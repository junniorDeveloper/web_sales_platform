import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { User, UserService } from '../../core/user.service';
import { UserDialogComponent } from '../user/user-dialog/user-dialog.component';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit, AfterViewInit {
  users: User[] = [];
  inactiveUsers: User[] = [];
  dataSource = new MatTableDataSource<User>();
  displayedColumns: string[] = ['name', 'surnames', 'charge', 'cellphone', 'email', 'actions'];
  searchTerm: string = '';
  private searchTerms = new Subject<string>();
  showActive: boolean = true;  // Controlador para alternar entre usuarios activos e inactivos

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private userService: UserService, private dialog: MatDialog) {}

  ngOnInit() {
    this.listUsers();
    this.searchTerms.pipe(debounceTime(300)).subscribe(() => {
      this.filterUsers();
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  listUsers() {
    this.userService.listarUsers().subscribe(
      (data: User[]) => {
        this.users = data.filter(user => user.active === 'A');
        this.inactiveUsers = data.filter(user => user.active === 'I');
        this.updateDataSource();
      },
      error => {
        console.error('Error fetching users:', error);
      }
    );
  }

  updateDataSource() {
    this.dataSource.data = this.showActive ? this.users : this.inactiveUsers;
    if (this.paginator) {
      this.paginator.firstPage();
    }
  }

  toggleList() {
    this.showActive = !this.showActive;
    this.updateDataSource();
  }

  openDialog(user?: User): void {
    const dialogRef = this.dialog.open(UserDialogComponent, {
      width: '400px',
      data: { user }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.listUsers();
      }
    });
  }

  filterUsers() {
    const searchTerm = this.searchTerm.toLowerCase();
    const filteredData = (this.showActive ? this.users : this.inactiveUsers).filter(user =>
      user.name.toLowerCase().includes(searchTerm) ||
      user.surnames.toLowerCase().includes(searchTerm) ||
      user.charge.toLowerCase().includes(searchTerm) ||
      user.cellphone.includes(searchTerm) ||
      user.email.toLowerCase().includes(searchTerm)
    );
    this.dataSource.data = filteredData;
    if (this.paginator) {
      this.paginator.firstPage();
    }
  }

  onSearchTermChange(term: string) {
    this.searchTerms.next(term);
  }

  toggleUserState(user: User) {
    const updatedUser = { ...user, active: user.active === 'A' ? 'I' : 'A' };
    this.userService.actualizarUser(user.id_person, updatedUser).subscribe(
      () => {
        this.listUsers();
      },
      error => {
        console.error(`Error ${user.active === 'A' ? 'deactivating' : 'activating'} user:`, error);
      }
    );
  }
}
