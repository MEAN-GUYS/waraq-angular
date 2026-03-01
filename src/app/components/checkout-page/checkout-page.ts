import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService, CartItem } from '../../services/cart';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-checkout-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './checkout-page.html',
  styleUrls: ['./checkout-page.css']
})
export class CheckoutPage {
  private router = inject(Router);
  private http = inject(HttpClient);
  cartService = inject(CartService);
  private notify = inject(NotificationService);

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
  errors: Record<string, string> = {};

  validPromos: Record<string, number> = {
    'WARAQ10': 10,
    'BOOKS20': 20,
    'READ15': 15
  };

  get currentItems(): CartItem[] {
    return this.cartService.items();
  }

  get subtotal() {
    return this.currentItems.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);
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
    this.errors = {};
    if (this.step === 1) {
      if (!this.address.fullName.trim()) this.errors['fullName'] = 'Full name is required';
      if (!this.address.street.trim()) this.errors['street'] = 'Street address is required';
      if (!this.address.city.trim()) this.errors['city'] = 'City is required';
      if (!this.address.country.trim()) this.errors['country'] = 'Country is required';
      if (!this.address.phone.trim()) this.errors['phone'] = 'Phone number is required';
      if (Object.keys(this.errors).length) {
        const first = Object.values(this.errors)[0];
        this.notify.show(first, 'error');
        return;
      }
    }
    if (this.step === 2 && this.paymentMethod === 'card') {
      const num = this.card.number.replace(/\s/g, '');
      if (num.length < 16) this.errors['cardNumber'] = 'Enter a valid 16-digit card number';
      if (!this.card.name.trim()) this.errors['cardName'] = 'Cardholder name is required';
      if (!/^\d{2}\/\d{2}$/.test(this.card.expiry)) this.errors['expiry'] = 'Enter expiry as MM/YY';
      if (!/^\d{3}$/.test(this.card.cvv)) this.errors['cvv'] = 'Enter a valid 3-digit CVV';
      if (Object.keys(this.errors).length) {
        const first = Object.values(this.errors)[0];
        this.notify.show(first, 'error');
        return;
      }
    }
    if (this.step < 3) this.step++;
  }

  prevStep() {
    this.errors = {};
    if (this.step > 1) this.step--;
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

    this.http.post(`${environment.apiUrl}/orders`, orderBody)
      .subscribe({
        next: () => {
          this.cartService.clear();
          this.notify.show('Order placed successfully!', 'success');
          this.router.navigate(['/my-orders']);
        },
        error: (err) => {
          this.isPlacingOrder = false;
          this.notify.show(err.error?.message ?? 'Failed to place order. Please try again.', 'error');
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
