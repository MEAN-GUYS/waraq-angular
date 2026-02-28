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
    return this.orders().reduce((sum, order) => sum + this.toFiniteNumber(order.totalPrice), 0);
  });

  // Data
  books: Book[] = [];
  authors: Author[] = [];
  users = signal<User[]>([]);
  orders = signal<Order[]>([]);

  // Feedback
  notification: { message: string, type: 'success' | 'error' | null } = { message: '', type: null };
  notificationTimeoutId?: number;
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
    this.bookService.getBooks({ limit: 5 }).subscribe({
      next: res => this.books = res.results,
      error: err => {
        console.error('Failed to load books:', err);
        this.books = [];
        this.showNotification('Failed to load books. Please try again.');
      }
    });
  }

  loadAuthors(): void {
    this.authorService.getAuthors({ limit: 10 }).subscribe({
      next: res => this.authors = res.results,
      error: err => {
        console.error('Failed to load authors:', err);
        this.authors = [];
        this.showNotification('Failed to load authors. Please try again.');
      }
    });
  }

  loadUsers(): void {
    this.userService.getUsers({ limit: 10 }).subscribe({
      next: res => this.users.set(res.results),
      error: err => {
        console.error('Failed to load users:', err);
        this.users.set([]);
        this.showNotification('Failed to load users. Please try again.');
      }
    });
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

  showNotification(message: string, type: 'success' | 'error' = 'error'): void {
    // clear any existing timer
    if (this.notificationTimeoutId) {
      clearTimeout(this.notificationTimeoutId);
    }

    this.notification = { message, type };
    this.notificationTimeoutId = setTimeout(() => {
      this.notification = { message: '', type: null };
      this.notificationTimeoutId = undefined;
    }, 3000) as unknown as number;
  }

  // Edit/Update actions
  editBook(book: Book): void {
    // todo: implement edit modal or navigate to edit page
    this.showNotification('Edit book feature coming soon', 'error');
  }

  updateOrderStatus(orderId: string): void {
    // todo: implement order status update
    this.showNotification('Order status update coming soon', 'error');
  }

  // Add handlers
  onAddBook(): void {
    // todo: open add book modal or navigate to add page
    this.showNotification('Add book feature coming soon', 'error');
  }

  onAddAuthor(): void {
    // todo: open add author modal
    this.showNotification('Add author feature coming soon', 'error');
  }

  // Edit handlers
  onEditAuthor(author: Author): void {
    // todo: open edit author modal
    this.showNotification('Edit author feature coming soon', 'error');
  }

  onEditUser(user: User): void {
    // todo: open edit user modal
    this.showNotification('Edit user feature coming soon', 'error');
  }

  // Delete handlers
  onDeleteAuthor(author: Author): void {
    if (confirm(`Delete author ${author.name}?`)) {
      // todo: implement author deletion
      this.showNotification('Delete author feature coming soon', 'error');
    }
  }
}
