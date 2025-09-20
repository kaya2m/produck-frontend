import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { LoginRequest } from '../../core/models/auth.models';

// Material Components
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatCheckboxModule,
    MatSnackBarModule,
    MatTooltipModule
  ],
  template: `
    <div class="login-container">
      <!-- Left Panel - Minimal Brand -->
      <div class="brand-panel">
        <div class="brand-content">
          <div class="brand-logo-section">
            <img src="/logo/favicon.svg" alt="Produck Logo" class="brand-logo">
            <h1 class="brand-name">Produck</h1>
            <div class="brand-tagline">Your Success, Our Priority</div>
          </div>

          <div class="brand-message">
            <h2 class="welcome-title">Ready to Boost Your Sales?</h2>
            <p class="welcome-subtitle">
              Join thousands of sales teams who've increased their revenue by 40% with Produck CRM
            </p>
          </div>


          <div class="brand-features">
            <div class="feature-item">
              <div class="feature-icon">
                <mat-icon>trending_up</mat-icon>
              </div>
              <div class="feature-text">
                <span class="feature-title">Increase Sales by 40%</span>
                <span class="feature-desc">Smart lead scoring and pipeline management</span>
              </div>
            </div>
            <div class="feature-item">
              <div class="feature-icon">
                <mat-icon>analytics</mat-icon>
              </div>
              <div class="feature-text">
                <span class="feature-title">Real-time Insights</span>
                <span class="feature-desc">Advanced analytics and custom reports</span>
              </div>
            </div>
            <div class="feature-item">
              <div class="feature-icon">
                <mat-icon>schedule</mat-icon>
              </div>
              <div class="feature-text">
                <span class="feature-title">Save 10+ Hours Weekly</span>
                <span class="feature-desc">Automated workflows and task management</span>
              </div>
            </div>
            <div class="feature-item">
              <div class="feature-icon">
                <mat-icon>security</mat-icon>
              </div>
              <div class="feature-text">
                <span class="feature-title">Enterprise Security</span>
                <span class="feature-desc">Bank-level encryption and data protection</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      <!-- Right Panel - Login Form -->
      <div class="form-panel">
        <div class="form-container">
          <div class="form-header">
            <h1>Welcome Back</h1>
            <p>Sign in to continue</p>
          </div>

          <form [formGroup]="loginForm" (ngSubmit)="onLogin()" class="login-form">
            <mat-form-field appearance="outline" class="form-field">
              <mat-label>Username</mat-label>
              <input matInput
                     type="text"
                     formControlName="username"
                     placeholder="Enter your username"
                     autocomplete="username">
              <mat-icon matPrefix>person</mat-icon>
              <mat-error *ngIf="loginForm.get('username')?.hasError('required')">
                Username is required
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="form-field">
              <mat-label>Password</mat-label>
              <input matInput
                     [type]="hidePassword() ? 'password' : 'text'"
                     formControlName="password"
                     placeholder="Enter your password"
                     autocomplete="current-password">
              <mat-icon matPrefix>lock</mat-icon>
              <button mat-icon-button
                      matSuffix
                      type="button"
                      (click)="togglePasswordVisibility()"
                      tabindex="-1">
                <mat-icon>{{ hidePassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              <mat-error *ngIf="loginForm.get('password')?.hasError('required')">
                Password is required
              </mat-error>
            </mat-form-field>

            <div class="form-options">
              <mat-checkbox formControlName="rememberMe" color="primary">
                Remember me
              </mat-checkbox>
            </div>

            <button mat-raised-button
                    color="primary"
                    type="submit"
                    class="login-button"
                    [disabled]="loginForm.invalid || isLoading()">
              @if (isLoading()) {
                <mat-spinner diameter="20" class="button-spinner"></mat-spinner>
                Signing in...
              } @else {
                <ng-container>
                  Sign In
                  <mat-icon>arrow_forward</mat-icon>
                </ng-container>
              }
            </button>
          </form>

          <!-- Demo Access -->
          <div class="demo-section">
            <div class="demo-info">
              <img src="/logo/favicon-96x96.png" alt="Demo" class="demo-logo">
              <span class="demo-text">Demo Access: admin / admin123</span>
              <button mat-icon-button
                      color="accent"
                      (click)="fillDemoCredentials()"
                      class="demo-fill-button"
                      matTooltip="Use demo credentials">
                <mat-icon>content_paste</mat-icon>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      background: #ffffff;
      overflow: hidden;
    }

    /* Left Panel - Brand */
    .brand-panel {
      flex: 1;
      background: url('/produck-bg-dark.png') center/cover no-repeat,
                  linear-gradient(135deg, rgba(30, 58, 138, 0.7) 0%, rgba(55, 48, 163, 0.7) 50%, rgba(88, 28, 135, 0.7) 100%);
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px;
    }

    .brand-panel::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.4);
      backdrop-filter: blur(0.5px);
    }

    .brand-content {
      position: relative;
      z-index: 2;
      color: white;
      text-align: center;
      max-width: 400px;
    }

    .brand-logo-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      margin-bottom: 32px;
    }

    .brand-logo {
      width: 56px;
      height: 56px;
      margin-bottom: 12px;
      filter: brightness(1.2) drop-shadow(0 2px 4px rgba(0,0,0,0.1));
    }

    .brand-name {
      font-size: 36px;
      font-weight: 700;
      letter-spacing: -0.025em;
      margin: 0 0 8px 0;
    }

    .brand-tagline {
      font-size: 14px;
      font-weight: 500;
      opacity: 0.8;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }

    .brand-message {
      margin-bottom: 32px;
    }

    .welcome-title {
      font-size: 26px;
      font-weight: 600;
      margin: 0 0 12px 0;
      line-height: 1.2;
      text-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .welcome-subtitle {
      font-size: 16px;
      opacity: 0.9;
      margin: 0;
      line-height: 1.4;
      font-weight: 400;
    }


    .brand-features {
      display: flex;
      flex-direction: column;
      gap: 20px;
      margin-bottom: 32px;
    }

    .feature-item {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      text-align: left;
    }

    .feature-text {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .feature-title {
      font-size: 15px;
      font-weight: 600;
      opacity: 1;
      line-height: 1.2;
    }

    .feature-desc {
      font-size: 13px;
      font-weight: 400;
      opacity: 0.8;
      line-height: 1.3;
    }

    .feature-icon {
      width: 40px;
      height: 40px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      backdrop-filter: blur(10px);
    }

    .feature-icon mat-icon {
      font-size: 22px;
      width: 22px;
      height: 22px;
      color: rgba(255, 255, 255, 0.9);
    }

    /* Right Panel - Form */
    .form-panel {
      flex: 1;
      background: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px;
      max-height: 100vh;
      overflow-y: auto;
    }

    .form-container {
      width: 100%;
      max-width: 380px;
    }

    .form-header {
      text-align: center;
      margin-bottom: 32px;
    }

    .form-header h1 {
      font-size: 24px;
      font-weight: 700;
      color: #111827;
      margin: 0 0 6px 0;
    }

    .form-header p {
      font-size: 14px;
      color: #6b7280;
      margin: 0;
    }

    .login-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .form-field {
      width: 100%;
    }

    .form-options {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin: -6px 0 6px 0;
      font-size: 14px;
    }


    .login-button {
      height: 44px;
      font-size: 15px;
      font-weight: 500;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      border-radius: 6px;
      margin: 8px 0 20px 0;
    }

    .button-spinner {
      margin-right: 8px;
    }

    .demo-section {
      margin: 16px 0;
    }

    .demo-info {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 12px;
      background: #fef3c7;
      border: 1px solid #f59e0b;
      border-radius: 8px;
      font-size: 12px;
    }

    .demo-logo {
      width: 20px;
      height: 20px;
      flex-shrink: 0;
      opacity: 0.8;
    }

    .demo-text {
      flex: 1;
      color: #92400e;
      font-family: 'Courier New', monospace;
      font-weight: 500;
    }

    .demo-fill-button {
      width: 32px;
      height: 32px;
      color: #d97706;
    }

    .demo-fill-button mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }


    /* Responsive Design */
    @media (max-width: 768px) {
      .login-container {
        flex-direction: column;
      }

      .brand-panel {
        min-height: 30vh;
        padding: 24px;
      }

      .form-panel {
        padding: 24px;
        min-height: 70vh;
      }

      .brand-name {
        font-size: 28px;
      }

      .welcome-title {
        font-size: 24px;
      }

      .welcome-subtitle {
        font-size: 16px;
      }

      .brand-features {
        gap: 12px;
      }

      .feature-item {
        font-size: 14px;
      }

      .form-header h1 {
        font-size: 22px;
      }

      .form-options {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
      }
    }

    @media (max-width: 480px) {
      .brand-panel,
      .form-panel {
        padding: 20px 16px;
      }
    }
  `]
})
export class LoginComponent {
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private authService = inject(AuthService);

  // Modern Signal-based state
  hidePassword = signal(true);
  isLoading = signal(false);

  // Reactive Form
  loginForm: FormGroup;

  constructor() {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  fillDemoCredentials() {
    this.loginForm.patchValue({
      username: 'admin',
      password: 'admin123'
    });
  }

  togglePasswordVisibility() {
    this.hidePassword.set(!this.hidePassword());
  }

  onLogin() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const formValue = this.loginForm.value;
    const credentials: LoginRequest = {
      username: formValue.username!,
      password: formValue.password!
    };

    this.isLoading.set(true);

    this.authService.login(credentials)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: () => {
          if (formValue.rememberMe) {
            localStorage.setItem('produck_remember_me', 'true');
          } else {
            localStorage.removeItem('produck_remember_me');
          }

          this.snackBar.open('Welcome back!', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });

          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          console.error('Login failed:', error);
          this.snackBar.open(error.message || 'Login failed. Please check your credentials.', 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
  }
}
