import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { ProductService } from '../../../core/product.service';

@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.scss']
})
export class ProductFormComponent implements OnInit {
  productForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ProductFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private productService: ProductService
  ) {
    this.productForm = this.fb.group({
      code: ['', Validators.required],
      names: ['', Validators.required],
      brand: ['', Validators.required],
      model: ['', Validators.required],
      price: ['', Validators.required],
      description: [''],
      stock: ['', Validators.required],
    });

    if (data.product) {
      this.productForm.patchValue(data.product);
    }
  }

  ngOnInit(): void {}

  saveProduct() {
    if (this.productForm.valid) {
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
          let formData = this.productForm.value;

          // Agregar states por defecto si no está presente en el formData
          if (!formData.hasOwnProperty('states')) {
            formData = { ...formData, states: 'A' };
          }

          if (this.data.product && this.data.product.productId) {
            const productId = this.data.product.productId;
            this.productService.actualizarProducto(productId, formData).subscribe(
              () => {
                Swal.fire({
                  title: '¡Producto actualizado!',
                  text: 'El producto ha sido actualizado exitosamente.',
                  icon: 'success'
                });
                this.dialogRef.close(formData);
              },
              error => {
                Swal.fire({
                  title: 'Error',
                  text: 'Ocurrió un error al actualizar el producto. Por favor, intenta nuevamente más tarde.',
                  icon: 'error'
                });
              }
            );
          } else {
            this.productService.crearProduct(formData).subscribe(
              () => {
                Swal.fire({
                  title: '¡Producto creado!',
                  text: 'El producto ha sido creado exitosamente.',
                  icon: 'success'
                });
                this.dialogRef.close(formData);
              },
              error => {
                Swal.fire({
                  title: 'Error',
                  text: 'Ocurrió un error al crear el producto. Por favor, intenta nuevamente más tarde.',
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
}
