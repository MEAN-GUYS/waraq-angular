import { Component, inject, OnInit, signal } from '@angular/core';
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

  // Stats
  totalBooks = 0;
  totalOrders = 0;
  totalUsers = 0;
  totalRevenue = 4230; // Mocked as per design

  // Data
  books: Book[] = [];
  authors: Author[] = [];
  users = signal<User[]>([]);
  orders: Order[] = [
    { id: 'ORD-001', customer: 'Sarah M.', items: 3, total: 73.94, status: 'Processing', payment: 'PENDING', date: 'Feb 18' },
    { id: 'ORD-002', customer: 'Ahmed K.', items: 1, total: 16.99, status: 'Out for Delivery', payment: 'PENDING', date: 'Feb 15' },
    { id: 'ORD-003', customer: 'Lisa T.', items: 2, total: 27.98, status: 'Delivered', payment: 'SUCCESS', date: 'Feb 10' },
  ];

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
        this.totalBooks = res.books.totalResults;
        this.totalUsers = res.users.totalResults;
        this.totalOrders = 156; // Mocked
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
      this.bookService.deleteBook(id).subscribe(() => this.loadBooks());
    }
  }

  deleteUser(id: string): void {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      this.isDeletingUser = true;
      this.userService.deleteUser(id).subscribe({
        next: () => {
          this.showNotification('User deleted successfully', 'success');
          // Update signal locally for instant UI update with animation
          this.users.update(prev => prev.filter(u => u.id !== id));
          this.isDeletingUser = false;
        },
        error: (err) => {
          this.showNotification('Failed to delete user', 'error');
          console.error(err);
          this.isDeletingUser = false;
        }
      });
    }
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
