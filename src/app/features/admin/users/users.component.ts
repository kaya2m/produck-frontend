import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Material Components
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';

// Custom UI Components
import { DataGridComponent, DataGridColumn, DataGridAction, DataGridConfig } from '../../../shared/components/data-grid/data-grid.component';
import { CellRendererHelpers } from '../../../shared/components/data-grid/cell-renderers';

// Services
import { UserManagementService } from '../../../core/services/user-management.service';
import { RoleService } from '../../../core/services/role.service';

// Models
import { Role, UserDetailDto } from '../../../core/models/user-management.models';

// Dialog Components
import { UserFormDialogComponent, UserFormDialogData } from './user-form-dialog/user-form-dialog.component';
import { RoleAssignmentDialogComponent, RoleAssignmentDialogData } from './role-assignment-dialog/role-assignment-dialog.component';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    MatSnackBarModule,
    MatChipsModule,
    MatTooltipModule,
    MatMenuModule,
    MatDividerModule,
    DataGridComponent
  ],
  template: `
    <div class="page-container">
      <!-- Header - Updated for new standards -->
      <div class="page-header">
        <div class="actions-section">
          <button mat-raised-button color="primary" (click)="openCreateUserDialog()">
            <mat-icon>person_add</mat-icon>Yeni Kullanıcı
          </button>
        </div>
      </div>

      <!-- Data Grid - Standard: Sadece grid, card wrapper yok -->
      <div class="grid-section">
        <app-data-grid
          [data]="filteredUsers()"
          [columns]="gridColumns"
          [actions]="gridActions"
          [config]="gridConfig"
          [loading]="isLoading()"
          [title]="'Kullanıcılar'"
          [showDefaultToolbar]="true"
          [enableQuickFilter]="true"
          (pageChanged)="onPageChange($event)"
          (filterChanged)="onFilterChange($event)">
        </app-data-grid>
      </div>
    </div>
  `,
  styles: [`
    /* Updated for new page layout standards */
    .page-container {
      padding: 20px;
      max-width: 1400px;
      margin: 0 auto;
      height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;
      gap: 20px;
    }

    .title-section h1 {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 0;
      font-size: 28px;
      font-weight: 500;
      color: #1976d2;
    }

    .title-section mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
    }

    .title-section p {
      margin: 8px 0 0 0;
      color: #666;
      font-size: 16px;
    }

    .actions-section {
      display: flex;
      gap: 12px;
      align-items: center;
    }

    .grid-section {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-height: 0;
    }

    /* All grid-related styles removed - handled by data-grid component */

    /* Context Menu Styles */
    .danger-menu-item {
      color: #f44336 !important;
    }

    .danger-menu-item mat-icon {
      color: #f44336 !important;
    }

    .warn-menu-item {
      color: #ff9800 !important;
    }

    .warn-menu-item mat-icon {
      color: #ff9800 !important;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .page-container {
        padding: 16px;
      }

      .page-header {
        flex-direction: column;
        align-items: stretch;
      }

      .title-section h1 {
        font-size: 24px;
      }

      .title-section mat-icon {
        font-size: 28px;
        width: 28px;
        height: 28px;
      }
    }

    @media (max-width: 480px) {
      .title-section h1 {
        font-size: 20px;
      }

      .title-section mat-icon {
        font-size: 24px;
        width: 24px;
        height: 24px;
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
  users = signal<UserDetailDto[]>([]);
  availableRoles = signal<Role[]>([]);
  isLoading = signal(false);
  searchTerm = signal('');
  roleFilter = signal('');
  statusFilter = signal('');

  // Context Menu

  // Grid Configuration - Updated for new standards
  gridColumns: DataGridColumn[] = [
    {
      field: 'userInfo',
      headerName: 'Kullanıcı Bilgileri',
      flex: 1,
      minWidth: 350,
      pinned: 'left',
      cellRenderer: (params: any) => {
        const data = params.data;
        const initials = this.getUserInitials(data);
        return `
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="
              width: 32px;
              height: 32px;
              border-radius: 50%;
              background: #1976d2;
              color: white;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 12px;
              font-weight: 600;
            ">${initials}</div>
            <div style="display: flex; flex-direction: column;">
              <div style="font-weight: 500; color: #1f2937;">${data.username}</div>
              <div style="font-size: 12px; color: #6b7280;">${data.email}</div>
              <div style="font-size: 11px; color: #9ca3af;">ID: ${data.id.substring(0, 8)}...</div>
            </div>
          </div>
        `;
      },
      filter: 'agTextColumnFilter',
      valueGetter: (params: any) => {
        const data = params.data;
        return `${data.username} ${data.email} ${data.id.substring(0, 8)}`;
      },
      hide: false
    },
    {
      field: 'roles',
      headerName: 'Roller',
      width: 180,
      cellRenderer: (params: any) => {
        const roles = params.data.roles || [];
        if (roles.length === 0) {
          return '<span style="color: #ef4444; font-style: italic;">Rol atanmamış</span>';
        }
        const roleChips = roles.slice(0, 2).map((role: any) =>
          `<span style="
            background: #e0f2fe;
            color: #0277bd;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 500;
            margin-right: 4px;
          ">${role.name}</span>`
        ).join('');
        const moreText = roles.length > 2 ? `<span style="color: #6b7280; font-size: 11px;">+${roles.length - 2}</span>` : '';
        return `<div style="display: flex; flex-wrap: wrap; gap: 4px; align-items: center;">${roleChips}${moreText}</div>`;
      },
      filter: 'agTextColumnFilter',
      hide: false
    },
    {
      field: 'isActive',
      headerName: 'Durum',
      width: 100,
      cellRenderer: (params: any) => {
        const isActive = params.value;
        const color = isActive ? '#059669' : '#dc2626';
        const bgColor = isActive ? '#ecfdf5' : '#fef2f2';
        const text = isActive ? 'Aktif' : 'Pasif';
        return `
          <span style="
            background: ${bgColor};
            color: ${color};
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 600;
          ">${text}</span>
        `;
      },
      filter: 'agTextColumnFilter',
      hide: false
    },
    {
      field: 'phoneNumber',
      headerName: 'Telefon',
      width: 140,
      cellRenderer: (params: any) => {
        const phone = params.value;
        if (!phone) {
          return '<span style="color: #9ca3af; font-style: italic;">-</span>';
        }
        return `<a href="tel:${phone}" style="color: #1976d2; text-decoration: none;">${phone}</a>`;
      },
      filter: 'agTextColumnFilter',
      hide: false
    },
    {
      field: 'twoFactorEnabled',
      headerName: '2FA',
      width: 80,
      cellRenderer: (params: any) => {
        const enabled = params.value;
        const color = enabled ? '#059669' : '#dc2626';
        const bgColor = enabled ? '#ecfdf5' : '#fef2f2';
        const text = enabled ? 'Açık' : 'Kapalı';
        return `
          <span style="
            background: ${bgColor};
            color: ${color};
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 600;
          ">${text}</span>
        `;
      },
      filter: 'agTextColumnFilter',
      hide: false
    },
    {
      field: 'email',
      headerName: 'E-posta',
      width: 200,
      cellRenderer: (params: any) => {
        return `<a href="mailto:${params.value}" style="color: #1976d2; text-decoration: none;">${params.value}</a>`;
      },
      filter: 'agTextColumnFilter',
      hide: false
    },
    // Ek sütunlar - varsayılan gizli
    {
      field: 'emailConfirmed',
      headerName: 'E-posta Onayı',
      width: 120,
      cellRenderer: (params: any) => {
        const confirmed = params.value;
        const color = confirmed ? '#059669' : '#dc2626';
        const bgColor = confirmed ? '#ecfdf5' : '#fef2f2';
        const text = confirmed ? 'Onaylı' : 'Onaysız';
        return `
          <span style="
            background: ${bgColor};
            color: ${color};
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 600;
          ">${text}</span>
        `;
      },
      filter: 'agTextColumnFilter',
      hide: true
    },
    {
      field: 'phoneNumberConfirmed',
      headerName: 'Telefon Onayı',
      width: 120,
      cellRenderer: (params: any) => {
        const confirmed = params.value;
        const color = confirmed ? '#059669' : '#dc2626';
        const bgColor = confirmed ? '#ecfdf5' : '#fef2f2';
        const text = confirmed ? 'Onaylı' : 'Onaysız';
        return `
          <span style="
            background: ${bgColor};
            color: ${color};
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 600;
          ">${text}</span>
        `;
      },
      filter: 'agTextColumnFilter',
      hide: true
    },
    {
      field: 'createdDate',
      headerName: 'Oluşturma Tarihi',
      width: 150,
      cellRenderer: (params: any) => {
        const date = new Date(params.value);
        return date.toLocaleDateString('tr-TR') + ' ' + date.toLocaleTimeString('tr-TR', {hour: '2-digit', minute: '2-digit'});
      },
      filter: 'agDateColumnFilter',
      hide: false
    },
    {
      field: 'lastModifiedDate',
      headerName: 'Son Güncelleme',
      width: 150,
      cellRenderer: (params: any) => {
        if (!params.value) return '-';
        const date = new Date(params.value);
        return date.toLocaleDateString('tr-TR') + ' ' + date.toLocaleTimeString('tr-TR', {hour: '2-digit', minute: '2-digit'});
      },
      filter: 'agDateColumnFilter',
      hide: false
    }
  ];

  // Context Menu Actions - Updated for new color standards
  gridActions: DataGridAction[] = [
    {
      icon: 'visibility',
      tooltip: 'Detayları Görüntüle',
      color: undefined,
      click: (row: UserDetailDto) => this.viewUserDetails(row)
    },
    {
      icon: 'edit',
      tooltip: 'Profil Düzenle',
      color: 'primary',
      click: (row: UserDetailDto) => this.editUser(row)
    },
    {
      icon: 'admin_panel_settings',
      tooltip: 'Rolleri Yönet',
      color: 'accent',
      click: (row: UserDetailDto) => this.manageRoles(row)
    },
    {
      icon: 'block',
      tooltip: 'Durumu Değiştir',
      color: 'accent',
      click: (row: UserDetailDto) => this.toggleUserStatus(row)
    },
    {
      icon: 'content_copy',
      tooltip: 'Kopyala',
      color: 'accent',
      click: (row: UserDetailDto) => this.duplicateUser(row)
    },
    {
      icon: 'delete',
      tooltip: 'Kullanıcı Sil',
      color: 'warn',
      click: (row: UserDetailDto) => this.deleteUser(row)
    }
  ];

  gridConfig: DataGridConfig = {
    enableSorting: true,
    enableFiltering: true,
    enablePagination: true,
    paginationPageSize: 15,
    paginationPageSizeSelector: [15, 30, 50, 100],
    enableSelection: false,
    enableContextMenu: true,
    enableColumnResize: true,
    enableColumnReorder: true,
    enableAutoSizeColumns: false,
    rowHeight: 60,
    headerHeight: 48
  };

  // Pagination
  totalCount = signal(0);
  pageNumber = signal(1);
  pageSize = signal(15);

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
        user.roles?.some(role => role.id === roleId)
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
  loadUsers() {
    this.isLoading.set(true);
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users.set(users || []);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Failed to load users:', error);
        this.snackBar.open('Failed to load users', 'Close', { duration: 3000 });
        this.isLoading.set(false);
      }
    });
  }

  loadRoles() {
    this.roleService.getAllRoles().subscribe({
      next: (roles) => {
        this.availableRoles.set(roles || []);
      },
      error: (error) => {
        console.error('Failed to load roles:', error);
      }
    });
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


  // Filter helpers
  getRoleFilterLabel(): string {
    const roleId = this.roleFilter();
    if (!roleId) return 'All Roles';

    const role = this.availableRoles().find(r => r.id === roleId);
    return role ? role.name : 'All Roles';
  }

  getStatusFilterLabel(): string {
    const status = this.statusFilter();
    if (!status) return 'All Status';
    return status === 'active' ? 'Active' : 'Inactive';
  }

  toggleRoleFilter() {
    // TODO: Implement role filter dropdown or modal
    console.log('Toggle role filter');
  }

  toggleStatusFilter() {
    // TODO: Implement status filter dropdown or modal
    console.log('Toggle status filter');
  }

  // User actions
  openCreateUserDialog() {
    const dialogData: UserFormDialogData = {
      mode: 'create'
    };

    const dialogRef = this.dialog.open(UserFormDialogComponent, {
      width: '600px',
      data: dialogData,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadUsers();
      }
    });
  }

  editUser(user: UserDetailDto) {
    const dialogData: UserFormDialogData = {
      mode: 'edit',
      user: user
    };

    const dialogRef = this.dialog.open(UserFormDialogComponent, {
      width: '600px',
      data: dialogData,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadUsers();
      }
    });
  }

  manageRoles(user: UserDetailDto) {
    const dialogData: RoleAssignmentDialogData = {
      user: user
    };

    const dialogRef = this.dialog.open(RoleAssignmentDialogComponent, {
      width: '600px',
      data: dialogData,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadUsers();
      }
    });
  }

  toggleUserStatus(user: UserDetailDto) {
    const newStatus = !user.isActive;
    this.userService.updateUserProfile(user.id, { isActive: newStatus }).subscribe({
      next: () => {
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
      },
      error: (error) => {
        console.error('Failed to update user status:', error);
        this.snackBar.open('Failed to update user status', 'Close', { duration: 3000 });
      }
    });
  }

  // Grid Action Methods - New implementations
  viewUserDetails(user: UserDetailDto): void {
    console.log('Viewing user details:', user);
    // TODO: Implement user details view
  }

  duplicateUser(user: UserDetailDto): void {
    const duplicated = { ...user };
    delete (duplicated as any).id;
    duplicated.username = `${duplicated.username}_copy`;
    duplicated.email = `copy_${duplicated.email}`;

    const dialogData: UserFormDialogData = {
      mode: 'create',
      user: duplicated
    };

    const dialogRef = this.dialog.open(UserFormDialogComponent, {
      width: '600px',
      data: dialogData,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadUsers();
      }
    });
  }

  deleteUser(user: UserDetailDto) {
    if (confirm(`"${user.username}" kullanıcısını silmek istediğinizden emin misiniz?`)) {
      this.userService.deleteUser(user.id).subscribe({
        next: () => {
          // Remove from local state
          const users = this.users().filter(u => u.id !== user.id);
          this.users.set(users);

          this.snackBar.open('Kullanıcı başarıyla silindi', 'Tamam', { duration: 3000 });
        },
        error: (error) => {
          console.error('Failed to delete user:', error);
          this.snackBar.open('Kullanıcı silinirken hata oluştu', 'Tamam', { duration: 3000 });
        }
      });
    }
  }

  exportToExcel(): void {
    console.log('Exporting users to Excel');
    // TODO: Implement Excel export
    this.snackBar.open('Excel export özelliği yakında eklenecek', 'Tamam', { duration: 3000 });
  }

  onPageChange(page: any): void {
    this.pageNumber.set(page.pageNumber);
    this.pageSize.set(page.pageSize);
    // Since this uses local filtering, no API call needed
  }

  onFilterChange(filters: any): void {
    this.searchTerm.set(filters.globalSearch || '');
  }


  assignRolesToUser(user: UserDetailDto): void {
    this.manageRoles(user);
  }

  resetUserPassword(user: UserDetailDto): void {
    if (confirm(`"${user.username}" kullanıcısının şifresini sıfırlamak istediğinizden emin misiniz?`)) {
      // API call for password reset
      this.snackBar.open('Şifre sıfırlama özelliği yakında eklenecek', 'Tamam', { duration: 3000 });
      console.log('Reset password for user:', user);
    }
  }

  // Helper methods
  getUserInitials(user: UserDetailDto): string {
    const username = user.username;
    if (!username || username.length === 0) return 'UN';

    if (username.length === 1) return username.toUpperCase();

    return (username.charAt(0) + username.charAt(1)).toUpperCase();
  }
}
