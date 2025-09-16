import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, map, take } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.authService.isAuthenticated$.pipe(
      take(1),
      map(isAuthenticated => {
        if (isAuthenticated) {
          return true;
        }

        this.router.navigate(['/login'], {
          queryParams: { returnUrl: state.url }
        });
        return false;
      })
    );
  }
}

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.authService.isAuthenticated$.pipe(
      take(1),
      map(isAuthenticated => {
        if (!isAuthenticated) {
          this.router.navigate(['/login']);
          return false;
        }

        const requiredRoles = route.data['roles'] as string[];
        const requiredPermissions = route.data['permissions'] as string[];

        if (requiredRoles && requiredRoles.length > 0) {
          if (!this.authService.hasAnyRole(requiredRoles)) {
            this.router.navigate(['/unauthorized']);
            return false;
          }
        }

        if (requiredPermissions && requiredPermissions.length > 0) {
          const hasPermission = requiredPermissions.some(permission =>
            this.authService.hasPermission(permission)
          );

          if (!hasPermission) {
            this.router.navigate(['/unauthorized']);
            return false;
          }
        }

        return true;
      })
    );
  }
}