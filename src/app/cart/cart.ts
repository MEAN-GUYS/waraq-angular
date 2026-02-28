import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../services/cart';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cart.html',
  styleUrl: './cart.css'
})
export class CartComponent {
  constructor(public cartService: CartService) {}

  increase(bookId: string) { this.cartService.increase(bookId); }
  decrease(bookId: string) { this.cartService.decrease(bookId); }
  remove(bookId: string) { this.cartService.remove(bookId); }

  get subtotal() { return this.cartService.getSubtotal(); }
  get itemCount() { return this.cartService.getItemCount(); }
}