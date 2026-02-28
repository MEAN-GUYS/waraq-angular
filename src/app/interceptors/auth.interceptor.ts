import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth-service';
import { Router } from '@angular/router';

const AUTH_PATHS = ['/auth/login', '/auth/register', '/auth/refresh-tokens'];

export const authInterceptor: HttpInterceptorFn = (
    req: HttpRequest<unknown>,
    next: HttpHandlerFn
) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const platformId = inject(PLATFORM_ID);
    const isBrowser = isPlatformBrowser(platformId);

    // Skip auth endpoints to avoid infinite loops
    const isAuthRequest = AUTH_PATHS.some((path) => req.url.includes(path));
    if (isAuthRequest) {
        return next(req);
    }

    // Attach access token
    const token = authService.getAccessToken();
    const authReq = token
        ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
        : req;

    return next(authReq).pipe(
        catchError((error: HttpErrorResponse) => {
            if (error.status === 401 && isBrowser) {
                const refreshToken = authService.getRefreshToken();

                if (!refreshToken) {
                    // no refresh token - clear auth and redirect
                    authService.clearTokens();
                    router.navigate(['/login']);
                    return throwError(() => error);
                }

                return authService.refreshTokens().pipe(
                    switchMap((res) => {
                        const newReq = req.clone({
                            setHeaders: { Authorization: `Bearer ${res.tokens.access.token}` },
                        });
                        return next(newReq);
                    }),
                    catchError((refreshErr) => {
                        authService.clearTokens();
                        router.navigate(['/login']);
                        return throwError(() => refreshErr);
                    })
                );
            }

            return throwError(() => error);
        })
    );
};
