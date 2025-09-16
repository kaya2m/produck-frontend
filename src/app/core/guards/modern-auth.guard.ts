import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { CanActivateFn } from '@angular/router';

// Modern Functional Guard (Angular 14+)
export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  // Mock authentication check - in real app would use AuthService
  const isAuthenticated = localStorage.getItem('produck_demo_auth') === 'true';

  if (isAuthenticated) {
    return true;
  }

  // Redirect to login with return URL
  router.navigate(['/login'], {
    queryParams: { returnUrl: state.url }
  });

  return false;
};

// Alternative: Signal-based auth check
export const signalAuthGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  // Check if user is authenticated
  const isAuthenticated = localStorage.getItem('produck_demo_auth') === 'true';

  if (isAuthenticated) {
    return true;
  }

  // Redirect to login with return URL
  router.navigate(['/login'], {
    queryParams: { returnUrl: state.url }
  });

  return false;
};