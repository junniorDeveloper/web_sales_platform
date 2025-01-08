import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { API_BASE_URL } from '../core/config';

export interface User {
  id_person: number;
  name: string;
  surnames: string;
  charge: string;
  cellphone: string;
  email: string;
  password: string;
  active: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly baseUrl: string = `${API_BASE_URL}persons/`;

  constructor(private http: HttpClient) {}

  listarUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.baseUrl).pipe(catchError(this.handleError));
  }

  personID(idPerson: number): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}${idPerson}`).pipe(catchError(this.handleError));
  }

  listarUsersInactivos(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}inactive`).pipe(catchError(this.handleError));
  }

  eliminarUser(idPerson: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}${idPerson}`).pipe(catchError(this.handleError));
  }

  crearUser(userData: User): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}crear`, userData).pipe(catchError(this.handleError));
  }

  actualizarUser(idPerson: number, datosUser: User): Observable<User> {
    return this.http.put<User>(`${this.baseUrl}${idPerson}`, datosUser).pipe(catchError(this.handleError));
  }

  private handleError(error: any): Observable<never> {
    console.error('Error en UserService:', error);
    return throwError(error);
  }
}
