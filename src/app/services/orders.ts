import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface OrderItem {
  book: string;
  name: string;
  cover: string;
  price: number;
  quantity: number;
}

export interface OrderAddress {
  street: string;
  city: string;
  country: string;
}

export interface Order {
  id: string;
  user: string;
  items: OrderItem[];
  address: OrderAddress;
  shippingStatus: 'processing' | 'out for delivery' | 'delivered';
  paymentMethod: 'COD';
  paymentStatus: 'pending' | 'success';
  totalPrice: number;
  createdAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export default class OrdersService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getOrders(): Observable<{ results: Order[] }> {
    return this.http.get<{ results: Order[] }>(`${this.apiUrl}/orders/myorders`);
  }

  getAllOrders(params?: { page?: number; limit?: number }): Observable<{ results: Order[]; page: number; totalPages: number; totalResults: number }> {
    let url = `${this.apiUrl}/orders/all`;
    const queryParts: string[] = [];
    if (params?.page) queryParts.push(`page=${params.page}`);
    if (params?.limit) queryParts.push(`limit=${params.limit}`);
    if (queryParts.length) url += '?' + queryParts.join('&');
    return this.http.get<{ results: Order[]; page: number; totalPages: number; totalResults: number }>(url);
  }

  updateOrderStatus(id: string, body: { shippingStatus?: string; paymentStatus?: string }): Observable<Order> {
    return this.http.patch<Order>(`${this.apiUrl}/orders/${id}`, body);
  }
}