import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SaleService } from '../../../core/sale.service';
import { UserService } from '../../../core/user.service';
import { ClientService } from '../../../core/client.service';
import { ProductService } from '../../../core/product.service';

@Component({
  selector: 'app-venta',
  templateUrl: './venta.component.html',
  styleUrls: ['./venta.component.scss']
})
export class VentaComponent {
  venta: any;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private saleService: SaleService,
    private clientService: ClientService,
    private userService: UserService,
    private productService: ProductService,
    private dialogRef: MatDialogRef<VentaComponent>
  ) {
    const idVenta = data.idVenta;

    if (typeof idVenta === 'number' && !isNaN(idVenta)) {
      this.obtenerDetallesVenta(idVenta);
    } else {
      console.error('ID de venta no válido:', idVenta);
    }
  }

  obtenerDetallesVenta(idVenta: number) {
    this.saleService.obtenerVenta(idVenta).subscribe(
      (venta: any) => {
        this.venta = venta;
        // Una vez que tengas los detalles de la venta, obtén el nombre del cliente
        this.obtenerNombreCliente(venta.clientIdentifier);
        this.obtenerNombreUsuario(venta.personIdPerson);
        this.obtenerNombreProductoParaDetalles();
      },
      error => {
        console.error('Error obteniendo detalles de la venta:', error);
      }
    );
  }

  obtenerNombreCliente(clientIdentifier: number) {
    this.clientService.clientID(clientIdentifier).subscribe(
      (cliente: any) => {
        // Asumiendo que "nombre" es la propiedad correcta del objeto cliente
        this.venta.clienteNombre = `${cliente.names} ${cliente.surnames}`; // Asigna el nombre del cliente a una nueva propiedad
      },
      error => {
        console.error('Error obteniendo nombre del cliente:', error);
      }
    );
  }

  obtenerNombreUsuario(personId: number) {
    this.userService.personID(personId).subscribe(
      (usuario: any) => {
        // Asumiendo que "name" y "surname" son las propiedades correctas del objeto usuario
        this.venta.nombreUsuario = `${usuario.name} ${usuario.surnames}`; // Concatena nombre y apellido
      },
      error => {
        console.error('Error obteniendo nombre del usuario:', error);
      }
    );
  }

  obtenerNombreProductoParaDetalles() {
    if (this.venta.saleDetails && this.venta.saleDetails.length > 0) {
      this.venta.saleDetails.forEach((detalle: any) => {
        this.productService.productID(detalle.productsProductId).subscribe(
          (producto: any) => {
            detalle.nombreProducto = `${producto.names}  ${producto.brand}` // Asigna el nombre del producto a una nueva propiedad
          },
          error => {
            console.error(`Error obteniendo nombre del producto para el detalle ${detalle.productsProductId}:`, error);
          }
        );
      });
    }
  }

  closeDialog() {
    this.dialogRef.close();
  }
}
