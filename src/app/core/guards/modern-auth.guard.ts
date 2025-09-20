import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

// Modern Functional Guard (Angular 14+)
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);

  if (authService.hasValidToken()) {
    return true;
  }

  const refreshToken = authService.getRefreshToken();
  if (refreshToken) {
    return authService.refreshToken().pipe(
      map(() => true),
      catchError(() => {
        authService.logout(state.url);
        return of(false);
      })
    );
  }

  authService.logout(state.url);
  return false;
};

// Alternative: Signal-based auth check
export const signalAuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);

  if (authService.hasValidToken()) {
    return true;
  }

  const refreshToken = authService.getRefreshToken();
  if (refreshToken) {
    return authService.refreshToken().pipe(
      map(() => true),
      catchError(() => {
        authService.logout(state.url);
        return of(false);
      })
    );
  }

  authService.logout(state.url);
  return false;
};
