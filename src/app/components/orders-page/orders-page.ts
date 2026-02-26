import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import OrdersService, { Order, OrderItem } from '../../services/orders';

@Component({
  selector: 'app-orders-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './orders-page.html',
  styleUrl: './orders-page.css'
})
export class OrdersPage implements OnInit {
  private readonly ordersService = inject(OrdersService);
  private readonly destroyRef = inject(DestroyRef);

  orders: Order[] = [];
  expandedOrder: string | null = null;
  reviewingItem: string | null = null;
  isLoading = true;

  ngOnInit(): void {
    this.ordersService
      .getOrders()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data) => {
        this.orders = data.results;
        this.isLoading = false;
      });
  }

  toggleOrder(orderId: string) {
    this.expandedOrder = this.expandedOrder === orderId ? null : orderId;
  }

  toggleReview(itemId: string) {
    this.reviewingItem = this.reviewingItem === itemId ? null : itemId;
  }

  setRating(item: OrderItem, rating: number) {
    item.rating = rating;
  }

  setLike(item: OrderItem, value: boolean) {
    item.liked = item.liked === value ? null : value;
  }

  submitReview(orderId: string, item: OrderItem) {
    this.ordersService.submitReview(orderId, item.id, {
      rating: item.rating,
      review: item.review,
      liked: item.liked
    }).subscribe(() => {
      this.reviewingItem = null;
    });
  }

  getStatusStep(status: string): number {
    const steps: Record<string, number> = {
      'Processing': 1,
      'Shipped': 2,
      'Out for Delivery': 3,
      'Delivered': 4
    };
    return steps[status] || 1;
  }

  getStatusClass(status: string): string {
    return status.toLowerCase().replace(/ /g, '-');
  }
}