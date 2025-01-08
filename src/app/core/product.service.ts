import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../core/config'; // Asegúrate de importar la URL base correcta

export interface Product {

  productId: number;
  product_id: number;
  code: string;
  names: string;
  brand: string;
  model: string;
  price: number;
  description: string;
  stock: number;
  states: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly baseUrl: string = API_BASE_URL;

  constructor(private http: HttpClient) { }

  listarProduct(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.baseUrl}products/`);
  }

  productID(idProduct: number): Observable<Product> {
    return this.http.get<Product>(`${this.baseUrl}products/${idProduct}`);
  }

  listarProductInactivos(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.baseUrl}products/inactive`);
  }

  eliminarProduct(productId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}products/${productId}`);
  }

  crearProduct(productData: Product): Observable<Product> {
    return this.http.post<Product>(`${this.baseUrl}products/crear`, productData);
  }

  actualizarProducto(productId: number, datosProducto: Product): Observable<Product> {
    return this.http.put<Product>(`${this.baseUrl}products/${productId}`, datosProducto);
  }

  restaurarProducto(productId: number): Observable<Product> {
    return this.http.put<Product>(`${this.baseUrl}products/restore/${productId}`, null);
  }
}
