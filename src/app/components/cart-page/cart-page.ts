import { isPlatformBrowser } from '@angular/common';
import { Component, DestroyRef, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from '../../services/auth-service';
import { CartService } from '../../services/cart';

@Component({
  selector: 'app-cart-page',
  imports: [RouterLink],
  templateUrl: './cart-page.html',
  styleUrl: './cart-page.css',
})
export class CartPage implements OnInit {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  readonly cartService = inject(CartService);

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.authService.isLoggedIn$
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        filter((loggedIn) => !loggedIn)
      )
      .subscribe(() => {
        this.router.navigate(['/login']);
      });
  }
}
