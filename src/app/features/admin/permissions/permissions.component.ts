import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DataGridComponent, DataGridColumn, DataGridAction, DataGridConfig } from '../../../shared/components/data-grid';
import { PermissionService } from '../../../core/services/permission.service';
import { Permission, CreatePermissionRequest, UpdatePermissionRequest } from '../../../core/models/user-management.models';

@Component({
  selector: 'app-permissions',
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
    MatChipsModule,
    MatDividerModule,
    ReactiveFormsModule
  ],
  templateUrl: './permissions.component.html',
  styleUrls: ['./permissions.component.css']
})
export class PermissionsComponent implements OnInit {
  private permissionService = inject(PermissionService);
  private snackBar = inject(MatSnackBar);
  private fb = inject(FormBuilder);

  permissions = signal<Permission[]>([]);
  filteredPermissions = signal<Permission[]>([]);
  categories = signal<string[]>([]);
  selectedCategory = signal<string>('');
  loading = signal(true);
  saving = signal(false);
  initializing = signal(false);
  showPermissionDialog = signal(false);
  editingPermission = signal<Permission | null>(null);


  // AG Grid Configuration
  gridColumns: DataGridColumn[] = [
    {
      field: 'name',
      headerName: 'İzin Adı',
      flex: 1,
      minWidth: 200,
      cellClass: 'cell-bold'
    },
    {
      field: 'description',
      headerName: 'Açıklama',
      flex: 2,
      minWidth: 250,
      valueGetter: (params: any) => params.data.description || 'Açıklama yok'
    },
    {
      field: 'category',
      headerName: 'Kategori',
      flex: 1,
      minWidth: 150,
      cellRenderer: (params: any) => {
        return `<span class="category-chip">${params.value}</span>`;
      }
    }
  ];

  gridActions: DataGridAction[] = [
    {
      icon: 'edit',
      tooltip: 'Düzenle',
      color: 'primary',
      click: (row: Permission) => this.editPermission(row)
    },
    {
      icon: 'delete',
      tooltip: 'Sil',
      color: 'warn',
      click: (row: Permission) => this.deletePermission(row)
    }
  ];

  gridConfig: DataGridConfig = {
    enableSorting: true,
    enableFiltering: true,
    enablePagination: true,
    paginationPageSize: 25,
    paginationPageSizeSelector: [10, 25, 50, 100],
    enableSelection: true,
    selectionMode: 'single',
    enableContextMenu: true,
    enableColumnResize: true,
    rowHeight: 56,
    headerHeight: 48,
    animateRows: true,
    suppressCellFocus: true,
    defaultColDef: {
      sortable: true,
      filter: true,
      resizable: true,
      minWidth: 100
    }
  };

  permissionForm: FormGroup = this.fb.group({
    name: ['', [Validators.required]],
    description: ['', [Validators.required]],
    category: ['', [Validators.required]],
    newCategory: ['']
  });

  ngOnInit(): void {
    this.loadPermissions();
    this.setupFormValidation();
  }

  setupFormValidation(): void {
    this.permissionForm.get('category')?.valueChanges.subscribe(value => {
      const newCategoryControl = this.permissionForm.get('newCategory');
      if (value === '__new__') {
        newCategoryControl?.setValidators([Validators.required]);
      } else {
        newCategoryControl?.clearValidators();
      }
      newCategoryControl?.updateValueAndValidity();
    });
  }

  loadPermissions(): void {
    this.loading.set(true);
    this.permissionService.getAllPermissions().subscribe({
      next: (permissions) => {
        this.permissions.set(permissions || []);
        this.filteredPermissions.set(permissions || []);
        const categories = [...new Set((permissions || []).map(p => p.category))].sort();
        this.categories.set(categories);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading permissions:', error);
        this.permissions.set([]);
        this.filteredPermissions.set([]);
        this.categories.set([]);
        this.snackBar.open('Failed to load permissions', 'Close', { duration: 3000 });
        this.loading.set(false);
      }
    });
  }

  filterByCategory(category: string): void {
    this.selectedCategory.set(category);
    if (category) {
      const filtered = this.permissions().filter(p => p.category === category);
      this.filteredPermissions.set(filtered);
    } else {
      this.filteredPermissions.set(this.permissions());
    }
  }

  getCategoryCount(category: string): number {
    return (this.permissions() || []).filter(p => p.category === category).length;
  }

  initializeDefaultPermissions(): void {
    if (confirm('This will create default system permissions. Continue?')) {
      this.initializing.set(true);
      this.permissionService.initializeDefaultPermissions().subscribe({
        next: (response) => {
          this.snackBar.open(response.message, 'Close', { duration: 3000 });
          this.loadPermissions();
          this.initializing.set(false);
        },
        error: (error) => {
          console.error('Error initializing permissions:', error);
          this.snackBar.open('Failed to initialize permissions', 'Close', { duration: 3000 });
          this.initializing.set(false);
        }
      });
    }
  }

  openCreatePermissionDialog(): void {
    this.editingPermission.set(null);
    this.permissionForm.reset();
    this.showPermissionDialog.set(true);
  }

  editPermission(permission: Permission): void {
    this.editingPermission.set(permission);
    this.permissionForm.patchValue({
      name: permission.name,
      description: permission.description,
      category: permission.category
    });
    this.showPermissionDialog.set(true);
  }

  closePermissionDialog(): void {
    this.showPermissionDialog.set(false);
    this.editingPermission.set(null);
    this.permissionForm.reset();
  }

  savePermission(): void {
    if (this.permissionForm.invalid) return;

    this.saving.set(true);
    const formValue = this.permissionForm.value;

    const request: CreatePermissionRequest | UpdatePermissionRequest = {
      name: formValue.name,
      description: formValue.description,
      category: formValue.category === '__new__' ? formValue.newCategory : formValue.category
    };

    const operation = this.editingPermission()
      ? this.permissionService.updatePermission(this.editingPermission()!.id, request as UpdatePermissionRequest)
      : this.permissionService.createPermission(request as CreatePermissionRequest);

    operation.subscribe({
      next: () => {
        const message = this.editingPermission() ? 'Permission updated successfully' : 'Permission created successfully';
        this.snackBar.open(message, 'Close', { duration: 3000 });
        this.closePermissionDialog();
        this.loadPermissions();
        this.saving.set(false);
      },
      error: (error) => {
        console.error('Error saving permission:', error);
        this.snackBar.open('Failed to save permission', 'Close', { duration: 3000 });
        this.saving.set(false);
      }
    });
  }

  deletePermission(permission: Permission): void {
    if (confirm(`Are you sure you want to delete the permission "${permission.name}"?`)) {
      this.permissionService.deletePermission(permission.id).subscribe({
        next: () => {
          this.snackBar.open('Permission deleted successfully', 'Close', { duration: 3000 });
          this.loadPermissions();
        },
        error: (error) => {
          console.error('Error deleting permission:', error);
          this.snackBar.open('Failed to delete permission', 'Close', { duration: 3000 });
        }
      });
    }
  }


  viewPermissionDetails(permission: Permission): void {
    console.log('View permission details:', permission);
    this.snackBar.open('İzin detayları özelliği yakında eklenecek', 'Close', { duration: 3000 });
  }

  viewPermissionByCategory(category: string): void {
    if (category) {
      this.filterByCategory(category);
      this.snackBar.open(`"${category}" kategorisi filtrelenmiştir`, 'Close', { duration: 2000 });
    }
  }

  viewRolesWithPermission(permission: Permission): void {
    console.log('View roles with permission:', permission);
    this.snackBar.open('Bu izne sahip rolleri görüntüleme özelliği yakında eklenecek', 'Close', { duration: 3000 });
  }

  duplicatePermission(permission: Permission): void {
    const duplicatedPermission = {
      name: `${permission.name}_copy`,
      description: `${permission.description} (Kopya)`,
      category: permission.category
    };

    this.permissionService.createPermission(duplicatedPermission).subscribe({
      next: () => {
        this.snackBar.open('İzin başarıyla kopyalandı', 'Close', { duration: 3000 });
        this.loadPermissions();
      },
      error: (error) => {
        console.error('Error duplicating permission:', error);
        this.snackBar.open('İzin kopyalanırken hata oluştu', 'Close', { duration: 3000 });
      }
    });
  }

  trackByFn(index: number, item: any): any {
    return item.id || index;
  }
}
