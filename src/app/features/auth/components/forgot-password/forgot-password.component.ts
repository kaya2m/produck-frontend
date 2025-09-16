import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="space-y-6">
      <div>
        <h2 class="text-2xl font-bold text-gray-900 text-center">Reset your password</h2>
        <p class="mt-2 text-sm text-gray-600 text-center">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>

      <form [formGroup]="forgotPasswordForm" (ngSubmit)="onSubmit()" class="space-y-6">
        <div>
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Email address</mat-label>
            <input matInput type="email" formControlName="email" placeholder="Enter your email">
            <mat-icon matPrefix>email</mat-icon>
            @if (forgotPasswordForm.get('email')?.hasError('required')) {
              <mat-error>Email is required</mat-error>
            }
            @if (forgotPasswordForm.get('email')?.hasError('email')) {
              <mat-error>Please enter a valid email</mat-error>
            }
          </mat-form-field>
        </div>

        <div>
          <button mat-raised-button
                  color="primary"
                  type="submit"
                  class="w-full"
                  [disabled]="forgotPasswordForm.invalid || isLoading()">
            @if (isLoading()) {
              <mat-spinner diameter="20" class="mr-2"></mat-spinner>
            }
            {{ isLoading() ? 'Sending...' : 'Send reset link' }}
          </button>
        </div>

        <div class="text-center">
          <a routerLink="/auth/login"
             class="text-sm font-medium text-primary-600 hover:text-primary-500">
            <mat-icon class="text-sm mr-1">arrow_back</mat-icon>
            Back to sign in
          </a>
        </div>
      </form>

      @if (emailSent()) {
        <div class="bg-green-50 border border-green-200 rounded-md p-4">
          <div class="flex">
            <mat-icon class="text-green-400 mr-2">check_circle</mat-icon>
            <div>
              <h3 class="text-sm font-medium text-green-800">
                Check your email
              </h3>
              <p class="text-sm text-green-700 mt-1">
                We've sent a password reset link to {{ forgotPasswordForm.get('email')?.value }}
              </p>
            </div>
          </div>
        </div>
      }
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
export class ForgotPasswordComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  forgotPasswordForm!: FormGroup;
  isLoading = signal(false);
  emailSent = signal(false);

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {
    if (this.forgotPasswordForm.valid) {
      this.isLoading.set(true);

      // Simulate API call
      setTimeout(() => {
        this.isLoading.set(false);
        this.emailSent.set(true);
        this.snackBar.open('Password reset link sent to your email!', 'Close', {
          duration: 5000,
          panelClass: ['success-snackbar']
        });
      }, 2000);
    }
  }
}