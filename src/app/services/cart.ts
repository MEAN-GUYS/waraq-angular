import { Injectable, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface CartItem {
  book: string;
  quantity: number;
  name: string;
  price: number;
  cover?: string;
  stock: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = environment.apiUrl;
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  items = signal<CartItem[]>([]);
  itemCount = computed(() => this.items().reduce((sum, item) => sum + item.quantity, 0));

  constructor(private http: HttpClient) {
    if (this.isBrowser) {
      this.loadCart();
    }
  }

  loadCart() {
    this.http.get<any>(`${this.apiUrl}/cart`).subscribe({
      next: (data) => {
        if (data && data.items) {
          this.items.set(
            data.items.map((item: any) => ({
              book: item.book.id || item.book._id,
              name: item.book.name,
              price: item.book.price || 0,
              cover: item.book.cover || item.book.coverUrl || '',
              stock: item.book.stock ?? 0,
              quantity: item.quantity
            }))
          );
        } else {
          this.items.set([]);
        }
      },
      error: () => this.items.set([])
    });
  }

  addToCart(bookId: string, quantity: number = 1, meta?: { name: string; price: number; cover?: string; stock: number }) {
    // Optimistic update so UI reacts instantly
    if (meta && !this.isInCart(bookId)) {
      this.items.update(items => [...items, { book: bookId, quantity, name: meta.name, price: meta.price, cover: meta.cover, stock: meta.stock }]);
    }
    this.http.post(`${this.apiUrl}/cart/items`, { bookId, quantity }).subscribe({
      next: () => this.loadCart(),
      error: (err) => {
        console.error('Error adding to cart', err);
        // Rollback optimistic update on error
        if (meta) {
          this.items.update(items => items.filter(i => i.book !== bookId));
        }
      }
    });
  }

  isInCart(bookId: string): boolean {
    return this.items().some(i => i.book === bookId);
  }

  increase(bookId: string) {
    const item = this.items().find(i => i.book === bookId);
    if (item && item.quantity < item.stock) {
      const prev = item.quantity;
      item.quantity++;
      this.http.put(`${this.apiUrl}/cart/items/${bookId}`, { quantity: item.quantity }).subscribe({
        error: () => { item.quantity = prev; }
      });
    }
  }

  decrease(bookId: string) {
    const item = this.items().find(i => i.book === bookId);
    if (item && item.quantity > 1) {
      const prev = item.quantity;
      item.quantity--;
      this.http.put(`${this.apiUrl}/cart/items/${bookId}`, { quantity: item.quantity }).subscribe({
        error: () => { item.quantity = prev; }
      });
    }
  }

  remove(bookId: string) {
    const removed = this.items().find(i => i.book === bookId);
    this.items.set(this.items().filter(i => i.book !== bookId));
    this.http.delete(`${this.apiUrl}/cart/items/${bookId}`).subscribe({
      error: () => { if (removed) this.items.update(items => [...items, removed]); }
    });
  }

  clear() {
    this.items.set([]);
  }

  getSubtotal(): number {
    return this.items().reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  getItemCount(): number {
    return this.items().reduce((sum, item) => sum + item.quantity, 0);
  }
}