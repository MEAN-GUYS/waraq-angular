import { Component, DestroyRef, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import OrdersService, { Order } from '../../services/orders';
import { ReviewService } from '../../services/review.service';

@Component({
  selector: 'app-orders-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './orders-page.html',
  styleUrls: ['./orders-page.css']
})
export class OrdersPage implements OnInit {
  private readonly ordersService = inject(OrdersService);
  private readonly reviewService = inject(ReviewService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);

  orders: Order[] = [];
  expandedOrder: string | null = null;
  reviewingItem: string | null = null;
  isLoading = true;
  showThankYou = false;

  // use item.book as key instead of item.id
  reviewData: Record<string, { rating: number; review: string; liked: boolean | null }> = {};

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      this.isLoading = false;
      return;
    }

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

  toggleReview(bookId: string) {
    this.reviewingItem = this.reviewingItem === bookId ? null : bookId;
    if (!this.reviewData[bookId]) {
      this.reviewData[bookId] = { rating: 0, review: '', liked: null };
    }
  }

  setRating(bookId: string, rating: number) {
    if (!this.reviewData[bookId]) this.reviewData[bookId] = { rating: 0, review: '', liked: null };
    this.reviewData[bookId].rating = rating;
  }

  setLike(bookId: string, value: boolean) {
    if (!this.reviewData[bookId]) this.reviewData[bookId] = { rating: 0, review: '', liked: null };
    this.reviewData[bookId].liked = this.reviewData[bookId].liked === value ? null : value;
  }

  submitReview(bookId: string) {
    const data = this.reviewData[bookId];
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