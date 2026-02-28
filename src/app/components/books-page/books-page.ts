import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import BooksService from '../../services/books';
import { Book, BooksParams } from '../../models/books';
import { BookCard } from '../book-card/book-card';
import { Category } from '../../models/category';
import { Author } from '../../models/author';
import { CategoryService } from '../../services/category.service';
import { AuthorService } from '../../services/author.service';

type SortOption = 'relevance' | 'priceAsc' | 'priceDesc' | 'nameAsc' | 'nameDesc';

@Component({
  selector: 'app-books-page',
  imports: [FormsModule, RouterLink, BookCard],
  templateUrl: './books-page.html',
  styleUrl: './books-page.css',
})
export class BooksPage implements OnInit {
  private readonly booksService = inject(BooksService);
  private readonly categoryService = inject(CategoryService);
  private readonly authorService = inject(AuthorService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly route = inject(ActivatedRoute);

  booksState = signal<Book[]>([]);
  isLoadingState = signal(false);
  errorMessageState = signal('');

  searchTerm = '';
  minPrice = '';
  maxPrice = '';
  sortOption: SortOption = 'relevance';

  pageState = signal(1);
  limit = 8;
  totalPagesState = signal(1);
  totalResultsState = signal(0);

  categories: Category[] = [];
  selectedCategories: string[] = [];
  authors: Author[] = [];
  selectedAuthors: string[] = [];

  ngOnInit(): void {
    this.categoryService.getCategories({ limit: 100 })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data) => this.categories = data.results);

    this.authorService.getAuthors({ limit: 100 })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data) => this.authors = data.results);

    // Read query params (e.g. from home page author click)
    this.route.queryParams
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        if (params['author']) {
          this.selectedAuthors = [params['author']];
        }
        if (params['category']) {
          this.selectedCategories = [params['category']];
        }
        this.fetchBooks();
      });
  }

  fetchBooks(): void {
    this.isLoadingState.set(true);
    this.errorMessageState.set('');

    const params: BooksParams = {
      page: this.pageState(),
      limit: this.limit,
      name: this.searchTerm.trim() || undefined,
      minPrice: this.minPrice ? Number(this.minPrice) : undefined,
      maxPrice: this.maxPrice ? Number(this.maxPrice) : undefined,
      sortBy: this.mapSort(this.sortOption),
      author: this.selectedAuthors[0] || undefined,
      category: this.selectedCategories[0] || undefined,
    };

    this.booksService
      .getBooks(params)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.booksState.set(data.results);
          this.pageState.set(data.page);
          this.totalPagesState.set(data.totalPages || 1);
          this.totalResultsState.set(data.totalResults);
          this.isLoadingState.set(false);
        },
        error: () => {
          this.errorMessageState.set('Could not load books. Check API server and try again.');
          this.isLoadingState.set(false);
        },
      });
  }

  applyFilters(): void {
    if (!this.validPriceRange()) return;
    this.pageState.set(1);
    this.fetchBooks();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.minPrice = '';
    this.maxPrice = '';
    this.sortOption = 'relevance';
    this.selectedCategories = [];
    this.selectedAuthors = [];
    this.pageState.set(1);
    this.fetchBooks();
  }

  changePage(nextPage: number): void {
    if (nextPage < 1 || nextPage > this.totalPagesState() || nextPage === this.pageState()) return;
    this.pageState.set(nextPage);
    this.fetchBooks();
  }

  pages(): number[] {
    const start = Math.max(1, this.pageState() - 2);
    const end = Math.min(this.totalPagesState(), start + 4);
    const normalizedStart = Math.max(1, end - 4);
    return Array.from({ length: end - normalizedStart + 1 }, (_, i) => normalizedStart + i);
  }

  onSearchEnter(event: KeyboardEvent): void {
    if (event.key === 'Enter') this.applyFilters();
  }

  onCategoryChange(categoryId: string, checked: boolean): void {
    if (checked) {
      this.selectedCategories.push(categoryId);
    } else {
      this.selectedCategories = this.selectedCategories.filter(id => id !== categoryId);
    }
    this.applyFilters();
  }

  onAuthorChange(authorId: string, checked: boolean): void {
    if (checked) {
      this.selectedAuthors.push(authorId);
    } else {
      this.selectedAuthors = this.selectedAuthors.filter(id => id !== authorId);
    }
    this.applyFilters();
  }

  authorName(_book: Book): string {
    // TODO: return book.author.name once Book has author ref
    return 'Unknown Author';
  }

  rating(_book: Book): number {
    // TODO: return book.averageRating once Book has that field
    return 0;
  }

  stars(book: Book): string {
    return '★★★★★'.slice(0, Math.round(this.rating(book)));
  }

  formatPrice(price: number): string {
    return price.toFixed(2).replace(/\.00$/, '');
  }

  isOutOfStock(book: Book): boolean {
    return book.stock <= 0;
  }

  validPriceRange(): boolean {
    if (!this.minPrice || !this.maxPrice) return true;
    return Number(this.minPrice) <= Number(this.maxPrice);
  }

  private mapSort(sort: SortOption): string | undefined {
    if (sort === 'priceAsc') return 'price:asc';
    if (sort === 'priceDesc') return 'price:desc';
    if (sort === 'nameAsc') return 'name:asc';
    if (sort === 'nameDesc') return 'name:desc';
    return undefined;
  }
}
