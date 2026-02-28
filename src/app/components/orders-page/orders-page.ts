import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import OrdersService, { Order, OrderItem } from '../../services/orders';
import { ReviewService } from '../../services/review.service';

@Component({
  selector: 'app-orders-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './orders-page.html',
  styleUrl: './orders-page.css'
})
export class OrdersPage implements OnInit {
  private readonly ordersService = inject(OrdersService);
  private readonly reviewService = inject(ReviewService);
  private readonly destroyRef = inject(DestroyRef);

  orders: Order[] = [];
  expandedOrder: string | null = null;
  reviewingItem: string | null = null;
  isLoading = true;
  showThankYou = false;

  reviewData: Record<string, { rating: number; review: string; liked: boolean | null }> = {};

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
    if (!this.reviewData[itemId]) {
      this.reviewData[itemId] = { rating: 0, review: '', liked: null };
    }
  }

  setRating(itemId: string, rating: number) {
    if (!this.reviewData[itemId]) this.reviewData[itemId] = { rating: 0, review: '', liked: null };
    this.reviewData[itemId].rating = rating;
  }

  setLike(itemId: string, value: boolean) {
    if (!this.reviewData[itemId]) this.reviewData[itemId] = { rating: 0, review: '', liked: null };
    this.reviewData[itemId].liked = this.reviewData[itemId].liked === value ? null : value;
  }

  submitReview(bookId: string, itemId: string) {
    const data = this.reviewData[itemId];
    if (!data || !data.rating) return;

    this.reviewService.submitReview({
      bookId,
      rating: data.rating,
      review: data.review,
      liked: data.liked
    }).subscribe({
      next: () => {
        this.reviewingItem = null;
        this.showThankYou = true;
        setTimeout(() => this.showThankYou = false, 4000);
      }
    });
  }

  getStatusStep(status: string): number {
    const steps: Record<string, number> = {
      'processing': 1,
      'out for delivery': 2,
      'delivered': 3
    };
    return steps[status] || 1;
  }

  getStatusClass(status: string): string {
    return status.replace(/ /g, '-');
  }
}