import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import {
  User,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RefreshTokenRequest,
  ApiResponse
} from '../models/auth.models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = environment.api.baseUrl;
  private readonly TOKEN_KEY = environment.auth.tokenKey;
  private readonly REFRESH_TOKEN_KEY = environment.auth.refreshTokenKey;
  private readonly USER_KEY = environment.auth.userKey;

  private currentUserSubject = new BehaviorSubject<User | null>(this.getCurrentUser());
  public currentUser$ = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasValidToken());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_URL}/auth/login`, credentials)
      .pipe(
        tap(loginResponse => {
          this.setSession(loginResponse);
          this.currentUserSubject.next(loginResponse.user);
          this.isAuthenticatedSubject.next(true);
        }),
        catchError(this.handleError)
      );
  }

  register(credentials: RegisterRequest): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/auth/register`, credentials)
      .pipe(
        catchError(this.handleError)
      );
  }

  logout(): void {
    this.clearSession();
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/login']);
  }

  refreshToken(): Observable<LoginResponse> {
    const refreshToken = this.getRefreshToken();

    if (!refreshToken) {
      this.logout();
      return throwError(() => new Error('No refresh token available'));
    }

    const request: RefreshTokenRequest = { refreshToken };

    return this.http.post<LoginResponse>(`${this.API_URL}/auth/refresh`, request)
      .pipe(
        tap(loginResponse => {
          this.setSession(loginResponse);
          this.currentUserSubject.next(loginResponse.user);
        }),
        catchError(error => {
          this.logout();
          return this.handleError(error);
        })
      );
  }

  getCurrentUser(): User | null {
    const userData = localStorage.getItem(this.USER_KEY);
    if (userData) {
      try {
        return JSON.parse(userData);
      } catch {
        return null;
      }
    }

    // Demo auth için geçici user
    if (localStorage.getItem('produck_demo_auth')) {
      return {
        id: 'demo-user-1',
        username: 'admin',
        email: 'admin@produck.com',
        emailConfirmed: true,
        phoneNumber: '+1234567890',
        phoneNumberConfirmed: false,
        twoFactorEnabled: false,
        isActive: true,
        createdDate: new Date(),
        firstName: 'John',
        lastName: 'Doe',
        roles: ['admin', 'sales_manager'],
        permissions: ['workflow.read', 'team.read', 'security.read']
      };
    }

    return null;
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  hasValidToken(): boolean {
    const token = this.getAccessToken();
    if (!token) return false;

    try {
      const tokenData = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = tokenData.exp * 1000;
      return Date.now() < expirationTime;
    } catch {
      return false;
    }
  }

  hasPermission(permission: string): boolean {
    const user = this.getCurrentUser();
    return user?.permissions?.includes(permission) || false;
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.roles?.includes(role) || false;
  }

  hasAnyRole(roles: string[]): boolean {
    const user = this.getCurrentUser();
    if (!user || !user.roles) return false;
    return roles.some(role => user.roles!.includes(role));
  }

  private setSession(authResult: LoginResponse): void {
    localStorage.setItem(this.TOKEN_KEY, authResult.accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, authResult.refreshToken);
    localStorage.setItem(this.USER_KEY, JSON.stringify(authResult.user));
  }

  private clearSession(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  private handleError(error: any): Observable<never> {
    let errorMessage = 'An error occurred';

    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.error?.errors) {
      errorMessage = error.error.errors.join(', ');
    } else if (error.message) {
      errorMessage = error.message;
    }

    return throwError(() => new Error(errorMessage));
  }
}