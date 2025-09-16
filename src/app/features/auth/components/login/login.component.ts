import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../../core/services/auth.service';
import { LoginRequest } from '../../../../core/models/auth.models';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="space-y-6">
      <div>
        <h2 class="text-2xl font-bold text-gray-900 text-center">Sign in to your account</h2>
        <p class="mt-2 text-sm text-gray-600 text-center">
          Or
          <a routerLink="/auth/register" class="font-medium text-primary-600 hover:text-primary-500">
            create a new account
          </a>
        </p>
      </div>

      <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-6">
        <div>
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Email address</mat-label>
            <input matInput type="email" formControlName="email" placeholder="Enter your email">
            <mat-icon matPrefix>email</mat-icon>
            @if (loginForm.get('email')?.hasError('required')) {
              <mat-error>Email is required</mat-error>
            }
            @if (loginForm.get('email')?.hasError('email')) {
              <mat-error>Please enter a valid email</mat-error>
            }
          </mat-form-field>
        </div>

        <div>
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Password</mat-label>
            <input matInput
                   [type]="hidePassword ? 'password' : 'text'"
                   formControlName="password"
                   placeholder="Enter your password">
            <mat-icon matPrefix>lock</mat-icon>
            <button mat-icon-button matSuffix
                    (click)="hidePassword = !hidePassword"
                    type="button"
                    [attr.aria-label]="'Hide password'"
                    [attr.aria-pressed]="hidePassword">
              <mat-icon>{{hidePassword ? 'visibility_off' : 'visibility'}}</mat-icon>
            </button>
            @if (loginForm.get('password')?.hasError('required')) {
              <mat-error>Password is required</mat-error>
            }
          </mat-form-field>
        </div>

        <div class="flex items-center justify-between">
          <mat-checkbox formControlName="rememberMe" color="primary">
            Remember me
          </mat-checkbox>
          <a routerLink="/auth/forgot-password"
             class="text-sm font-medium text-primary-600 hover:text-primary-500">
            Forgot your password?
          </a>
        </div>

        <div>
          <button mat-raised-button
                  color="primary"
                  type="submit"
                  class="w-full"
                  [disabled]="loginForm.invalid || isLoading()">
            @if (isLoading()) {
              <mat-spinner diameter="20" class="mr-2"></mat-spinner>
            }
            {{ isLoading() ? 'Signing in...' : 'Sign in' }}
          </button>
        </div>

        <div class="text-center">
          <p class="text-sm text-gray-600">
            Demo Credentials: admin@produck.com / admin123
          </p>
        </div>
      </form>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    .mat-mdc-form-field {
      width: 100%;
    }
  `]
})
export class LoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);

  loginForm!: FormGroup;
  hidePassword = true;
  isLoading = signal(false);
  returnUrl = '/';

  ngOnInit(): void {
    this.initializeForm();
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
  }

  private initializeForm(): void {
    this.loginForm = this.fb.group({
      email: ['admin@produck.com', [Validators.required, Validators.email]],
      password: ['admin123', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading.set(true);
      const loginRequest: LoginRequest = this.loginForm.value;

      this.authService.login(loginRequest).subscribe({
        next: (response) => {
          this.isLoading.set(false);
          this.snackBar.open('Login successful!', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.router.navigate([this.returnUrl]);
        },
        error: (error) => {
          this.isLoading.set(false);
          this.snackBar.open(error.message || 'Login failed. Please try again.', 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }
}