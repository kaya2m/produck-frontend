import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';
import { DataGridComponent, DataGridColumn, DataGridAction, DataGridConfig } from '../../../shared/components/data-grid/data-grid.component';
import { CellRendererHelpers } from '../../../shared/components/data-grid/cell-renderers';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { RoleService } from '../../../core/services/role.service';
import { PermissionService } from '../../../core/services/permission.service';
import { Role, Permission, CreateRoleRequest, UpdateRoleRequest } from '../../../core/models/user-management.models';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [
    CommonModule,
    DataGridComponent,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTooltipModule,
    MatDialogModule,
    MatSnackBarModule,
    MatInputModule,
    MatFormFieldModule,
    MatMenuModule,
    MatSelectModule,
    MatCheckboxModule,
    MatChipsModule,
    MatExpansionModule,
    MatTabsModule,
    MatDividerModule,
    ReactiveFormsModule
  ],
  template: `
    <div class="page-container">
      <!-- Header - Updated for new standards -->
      <div class="page-header">
        <div class="title-section">
          <h1><mat-icon>admin_panel_settings</mat-icon>Rol Yönetimi</h1>
          <p>Sistem rollerini yönetin ve izin atamalarını yapın</p>
        </div>
        <div class="actions-section">
          <button mat-raised-button color="primary" (click)="openCreateRoleDialog()">
            <mat-icon>add</mat-icon>Yeni Rol
          </button>
          <button mat-icon-button matTooltip="Excel'e Aktar" (click)="exportToExcel()">
            <mat-icon>download</mat-icon>
          </button>
          <button mat-icon-button matTooltip="Yenile" (click)="loadRoles()">
            <mat-icon>refresh</mat-icon>
          </button>
        </div>
      </div>

      <!-- Data Grid - Standard: Sadece grid, card wrapper yok -->
      <div class="grid-section">
        <app-data-grid
          [data]="roles()"
          [columns]="gridColumns"
          [actions]="gridActions"
          [config]="gridConfig"
          [loading]="loading()"
          [title]="'Roller'"
          [showDefaultToolbar]="true"
          [enableQuickFilter]="true">
        </app-data-grid>
      </div>
    </div>

    <!-- Role Dialog -->
    @if (showRoleDialog()) {
      <div class="dialog-overlay" (click)="closeRoleDialog()">
        <div class="dialog-container" (click)="$event.stopPropagation()">
          <div class="dialog-header">
            <h2>{{ editingRole() ? 'Rol Düzenle' : 'Yeni Rol Oluştur' }}</h2>
            <button mat-icon-button (click)="closeRoleDialog()">
              <mat-icon>close</mat-icon>
            </button>
          </div>

          <form [formGroup]="roleForm" (ngSubmit)="saveRole()" class="dialog-form">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Rol Adı *</mat-label>
              <input matInput formControlName="name" placeholder="Rol adını giriniz">
              <mat-error *ngIf="roleForm.get('name')?.hasError('required')">
                Rol adı gereklidir
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Açıklama</mat-label>
              <textarea matInput formControlName="description" placeholder="Rol açıklaması" rows="3"></textarea>
            </mat-form-field>

            <div class="dialog-actions">
              <button type="button" mat-button (click)="closeRoleDialog()">
                İptal
              </button>
              <button type="submit" mat-raised-button color="primary" [disabled]="roleForm.invalid || saving()">
                @if (saving()) {
                  <mat-icon class="loading-icon">refresh</mat-icon>
                } @else {
                  <mat-icon>{{ editingRole() ? 'save' : 'add' }}</mat-icon>
                }
                {{ editingRole() ? 'Güncelle' : 'Oluştur' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- Permissions Dialog -->
    @if (showPermissionsDialog()) {
      <div class="dialog-overlay" (click)="closePermissionsDialog()">
        <div class="dialog-container permissions-dialog" (click)="$event.stopPropagation()">
          <div class="dialog-header">
            <h2>İzin Yönetimi - {{ selectedRole()?.name }}</h2>
            <button mat-icon-button (click)="closePermissionsDialog()">
              <mat-icon>close</mat-icon>
            </button>
          </div>

          <div class="dialog-form">
            @if (loadingPermissions()) {
              <div class="loading-state">
                <mat-icon class="loading-icon">refresh</mat-icon>
                <p>İzinler yükleniyor...</p>
              </div>
            } @else {
              <mat-tab-group>
                <mat-tab label="Kategori Bazında">
                  <div class="permissions-content">
                    @for (category of permissionCategories(); track category) {
                      <mat-expansion-panel>
                        <mat-expansion-panel-header>
                          <mat-panel-title>{{ category }}</mat-panel-title>
                          <mat-panel-description>
                            {{ getCategoryPermissions(category).length }} izin
                          </mat-panel-description>
                        </mat-expansion-panel-header>

                        <div class="permission-list">
                          @for (permission of getCategoryPermissions(category); track permission.id) {
                            <mat-checkbox
                              [checked]="isPermissionAssigned(permission.id)"
                              (change)="togglePermission(permission.id, $event.checked)">
                              <div class="permission-item">
                                <div class="permission-name">{{ permission.name }}</div>
                                <div class="permission-description">{{ permission.description }}</div>
                              </div>
                            </mat-checkbox>
                          }
                        </div>
                      </mat-expansion-panel>
                    }
                  </div>
                </mat-tab>

                <mat-tab label="Atanmış İzinler">
                  <div class="assigned-permissions">
                    @if (rolePermissions().length === 0) {
                      <div class="empty-state">
                        <mat-icon>security</mat-icon>
                        <p>Bu role henüz izin atanmamış</p>
                      </div>
                    } @else {
                      <div class="permission-chips">
                        @for (permission of rolePermissions(); track permission.id) {
                          <mat-chip-option [removable]="true" (removed)="removePermission(permission.id)">
                            {{ permission.name }}
                          </mat-chip-option>
                        }
                      </div>
                    }
                  </div>
                </mat-tab>
              </mat-tab-group>
            }

            <div class="dialog-actions">
              <button type="button" mat-button (click)="closePermissionsDialog()">
                İptal
              </button>
              <button mat-raised-button color="primary" (click)="savePermissions()" [disabled]="savingPermissions() || loadingPermissions()">
                @if (savingPermissions()) {
                  <mat-icon class="loading-icon">refresh</mat-icon>
                } @else {
                  <mat-icon>save</mat-icon>
                }
                İzinleri Kaydet
              </button>
            </div>
          </div>
        </div>
      </div>
    }
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

    /* Context Menu Styles */
    .danger-menu-item {
      color: #f44336 !important;
    }

    .danger-menu-item mat-icon {
      color: #f44336 !important;
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
      padding: 20px;
    }

    .dialog-container {
      background: white;
      border-radius: 8px;
      width: 100%;
      max-width: 600px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 8px 32px rgba(0,0,0,0.2);
    }

    .permissions-dialog {
      max-width: 900px;
    }

    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24px 24px 0 24px;
      border-bottom: 1px solid #eee;
      padding-bottom: 16px;
      margin-bottom: 24px;
    }

    .dialog-header h2 {
      margin: 0;
      font-size: 24px;
      font-weight: 500;
      color: #333;
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
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid #eee;
    }

    .loading-icon {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px;
      color: #666;
    }

    .loading-state mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
    }

    .permissions-content {
      padding: 20px 0;
    }

    .permission-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 16px 0;
    }

    .permission-item {
      margin-left: 8px;
    }

    .permission-name {
      font-weight: 500;
      color: #333;
    }

    .permission-description {
      font-size: 12px;
      color: #666;
      margin-top: 2px;
    }

    .assigned-permissions {
      padding: 20px 0;
    }

    .permission-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px;
      color: #666;
    }

    .empty-state mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
      opacity: 0.5;
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

      .dialog-container {
        margin: 10px;
        max-width: calc(100vw - 20px);
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
      .dialog-header {
        padding: 16px 16px 0 16px;
      }

      .dialog-form {
        padding: 0 16px 16px 16px;
      }

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
export class RolesComponent implements OnInit {
  private roleService = inject(RoleService);
  private permissionService = inject(PermissionService);
  private snackBar = inject(MatSnackBar);
  private fb = inject(FormBuilder);

  roles = signal<Role[]>([]);
  loading = signal(true);
  saving = signal(false);
  showRoleDialog = signal(false);
  editingRole = signal<Role | null>(null);

  // Permissions management
  showPermissionsDialog = signal(false);
  selectedRole = signal<Role | null>(null);
  allPermissions = signal<Permission[]>([]);
  rolePermissions = signal<Permission[]>([]);
  loadingPermissions = signal(false);
  savingPermissions = signal(false);
  permissionCategories = signal<string[]>([]);
  selectedPermissionIds = new Set<string>();


  // Grid Configuration - Updated for new standards
  gridColumns: DataGridColumn[] = [
    {
      field: 'roleInfo',
      headerName: 'Rol Bilgileri',
      flex: 1,
      minWidth: 350,
      pinned: 'left',
      cellRenderer: CellRendererHelpers.createInfoRenderer(),
      filter: 'agTextColumnFilter',
      valueGetter: (params: any) => {
        const data = params.data;
        return `${data.name} ${data.description || ''}`;
      },
      hide: false
    },
    {
      field: 'permissions',
      headerName: 'İzinler',
      width: 120,
      cellRenderer: (params: any) => {
        const count = params.data.permissions?.length || 0;
        const color = count > 0 ? '#059669' : '#dc2626';
        const bgColor = count > 0 ? '#ecfdf5' : '#fef2f2';
        return `
          <span style="
            background: ${bgColor};
            color: ${color};
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 600;
          ">${count} İzin</span>
        `;
      },
      filter: 'agTextColumnFilter',
      hide: false
    },
    // Ek sütunlar - varsayılan gizli
    {
      field: 'name',
      headerName: 'Rol Adı',
      width: 150,
      filter: 'agTextColumnFilter',
      hide: true
    },
    {
      field: 'description',
      headerName: 'Açıklama',
      width: 200,
      valueGetter: (params: any) => params.data.description || 'Açıklama yok',
      filter: 'agTextColumnFilter',
      hide: true
    },
    {
      field: 'createdDate',
      headerName: 'Oluşturma Tarihi',
      width: 150,
      cellRenderer: CellRendererHelpers.createDateRenderer(),
      filter: 'agDateColumnFilter',
      hide: true
    }
  ];

  // Context Menu Actions - Updated for new color standards
  gridActions: DataGridAction[] = [
    {
      icon: 'visibility',
      tooltip: 'Detayları Görüntüle',
      color: undefined,
      click: (row: Role) => this.viewRoleDetails(row)
    },
    {
      icon: 'edit',
      tooltip: 'Düzenle',
      color: 'primary',
      click: (row: Role) => this.editRole(row)
    },
    {
      icon: 'security',
      tooltip: 'İzinleri Yönet',
      color: 'accent',
      click: (row: Role) => this.openPermissionsDialog(row)
    },
    {
      icon: 'content_copy',
      tooltip: 'Kopyala',
      color: 'accent',
      click: (row: Role) => this.duplicateRole(row)
    },
    {
      icon: 'delete',
      tooltip: 'Sil',
      color: 'warn',
      click: (row: Role) => this.deleteRole(row)
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

  roleForm: FormGroup = this.fb.group({
    name: ['', [Validators.required]],
    description: ['']
  });

  ngOnInit(): void {
    this.loadRoles();
    this.loadAllPermissions();
  }

  loadRoles(): void {
    this.loading.set(true);
    this.roleService.getAllRoles().subscribe({
      next: (roles) => {
        this.roles.set(roles || []);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading roles:', error);
        this.roles.set([]);
        this.snackBar.open('Failed to load roles', 'Close', { duration: 3000 });
        this.loading.set(false);
      }
    });
  }

  loadAllPermissions(): void {
    this.permissionService.getAllPermissions().subscribe({
      next: (permissions) => {
        this.allPermissions.set(permissions || []);
        const categories = [...new Set((permissions || []).map(p => p.category))].sort();
        this.permissionCategories.set(categories);
      },
      error: (error) => {
        console.error('Error loading permissions:', error);
        this.allPermissions.set([]);
        this.permissionCategories.set([]);
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
    const request: CreateRoleRequest | UpdateRoleRequest = {
      name: formValue.name,
      description: formValue.description || undefined
    };

    const operation = this.editingRole()
      ? this.roleService.updateRole(this.editingRole()!.id, request as UpdateRoleRequest)
      : this.roleService.createRole(request as CreateRoleRequest);

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

  // Grid Action Methods - New implementations

  deleteRole(role: Role): void {
    if (confirm(`"${role.name}" rolünü silmek istediğinizden emin misiniz?`)) {
      this.roleService.deleteRole(role.id).subscribe({
        next: () => {
          this.snackBar.open('Rol başarıyla silindi', 'Tamam', { duration: 3000 });
          this.loadRoles();
        },
        error: (error) => {
          console.error('Error deleting role:', error);
          this.snackBar.open('Rol silinirken hata oluştu', 'Tamam', { duration: 3000 });
        }
      });
    }
  }

  exportToExcel(): void {
    console.log('Exporting roles to Excel');
    // TODO: Implement Excel export
    this.snackBar.open('Excel export özelliği yakında eklenecek', 'Tamam', { duration: 3000 });
  }

  // Permissions Management Methods
  openPermissionsDialog(role: Role): void {
    this.selectedRole.set(role);
    this.loadRolePermissions(role.id);
    this.showPermissionsDialog.set(true);
  }

  loadRolePermissions(roleId: string): void {
    this.loadingPermissions.set(true);
    this.roleService.getRolePermissions(roleId).subscribe({
      next: (permissions) => {
        this.rolePermissions.set(permissions);
        this.selectedPermissionIds.clear();
        permissions.forEach(p => this.selectedPermissionIds.add(p.id));
        this.loadingPermissions.set(false);
      },
      error: (error) => {
        console.error('Error loading role permissions:', error);
        this.snackBar.open('Failed to load role permissions', 'Close', { duration: 3000 });
        this.loadingPermissions.set(false);
      }
    });
  }

  closePermissionsDialog(): void {
    this.showPermissionsDialog.set(false);
    this.selectedRole.set(null);
    this.rolePermissions.set([]);
    this.selectedPermissionIds.clear();
  }

  getCategoryPermissions(category: string): Permission[] {
    return this.allPermissions().filter(p => p.category === category);
  }

  isPermissionAssigned(permissionId: string): boolean {
    return this.selectedPermissionIds.has(permissionId);
  }

  togglePermission(permissionId: string, checked: boolean): void {
    if (checked) {
      this.selectedPermissionIds.add(permissionId);
    } else {
      this.selectedPermissionIds.delete(permissionId);
    }
  }

  removePermission(permissionId: string): void {
    this.selectedPermissionIds.delete(permissionId);
    this.rolePermissions.set(
      this.rolePermissions().filter(p => p.id !== permissionId)
    );
  }

  savePermissions(): void {
    if (!this.selectedRole()) return;

    this.savingPermissions.set(true);
    const currentPermissionIds = new Set(this.rolePermissions().map(p => p.id));
    const newPermissionIds = this.selectedPermissionIds;

    // Find permissions to add and remove
    const toAdd = [...newPermissionIds].filter(id => !currentPermissionIds.has(id));
    const toRemove = [...currentPermissionIds].filter(id => !newPermissionIds.has(id));

    const roleId = this.selectedRole()!.id;
    const operations: any[] = [];

    if (toAdd.length > 0) {
      operations.push(
        this.roleService.assignPermissions(roleId, { permissionIds: toAdd })
      );
    }

    if (toRemove.length > 0) {
      operations.push(
        this.roleService.removePermissions(roleId, { permissionIds: toRemove })
      );
    }

    if (operations.length === 0) {
      this.savingPermissions.set(false);
      this.closePermissionsDialog();
      return;
    }

    // Execute all operations
    let completed = 0;
    operations.forEach(operation => {
      operation.subscribe({
        next: () => {
          completed++;
          if (completed === operations.length) {
            this.snackBar.open('Permissions updated successfully', 'Close', { duration: 3000 });
            this.loadRolePermissions(roleId);
            this.savingPermissions.set(false);
            this.closePermissionsDialog();
          }
        },
        error: (error: any) => {
          console.error('Error updating permissions:', error);
          this.snackBar.open('Failed to update permissions', 'Close', { duration: 3000 });
          this.savingPermissions.set(false);
        }
      });
    });
  }


  viewRoleDetails(role: Role): void {
    console.log('View role details:', role);
    this.snackBar.open('Rol detayları özelliği yakında eklenecek', 'Tamam', { duration: 3000 });
  }

  managePermissions(role: Role): void {
    this.openPermissionsDialog(role);
  }

  viewRoleUsers(role: Role): void {
    console.log('View users with role:', role);
    this.snackBar.open('Bu role sahip kullanıcıları görüntüleme özelliği yakında eklenecek', 'Tamam', { duration: 3000 });
  }

  duplicateRole(role: Role): void {
    const duplicatedRole = {
      name: `${role.name} (Kopya)`,
      description: role.description,
      isActive: true
    };

    this.roleService.createRole(duplicatedRole).subscribe({
      next: () => {
        this.snackBar.open('Rol başarıyla kopyalandı', 'Tamam', { duration: 3000 });
        this.loadRoles();
      },
      error: (error) => {
        console.error('Error duplicating role:', error);
        this.snackBar.open('Rol kopyalanırken hata oluştu', 'Tamam', { duration: 3000 });
      }
    });
  }

  trackByFn(index: number, item: any): any {
    return item.id || index;
  }
}