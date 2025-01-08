import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../core/config'; // Importa la URL base

export interface Client {
  identifier: number;
  sex: string;
  names: string;
  surnames: string;
  documentType: string;
  documentNumber: string;
  cellphone: string;
  email: string;
  active: string;
}

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private readonly baseUrl: string = API_BASE_URL;

  constructor(private http: HttpClient) { }

  listarClient(): Observable<Client[]> {
    return this.http.get<Client[]>(`${this.baseUrl}clients/`);
  }

  clientID(idClient: number): Observable<Client> {
    return this.http.get<Client>(`${this.baseUrl}clients/${idClient}`);
  }

  listarClientInactivos(): Observable<Client[]> {
    return this.http.get<Client[]>(`${this.baseUrl}clients/inactive`);
  }

  eliminarClient(clientId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}clients/${clientId}`);
  }

  crearClient(ClientData: Client): Observable<Client> {
    return this.http.post<Client>(`${this.baseUrl}clients/crear`, ClientData);
  }

  actualizarCliente(idCliente: number, datosCliente: Client): Observable<Client> {
    return this.http.put<Client>(`${this.baseUrl}clients/${idCliente}`, datosCliente);
  }
}
