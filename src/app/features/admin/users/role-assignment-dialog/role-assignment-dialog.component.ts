import { Component, Inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';

// Custom UI Components
import { ButtonComponent, CardComponent } from '../../../../shared/components/ui';

import { UserManagementService } from '../../../../core/services/user-management.service';
import { RoleService } from '../../../../core/services/role.service';
import { Role, AssignRolesRequest, UserDetailDto } from '../../../../core/models/user-management.models';

export interface RoleAssignmentDialogData {
  user: UserDetailDto;
}

@Component({
  selector: 'app-role-assignment-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatSelectModule,
    ButtonComponent,
    CardComponent
  ],
  template: `
    <div class="role-assignment-dialog">
      <!-- Dialog Header -->
      <div class="dialog-header">
        <div class="header-content">
          <mat-icon class="header-icon">admin_panel_settings</mat-icon>
          <div class="header-text">
            <h2>Manage User Roles</h2>
            <p>Assign and manage roles for {{ data.user.username }}</p>
          </div>
        </div>
        <button mat-icon-button mat-dialog-close class="close-button">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <!-- Dialog Content -->
      <div class="dialog-content">
        <!-- User Information Card -->
        <app-card title="User Information" variant="outlined" size="small">
          <div class="user-info">
            <div class="user-avatar">
              {{ getUserInitials() }}
            </div>
            <div class="user-details">
              <h3>{{ data.user.username }}</h3>
              <p>{{ data.user.email }}</p>
              <div class="user-status">
                <span class="status-badge" [class]="data.user.isActive ? 'active' : 'inactive'">
                  <mat-icon>{{ data.user.isActive ? 'check_circle' : 'pause_circle_outline' }}</mat-icon>
                  {{ data.user.isActive ? 'Active' : 'Inactive' }}
                </span>
              </div>
            </div>
          </div>
        </app-card>

        <!-- Current Roles Card -->
        <app-card title="Current Roles" subtitle="Roles currently assigned to this user" variant="outlined" size="small">
          @if (data.user.roles && data.user.roles.length > 0) {
            <div class="current-roles-list">
              @for (role of data.user.roles; track role.id) {
                <div class="role-item">
                  <div class="role-info">
                    <span class="role-name">{{ role.name }}</span>
                    @if (role.description) {
                      <span class="role-description">{{ role.description }}</span>
                    }
                  </div>
                  <mat-icon class="role-icon">security</mat-icon>
                </div>
              }
            </div>
          } @else {
            <div class="empty-state">
              <mat-icon class="empty-icon">security</mat-icon>
              <p>No roles currently assigned</p>
            </div>
          }
        </app-card>

        <!-- Role Assignment Form -->
        <app-card title="Assign Roles" subtitle="Select roles to assign to this user" variant="outlined" size="small">
          <form [formGroup]="roleForm" class="role-form">
            <div class="form-section">
              <div class="role-select-wrapper">
                <label class="role-label">Available Roles</label>
                <mat-select formControlName="roleIds" multiple class="role-select">
                  @for (role of availableRoles(); track role.id) {
                    <mat-option [value]="role.id">
                      <div class="option-content">
                        <span class="option-name">{{ role.name }}</span>
                        @if (role.description) {
                          <span class="option-description">{{ role.description }}</span>
                        }
                      </div>
                    </mat-option>
                  }
                </mat-select>
                <div class="select-hint">
                  <mat-icon>info</mat-icon>
                  <span>Hold Ctrl/Cmd to select multiple roles</span>
                </div>
              </div>
            </div>
          </form>
        </app-card>
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
          text="Update Roles"
          leadingIcon="save"
          [loading]="isLoading()"
          (buttonClick)="onSubmit()">
        </app-button>
      </div>
    </div>
  `,
  styles: [`
    .role-assignment-dialog {
      width: 100%;
      max-width: 650px;
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
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    /* User Information */
    .user-info {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
    }

    .user-avatar {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 600;
      font-size: 20px;
      flex-shrink: 0;
    }

    .user-details {
      display: flex;
      flex-direction: column;
      gap: 4px;
      flex: 1;
    }

    .user-details h3 {
      margin: 0;
      font-size: 1.125rem;
      font-weight: 600;
      color: #1f2937;
    }

    .user-details p {
      margin: 0;
      color: #6b7280;
      font-size: 0.875rem;
    }

    .user-status {
      margin-top: 8px;
    }

    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .status-badge.active {
      background: #d1fae5;
      color: #065f46;
    }

    .status-badge.inactive {
      background: #fef2f2;
      color: #991b1b;
    }

    .status-badge mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    /* Current Roles */
    .current-roles-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 16px;
    }

    .role-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      background: white;
    }

    .role-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .role-name {
      font-weight: 600;
      color: #1f2937;
      font-size: 0.875rem;
    }

    .role-description {
      font-size: 0.75rem;
      color: #6b7280;
    }

    .role-icon {
      color: #9ca3af;
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    /* Role Assignment Form */
    .role-form {
      padding: 16px;
    }

    .form-section {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

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

    .option-content {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .option-name {
      font-weight: 500;
      color: #1f2937;
    }

    .option-description {
      font-size: 0.75rem;
      color: #6b7280;
    }

    .select-hint {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.75rem;
      color: #6b7280;
      margin-top: 4px;
    }

    .select-hint mat-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
    }

    /* Empty State */
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 32px 16px;
      text-align: center;
    }

    .empty-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #d1d5db;
      margin-bottom: 12px;
    }

    .empty-state p {
      margin: 0;
      color: #6b7280;
      font-size: 0.875rem;
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
      .role-assignment-dialog {
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

      .user-info {
        flex-direction: column;
        text-align: center;
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
export class RoleAssignmentDialogComponent implements OnInit {
  roleForm: FormGroup;
  availableRoles = signal<Role[]>([]);
  isLoading = signal(false);

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<RoleAssignmentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: RoleAssignmentDialogData,
    private userService: UserManagementService,
    private roleService: RoleService,
    private snackBar: MatSnackBar
  ) {
    this.roleForm = this.fb.group({
      roleIds: [[]]
    });
  }

  ngOnInit() {
    this.loadRoles();
    this.setCurrentRoles();
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

  private setCurrentRoles() {
    const currentRoleIds = this.data.user.roles?.map(role => role.id) || [];
    this.roleForm.patchValue({
      roleIds: currentRoleIds
    });
  }

  getUserInitials(): string {
    const username = this.data.user.username;
    if (!username || username.length === 0) return 'UN';

    if (username.length === 1) return username.toUpperCase();

    return (username.charAt(0) + username.charAt(1)).toUpperCase();
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  async onSubmit() {
    this.isLoading.set(true);

    try {
      const formValue = this.roleForm.value;
      const request: AssignRolesRequest = {
        roleIds: formValue.roleIds
      };

      const response = await this.userService.assignRolesToUser(this.data.user.id, request).toPromise();

      if (response?.success) {
        this.snackBar.open('Roles updated successfully', 'Close', { duration: 3000 });
        this.dialogRef.close(true);
      } else {
        throw new Error(response?.message || 'Failed to update roles');
      }
    } catch (error) {
      console.error('Failed to update roles:', error);
      this.snackBar.open('Failed to update roles', 'Close', { duration: 3000 });
    } finally {
      this.isLoading.set(false);
    }
  }
}