import { Component, OnInit, signal, computed, viewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Material Components
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatChipsModule } from '@angular/material/chips';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';

// Services
import { UserManagementService } from '../../../core/services/user-management.service';
import { RoleService } from '../../../core/services/role.service';

// Models
import { User } from '../../../core/models/auth.models';
import { Role, CreateUserRequest, UpdateUserRequest, AssignRolesRequest } from '../../../core/models/user-management.models';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatChipsModule,
    MatSlideToggleModule,
    MatTooltipModule,
    MatMenuModule,
    MatDividerModule
  ],
  template: `
    <div class="users-container">
      <!-- Header -->
      <div class="users-header">
        <div class="header-title">
          <h1>
            <mat-icon>people</mat-icon>
            User Management
          </h1>
          <p class="header-subtitle">
            Manage system users, roles, and permissions
          </p>
        </div>

        <div class="header-actions">
          <button mat-raised-button color="primary" (click)="openCreateUserDialog()">
            <mat-icon>person_add</mat-icon>
            Add User
          </button>
        </div>
      </div>

      <!-- Filters -->
      <mat-card class="filters-card">
        <mat-card-content>
          <div class="filters-row">
            <mat-form-field appearance="outline" class="filter-field">
              <mat-label>Search Users</mat-label>
              <input matInput
                     placeholder="Search by username, email..."
                     [value]="searchTerm()"
                     (input)="onSearchChange($event)">
              <mat-icon matPrefix>search</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline" class="filter-field">
              <mat-label>Role</mat-label>
              <mat-select [value]="roleFilter()" (selectionChange)="onRoleFilterChange($event.value)">
                <mat-option value="">All Roles</mat-option>
                @for (role of availableRoles(); track role.id) {
                  <mat-option [value]="role.id">{{ role.name }}</mat-option>
                }
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="filter-field">
              <mat-label>Status</mat-label>
              <mat-select [value]="statusFilter()" (selectionChange)="onStatusFilterChange($event.value)">
                <mat-option value="">All Status</mat-option>
                <mat-option value="active">Active</mat-option>
                <mat-option value="inactive">Inactive</mat-option>
              </mat-select>
            </mat-form-field>

            @if (hasFilters()) {
              <button mat-stroked-button (click)="clearFilters()">
                <mat-icon>clear</mat-icon>
                Clear Filters
              </button>
            }
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Users Table -->
      <mat-card class="table-card">
        <mat-card-content>
          <div class="table-toolbar">
            <span class="results-count">
              {{ filteredUsers().length }} users found
            </span>

            <div class="table-actions">
              <button mat-icon-button (click)="refreshUsers()" [disabled]="isLoading()">
                <mat-icon [class.spinning]="isLoading()">refresh</mat-icon>
              </button>
            </div>
          </div>

          @if (isLoading()) {
            <div class="loading-state">
              <mat-icon class="spinning">refresh</mat-icon>
              <span>Loading users...</span>
            </div>
          } @else {
            <div class="table-container">
              <table mat-table [dataSource]="filteredUsers()" class="users-table">
                <!-- Avatar & Username Column -->
                <ng-container matColumnDef="user">
                  <th mat-header-cell *matHeaderCellDef>User</th>
                  <td mat-cell *matCellDef="let user">
                    <div class="user-cell">
                      <div class="user-avatar">
                        {{ getUserInitials(user) }}
                      </div>
                      <div class="user-info">
                        <div class="username">{{ user.username }}</div>
                        <div class="email">{{ user.email }}</div>
                      </div>
                    </div>
                  </td>
                </ng-container>

                <!-- Roles Column -->
                <ng-container matColumnDef="roles">
                  <th mat-header-cell *matHeaderCellDef>Roles</th>
                  <td mat-cell *matCellDef="let user">
                    <div class="roles-cell">
                      @if (user.roles && user.roles.length > 0) {
                        <mat-chip-set>
                          @for (role of user.roles; track role) {
                            <mat-chip>{{ role }}</mat-chip>
                          }
                        </mat-chip-set>
                      } @else {
                        <span class="no-roles">No roles assigned</span>
                      }
                    </div>
                  </td>
                </ng-container>

                <!-- Status Column -->
                <ng-container matColumnDef="status">
                  <th mat-header-cell *matHeaderCellDef>Status</th>
                  <td mat-cell *matCellDef="let user">
                    <div class="status-cell">
                      <div class="status-badge" [class]="user.isActive ? 'active' : 'inactive'">
                        <mat-icon>{{ user.isActive ? 'check_circle' : 'cancel' }}</mat-icon>
                        {{ user.isActive ? 'Active' : 'Inactive' }}
                      </div>
                    </div>
                  </td>
                </ng-container>

                <!-- Last Login Column -->
                <ng-container matColumnDef="lastLogin">
                  <th mat-header-cell *matHeaderCellDef>Last Login</th>
                  <td mat-cell *matCellDef="let user">
                    @if (user.lastLoginAt) {
                      <span class="last-login">{{ user.lastLoginAt | date:'short' }}</span>
                    } @else {
                      <span class="never-logged-in">Never logged in</span>
                    }
                  </td>
                </ng-container>

                <!-- Actions Column -->
                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef>Actions</th>
                  <td mat-cell *matCellDef="let user">
                    <div class="actions-cell">
                      <button mat-icon-button [matMenuTriggerFor]="userMenu"
                              [matMenuTriggerData]="{user: user}">
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

    <!-- User Actions Menu -->
    <mat-menu #userMenu="matMenu">
      <ng-template matMenuContent let-user="user">
        <button mat-menu-item (click)="editUser(user)">
          <mat-icon>edit</mat-icon>
          <span>Edit Profile</span>
        </button>
        <button mat-menu-item (click)="manageRoles(user)">
          <mat-icon>admin_panel_settings</mat-icon>
          <span>Manage Roles</span>
        </button>
        <button mat-menu-item (click)="toggleUserStatus(user)">
          <mat-icon>{{ user.isActive ? 'block' : 'check_circle' }}</mat-icon>
          <span>{{ user.isActive ? 'Deactivate' : 'Activate' }}</span>
        </button>
        <mat-divider></mat-divider>
        <button mat-menu-item (click)="deleteUser(user)" class="delete-action">
          <mat-icon>delete</mat-icon>
          <span>Delete User</span>
        </button>
      </ng-template>
    </mat-menu>
  `,
  styles: [`
    .users-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0;
    }

    .users-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;
      padding: 24px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 16px;
      color: white;
    }

    .header-title h1 {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 28px;
      font-weight: 700;
      margin: 0 0 8px 0;
    }

    .header-subtitle {
      font-size: 16px;
      opacity: 0.9;
      margin: 0;
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }

    .filters-card {
      margin-bottom: 24px;
    }

    .filters-row {
      display: flex;
      gap: 16px;
      align-items: center;
      flex-wrap: wrap;
    }

    .filter-field {
      min-width: 200px;
    }

    .table-card {
      margin-bottom: 24px;
    }

    .table-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      padding: 0 8px;
    }

    .results-count {
      font-size: 14px;
      color: #666;
    }

    .table-actions {
      display: flex;
      gap: 8px;
    }

    .loading-state {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      padding: 48px;
      color: #666;
    }

    .table-container {
      overflow-x: auto;
    }

    .users-table {
      width: 100%;
    }

    .user-cell {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 600;
      font-size: 14px;
    }

    .user-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .username {
      font-weight: 600;
      color: #333;
    }

    .email {
      font-size: 13px;
      color: #666;
    }

    .roles-cell mat-chip-set {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
    }

    .no-roles {
      color: #999;
      font-style: italic;
      font-size: 13px;
    }

    .status-badge {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
    }

    .status-badge.active {
      background: #dcfce7;
      color: #166534;
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

    .last-login {
      font-size: 13px;
      color: #666;
    }

    .never-logged-in {
      font-size: 13px;
      color: #999;
      font-style: italic;
    }

    .actions-cell {
      display: flex;
      gap: 4px;
    }

    .delete-action {
      color: #dc2626 !important;
    }

    .spinning {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    @media (max-width: 768px) {
      .users-header {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
      }

      .filters-row {
        flex-direction: column;
        align-items: stretch;
      }

      .filter-field {
        min-width: auto;
      }

      .table-toolbar {
        flex-direction: column;
        gap: 12px;
        align-items: stretch;
      }
    }
  `]
})
export class UsersComponent implements OnInit {
  // Services
  constructor(
    private userService: UserManagementService,
    private roleService: RoleService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private fb: FormBuilder
  ) {}

  // Signals
  users = signal<User[]>([]);
  availableRoles = signal<Role[]>([]);
  isLoading = signal(false);
  searchTerm = signal('');
  roleFilter = signal('');
  statusFilter = signal('');

  // Table configuration
  displayedColumns = ['user', 'roles', 'status', 'lastLogin', 'actions'];

  ngOnInit() {
    this.loadUsers();
    this.loadRoles();
  }

  // Computed values
  filteredUsers = computed(() => {
    let users = this.users();
    const search = this.searchTerm().toLowerCase();
    const roleId = this.roleFilter();
    const status = this.statusFilter();

    if (search) {
      users = users.filter(user =>
        user.username.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search)
      );
    }

    if (roleId) {
      users = users.filter(user =>
        user.roles?.some(role => role === roleId)
      );
    }

    if (status === 'active') {
      users = users.filter(user => user.isActive);
    } else if (status === 'inactive') {
      users = users.filter(user => !user.isActive);
    }

    return users;
  });

  hasFilters = computed(() => {
    return this.searchTerm() || this.roleFilter() || this.statusFilter();
  });

  // Data loading
  async loadUsers() {
    this.isLoading.set(true);
    try {
      const users = await this.userService.getUsers().toPromise();
      this.users.set(users || []);
    } catch (error) {
      console.error('Failed to load users:', error);
      this.snackBar.open('Failed to load users', 'Close', { duration: 3000 });
    } finally {
      this.isLoading.set(false);
    }
  }

  async loadRoles() {
    try {
      const roles = await this.roleService.getRoles().toPromise();
      this.availableRoles.set(roles || []);
    } catch (error) {
      console.error('Failed to load roles:', error);
    }
  }

  // Event handlers
  onSearchChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.searchTerm.set(target.value);
  }

  onRoleFilterChange(roleId: string) {
    this.roleFilter.set(roleId);
  }

  onStatusFilterChange(status: string) {
    this.statusFilter.set(status);
  }

  clearFilters() {
    this.searchTerm.set('');
    this.roleFilter.set('');
    this.statusFilter.set('');
  }

  refreshUsers() {
    this.loadUsers();
  }

  // User actions
  openCreateUserDialog() {
    // TODO: Implement create user dialog
    console.log('Open create user dialog');
  }

  editUser(user: User) {
    // TODO: Implement edit user dialog
    console.log('Edit user:', user);
  }

  manageRoles(user: User) {
    // TODO: Implement manage roles dialog
    console.log('Manage roles for user:', user);
  }

  async toggleUserStatus(user: User) {
    try {
      const newStatus = !user.isActive;
      await this.userService.updateUser(user.id, { isActive: newStatus }).toPromise();

      // Update local state
      const users = this.users().map(u =>
        u.id === user.id ? { ...u, isActive: newStatus } : u
      );
      this.users.set(users);

      this.snackBar.open(
        `User ${newStatus ? 'activated' : 'deactivated'} successfully`,
        'Close',
        { duration: 3000 }
      );
    } catch (error) {
      console.error('Failed to update user status:', error);
      this.snackBar.open('Failed to update user status', 'Close', { duration: 3000 });
    }
  }

  async deleteUser(user: User) {
    if (confirm(`Are you sure you want to delete user "${user.username}"?`)) {
      try {
        await this.userService.deleteUser(user.id).toPromise();

        // Remove from local state
        const users = this.users().filter(u => u.id !== user.id);
        this.users.set(users);

        this.snackBar.open('User deleted successfully', 'Close', { duration: 3000 });
      } catch (error) {
        console.error('Failed to delete user:', error);
        this.snackBar.open('Failed to delete user', 'Close', { duration: 3000 });
      }
    }
  }

  // Helper methods
  getUserInitials(user: User): string {
    const firstName = user.firstName || user.username?.charAt(0) || 'U';
    const lastName = user.lastName || user.username?.charAt(1) || 'N';
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
  }
}