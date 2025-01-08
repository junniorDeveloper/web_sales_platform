import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { ClientService } from '../../../core/client.service';

@Component({
  selector: 'app-emergente',
  templateUrl: './emergente.component.html',
  styleUrls: ['./emergente.component.scss']
})
export class EmergenteComponent implements OnInit {

  clientForm: FormGroup;
  maxDocumentNumberLengths: { [key: string]: number } = {
    DNI: 8,
    CNE: 20
  };

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<EmergenteComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private clientService: ClientService
  ) {
    this.clientForm = this.fb.group({
      sex: ['', Validators.required],
      names: ['', [Validators.required, Validators.pattern('^[a-zA-ZáéíóúñÁÉÍÓÚÑ ]*$')]],
      surnames: ['', [Validators.required, Validators.pattern('^[a-zA-ZáéíóúñÁÉÍÓÚÑ ]*$')]],
      documentType: ['', Validators.required],
      documentNumber:  ['', [Validators.required,Validators.pattern('^[0-9]*$')]],
      cellphone: ['', [Validators.pattern('^9[0-9]{8}$')]],
      email: ['', [
        Validators.email,
        Validators.pattern(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)
      ]],

    });

    // Parchar el formulario solo si se proporciona un cliente
    if (this.data.client) {
      this.clientForm.patchValue(this.data.client);
    }

    // Agregar validación dinámica para la longitud del número de documento
    this.clientForm.get('documentType')?.valueChanges.subscribe(type => {
      const maxLength = this.maxDocumentNumberLengths[type as keyof typeof this.maxDocumentNumberLengths];
      if (maxLength) {
        this.clientForm.get('documentNumber')?.setValidators([
          Validators.required,
          Validators.maxLength(maxLength),
          Validators.pattern('^[0-9]*$') // Validación de solo números
        ]);
      }
      this.clientForm.get('documentNumber')?.updateValueAndValidity();
    });
  }

  ngOnInit(): void {}

  saveClient() {
    if (this.clientForm.valid) {
      Swal.fire({
        title: '¿Estás seguro?',
        text: '¿Deseas guardar los cambios?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, guardar!'
      }).then((result) => {
        if (result.isConfirmed) {
          const formData = this.clientForm.value;

          // Asegurar que 'active' tenga el valor por defecto si no se ha cambiado
          if (!formData.active) {
            formData.active = 'A';
          }

          if (this.data.client && this.data.client.identifier) {
            const clientId = this.data.client.identifier;
            this.clientService.actualizarCliente(clientId, formData).subscribe(
              () => {
                Swal.fire({
                  title: '¡Cliente actualizado!',
                  text: 'Los datos del cliente han sido actualizados exitosamente.',
                  icon: 'success'
                });
                this.dialogRef.close(formData); // Retornar los datos actualizados al componente padre
              },
              error => {
                Swal.fire({
                  title: 'Error',
                  text: 'Ocurrió un error al actualizar el cliente. Por favor, intenta nuevamente más tarde.',
                  icon: 'error'
                });
              }
            );
          } else {
            this.clientService.crearClient(formData).subscribe(
              () => {
                Swal.fire({
                  title: '¡Cliente creado!',
                  text: 'El cliente ha sido creado exitosamente.',
                  icon: 'success'
                });
                this.dialogRef.close(formData); // Retornar los datos nuevos al componente padre
              },
              error => {
                Swal.fire({
                  title: 'Error',
                  text: 'Ocurrió un error al crear el cliente. Por favor, intenta nuevamente más tarde.',
                  icon: 'error'
                });
              }
            );
          }
        }
      });
    }
  }

  closeDialog() {
    this.dialogRef.close();
  }

  markFieldAsTouched(fieldName: string) {
    this.clientForm.get(fieldName)?.markAsTouched();
  }

    // Método para obtener el mensaje de error dinámico según el tipo de documento seleccionado
    getClientNumberErrorMessage(): string {
      const selectedType = this.clientForm.get('documentType')?.value;
      const maxLength = this.maxDocumentNumberLengths[selectedType as keyof typeof this.maxDocumentNumberLengths];
      return `Se requieren ${maxLength} dígitos para ${selectedType}`;
    }


    // Método para bloquear la entrada de números desde el portapapeles
    onPaste(event: ClipboardEvent) {
      const clipboardData = event.clipboardData;
      const pastedText = clipboardData?.getData('text');
      if (pastedText && /[\d]/.test(pastedText)) {
        event.preventDefault();
      }
    }
  }






