import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Client, ClientService } from '../../core/client.service';
import { EmergenteComponent } from '../client/emergente/emergente.component';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import Swal from 'sweetalert2'; // Importar SweetAlert2
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-client',
  templateUrl: './client.component.html',
  styleUrls: ['./client.component.scss']
})
export class ClientComponent implements OnInit, AfterViewInit {
  clients: any[] = []; // Array para almacenar los clientes obtenidos del servicio
  dataSource = new MatTableDataSource<any>(); // DataSource para la tabla
  displayedColumns: string[] = ['sex', 'names', 'surnames', 'documentType', 'documentNumber', 'cellphone', 'email', 'actions'];
  searchTerm: string = '';
  documentTypeFilter: string = '';
  private searchTerms = new Subject<string>();
  showActive: boolean = true;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private clientService: ClientService, private dialog: MatDialog) {}

  ngOnInit() {
    this.listClients(); // Llamar al método para listar clientes al inicializar el componente
    this.searchTerms.pipe(
      debounceTime(300) // Espera 300ms después de que el usuario haya dejado de escribir
    ).subscribe(() => {
      this.filterClients();
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  listClients() {
    if (this.showActive) {
      this.clientService.listarClient().subscribe(
        (data: Client[]) => {
          this.clients = data.filter(client => client.active === 'A');
          this.dataSource.data = this.clients;
        },
        error => {
          console.log('Error fetching active clients:', error);
        }
      );
    } else {
      this.clientService.listarClientInactivos().subscribe(
        (data: Client[]) => {
          this.clients = data.filter(client => client.active === 'I');
          this.dataSource.data = this.clients;
        },
        error => {
          console.log('Error fetching inactive clients:', error);
        }
      );
    }
  }

  toggleList() {
    this.showActive = !this.showActive;
    this.listClients();
  }


  accionCliente(client: Client) {
    if (client.active === 'A') {
      this.eliminarCliente(client); // Si el cliente está activo, eliminar
    } else {
      this.restaurarCliente(client); // Si el cliente está inactivo, restaurar
    }
  }

  // Método para abrir el diálogo de cliente
  openDialog(client?: any): void {
    const dialogRef = this.dialog.open(EmergenteComponent, {
      width: '400px',
      data: { client: client } // Pasa el cliente como parte de los datos
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      if (result) {
        this.listClients();
      }
    });
  }

  // Método para filtrar la lista de clientes
  filterClients() {
    const searchTerm = this.searchTerm ? this.searchTerm.toLowerCase() : '';
    const documentTypeFilter = this.documentTypeFilter ? this.documentTypeFilter : '';

    this.dataSource.data = this.clients.filter(client => {
      return (
        (!documentTypeFilter || client.documentType === documentTypeFilter) &&
        (
          client.names.toLowerCase().includes(searchTerm) ||
          client.surnames.toLowerCase().includes(searchTerm) ||
          client.documentNumber.includes(searchTerm) ||
          (client.cellphone && client.cellphone.includes(searchTerm)) ||
          (client.email && client.email.toLowerCase().includes(searchTerm))
        )
      );
    });

    if (this.paginator) {
      this.paginator.firstPage();
    }
  }


  // Método para manejar el cambio en el término de búsqueda
  onSearchTermChange(term: string) {
    this.searchTerms.next(term);
  }

  onDocumentTypeChange(event: any) {
    this.documentTypeFilter = event.value;
    this.filterClients();
  }

  eliminarCliente(client: Client) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas eliminar al cliente?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar!',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.clientService.eliminarClient(client.identifier).subscribe(
          () => {
            Swal.fire({
              title: '¡Cliente eliminado!',
              text: `El cliente ha sido eliminado exitosamente.`,
              icon: 'success'
            });
            // Actualizar la lista de clientes después de eliminar
            this.listClients();
          },
          error => {
            Swal.fire({
              title: 'Error',
              text: 'Ocurrió un error al eliminar el cliente. Por favor, intenta nuevamente más tarde.',
              icon: 'error'
            });
            console.error('Error al eliminar cliente:', error);
          }
        );
      }
    });
  }

  restaurarCliente(client: Client) {
    // Mostrar mensaje de confirmación
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Quieres restaurar al cliente?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, restaurar',
      cancelButtonText: 'No, cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        // Cambiar el estado a activo ('A')
        client.active = 'A';
        this.clientService.actualizarCliente(client.identifier, client).subscribe(
          (updatedClient: Client) => {
            Swal.fire(
              'Restaurado!',
              `El cliente ha sido restaurado exitosamente.`,
              'success'
            );
            // Actualizar la lista de clientes después de restaurar
            this.listClients();
          },
          error => {
            Swal.fire(
              'Error',
              'Hubo un problema al restaurar el cliente.',
              'error'
            );
            console.error('Error al restaurar cliente:', error);
          }
        );
      }
    });
  }



  exportData(format: string) {
    const dataToExport = this.dataSource.data.map(client => ({
      Genero: client.sex,
      Nombres: client.names,
      Apellidos: client.surnames,
      'Tipo Documento': client.documentType,
      'Numero Documento': client.documentNumber,
      Celular: client.cellphone,
      'Correo Electronico': client.email
    }));

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataToExport);
    const wb: XLSX.WorkBook = { Sheets: { 'Clientes': ws }, SheetNames: ['Clientes'] };

    if (format === 'xls') {
      const xlsBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      saveAs(new Blob([xlsBuffer], { type: 'application/octet-stream' }), `clientes_${this.showActive ? 'activos' : 'inactivos'}.xlsx`);
    } else if (format === 'csv') {
      const csvData = XLSX.utils.sheet_to_csv(ws);
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      saveAs(blob, `clientes_${this.showActive ? 'activos' : 'inactivos'}.csv`);
    }
  }
}
