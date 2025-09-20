import { Component, Inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';

// Custom UI Components
import { InputComponent, ButtonComponent, CardComponent } from '../../../../shared/components/ui';

import { UserManagementService } from '../../../../core/services/user-management.service';
import { RoleService } from '../../../../core/services/role.service';
import { Role, CreateUserRequest, UpdateUserProfileRequest, UserDetailDto } from '../../../../core/models/user-management.models';

export interface UserFormDialogData {
  mode: 'create' | 'edit';
  user?: UserDetailDto;
}

@Component({
  selector: 'app-user-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatCheckboxModule,
    MatSelectModule,
    InputComponent,
    ButtonComponent,
    CardComponent
  ],
  template: `
    <div class="user-form-dialog">
      <!-- Dialog Header -->
      <div class="dialog-header">
        <div class="header-content">
          <mat-icon class="header-icon">{{ isEditMode() ? 'edit' : 'person_add' }}</mat-icon>
          <div class="header-text">
            <h2>{{ isEditMode() ? 'Edit User' : 'Create New User' }}</h2>
            <p>{{ isEditMode() ? 'Update user information and settings' : 'Add a new user to the system' }}</p>
          </div>
        </div>
        <button mat-icon-button mat-dialog-close class="close-button">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <!-- Dialog Content -->
      <div class="dialog-content">
        <form [formGroup]="userForm" class="user-form">
          <!-- Basic Information Section -->
          <app-card title="Basic Information" variant="outlined" size="small">
            <div class="form-section">
              <div class="form-row">
                <app-input
                  label="Username"
                  placeholder="Enter username"
                  formControlName="username"
                  prefixIcon="person"
                  variant="outline"
                  size="medium"
                  [required]="true">
                </app-input>
              </div>

              <div class="form-row">
                <app-input
                  label="Email Address"
                  type="email"
                  placeholder="Enter email address"
                  formControlName="email"
                  prefixIcon="email"
                  variant="outline"
                  size="medium"
                  [required]="true">
                </app-input>
              </div>

              <!-- Password field only for create mode -->
              @if (!isEditMode()) {
                <div class="form-row">
                  <app-input
                    label="Password"
                    type="password"
                    placeholder="Enter password"
                    formControlName="password"
                    prefixIcon="lock"
                    variant="outline"
                    size="medium"
                    [required]="true">
                  </app-input>
                </div>
              }

              <div class="form-row">
                <app-input
                  label="Phone Number"
                  type="tel"
                  placeholder="Enter phone number"
                  formControlName="phoneNumber"
                  prefixIcon="phone"
                  variant="outline"
                  size="medium">
                </app-input>
              </div>
            </div>
          </app-card>

          <!-- Role Assignment Section (only for create) -->
          @if (!isEditMode()) {
            <app-card title="Role Assignment" variant="outlined" size="small">
              <div class="form-section">
                <div class="role-select-wrapper">
                  <label class="role-label">Assign Roles</label>
                  <mat-select formControlName="roleIds" multiple class="role-select">
                    @for (role of availableRoles(); track role.id) {
                      <mat-option [value]="role.id">{{ role.name }}</mat-option>
                    }
                  </mat-select>
                </div>
              </div>
            </app-card>
          }

          <!-- User Settings Section -->
          <app-card title="User Settings" variant="outlined" size="small">
            <div class="form-section">
              <div class="checkbox-grid">
                <mat-checkbox formControlName="emailConfirmed" class="setting-checkbox">
                  Email Confirmed
                </mat-checkbox>

                <mat-checkbox formControlName="phoneNumberConfirmed" class="setting-checkbox">
                  Phone Confirmed
                </mat-checkbox>

                <mat-checkbox formControlName="twoFactorEnabled" class="setting-checkbox">
                  Two-Factor Auth
                </mat-checkbox>

                <mat-checkbox formControlName="isActive" class="setting-checkbox">
                  Active User
                </mat-checkbox>
              </div>
            </div>
          </app-card>
        </form>
      </div>

      <!-- Dialog Actions -->
      <div class="dialog-actions">
        <app-button
          variant="stroked"
          text="Cancel"
          (buttonClick)="onCancel()">
        </app-button>
        <app-button
          variant="raised"
          color="primary"
          [text]="isEditMode() ? 'Update User' : 'Create User'"
          [leadingIcon]="isEditMode() ? 'save' : 'add'"
          [loading]="isLoading()"
          [disabled]="userForm.invalid"
          (buttonClick)="onSubmit()">
        </app-button>
      </div>
    </div>
  `,
  styles: [`
    .user-form-dialog {
      width: 100%;
      max-width: 600px;
      min-width: 500px;
      display: flex;
      flex-direction: column;
      max-height: 90vh;
    }

    /* Dialog Header */
    .dialog-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      padding: 24px 24px 0 24px;
      border-bottom: 1px solid #e5e7eb;
      margin-bottom: 0;
    }

    .header-content {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      flex: 1;
    }

    .header-icon {
      width: 40px;
      height: 40px;
      font-size: 24px;
      background: #f3f4f6;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #6b7280;
      margin-top: 4px;
    }

    .header-text h2 {
      margin: 0 0 4px 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: #1f2937;
    }

    .header-text p {
      margin: 0;
      font-size: 0.875rem;
      color: #6b7280;
      line-height: 1.4;
    }

    .close-button {
      color: #6b7280;
      margin-top: -8px;
      margin-right: -8px;
    }

    /* Dialog Content */
    .dialog-content {
      flex: 1;
      overflow-y: auto;
      padding: 24px;
      min-height: 0;
    }

    .user-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .form-section {
      padding: 16px;
    }

    .form-row {
      margin-bottom: 16px;
    }

    .form-row:last-child {
      margin-bottom: 0;
    }

    /* Role Selection */
    .role-select-wrapper {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .role-label {
      font-size: 0.875rem;
      font-weight: 500;
      color: #374151;
    }

    .role-select {
      width: 100%;
      min-height: 48px;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      padding: 12px 16px;
      font-size: 1rem;
    }

    .role-select:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    /* Checkbox Grid */
    .checkbox-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 16px;
    }

    .setting-checkbox {
      margin: 0;
    }

    .setting-checkbox .mdc-form-field {
      color: #374151;
    }

    /* Dialog Actions */
    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 16px 24px 24px 24px;
      border-top: 1px solid #e5e7eb;
      background: #fafafa;
    }

    /* Responsive Design */
    @media (max-width: 640px) {
      .user-form-dialog {
        min-width: auto;
        width: 100%;
        max-width: 100%;
        margin: 0;
        max-height: 100vh;
        border-radius: 0;
      }

      .dialog-header {
        padding: 16px;
      }

      .dialog-content {
        padding: 16px;
      }

      .dialog-actions {
        padding: 16px;
        flex-direction: column;
      }

      .checkbox-grid {
        grid-template-columns: 1fr;
        gap: 12px;
      }

      .header-content {
        flex-direction: column;
        gap: 12px;
      }

      .header-icon {
        align-self: flex-start;
      }
    }

    /* Scrollbar Styling */
    .dialog-content::-webkit-scrollbar {
      width: 6px;
    }

    .dialog-content::-webkit-scrollbar-track {
      background: #f1f5f9;
      border-radius: 3px;
    }

    .dialog-content::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 3px;
    }

    .dialog-content::-webkit-scrollbar-thumb:hover {
      background: #94a3b8;
    }

    /* Remove default dialog padding */
    ::ng-deep .mat-mdc-dialog-container .mdc-dialog__surface {
      padding: 0 !important;
      overflow: visible !important;
    }

    ::ng-deep .mat-mdc-dialog-content {
      margin: 0 !important;
      padding: 0 !important;
      max-height: none !important;
    }

    ::ng-deep .mat-mdc-dialog-actions {
      margin: 0 !important;
      padding: 0 !important;
    }
  `]
})
export class UserFormDialogComponent implements OnInit {
  userForm: FormGroup;
  availableRoles = signal<Role[]>([]);
  isLoading = signal(false);

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<UserFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UserFormDialogData,
    private userService: UserManagementService,
    private roleService: RoleService,
    private snackBar: MatSnackBar
  ) {
    this.userForm = this.createForm();
  }

  ngOnInit() {
    this.loadRoles();
    if (this.isEditMode() && this.data.user) {
      this.populateForm(this.data.user);
    }
  }

  isEditMode(): boolean {
    return this.data.mode === 'edit';
  }

  private createForm(): FormGroup {
    const usernameControl = this.isEditMode()
      ? new FormControl({value: '', disabled: true}, [Validators.required, Validators.minLength(3)])
      : new FormControl('', [Validators.required, Validators.minLength(3)]);

    return this.fb.group({
      username: usernameControl,
      email: ['', [Validators.required, Validators.email]],
      password: ['', this.isEditMode() ? [] : [Validators.required, Validators.minLength(6)]],
      phoneNumber: [''],
      roleIds: [[]],
      emailConfirmed: [false],
      phoneNumberConfirmed: [false],
      twoFactorEnabled: [false],
      isActive: [true]
    });
  }

  private async loadRoles() {
    try {
      const roles = await this.roleService.getRoles().toPromise();
      this.availableRoles.set(roles || []);
    } catch (error) {
      console.error('Failed to load roles:', error);
      this.snackBar.open('Failed to load roles', 'Close', { duration: 3000 });
    }
  }

  private populateForm(user: UserDetailDto) {
    this.userForm.patchValue({
      username: user.username,
      email: user.email,
      phoneNumber: user.phoneNumber,
      emailConfirmed: user.emailConfirmed,
      phoneNumberConfirmed: user.phoneNumberConfirmed,
      twoFactorEnabled: user.twoFactorEnabled,
      isActive: user.isActive
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  async onSubmit() {
    if (this.userForm.invalid) {
      Object.keys(this.userForm.controls).forEach(key => {
        const control = this.userForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
      return;
    }

    this.isLoading.set(true);

    try {
      if (this.isEditMode()) {
        await this.updateUser();
      } else {
        await this.createUser();
      }

      this.dialogRef.close(true);
    } catch (error) {
      console.error('Failed to save user:', error);
      this.snackBar.open('Failed to save user', 'Close', { duration: 3000 });
    } finally {
      this.isLoading.set(false);
    }
  }

  private async createUser() {
    const formValue = this.userForm.value;
    const request: CreateUserRequest = {
      username: formValue.username,
      email: formValue.email,
      password: formValue.password,
      phoneNumber: formValue.phoneNumber,
      emailConfirmed: formValue.emailConfirmed,
      phoneNumberConfirmed: formValue.phoneNumberConfirmed,
      twoFactorEnabled: formValue.twoFactorEnabled,
      isActive: formValue.isActive,
      roleIds: formValue.roleIds
    };

    const response = await this.userService.createUser(request).toPromise();
    if (response?.success) {
      this.snackBar.open('User created successfully', 'Close', { duration: 3000 });
    } else {
      throw new Error(response?.message || 'Failed to create user');
    }
  }

  private async updateUser() {
    if (!this.data.user) return;

    const formValue = this.userForm.value;
    const request: UpdateUserProfileRequest = {
      email: formValue.email,
      phoneNumber: formValue.phoneNumber,
      emailConfirmed: formValue.emailConfirmed,
      phoneNumberConfirmed: formValue.phoneNumberConfirmed,
      twoFactorEnabled: formValue.twoFactorEnabled,
      isActive: formValue.isActive
    };

    const response = await this.userService.updateUserProfile(this.data.user.id, request).toPromise();
    if (response?.success) {
      this.snackBar.open('User updated successfully', 'Close', { duration: 3000 });
    } else {
      throw new Error(response?.message || 'Failed to update user');
    }
  }
}