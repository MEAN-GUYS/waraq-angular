import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService, CartItem } from '../services/cart';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart.html',
  styleUrl: './cart.css'
})
export class CartComponent {
  constructor(public cartService: CartService) {}

  increase(id: number) { this.cartService.increase(id); }
  decrease(id: number) { this.cartService.decrease(id); }
  remove(id: number) { this.cartService.remove(id); }

  get subtotal() { return this.cartService.getSubtotal(); }
  get itemCount() { return this.cartService.getItemCount(); }
}