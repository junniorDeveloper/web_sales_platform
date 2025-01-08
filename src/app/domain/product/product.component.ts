import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Product, ProductService } from '../../core/product.service';
import { ProductFormComponent } from '../product/product-form/product-form.component'; // Asegúrate de ajustar la ruta si es diferente
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss']
})
export class ProductComponent implements OnInit, AfterViewInit {
  products: Product[] = [];
  dataSource = new MatTableDataSource<Product>();
  displayedColumns: string[] = ['code', 'names', 'brand', 'model', 'price', 'description', 'stock', 'actions'];
  searchTerm: string = '';
  private searchTerms = new Subject<string>();
  showActive: boolean = true;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private productService: ProductService, private dialog: MatDialog) {}

  ngOnInit() {
    this.listProducts();
    this.searchTerms.pipe(
      debounceTime(300)
    ).subscribe(() => {
      this.filterProducts();
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  listProducts() {
    if (this.showActive) {
      this.productService.listarProduct().subscribe(
        (data: Product[]) => {
          this.products = data.filter(product => product.states === 'A');
          this.dataSource.data = this.products;
        },
        error => {
          console.log('Error fetching active products:', error);
        }
      );
    } else {
      this.productService.listarProductInactivos().subscribe(
        (data: Product[]) => {
          this.products = data.filter(product => product.states === 'I');
          this.dataSource.data = this.products;
        },
        error => {
          console.log('Error fetching inactive products:', error);
        }
      );
    }
  }

  toggleList() {
    this.showActive = !this.showActive;
    this.listProducts();
  }

  accionProducto(product: Product) {
    // Verifica el productId aquí
    if (product.states === 'A') {
      this.eliminarProducto(product); // Si el producto está activo, eliminar
    } else {
      this.restaurarProducto(product); // Si el producto está inactivo, restaurar
    }
  }

  openDialog(product?: Product): void {
    const dialogRef = this.dialog.open(ProductFormComponent, {
      width: '400px',
      data: { product: product }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      if (result) {
        this.listProducts();
      }
    });
  }

  filterProducts() {
    const searchTerm = this.searchTerm.toLowerCase();

    if (searchTerm.trim() === '') {
      this.dataSource.data = this.products;
    } else {
      this.dataSource.data = this.products.filter(product =>
        product.code.toLowerCase().includes(searchTerm) ||
        product.names.toLowerCase().includes(searchTerm) ||
        product.brand.toLowerCase().includes(searchTerm) ||
        product.model.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm)
      );
    }

    if (this.paginator) {
      this.paginator.firstPage();
    }
  }

  // Método para manejar el cambio en el término de búsqueda
  onSearchTermChange(term: string) {
    this.searchTerms.next(term);
  }

  eliminarProducto(product: Product) {
    if (product && product.productId !== undefined && product.productId !== null) {
      this.productService.eliminarProduct(product.productId).subscribe(
        () => {
          console.log(`Producto eliminado: ${product.productId}`);
          this.listProducts(); // Actualizar la lista después de eliminar
        },
        error => {
          console.error('Error al eliminar producto:', error);
        }
      );
    } else {
      console.error('El ID del producto no es válido:', product);
    }
  }


  restaurarProducto(product: Product) {
    console.log('Restaurando producto con ID:', product.product_id);

    if (!product.product_id) {
      console.error('Product ID is undefined or null');
      return;
    }

    this.productService.restaurarProducto(product.product_id).subscribe(
      (updatedProduct: Product) => {
        console.log(`Producto restaurado: ${updatedProduct.product_id}`);
        this.listProducts(); // Actualizar la lista después de restaurar
      },
      error => {
        console.error('Error al restaurar producto:', error);
      }
    );
  }
}
