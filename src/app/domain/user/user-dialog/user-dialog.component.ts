import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { UserService, User } from '../../../core/user.service';

@Component({
  selector: 'app-user-dialog',
  templateUrl: './user-dialog.component.html',
  styleUrls: ['./user-dialog.component.scss']
})
export class UserDialogComponent implements OnInit {
  userForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<UserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { user: User },
    private userService: UserService
  ) {
    this.userForm = this.fb.group({
      name: ['', Validators.required],
      surnames: ['', Validators.required],
      charge: ['', Validators.required],
      cellphone: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      active: ['A', Validators.required]
    });

    if (data.user) {
      this.userForm.patchValue(data.user);
    }
  }

  ngOnInit(): void {}

  saveUser() {
    if (this.userForm.valid) {
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
          const formData: User = this.userForm.value;

          if (this.data.user && this.data.user.id_person) {
            const userId = this.data.user.id_person;
            this.userService.actualizarUser(userId, formData).subscribe(
              () => {
                Swal.fire({
                  title: '¡Usuario actualizado!',
                  text: 'El usuario ha sido actualizado exitosamente.',
                  icon: 'success'
                });
                this.dialogRef.close(formData);
              },
              error => {
                Swal.fire({
                  title: 'Error',
                  text: 'Ocurrió un error al actualizar el usuario. Por favor, intenta nuevamente más tarde.',
                  icon: 'error'
                });
                console.error('Error updating user:', error);
              }
            );
          } else {
            this.userService.crearUser(formData).subscribe(
              () => {
                Swal.fire({
                  title: '¡Usuario creado!',
                  text: 'El usuario ha sido creado exitosamente.',
                  icon: 'success'
                });
                this.dialogRef.close(true);
              },
              error => {
                Swal.fire({
                  title: 'Error',
                  text: 'Ocurrió un error al crear el usuario. Por favor, intenta nuevamente más tarde.',
                  icon: 'error'
                });
                console.error('Error creating user:', error);
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
}
