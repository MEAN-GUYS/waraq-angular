# Angular Page Pattern (Signals + Service Calls)

Use this for every new data page (`books`, `orders`, `cart`, etc.).

## Quick Copy/Paste Starter

```ts
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-your-page',
  templateUrl: './your-page.html',
})
export class YourPage implements OnInit {
  private readonly service = inject(YourService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly itemsState = signal<Item[]>([]);
  private readonly loadingState = signal(false);
  private readonly errorState = signal('');

  readonly items = computed(() => this.itemsState());
  readonly loading = computed(() => this.loadingState());
  readonly error = computed(() => this.errorState());

  ngOnInit(): void {
    this.fetch();
  }

  fetch(): void {
    this.loadingState.set(true);
    this.errorState.set('');

    this.service
      .getItems()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.itemsState.set(res.results);
          this.loadingState.set(false);
        },
        error: () => {
          this.errorState.set('Could not load data.');
          this.loadingState.set(false);
        },
      });
  }
}
```

```html
<p>Count: {{ items().length }}</p>
@if (error()) { <p>{{ error() }}</p> }
@if (loading()) { <p>Loading...</p> } @else {
  @for (item of items(); track item.id) {
    <div>{{ item.name }}</div>
  }
}
```

Rule: never use `{{ mySignal }}`. Always use `{{ mySignal() }}`.

## 1) Service pattern

```ts
// src/app/services/books.ts
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Item {
  id: string;
  name: string;
}

export interface ListResponse {
  results: Item[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
}

export interface ListParams {
  page?: number;
  limit?: number;
  name?: string;
}

@Injectable({ providedIn: 'root' })
export default class ItemsService {
  constructor(private http: HttpClient) {}

  getItems(params?: ListParams): Observable<ListResponse> {
    let httpParams = new HttpParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        const isPrimitive = ['string', 'number', 'boolean'].includes(typeof value);
        if (value !== undefined && value !== null && isPrimitive) {
          httpParams = httpParams.set(key, String(value));
        }
      });
    }

    return this.http.get<ListResponse>(`${environment.apiUrl}/items`, { params: httpParams });
  }
}
```

## 2) Component pattern (Signals)

```ts
// src/app/components/items-page/items-page.ts
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import ItemsService, { Item, ListParams } from '../../services/items';

@Component({
  selector: 'app-items-page',
  imports: [FormsModule],
  templateUrl: './items-page.html',
})
export class ItemsPage implements OnInit {
  private readonly itemsService = inject(ItemsService);
  private readonly destroyRef = inject(DestroyRef);

  // Internal state signals
  private readonly itemsState = signal<Item[]>([]);
  private readonly loadingState = signal(false);
  private readonly errorState = signal('');
  private readonly pageState = signal(1);
  private readonly totalPagesState = signal(1);
  private readonly totalResultsState = signal(0);

  // UI inputs (plain fields are fine)
  searchTerm = '';
  limit = 8;

  // Template-safe computed values
  readonly items = computed(() => this.itemsState());
  readonly loading = computed(() => this.loadingState());
  readonly error = computed(() => this.errorState());
  readonly page = computed(() => this.pageState());
  readonly totalPages = computed(() => this.totalPagesState());
  readonly totalResults = computed(() => this.totalResultsState());

  ngOnInit(): void {
    this.fetchItems();
  }

  fetchItems(): void {
    this.loadingState.set(true);
    this.errorState.set('');

    const params: ListParams = {
      page: this.pageState(),
      limit: this.limit,
      name: this.searchTerm.trim() || undefined,
    };

    this.itemsService
      .getItems(params)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.itemsState.set(res.results);
          this.pageState.set(res.page);
          this.totalPagesState.set(res.totalPages || 1);
          this.totalResultsState.set(res.totalResults);
          this.loadingState.set(false);
        },
        error: () => {
          this.errorState.set('Could not load items. Try again.');
          this.loadingState.set(false);
        },
      });
  }

  applySearch(): void {
    this.pageState.set(1);
    this.fetchItems();
  }

  changePage(nextPage: number): void {
    if (nextPage < 1 || nextPage > this.totalPagesState() || nextPage === this.pageState()) return;
    this.pageState.set(nextPage);
    this.fetchItems();
  }
}
```

## 3) Template pattern

```html
<!-- src/app/components/items-page/items-page.html -->
<section>
  <input [(ngModel)]="searchTerm" placeholder="Search..." />
  <button (click)="applySearch()">Search</button>

  <p>Showing {{ items().length }} of {{ totalResults() }} items</p>

  @if (error()) {
    <p>{{ error() }}</p>
  }

  @if (loading()) {
    <p>Loading...</p>
  } @else if (items().length === 0) {
    <p>No items found.</p>
  } @else {
    @for (item of items(); track item.id) {
      <div>{{ item.name }}</div>
    }
  }

  @if (totalPages() > 1) {
    <button [disabled]="page() === 1" (click)="changePage(page() - 1)">Prev</button>
    <span>Page {{ page() }} / {{ totalPages() }}</span>
    <button [disabled]="page() === totalPages()" (click)="changePage(page() + 1)">Next</button>
  }
</section>
```

## 4) Rules to avoid `[Signal: ...]` bugs

- Never write `{{ mySignal }}` in template.
- Always read signal/computed values as `{{ mySignal() }}`.
- Never send signal objects in HTTP params.
- Keep a dedicated loading and error signal for every API call.

## 5) Pre-commit checklist

1. Template only reads signal values with `()`.
2. API params are primitives only.
3. `loading` and `error` are always set in both success/error paths.
4. Pagination/search resets page to `1` before fetching.
5. Build passes.
