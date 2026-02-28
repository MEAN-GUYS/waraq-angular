import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService, CartItem } from '../../services/cart.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-checkout-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './checkout-page.html',
  styleUrls: ['./checkout-page.css']
})
export class CheckoutPage implements OnInit {
  private router = inject(Router);
  private http = inject(HttpClient);
  cartService = inject(CartService);

  items$: Observable<CartItem[]> = this.cartService.items$;
  currentItems: CartItem[] = [];

  step = 1;
  isPlacingOrder = false;
  promoApplied = false;
  promoError = '';
  discount = 0;

  address = {
    fullName: '',
    street: '',
    city: '',
    country: '',
    phone: ''
  };

  paymentMethod: 'card' | 'cash' = 'card';

  card = {
    number: '',
    name: '',
    expiry: '',
    cvv: ''
  };

  promoCode = '';

  validPromos: Record<string, number> = {
    'WARAQ10': 10,
    'BOOKS20': 20,
    'READ15': 15
  };

  ngOnInit() {
    this.cartService.items$.subscribe(items => {
      this.currentItems = items;
    });
  }

  get subtotal() {
    return this.currentItems.reduce((sum, item: any) => sum + (item.price || 0) * item.quantity, 0);
  }

  get discountAmount() {
    return (this.subtotal * this.discount) / 100;
  }

  get total() {
    return this.subtotal - this.discountAmount;
  }

  applyPromo() {
    const code = this.promoCode.toUpperCase().trim();
    if (this.validPromos[code]) {
      this.discount = this.validPromos[code];
      this.promoApplied = true;
      this.promoError = '';
    } else {
      this.promoError = 'Invalid promo code';
      this.promoApplied = false;
      this.discount = 0;
    }
  }

  nextStep() {
    if (this.step < 3) this.step++;
  }

  prevStep() {
    if (this.step > 1) this.step--;
  }

  private getHeaders(): { headers: HttpHeaders } {
    const token = localStorage.getItem('access_token');
    return {
      headers: new HttpHeaders({ Authorization: `Bearer ${token}` })
    };
  }

  placeOrder() {
    this.isPlacingOrder = true;
    const orderBody = {
      address: {
        fullName: this.address.fullName,
        street: this.address.street,
        city: this.address.city,
        country: this.address.country,
        phone: this.address.phone,
      },
      paymentMethod: this.paymentMethod === 'cash' ? 'COD' : 'card',
    };

    this.http.post(`${environment.apiUrl}/orders`, orderBody, this.getHeaders())
      .subscribe({
        next: () => {
          this.cartService.clear();
          this.router.navigate(['/my-orders']);
        },
        error: () => {
          this.isPlacingOrder = false;
        }
      });
  }

  formatCardNumber(event: any) {
    let value = event.target.value.replace(/\D/g, '');
    value = value.match(/.{1,4}/g)?.join(' ') || value;
    this.card.number = value;
  }

  formatExpiry(event: any) {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length >= 2) value = value.slice(0, 2) + '/' + value.slice(2, 4);
    this.card.expiry = value;
  }
}