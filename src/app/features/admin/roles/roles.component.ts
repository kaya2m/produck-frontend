import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatMenuModule } from '@angular/material/menu';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RoleService } from '../../../core/services/role.service';
import { Role } from '../../../core/models/user-management.models';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTooltipModule,
    MatDialogModule,
    MatSnackBarModule,
    MatInputModule,
    MatFormFieldModule,
    MatMenuModule,
    ReactiveFormsModule
  ],
  template: `
    <div class="roles-container">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <div class="title-section">
            <h1 class="page-title">
              <mat-icon>admin_panel_settings</mat-icon>
              Roles Management
            </h1>
            <p class="page-subtitle">
              Manage system roles and permissions
            </p>
          </div>

          <div class="header-actions">
            <button mat-raised-button
                    color="primary"
                    (click)="openCreateRoleDialog()"
                    class="create-button">
              <mat-icon>add</mat-icon>
              Create Role
            </button>
          </div>
        </div>
      </div>

      <!-- Roles Table -->
      <mat-card class="table-card">
        <mat-card-content>
          @if (loading()) {
            <div class="loading-state">
              <mat-icon class="loading-icon">refresh</mat-icon>
              <p>Loading roles...</p>
            </div>
          } @else if (roles().length === 0) {
            <div class="empty-state">
              <mat-icon>admin_panel_settings</mat-icon>
              <h3>No Roles Found</h3>
              <p>Create your first role to get started with user management.</p>
              <button mat-raised-button
                      color="primary"
                      (click)="openCreateRoleDialog()">
                <mat-icon>add</mat-icon>
                Create Role
              </button>
            </div>
          } @else {
            <div class="table-container">
              <table mat-table [dataSource]="roles()" class="roles-table">
                <!-- Name Column -->
                <ng-container matColumnDef="name">
                  <th mat-header-cell *matHeaderCellDef class="name-header">
                    <div class="header-cell">
                      <mat-icon>badge</mat-icon>
                      <span>Role Name</span>
                    </div>
                  </th>
                  <td mat-cell *matCellDef="let role" class="name-cell">
                    <div class="role-info">
                      <div class="role-name">{{ role.name }}</div>
                      <div class="role-normalized">{{ role.normalizedName }}</div>
                    </div>
                  </td>
                </ng-container>

                <!-- Description Column -->
                <ng-container matColumnDef="description">
                  <th mat-header-cell *matHeaderCellDef class="description-header">
                    <div class="header-cell">
                      <mat-icon>description</mat-icon>
                      <span>Description</span>
                    </div>
                  </th>
                  <td mat-cell *matCellDef="let role" class="description-cell">
                    <div class="role-description">
                      {{ role.description || 'No description provided' }}
                    </div>
                  </td>
                </ng-container>

                <!-- Actions Column -->
                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef class="actions-header">Actions</th>
                  <td mat-cell *matCellDef="let role" class="actions-cell">
                    <div class="action-buttons">
                      <button mat-icon-button
                              [matMenuTriggerFor]="actionMenu"
                              [matMenuTriggerData]="{role: role}"
                              matTooltip="More actions"
                              class="action-menu-trigger">
                        <mat-icon>more_vert</mat-icon>
                      </button>
                    </div>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
              </table>
            </div>
          }
        </mat-card-content>
      </mat-card>
    </div>

    <!-- Action Menu -->
    <mat-menu #actionMenu="matMenu">
      <ng-template matMenuContent let-role="role">
        <button mat-menu-item (click)="editRole(role)">
          <mat-icon>edit</mat-icon>
          <span>Edit</span>
        </button>
        <button mat-menu-item (click)="deleteRole(role)" class="delete-action">
          <mat-icon>delete</mat-icon>
          <span>Delete</span>
        </button>
      </ng-template>
    </mat-menu>

    <!-- Create/Edit Role Dialog -->
    @if (showRoleDialog()) {
      <div class="dialog-overlay" (click)="closeRoleDialog()">
        <div class="dialog-container" (click)="$event.stopPropagation()">
          <div class="dialog-header">
            <h2>{{ editingRole() ? 'Edit Role' : 'Create New Role' }}</h2>
            <button mat-icon-button (click)="closeRoleDialog()">
              <mat-icon>close</mat-icon>
            </button>
          </div>

          <form [formGroup]="roleForm" (ngSubmit)="saveRole()" class="dialog-form">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Role Name</mat-label>
              <input matInput formControlName="name" placeholder="Enter role name">
              <mat-error *ngIf="roleForm.get('name')?.hasError('required')">
                Role name is required
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Description</mat-label>
              <textarea matInput
                        formControlName="description"
                        placeholder="Enter role description"
                        rows="3"></textarea>
            </mat-form-field>

            <div class="dialog-actions">
              <button type="button"
                      mat-button
                      (click)="closeRoleDialog()">
                Cancel
              </button>
              <button type="submit"
                      mat-raised-button
                      color="primary"
                      [disabled]="roleForm.invalid || saving()">
                @if (saving()) {
                  <mat-icon class="loading-icon">refresh</mat-icon>
                } @else {
                  <mat-icon>{{ editingRole() ? 'save' : 'add' }}</mat-icon>
                }
                {{ editingRole() ? 'Update' : 'Create' }} Role
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
  styles: [`
    .roles-container {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .page-header {
      margin-bottom: 24px;
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 24px;
    }

    .title-section {
      flex: 1;
    }

    .page-title {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 28px;
      font-weight: 600;
      color: #1a202c;
      margin: 0 0 8px 0;
    }

    .page-title mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: #3b82f6;
    }

    .page-subtitle {
      color: #64748b;
      font-size: 16px;
      margin: 0;
    }

    .header-actions {
      display: flex;
      gap: 12px;
      align-items: center;
    }

    .create-button {
      height: 44px;
      padding: 0 24px;
      font-weight: 600;
      border-radius: 8px;
    }

    .table-card {
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      border: 1px solid #e2e8f0;
    }

    .loading-state, .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px 24px;
      text-align: center;
      color: #64748b;
    }

    .loading-state mat-icon, .empty-state mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
      color: #94a3b8;
    }

    .loading-icon {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    .empty-state h3 {
      margin: 0 0 8px 0;
      font-size: 20px;
      font-weight: 600;
      color: #374151;
    }

    .empty-state p {
      margin: 0 0 24px 0;
      font-size: 16px;
    }

    .table-container {
      overflow-x: auto;
    }

    .roles-table {
      width: 100%;
      background: white;
    }

    .header-cell {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
      color: #374151;
    }

    .header-cell mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: #6b7280;
    }

    .name-cell {
      padding: 16px !important;
    }

    .role-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .role-name {
      font-weight: 600;
      color: #1f2937;
      font-size: 14px;
    }

    .role-normalized {
      font-size: 12px;
      color: #6b7280;
      text-transform: uppercase;
      font-family: 'Courier New', monospace;
    }

    .description-cell {
      padding: 16px !important;
      max-width: 300px;
    }

    .role-description {
      color: #4b5563;
      font-size: 14px;
      line-height: 1.4;
    }

    .actions-cell {
      padding: 16px !important;
      width: 80px;
    }

    .action-buttons {
      display: flex;
      gap: 8px;
      justify-content: flex-end;
    }

    .action-menu-trigger {
      color: #6b7280;
    }

    .delete-action {
      color: #dc2626 !important;
    }

    .delete-action mat-icon {
      color: #dc2626 !important;
    }

    /* Dialog Styles */
    .dialog-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 24px;
    }

    .dialog-container {
      background: white;
      border-radius: 12px;
      width: 100%;
      max-width: 500px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    }

    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24px 24px 0 24px;
      border-bottom: 1px solid #e5e7eb;
      margin-bottom: 24px;
    }

    .dialog-header h2 {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      color: #1f2937;
    }

    .dialog-form {
      padding: 0 24px 24px 24px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .full-width {
      width: 100%;
    }

    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 12px;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .roles-container {
        padding: 16px;
      }

      .header-content {
        flex-direction: column;
        align-items: stretch;
        gap: 16px;
      }

      .page-title {
        font-size: 24px;
      }

      .dialog-overlay {
        padding: 16px;
      }

      .dialog-container {
        max-width: 100%;
      }

      .dialog-header {
        padding: 16px 16px 0 16px;
      }

      .dialog-form {
        padding: 0 16px 16px 16px;
      }
    }
  `]
})
export class RolesComponent implements OnInit {
  private roleService = inject(RoleService);
  private snackBar = inject(MatSnackBar);
  private fb = inject(FormBuilder);

  roles = signal<Role[]>([]);
  loading = signal(true);
  saving = signal(false);
  showRoleDialog = signal(false);
  editingRole = signal<Role | null>(null);

  displayedColumns = ['name', 'description', 'actions'];

  roleForm: FormGroup = this.fb.group({
    name: ['', [Validators.required]],
    description: ['']
  });

  ngOnInit(): void {
    this.loadRoles();
  }

  loadRoles(): void {
    this.loading.set(true);
    this.roleService.getRoles().subscribe({
      next: (roles) => {
        this.roles.set(roles);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading roles:', error);
        this.snackBar.open('Failed to load roles', 'Close', { duration: 3000 });
        this.loading.set(false);
      }
    });
  }

  openCreateRoleDialog(): void {
    this.editingRole.set(null);
    this.roleForm.reset();
    this.showRoleDialog.set(true);
  }

  editRole(role: Role): void {
    this.editingRole.set(role);
    this.roleForm.patchValue({
      name: role.name,
      description: role.description || ''
    });
    this.showRoleDialog.set(true);
  }

  closeRoleDialog(): void {
    this.showRoleDialog.set(false);
    this.editingRole.set(null);
    this.roleForm.reset();
  }

  saveRole(): void {
    if (this.roleForm.invalid) return;

    this.saving.set(true);
    const formValue = this.roleForm.value;
    const request = {
      name: formValue.name,
      description: formValue.description || undefined
    };

    const operation = this.editingRole()
      ? this.roleService.updateRole(this.editingRole()!.id, request)
      : this.roleService.createRole(request);

    operation.subscribe({
      next: () => {
        const message = this.editingRole() ? 'Role updated successfully' : 'Role created successfully';
        this.snackBar.open(message, 'Close', { duration: 3000 });
        this.closeRoleDialog();
        this.loadRoles();
        this.saving.set(false);
      },
      error: (error) => {
        console.error('Error saving role:', error);
        this.snackBar.open('Failed to save role', 'Close', { duration: 3000 });
        this.saving.set(false);
      }
    });
  }

  deleteRole(role: Role): void {
    if (confirm(`Are you sure you want to delete the role "${role.name}"?`)) {
      this.roleService.deleteRole(role.id).subscribe({
        next: () => {
          this.snackBar.open('Role deleted successfully', 'Close', { duration: 3000 });
          this.loadRoles();
        },
        error: (error) => {
          console.error('Error deleting role:', error);
          this.snackBar.open('Failed to delete role', 'Close', { duration: 3000 });
        }
      });
    }
  }
}