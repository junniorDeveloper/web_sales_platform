import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { SaleService } from '../../core/sale.service';
import { MatDialog } from '@angular/material/dialog'; // Importa MatDialog
import { VentaComponent } from '../history/venta/venta.component';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss']
})
export class HistoryComponent implements OnInit, AfterViewInit {
  sales: any[] = [];
  dataSource = new MatTableDataSource<any>();
  displayedColumns: string[] = ['dataTime', 'idSeller', 'typePay', 'totalSale', 'preview'];
  searchTerm: string = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private saleService: SaleService,
    private dialog: MatDialog // Inyecta MatDialog en el constructor
  ) {}

  ngOnInit() {
    this.listSales(); // Llamar al método para listar ventas al inicializar el componente
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  listSales() {
    this.saleService.listarSale().subscribe(
      (data: any) => {
        this.sales = data;
        this.dataSource.data = data; // Asignar datos a la dataSource
      },
      error => {
        console.log('Error fetching sales:', error);
      }
    );
  }

  // Método para filtrar la lista de ventas
  filterSales() {
    // Convierte el término de búsqueda a minúsculas
    const searchTerm = this.searchTerm.toLowerCase();

    if (searchTerm.trim() === '') {
      // Si el término de búsqueda está vacío, cargar la lista completa de ventas
      this.dataSource.data = this.sales;
    } else {
      // Filtra la lista de ventas basada en el término de búsqueda
      this.dataSource.data = this.sales.filter(sale =>
        sale.dataTime.toLowerCase().includes(searchTerm) ||
        sale.idSeller.toLowerCase().includes(searchTerm) ||
        sale.typePay.toLowerCase().includes(searchTerm) ||
        sale.totalSale.toLowerCase().includes(searchTerm)
      );
    }

    // Reiniciar el paginador después de filtrar
    if (this.paginator) {
      this.paginator.firstPage();
    }
  }

  showPreview(sale: any) {
    console.log('ID de venta:', sale.idSeller); // Verificar que el ID esté definido
    const dialogRef = this.dialog.open(VentaComponent, {
      width: '700px',
      data: { idVenta: sale.idSeller }
    });
  }

}
