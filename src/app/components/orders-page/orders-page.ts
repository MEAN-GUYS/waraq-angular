import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import OrdersService, { Order } from '../../services/orders';

@Component({
  selector: 'app-orders-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './orders-page.html',
  styleUrl: './orders-page.css'
})
export class OrdersPage implements OnInit {
  private readonly ordersService = inject(OrdersService);
  private readonly destroyRef = inject(DestroyRef);

  orders: Order[] = [];
  expandedOrder: string | null = null;
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
