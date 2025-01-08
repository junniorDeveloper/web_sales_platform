import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Observable, of } from 'rxjs';
import { startWith, switchMap, map } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { Client, ClientService } from '../../core/client.service';
import { Product, ProductService } from '../../core/product.service';
import { User, UserService } from '../../core/user.service';
import { SaleService } from '../../core/sale.service';
import { EmergenteComponent } from '../client/emergente/emergente.component';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-sale',
  templateUrl: './sale.component.html',
  styleUrls: ['./sale.component.scss']
})
export class SaleComponent implements OnInit {
  saleForm: FormGroup;
  displayedColumns: string[] = ['productsProductId', 'amount', 'price', 'actions'];
  dataSource = new MatTableDataSource<any>();
  filteredClients!: Observable<Client[]>;
  filteredUsers!: Observable<User[]>;
  filteredProducts!: Observable<Product[]>;
  selectedProduct!: Product;
  formLocked: boolean = true; // Variable para controlar el estado de bloqueo de los campos del formulario

  constructor(
    private fb: FormBuilder,
    private saleService: SaleService,
    private clientService: ClientService,
    private userService: UserService,
    private productService: ProductService,
    private dialog: MatDialog
  ) {
    this.saleForm = this.fb.group({
      receiptType: ['', Validators.required],
      receiptNumber: ['', Validators.required],
      typePay: ['', Validators.required],
      totalSale: [{ value: '', disabled: true }, Validators.required],
      clientIdentifier: ['', Validators.required],
      personIdPerson: ['', Validators.required],
      amount: [1, Validators.required],
      productSearch: [''],
      saleDetails: this.fb.array([]),
    });

    this.saleForm.get('saleDetails')?.valueChanges.subscribe(details => {
      this.dataSource.data = details;
      this.calculateTotalSale();
    });

    this.filteredClients = this.saleForm.get('clientIdentifier')!.valueChanges.pipe(
      startWith(''),
      map(value => {
        if (typeof value === 'string') {
          return value;
        } else if (value && typeof value.names === 'string') {
          return value.names;
        } else {
          return '';
        }
      }),
      switchMap(value => this._filterClients(value ? value.toLowerCase() : ''))
    );

    this.filteredUsers = this.saleForm.get('personIdPerson')!.valueChanges.pipe(
      startWith(''),
      map(value => {
        if (typeof value === 'string') {
          return value;
        } else if (value && typeof value.name === 'string') {
          return value.name;
        } else {
          return '';
        }
      }),
      switchMap(value => this._filterUsers(value ? value.toLowerCase() : ''))
    );

    this.filteredProducts = this.saleForm.get('productSearch')?.valueChanges.pipe(
      startWith(''),
      switchMap(value => this._filterProducts(value))
    ) || of([]);
  }

  ngOnInit(): void {
    this.dataSource.data = this.saleDetails.controls.map(control => control.value);
  }

  // Método para eliminar un detalle de venta
  deleteSaleDetail(detail: any): void {
    const index = this.saleDetails.controls.findIndex(
      ctrl => ctrl.get('productsProductId')!.value === detail.productsProductId
    );
    if (index !== -1) {
      this.saleDetails.removeAt(index);
      this.dataSource.data = this.saleDetails.controls.map(control => control.value);
      this.calculateTotalSale();
    }
  }

  // Método para ventana emergente cliente
  openDialog(client?: any): void {
    const dialogRef = this.dialog.open(EmergenteComponent, {
      width: '400px',
      data: { client: client }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      if (result) {
        this.listClients();
      }
    });
  }

  createSaleDetail(): FormGroup {
    return this.fb.group({
      amount: [1, Validators.required],
      price: ['', Validators.required],
      productsProductId: ['', Validators.required]
    });
  }

  get saleDetails(): FormArray {
    return this.saleForm.get('saleDetails') as FormArray;
  }

  addProduct(): void {
    if (this.selectedProduct) {
      const saleDetail = this.createSaleDetail();
      saleDetail.patchValue({
        productsProductId: this.selectedProduct.productId,
        amount: this.saleForm.get('amount')!.value,
        price: this.selectedProduct.price,
      });
      this.saleDetails.push(saleDetail);
      this.dataSource.data = this.saleDetails.controls.map(control => control.value);
      this.saleForm.get('productSearch')!.reset(); // Resetea el campo de búsqueda de producto
      this.saleForm.get('amount')!.setValue(1); // Resetea el campo de cantidad
      this.calculateTotalSale();

      // Desbloquear el formulario después de añadir un producto
      this.formLocked = false;
    }
  }

  calculateTotalSale(): void {
    const total = this.saleDetails.controls.reduce((acc, control) => {
      const detail = control.value;
      return acc + (detail.amount * detail.price);
    }, 0);
    this.saleForm.get('totalSale')!.setValue(total);
  }

  onSubmit(): void {
    if (this.saleForm.valid) {
      Swal.fire({
        title: '¿Estás seguro?',
        text: '¡No podrás revertir esto!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, crear venta!'
      }).then((result) => {
        if (result.isConfirmed) {
          const saleData = this.saleForm.value;
          saleData.totalSale = this.saleDetails.controls.reduce((acc, control) => {
            const detail = control.value;
            return acc + (detail.amount * detail.price);
          }, 0);

          this.saleService.crearVenta(saleData).subscribe(
            response => {
              Swal.fire({
                title: '¡Venta creada!',
                text: 'Tu venta ha sido creada exitosamente.',
                icon: 'success'
              });

              this.saleForm.reset();
              this.saleDetails.clear();
              this.dataSource.data = [];
              this.formLocked = true; // Volver a bloquear los campos del formulario después de crear la venta
            },
            error => {
              console.error('Error creando la venta', error);
              Swal.fire({
                title: 'Error',
                text: error.error.message || 'Error creando la venta. Por favor, intenta nuevamente más tarde.',
                icon: 'error'
              });
            }
          );
        }
      });
    }
  }

  private _filterClients(value: string): Observable<Client[]> {
    if (!value) {
      return of([]);
    }
    return this.clientService.listarClient().pipe(
      map(clients => clients.filter(client =>
        client.names.toLowerCase().includes(value) ||
        client.surnames.toLowerCase().includes(value)
      ))
    );
  }

  private _filterUsers(value: string): Observable<User[]> {
    if (!value) {
      return of([]);
    }
    return this.userService.listarUsers().pipe(
      map(users => users.filter(user =>
        user.name.toLowerCase().includes(value) ||
        user.surnames.toLowerCase().includes(value)
      ))
    );
  }

  private _filterProducts(value: any): Observable<Product[]> {
    const filterValue = typeof value === 'string' ? value.toLowerCase() : '';
    return this.productService.listarProduct().pipe(
      map(products => products.filter(product =>
        product.names.toLowerCase().includes(filterValue) ||
        product.stock.toString().toLowerCase().includes(filterValue)
      ))
    );
  }

  displayProduct(product: Product): string {
    return product && product.names ? `${product.names} (Stock: ${product.stock})` : '';
  }

  listClients(): void {
    this.clientService.listarClient().subscribe(clients => {
      console.log(clients);
    });
  }
}
