import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface OrderItem {
  id: string;
  book: {
    id: string;
    name: string;
    author: string;
    cover: string;
    price: number;
  };
  quantity: number;
  price: number;
  rating?: number;
  review?: string;
  liked?: boolean | null;
}

export interface Order {
  id: string;
  status: 'Processing' | 'Shipped' | 'Out for Delivery' | 'Delivered';
  trackingNumber: string;
  estimatedDelivery: string;
  total: number;
  items: OrderItem[];
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export default class OrdersService {
  private apiUrl = 'http://localhost:3000/v1';

  constructor(private http: HttpClient) {}

  getOrders(): Observable<{ results: Order[] }> {
    return this.http.get<{ results: Order[] }>(`${this.apiUrl}/orders`);
  }

  submitReview(orderId: string, itemId: string, body: { rating?: number; review?: string; liked?: boolean | null }): Observable<Order> {
    return this.http.patch<Order>(`${this.apiUrl}/orders/${orderId}/items/${itemId}/review`, body);
  }
}