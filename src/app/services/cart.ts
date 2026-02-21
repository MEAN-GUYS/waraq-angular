import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface CartItem {
  id: number;
  title: string;
  author: string;
  price: number;
  quantity: number;
  image: string;
}

@Injectable({
  providedIn: 'root'
})

export class CartService {
  private apiUrl = 'http://localhost:3000/v1';

  items: CartItem[] = [];

  constructor(private http: HttpClient) {
    this.loadCart();
  }

  loadCart() {
    this.http.get<CartItem[]>(`${this.apiUrl}/cart`).subscribe(data => {
      this.items = data;
    });
  }

  increase(id: number) {
    const item = this.items.find(i => i.id === id);
    if (item) {
      item.quantity++;
      this.http.put(`${this.apiUrl}/cart/${id}`, { quantity: item.quantity }).subscribe();
    }
  }

  decrease(id: number) {
    const item = this.items.find(i => i.id === id);
    if (item && item.quantity > 1) {
      item.quantity--;
      this.http.put(`${this.apiUrl}/cart/${id}`, { quantity: item.quantity }).subscribe();
    }
  }

  remove(id: number) {
    this.items = this.items.filter(i => i.id !== id);
    this.http.delete(`${this.apiUrl}/cart/${id}`).subscribe();
  }

  getSubtotal(): number {
    return this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  getItemCount(): number {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  }
}