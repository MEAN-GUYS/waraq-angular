import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import BooksService from '../../services/books';
import { AuthorService } from '../../services/author.service';
import { UserService } from '../../services/user.service';
import { Book } from '../../models/books';
import { Author } from '../../models/author';
import { User } from '../../models/registration';
import { Order } from '../../models/order';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-admin-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-page.html',
  styleUrl: './admin-page.css',
  animations: [
    trigger('rowAnimation', [
      transition(':leave', [
        style({ opacity: 1, transform: 'scale(1)' }),
        animate('400ms cubic-bezier(0.4, 0, 0.2, 1)',
          style({ opacity: 0, transform: 'scale(0.9) translateX(30px)' })
        )
      ])
    ])
  ]
})
export class AdminPage implements OnInit {
  private readonly bookService = inject(BooksService);
  private readonly authorService = inject(AuthorService);
  private readonly userService = inject(UserService);

  currentView: 'dashboard' | 'books' | 'authors' | 'users' | 'orders' = 'dashboard';
  isDeleteUserDialogOpen = false;
  pendingDeleteUser: User | null = null;

  private toFiniteNumber(value: unknown, fallback = 0): number {
    const num = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(num) ? num : fallback;
  }

  // Stats
  totalBooks = signal(0);
  totalUsers = signal(0);
  totalOrders = computed(() => this.orders().length);
  totalRevenue = computed(() => {
    return this.orders().reduce((sum, order) => sum + this.toFiniteNumber(order.total), 0);
  });

  // Data
  books: Book[] = [];
  authors: Author[] = [];
  users = signal<User[]>([]);
  orders = signal<Order[]>([
    { id: 'ORD-001', customer: 'Sarah M.', items: 3, total: 73.94, status: 'Processing', payment: 'PENDING', date: 'Feb 18' },
    { id: 'ORD-002', customer: 'Ahmed K.', items: 1, total: 16.99, status: 'Out for Delivery', payment: 'PENDING', date: 'Feb 15' },
    { id: 'ORD-003', customer: 'Lisa T.', items: 2, total: 27.98, status: 'Delivered', payment: 'SUCCESS', date: 'Feb 10' },
  ]);

  // Feedback
  notification: { message: string, type: 'success' | 'error' | null } = { message: '', type: null };
  isDeletingUser = false;

  ngOnInit(): void {
    this.loadDashboardData();
    this.loadBooks();
    this.loadAuthors();
    this.loadUsers();
  }

  loadDashboardData(): void {
    forkJoin({
      books: this.bookService.getBooks({ limit: 1 }),
      authors: this.authorService.getAuthors({ limit: 1 }),
      users: this.userService.getUsers({ limit: 1 })
    }).subscribe({
      next: (res) => {
        this.totalBooks.set(this.toFiniteNumber(res.books?.totalResults));
        this.totalUsers.set(this.toFiniteNumber(res.users?.totalResults));
      },
      error: (err) => console.error('Error loading dashboard data', err)
    });
  }

  loadBooks(): void {
    this.bookService.getBooks({ limit: 5 }).subscribe(res => this.books = res.results);
  }

  loadAuthors(): void {
    this.authorService.getAuthors({ limit: 10 }).subscribe(res => this.authors = res.results);
  }

  loadUsers(): void {
    this.userService.getUsers({ limit: 10 }).subscribe(res => this.users.set(res.results));
  }

  setView(view: 'dashboard' | 'books' | 'authors' | 'users' | 'orders'): void {
    this.currentView = view;
  }

  deleteBook(id: string): void {
    if (confirm('Are you sure you want to delete this book?')) {
      this.bookService.deleteBook(id).subscribe({
        next: () => {
          this.loadBooks();
          // Keep dashboard total in sync without needing a manual refresh.
          this.totalBooks.update((prev) => Math.max(0, prev - 1));
        },
        error: (err) => console.error(err),
      });
    }
  }

  deleteUser(id: string): void {
    this.isDeletingUser = true;
    this.userService.deleteUser(id).subscribe({
      next: () => {
        this.showNotification('User deleted successfully', 'success');
        this.users.update(prev => prev.filter(u => u.id !== id));
        this.totalUsers.update((prev) => Math.max(0, prev - 1));
        this.isDeletingUser = false;
        this.closeDeleteUserDialog();
      },
      error: (err) => {
        this.showNotification('Failed to delete user', 'error');
        console.error(err);
        this.isDeletingUser = false;
      }
    });
  }

  requestDeleteUser(user: User): void {
    if (this.isDeletingUser) return;
    this.pendingDeleteUser = user;
    this.isDeleteUserDialogOpen = true;
  }

  closeDeleteUserDialog(): void {
    if (this.isDeletingUser) return;
    this.isDeleteUserDialogOpen = false;
    this.pendingDeleteUser = null;
  }

  confirmDeleteUser(): void {
    if (!this.pendingDeleteUser || this.isDeletingUser) return;
    this.deleteUser(this.pendingDeleteUser.id);
  }

  showNotification(message: string, type: 'success' | 'error'): void {
    this.notification = { message, type };
    setTimeout(() => {
      this.notification = { message: '', type: null };
    }, 3000);
  }

  // Placeholder for Edit/Update actions
  editBook(book: Book): void {
    console.log('Edit book', book);
  }

  updateOrderStatus(orderId: string): void {
    console.log('Update order status', orderId);
  }
}
