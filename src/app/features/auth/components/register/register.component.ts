import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatCheckboxModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="space-y-6">
      <div>
        <h2 class="text-2xl font-bold text-gray-900 text-center">Create your account</h2>
        <p class="mt-2 text-sm text-gray-600 text-center">
          Already have an account?
          <a routerLink="/auth/login" class="font-medium text-primary-600 hover:text-primary-500">
            Sign in here
          </a>
        </p>
      </div>

      <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <mat-form-field appearance="outline">
            <mat-label>First Name</mat-label>
            <input matInput formControlName="firstName" placeholder="Enter first name">
            <mat-icon matPrefix>person</mat-icon>
            <mat-error *ngIf="registerForm.get('firstName')?.hasError('required')">
              First name is required
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Last Name</mat-label>
            <input matInput formControlName="lastName" placeholder="Enter last name">
            <mat-icon matPrefix>person</mat-icon>
            <mat-error *ngIf="registerForm.get('lastName')?.hasError('required')">
              Last name is required
            </mat-error>
          </mat-form-field>
        </div>

        <div>
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Email address</mat-label>
            <input matInput type="email" formControlName="email" placeholder="Enter your email">
            <mat-icon matPrefix>email</mat-icon>
            <mat-error *ngIf="registerForm.get('email')?.hasError('required')">
              Email is required
            </mat-error>
            <mat-error *ngIf="registerForm.get('email')?.hasError('email')">
              Please enter a valid email
            </mat-error>
          </mat-form-field>
        </div>

        <div>
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Password</mat-label>
            <input matInput
                   [type]="hidePassword ? 'password' : 'text'"
                   formControlName="password"
                   placeholder="Create a password">
            <mat-icon matPrefix>lock</mat-icon>
            <button mat-icon-button matSuffix
                    (click)="hidePassword = !hidePassword"
                    type="button">
              <mat-icon>{{hidePassword ? 'visibility_off' : 'visibility'}}</mat-icon>
            </button>
            <mat-error *ngIf="registerForm.get('password')?.hasError('required')">
              Password is required
            </mat-error>
            <mat-error *ngIf="registerForm.get('password')?.hasError('minlength')">
              Password must be at least 8 characters
            </mat-error>
            <mat-error *ngIf="registerForm.get('password')?.hasError('pattern')">
              Password must contain uppercase, lowercase, number and special character
            </mat-error>
          </mat-form-field>
        </div>

        <div>
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Confirm Password</mat-label>
            <input matInput
                   [type]="hideConfirmPassword ? 'password' : 'text'"
                   formControlName="confirmPassword"
                   placeholder="Confirm your password">
            <mat-icon matPrefix>lock</mat-icon>
            <button mat-icon-button matSuffix
                    (click)="hideConfirmPassword = !hideConfirmPassword"
                    type="button">
              <mat-icon>{{hideConfirmPassword ? 'visibility_off' : 'visibility'}}</mat-icon>
            </button>
            <mat-error *ngIf="registerForm.get('confirmPassword')?.hasError('required')">
              Please confirm your password
            </mat-error>
            <mat-error *ngIf="registerForm.get('confirmPassword')?.hasError('passwordMismatch')">
              Passwords do not match
            </mat-error>
          </mat-form-field>
        </div>

        <div>
          <mat-checkbox formControlName="agreeToTerms" color="primary" class="text-sm">
            I agree to the
            <a href="#" class="text-primary-600 hover:text-primary-500">Terms of Service</a>
            and
            <a href="#" class="text-primary-600 hover:text-primary-500">Privacy Policy</a>
          </mat-checkbox>
          <mat-error *ngIf="registerForm.get('agreeToTerms')?.hasError('required')" class="text-red-500 text-sm mt-1">
            You must agree to the terms and conditions
          </mat-error>
        </div>

        <div>
          <button mat-raised-button
                  color="primary"
                  type="submit"
                  class="w-full"
                  [disabled]="registerForm.invalid || isLoading">
            <mat-spinner diameter="20" *ngIf="isLoading" class="mr-2"></mat-spinner>
            {{ isLoading ? 'Creating account...' : 'Create account' }}
          </button>
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
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  hidePassword = true;
  hideConfirmPassword = true;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      ]],
      confirmPassword: ['', [Validators.required]],
      agreeToTerms: [false, [Validators.requiredTrue]]
    }, { validators: this.passwordMatchValidator });
  }

  private passwordMatchValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }

    return null;
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.isLoading = true;

      // Simulate API call
      setTimeout(() => {
        this.isLoading = false;
        this.snackBar.open('Account created successfully! Please sign in.', 'Close', {
          duration: 5000,
          panelClass: ['success-snackbar']
        });
        this.router.navigate(['/auth/login']);
      }, 2000);
    }
  }
}