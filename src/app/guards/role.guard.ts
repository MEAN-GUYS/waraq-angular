import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth-service';

export const roleGuard = (allowedRoles: string[]): CanActivateFn => (_route, state) => {
  const platformId = inject(PLATFORM_ID);
  if (!isPlatformBrowser(platformId)) return true;

  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
  }

  const role = authService.getRole();
  if (!role) return router.createUrlTree(['/']);

  const normalizedAllowed = allowedRoles.map((r) => r.toLowerCase());
  if (normalizedAllowed.includes(role.toLowerCase())) return true;

  return router.createUrlTree(['/']);
};

export const adminGuard: CanActivateFn = roleGuard(['admin']);
export const userGuard: CanActivateFn = roleGuard(['user']);

