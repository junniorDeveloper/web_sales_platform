import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_BASE_URL } from '../core/config'; // Importa la URL base

@Injectable({
  providedIn: 'root'
})
export class SaleService {

  private readonly baseUrl: string = API_BASE_URL;

  constructor(private http: HttpClient) { }

  listarSale() {
    return this.http.get(`${this.baseUrl}sales/`);
  }

  obtenerVenta(idVenta: number) {
    return this.http.get(`${this.baseUrl}sales/${idVenta}`);
  }

  crearVenta(VentaData: any) {
    return this.http.post(`${this.baseUrl}sales/crear`, VentaData);
  }
}
