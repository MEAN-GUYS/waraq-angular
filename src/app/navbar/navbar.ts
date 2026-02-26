import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from '../services/auth-service';
import { CartService } from '../services/cart.service';
import { User } from '../models/registration';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, AsyncPipe],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class NavbarComponent {
  readonly authService = inject(AuthService);
  private readonly cartService = inject(CartService);
  private readonly router = inject(Router);

  readonly isLoggedIn$ = this.authService.isLoggedIn$;
  readonly user$ = this.isLoggedIn$.pipe(
    map((loggedIn): User | null => (loggedIn ? this.authService.getUser() : null))
  );
  readonly cartCount$ = this.cartService.count$;

  logout(): void {
    this.authService.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => {
        // Even if the API call fails, clear local tokens and redirect
        this.authService.clearTokens();
        this.router.navigate(['/login']);
      },
    });
  }
}
