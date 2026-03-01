import { Component, computed, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import BooksService from '../../services/books';
import { AuthorService } from '../../services/author.service';
import { UserService } from '../../services/user.service';
import { CategoryService } from '../../services/category.service';
import OrdersService, { Order } from '../../services/orders';
import { Book } from '../../models/books';
import { Author } from '../../models/author';
import { Category } from '../../models/category';
import { User } from '../../models/registration';
import { forkJoin } from 'rxjs';

type ModalType = 'book' | 'author' | 'category' | 'order' | 'user' | null;

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
  private readonly categoryService = inject(CategoryService);
  private readonly orderService = inject(OrdersService);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private static readonly VIEW_KEY = 'admin_current_view';
  private static readonly VALID_VIEWS = ['dashboard', 'books', 'authors', 'users', 'orders', 'categories'];

  currentView: 'dashboard' | 'books' | 'authors' | 'users' | 'orders' | 'categories' = this.restoreView();

  // Generic delete dialog
  isDeleteDialogOpen = false;
  deleteTarget: { type: 'book' | 'author' | 'category' | 'user'; id: string; name: string } | null = null;
  isDeleting = false;

  // Modal state
  activeModal: ModalType = null;
  isEditing = false;
  isSaving = false;

  // Book form
  bookForm = { name: '', description: '', price: 0, stock: 0, authorId: '', categoryId: '' };
  bookCoverFile: File | null = null;
  editingBookId = '';

  // Author form
  authorForm = { name: '', bio: '' };
  editingAuthorId = '';

  // Category form
  categoryForm = { name: '' };
  editingCategoryId = '';

  // Order form
  orderForm = { shippingStatus: '', paymentStatus: '' };
  editingOrderId = '';

  // User form
  userForm = { name: '', email: '', role: '' };
  editingUserId = '';

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
  categories: Category[] = [];
  users = signal<User[]>([]);
  orders = signal<Order[]>([]);

  // Books pagination
  booksPage = 1;
  booksLimit = 10;
  booksTotalPages = 1;
  booksTotalResults = 0;

  // Authors pagination
  authorsPage = 1;
  authorsLimit = 10;
  authorsTotalPages = 1;
  authorsTotalResults = 0;

  // Categories pagination
  categoriesPage = 1;
  categoriesLimit = 10;
  categoriesTotalPages = 1;
  categoriesTotalResults = 0;

  // Users pagination
  usersPage = 1;
  usersLimit = 10;
  usersTotalPages = 1;
  usersTotalResults = 0;

  // Orders pagination & sorting
  ordersPage = 1;
  ordersLimit = 10;
  ordersTotalPages = 1;
  ordersTotalResults = 0;
  ordersSortBy = 'createdAt:desc';

  // Mobile sidebar
  sidebarOpen = false;

  // Feedback
  notification: { message: string, type: 'success' | 'error' | null } = { message: '', type: null };
  notificationTimeoutId?: number;

  ngOnInit(): void {
    this.loadDashboardData();
    this.loadBooks();
    this.loadAuthors();
    this.loadCategories();
    this.loadUsers();
    this.loadOrders();
  }

  loadDashboardData(): void {
    forkJoin({
      books: this.bookService.getBooks({ limit: 1 }),
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
    this.bookService.getBooks({ page: this.booksPage, limit: this.booksLimit }).subscribe({
      next: res => {
        this.books = res.results;
        this.booksTotalPages = res.totalPages;
        this.booksTotalResults = res.totalResults;
      },
      error: () => {
        this.books = [];
        this.showNotification('Failed to load books');
      }
    });
  }

  loadAuthors(): void {
    this.authorService.getAuthors({ page: this.authorsPage, limit: this.authorsLimit }).subscribe({
      next: res => {
        this.authors = res.results;
        this.authorsTotalPages = res.totalPages;
        this.authorsTotalResults = res.totalResults;
      },
      error: () => {
        this.authors = [];
        this.showNotification('Failed to load authors');
      }
    });
  }

  loadCategories(): void {
    this.categoryService.getCategories({ page: this.categoriesPage, limit: this.categoriesLimit }).subscribe({
      next: res => {
        this.categories = res.results;
        this.categoriesTotalPages = res.totalPages;
        this.categoriesTotalResults = res.totalResults;
      },
      error: () => {
        this.categories = [];
        this.showNotification('Failed to load categories');
      }
    });
  }

  loadUsers(): void {
    this.userService.getUsers({ page: this.usersPage, limit: this.usersLimit }).subscribe({
      next: res => {
        this.users.set(res.results);
        this.usersTotalPages = res.totalPages;
        this.usersTotalResults = res.totalResults;
      },
      error: () => {
        this.users.set([]);
        this.showNotification('Failed to load users');
      }
    });
  }

  loadOrders(): void {
    this.orderService.getAllOrders({ page: this.ordersPage, limit: this.ordersLimit, sortBy: this.ordersSortBy }).subscribe({
      next: res => {
        this.orders.set(res.results);
        this.ordersTotalPages = res.totalPages;
        this.ordersTotalResults = res.totalResults;
      },
      error: () => {
        this.orders.set([]);
        this.showNotification('Failed to load orders');
      }
    });
  }

  goToBooksPage(page: number): void {
    if (page < 1 || page > this.booksTotalPages) return;
    this.booksPage = page;
    this.loadBooks();
  }

  goToAuthorsPage(page: number): void {
    if (page < 1 || page > this.authorsTotalPages) return;
    this.authorsPage = page;
    this.loadAuthors();
  }

  goToCategoriesPage(page: number): void {
    if (page < 1 || page > this.categoriesTotalPages) return;
    this.categoriesPage = page;
    this.loadCategories();
  }

  goToUsersPage(page: number): void {
    if (page < 1 || page > this.usersTotalPages) return;
    this.usersPage = page;
    this.loadUsers();
  }

  goToOrdersPage(page: number): void {
    if (page < 1 || page > this.ordersTotalPages) return;
    this.ordersPage = page;
    this.loadOrders();
  }

  setView(view: typeof this.currentView): void {
    this.currentView = view;
    if (this.isBrowser) localStorage.setItem(AdminPage.VIEW_KEY, view);
  }

  private restoreView(): typeof this.currentView {
    if (!this.isBrowser) return 'dashboard';
    const saved = localStorage.getItem(AdminPage.VIEW_KEY);
    return saved && AdminPage.VALID_VIEWS.includes(saved) ? saved as typeof this.currentView : 'dashboard';
  }

  // ── Modal controls ──

  openModal(type: ModalType): void {
    this.activeModal = type;
    this.isEditing = false;
    this.isSaving = false;
    this.resetForms();
  }

  closeModal(): void {
    if (this.isSaving) return;
    this.activeModal = null;
    this.isEditing = false;
    this.resetForms();
  }

  private resetForms(): void {
    this.bookForm = { name: '', description: '', price: 0, stock: 0, authorId: '', categoryId: '' };
    this.bookCoverFile = null;
    this.editingBookId = '';
    this.authorForm = { name: '', bio: '' };
    this.editingAuthorId = '';
    this.categoryForm = { name: '' };
    this.editingCategoryId = '';
    this.orderForm = { shippingStatus: '', paymentStatus: '' };
    this.editingOrderId = '';
    this.userForm = { name: '', email: '', role: '' };
    this.editingUserId = '';
  }

  // ── Book CRUD ──

  onAddBook(): void {
    this.openModal('book');
  }

  editBook(book: Book): void {
    this.activeModal = 'book';
    this.isEditing = true;
    this.editingBookId = book.id;
    this.bookForm = {
      name: book.name,
      description: book.description || '',
      price: book.price,
      stock: book.stock,
      authorId: book.author?.id || book.author || '',
      categoryId: book.category?.id || book.category || ''
    };
  }

  onBookFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.bookCoverFile = input.files[0];
    }
  }

  saveBook(): void {
    this.isSaving = true;
    const fd = new FormData();
    fd.append('name', this.bookForm.name);
    fd.append('description', this.bookForm.description);
    fd.append('price', String(this.bookForm.price));
    fd.append('stock', String(this.bookForm.stock));
    if (this.bookForm.authorId) fd.append('author', this.bookForm.authorId);
    if (this.bookForm.categoryId) fd.append('category', this.bookForm.categoryId);
    if (this.bookCoverFile) fd.append('cover', this.bookCoverFile);

    const req$ = this.isEditing
      ? this.bookService.updateBook(this.editingBookId, fd)
      : this.bookService.createBook(fd);

    req$.subscribe({
      next: () => {
        const wasEditing = this.isEditing;
        this.showNotification(wasEditing ? 'Book updated' : 'Book created', 'success');
        this.isSaving = false;
        this.closeModal();
        this.loadBooks();
        if (!wasEditing) this.totalBooks.update(v => v + 1);
      },
      error: (err) => {
        this.isSaving = false;
        this.showNotification(err.error?.message || 'Failed to save book');
      }
    });
  }

  deleteBook(book: Book): void {
    this.requestDelete('book', book.id, book.name);
  }

  // ── Author CRUD ──

  onAddAuthor(): void {
    this.openModal('author');
  }

  onEditAuthor(author: Author): void {
    this.activeModal = 'author';
    this.isEditing = true;
    this.editingAuthorId = author.id;
    this.authorForm = { name: author.name, bio: author.bio || '' };
  }

  saveAuthor(): void {
    this.isSaving = true;
    const req$ = this.isEditing
      ? this.authorService.updateAuthor(this.editingAuthorId, this.authorForm)
      : this.authorService.createAuthor(this.authorForm);

    req$.subscribe({
      next: () => {
        this.showNotification(this.isEditing ? 'Author updated' : 'Author created', 'success');
        this.isSaving = false;
        this.closeModal();
        this.loadAuthors();
      },
      error: (err) => {
        this.isSaving = false;
        this.showNotification(err.error?.message || 'Failed to save author');
      }
    });
  }

  onDeleteAuthor(author: Author): void {
    this.requestDelete('author', author.id, author.name);
  }

  // ── Category CRUD ──

  onAddCategory(): void {
    this.openModal('category');
  }

  onEditCategory(cat: Category): void {
    this.activeModal = 'category';
    this.isEditing = true;
    this.editingCategoryId = cat.id;
    this.categoryForm = { name: cat.name };
  }

  saveCategory(): void {
    this.isSaving = true;
    const req$ = this.isEditing
      ? this.categoryService.updateCategory(this.editingCategoryId, this.categoryForm)
      : this.categoryService.createCategory(this.categoryForm);

    req$.subscribe({
      next: () => {
        this.showNotification(this.isEditing ? 'Category updated' : 'Category created', 'success');
        this.isSaving = false;
        this.closeModal();
        this.loadCategories();
      },
      error: (err) => {
        this.isSaving = false;
        this.showNotification(err.error?.message || 'Failed to save category');
      }
    });
  }

  onDeleteCategory(cat: Category): void {
    this.requestDelete('category', cat.id, cat.name);
  }

  // ── Order status update ──

  updateOrderStatus(order: Order): void {
    this.activeModal = 'order';
    this.isEditing = true;
    this.editingOrderId = order.id;
    this.orderForm = {
      shippingStatus: order.shippingStatus,
      paymentStatus: order.paymentStatus
    };
  }

  saveOrderStatus(): void {
    this.isSaving = true;
    this.orderService.updateOrderStatus(this.editingOrderId, this.orderForm).subscribe({
      next: () => {
        this.showNotification('Order updated', 'success');
        this.isSaving = false;
        this.closeModal();
        this.loadOrders();
      },
      error: (err) => {
        this.isSaving = false;
        this.showNotification(err.error?.message || 'Failed to update order');
      }
    });
  }

  // ── User edit ──

  onEditUser(user: User): void {
    this.activeModal = 'user';
    this.isEditing = true;
    this.editingUserId = user.id;
    this.userForm = { name: user.name, email: user.email, role: user.role };
  }

  saveUser(): void {
    this.isSaving = true;
    this.userService.updateUser(this.editingUserId, this.userForm).subscribe({
      next: () => {
        this.showNotification('User updated', 'success');
        this.isSaving = false;
        this.closeModal();
        this.loadUsers();
      },
      error: (err) => {
        this.isSaving = false;
        this.showNotification(err.error?.message || 'Failed to update user');
      }
    });
  }

  // ── Generic delete dialog ──

  requestDelete(type: 'book' | 'author' | 'category' | 'user', id: string, name: string): void {
    if (this.isDeleting) return;
    this.deleteTarget = { type, id, name };
    this.isDeleteDialogOpen = true;
  }

  closeDeleteDialog(): void {
    if (this.isDeleting) return;
    this.isDeleteDialogOpen = false;
    this.deleteTarget = null;
  }

  confirmDelete(): void {
    if (!this.deleteTarget || this.isDeleting) return;
    this.isDeleting = true;
    const { type, id } = this.deleteTarget;

    let req$;
    switch (type) {
      case 'book':
        req$ = this.bookService.deleteBook(id);
        break;
      case 'author':
        req$ = this.authorService.deleteAuthor(id);
        break;
      case 'category':
        req$ = this.categoryService.deleteCategory(id);
        break;
      case 'user':
        req$ = this.userService.deleteUser(id);
        break;
    }

    req$.subscribe({
      next: () => {
        const label = type.charAt(0).toUpperCase() + type.slice(1);
        this.showNotification(`${label} deleted`, 'success');
        this.isDeleting = false;
        this.closeDeleteDialog();

        switch (type) {
          case 'book':
            this.loadBooks();
            this.totalBooks.update(v => Math.max(0, v - 1));
            break;
          case 'author':
            this.loadAuthors();
            break;
          case 'category':
            this.loadCategories();
            break;
          case 'user':
            this.users.update(prev => prev.filter(u => u.id !== id));
            this.totalUsers.update(v => Math.max(0, v - 1));
            break;
        }
      },
      error: (err) => {
        this.showNotification(err.error?.message || `Failed to delete ${type}`);
        this.isDeleting = false;
      }
    });
  }

  // ── Notification ──

  showNotification(message: string, type: 'success' | 'error' = 'error'): void {
    if (this.notificationTimeoutId) clearTimeout(this.notificationTimeoutId);
    this.notification = { message, type };
    this.notificationTimeoutId = setTimeout(() => {
      this.notification = { message: '', type: null };
      this.notificationTimeoutId = undefined;
    }, 3000) as unknown as number;
  }
}
