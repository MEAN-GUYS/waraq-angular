import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, distinctUntilChanged, map, Observable } from 'rxjs';
import { AuthService } from './auth-service';

export type CartItem = {
  productId: string;
  quantity: number;
};

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly STORAGE_KEY = 'cart_items';
  private readonly isBrowser: boolean;

  private readonly itemsSubject: BehaviorSubject<CartItem[]>;
  readonly items$: Observable<CartItem[]>;
  readonly count$: Observable<number>;

  constructor(
    private readonly authService: AuthService,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);

    const initialItems = this.isBrowser ? this.readFromStorage() : [];
    this.itemsSubject = new BehaviorSubject<CartItem[]>(initialItems);
    this.items$ = this.itemsSubject.asObservable();
    this.count$ = this.items$.pipe(
      map((items) => items.reduce((sum, item) => sum + item.quantity, 0)),
      distinctUntilChanged()
    );

    if (this.isBrowser) {
      this.authService.isLoggedIn$.subscribe((loggedIn) => {
        if (!loggedIn) this.clear();
      });
    }
  }

  setItems(items: CartItem[]): void {
    this.itemsSubject.next(items);
    this.writeToStorage(items);
  }

  clear(): void {
    this.itemsSubject.next([]);
    this.writeToStorage([]);
  }

  private readFromStorage(): CartItem[] {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed)) return [];

      return parsed
        .filter((v): v is CartItem => !!v && typeof v === 'object')
        .map((item: any) => ({
          productId: String(item.productId ?? ''),
          quantity: Number(item.quantity ?? 0),
        }))
        .filter((item) => item.productId.length > 0 && Number.isFinite(item.quantity) && item.quantity > 0);
    } catch {
      return [];
    }
  }

  private writeToStorage(items: CartItem[]): void {
    if (!this.isBrowser) return;
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
  }
}
