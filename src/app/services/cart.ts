import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface CartItem {
  book: string;
  quantity: number;
  price: number;
}

@Injectable({
  providedIn: 'root'
})

export class CartService {
  private apiUrl = environment.apiUrl;

  items: CartItem[] = [];

  constructor(private http: HttpClient) {
    this.loadCart();
  }

  loadCart() {
    this.http.get<CartItem[]>(`${this.apiUrl}/cart`).subscribe(data => {
      this.items = data;
    });
  }

  increase(bookId: string) {
    const item = this.items.find(i => i.book === bookId);
    if (item) {
      item.quantity++;
      this.http.put(`${this.apiUrl}/cart/${bookId}`, { quantity: item.quantity }).subscribe();
    }
  }

  decrease(bookId: string) {
    const item = this.items.find(i => i.book === bookId);
    if (item && item.quantity > 1) {
      item.quantity--;
      this.http.put(`${this.apiUrl}/cart/${bookId}`, { quantity: item.quantity }).subscribe();
    }
  }

  remove(bookId: string) {
    this.items = this.items.filter(i => i.book !== bookId);
    this.http.delete(`${this.apiUrl}/cart/${bookId}`).subscribe();
  }

  getSubtotal(): number {
    return this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  getItemCount(): number {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  }
}