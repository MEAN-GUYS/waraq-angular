import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, BehaviorSubject, of, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthResponse, LoginPayload, RegistrationPayload, User } from '../models/registration';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly AUTH_URL = `${environment.apiUrl}/auth`;
  private readonly ACCESS_TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly ACCESS_EXPIRES_KEY = 'access_expires';
  private readonly REFRESH_EXPIRES_KEY = 'refresh_expires';
  private readonly USER_KEY = 'user';

  private isBrowser: boolean;
  private loggedIn$ = new BehaviorSubject<boolean>(false);
  isLoggedIn$ = this.loggedIn$.asObservable();

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.loggedIn$.next(this.isLoggedIn());
  }

  // ── Auth API calls ──────────────────────────────────────────

  register(payload: RegistrationPayload): Observable<AuthResponse> {
    const body = {
      name: `${payload.firstName} ${payload.lastName}`,
      email: payload.email,
      password: payload.password,
      dob: payload.dob,
    };
    return this.http
      .post<AuthResponse>(`${this.AUTH_URL}/register`, body)
      .pipe(tap((res) => this.handleAuthResponse(res)));
  }

  login(payload: LoginPayload): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.AUTH_URL}/login`, payload)
      .pipe(tap((res) => this.handleAuthResponse(res)));
  }

  logout(): Observable<void> {
    const refreshToken = this.getRefreshToken();
    // always clear tokens locally first
    this.clearTokens();

    if (!refreshToken) {
      return of(undefined);
    }

    return this.http
      .post<void>(`${this.AUTH_URL}/logout`, { refreshToken })
      .pipe(
        catchError(() => {
          // ignore logout API errors - user is logged out locally
          return of(undefined);
        })
      );
  }

  refreshTokens(): Observable<AuthResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http
      .post<AuthResponse>(`${this.AUTH_URL}/refresh-tokens`, { refreshToken })
      .pipe(tap((res) => this.saveTokens(res.tokens)));
  }

  // ── Token helpers ───────────────────────────────────────────

  getAccessToken(): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.getAccessToken();
  }

  getUser(): User | null {
    if (!this.isBrowser) return null;
    const raw = localStorage.getItem(this.USER_KEY);
    if (!raw) return null;

    try {
      return JSON.parse(raw);
    } catch {
      // clear corrupted data
      localStorage.removeItem(this.USER_KEY);
      return null;
    }
  }

  getRole(): string | null {
    return this.getUser()?.role ?? null;
  }

  clearTokens(): void {
    if (!this.isBrowser) return;
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.ACCESS_EXPIRES_KEY);
    localStorage.removeItem(this.REFRESH_EXPIRES_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.loggedIn$.next(false);
  }

  // ── Private helpers ─────────────────────────────────────────

  private handleAuthResponse(res: AuthResponse): void {
    this.saveTokens(res.tokens);
    this.saveUser(res.user);
    this.loggedIn$.next(true);
  }

  saveTokens(tokens: AuthResponse['tokens']): void {
    if (!this.isBrowser) return;
    localStorage.setItem(this.ACCESS_TOKEN_KEY, tokens.access.token);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, tokens.refresh.token);
    localStorage.setItem(this.ACCESS_EXPIRES_KEY, tokens.access.expires);
    localStorage.setItem(this.REFRESH_EXPIRES_KEY, tokens.refresh.expires);
  }

  private saveUser(user: User): void {
    if (!this.isBrowser) return;
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }
}