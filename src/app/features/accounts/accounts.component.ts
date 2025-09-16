import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';

import { DataTableComponent, TableColumn, TableAction } from '../../shared/components/data-table/data-table.component';
import { AccountService } from '../../core/services/account.service';
import { ErrorHandlerService } from '../../core/services/error-handler.service';
import { Account, AccountStatus } from '../../core/models/crm.models';
import {
  AccountFilter,
  AccountCreateDto,
  AccountUpdateDto,
  PaginatedResponse
} from '../../core/models/api-response.models';

@Component({
  selector: 'app-accounts',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDialogModule,
    MatSnackBarModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatChipsModule,
    MatMenuModule,
    MatTooltipModule,
    DataTableComponent
  ],
  template: `
    <div class="accounts-container">
      <!-- Page Header -->
      <div class="page-header">
        <div class="header-content">
          <div class="title-section">
            <h1 class="page-title">
              <mat-icon>business</mat-icon>
              Accounts
            </h1>
            <p class="page-subtitle">
              Manage your customer accounts and business relationships
            </p>
          </div>

          <div class="header-actions">
            <button mat-button
                    [matMenuTriggerFor]="filterMenu"
                    class="filter-button">
              <mat-icon>filter_list</mat-icon>
              Filters
            </button>

            <button mat-button
                    [matMenuTriggerFor]="exportMenu"
                    class="export-button">
              <mat-icon>download</mat-icon>
              Export
            </button>

            <button mat-raised-button
                    color="primary"
                    (click)="openCreateAccountDialog()"
                    class="create-button">
              <mat-icon>add</mat-icon>
              New Account
            </button>
          </div>
        </div>
      </div>

      <!-- Data Table -->
      <mat-card class="table-card">
        <app-data-table
          [data]="accounts()"
          [columns]="tableColumns"
          [actions]="tableActions"
          [bulkActions]="bulkActions"
          [loading]="loading()"
          [pagination]="true"
          [pageSize]="filter().pageSize || 25"
          [totalCount]="totalCount()"
          [pageIndex]="(filter().pageNumber || 1) - 1"
          [selectable]="true"
          [globalSearch]="true"
          [showColumnFilters]="false"
          [emptyStateIcon]="'business'"
          [emptyStateTitle]="'No accounts found'"
          [emptyStateMessage]="'Create your first account to start managing customer relationships'"
          (sortChange)="onSort($event)"
          (pageChange)="onPageChange($event)"
          (filterChange)="onFilterChange($event)"
          (actionClick)="onAction($event)"
          (bulkActionClick)="onBulkAction($event)"
          (rowClick)="onRowClick($event)">

          <div slot="empty-actions">
            <button mat-raised-button
                    color="primary"
                    (click)="openCreateAccountDialog()">
              <mat-icon>add</mat-icon>
              Create Account
            </button>
          </div>
        </app-data-table>
      </mat-card>
    </div>

    <!-- Filter Menu -->
    <mat-menu #filterMenu="matMenu" class="filter-menu">
      <div class="menu-content" (click)="$event.stopPropagation()">
        <h4>Filter Accounts</h4>

        <mat-form-field appearance="outline" class="filter-field">
          <mat-label>Status</mat-label>
          <mat-select [(ngModel)]="filter().status" (selectionChange)="applyFilters()">
            <mat-option value="">All Statuses</mat-option>
            <mat-option value="Active">Active</mat-option>
            <mat-option value="Inactive">Inactive</mat-option>
            <mat-option value="Potential">Potential</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="filter-field">
          <mat-label>Industry</mat-label>
          <mat-select [(ngModel)]="filter().industry" (selectionChange)="applyFilters()">
            <mat-option value="">All Industries</mat-option>
            <mat-option value="Technology">Technology</mat-option>
            <mat-option value="Healthcare">Healthcare</mat-option>
            <mat-option value="Finance">Finance</mat-option>
            <mat-option value="Manufacturing">Manufacturing</mat-option>
            <mat-option value="Retail">Retail</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="filter-field">
          <mat-label>Customer Type</mat-label>
          <mat-select [(ngModel)]="filter().customerType" (selectionChange)="applyFilters()">
            <mat-option value="">All Types</mat-option>
            <mat-option value="Enterprise">Enterprise</mat-option>
            <mat-option value="SMB">Small/Medium Business</mat-option>
            <mat-option value="Startup">Startup</mat-option>
          </mat-select>
        </mat-form-field>

        <div class="filter-actions">
          <button mat-button (click)="clearFilters()">Clear</button>
          <button mat-button color="primary" (click)="applyFilters()">Apply</button>
        </div>
      </div>
    </mat-menu>

    <!-- Export Menu -->
    <mat-menu #exportMenu="matMenu">
      <button mat-menu-item (click)="exportAccounts('excel')">
        <mat-icon>table_chart</mat-icon>
        <span>Export to Excel</span>
      </button>
      <button mat-menu-item (click)="exportAccounts('csv')">
        <mat-icon>description</mat-icon>
        <span>Export to CSV</span>
      </button>
    </mat-menu>

    <!-- Create/Edit Account Dialog -->
    @if (showAccountDialog()) {
      <div class="dialog-overlay" (click)="closeAccountDialog()">
        <div class="dialog-container" (click)="$event.stopPropagation()">
          <div class="dialog-header">
            <h2>{{ editingAccount() ? 'Edit Account' : 'Create New Account' }}</h2>
            <button mat-icon-button (click)="closeAccountDialog()">
              <mat-icon>close</mat-icon>
            </button>
          </div>

          <form [formGroup]="accountForm" (ngSubmit)="saveAccount()" class="dialog-form">
            <div class="form-row">
              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Account Name *</mat-label>
                <input matInput formControlName="name" placeholder="Enter account name">
                <mat-error *ngIf="accountForm.get('name')?.hasError('required')">
                  Account name is required
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Legal Name</mat-label>
                <input matInput formControlName="legalName" placeholder="Enter legal name">
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Customer Code</mat-label>
                <input matInput formControlName="customerCode" placeholder="Enter customer code">
              </mat-form-field>

              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Status</mat-label>
                <mat-select formControlName="status">
                  <mat-option value="Active">Active</mat-option>
                  <mat-option value="Inactive">Inactive</mat-option>
                  <mat-option value="Potential">Potential</mat-option>
                </mat-select>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Industry</mat-label>
                <mat-select formControlName="industry">
                  <mat-option value="Technology">Technology</mat-option>
                  <mat-option value="Healthcare">Healthcare</mat-option>
                  <mat-option value="Finance">Finance</mat-option>
                  <mat-option value="Manufacturing">Manufacturing</mat-option>
                  <mat-option value="Retail">Retail</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Customer Type</mat-label>
                <mat-select formControlName="customerType">
                  <mat-option value="Enterprise">Enterprise</mat-option>
                  <mat-option value="SMB">Small/Medium Business</mat-option>
                  <mat-option value="Startup">Startup</mat-option>
                </mat-select>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Main Email</mat-label>
                <input matInput type="email" formControlName="mainEmail" placeholder="Enter main email">
              </mat-form-field>

              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Main Phone</mat-label>
                <input matInput formControlName="mainPhone" placeholder="Enter main phone">
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Website</mat-label>
                <input matInput formControlName="website" placeholder="Enter website URL">
              </mat-form-field>

              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Currency</mat-label>
                <mat-select formControlName="currency">
                  <mat-option value="TRY">Turkish Lira (TRY)</mat-option>
                  <mat-option value="USD">US Dollar (USD)</mat-option>
                  <mat-option value="EUR">Euro (EUR)</mat-option>
                </mat-select>
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Description</mat-label>
              <textarea matInput
                        formControlName="description"
                        placeholder="Enter account description"
                        rows="3"></textarea>
            </mat-form-field>

            <div class="dialog-actions">
              <button type="button"
                      mat-button
                      (click)="closeAccountDialog()">
                Cancel
              </button>
              <button type="submit"
                      mat-raised-button
                      color="primary"
                      [disabled]="accountForm.invalid || saving()">
                @if (saving()) {
                  <mat-icon class="loading-icon">refresh</mat-icon>
                } @else {
                  <mat-icon>{{ editingAccount() ? 'save' : 'add' }}</mat-icon>
                }
                {{ editingAccount() ? 'Update' : 'Create' }} Account
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
  styles: [`
    .accounts-container {
      padding: 24px;
      max-width: 1400px;
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

    .filter-button, .export-button {
      border: 1px solid #e2e8f0;
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

    /* Filter Menu Styles */
    .filter-menu {
      margin-top: 8px;
    }

    .menu-content {
      padding: 16px;
      min-width: 300px;
    }

    .menu-content h4 {
      margin: 0 0 16px 0;
      font-weight: 600;
      color: #374151;
    }

    .filter-field {
      width: 100%;
      margin-bottom: 12px;
    }

    .filter-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      margin-top: 16px;
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
      max-width: 800px;
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

    .form-row {
      display: flex;
      gap: 16px;
    }

    .half-width {
      flex: 1;
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

    .loading-icon {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    /* Responsive */
    @media (max-width: 768px) {
      .accounts-container {
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

      .form-row {
        flex-direction: column;
      }

      .dialog-overlay {
        padding: 16px;
      }

      .dialog-container {
        max-width: 100%;
      }
    }
  `]
})
export class AccountsComponent implements OnInit {
  private accountService = inject(AccountService);
  private errorHandler = inject(ErrorHandlerService);
  private snackBar = inject(MatSnackBar);
  private fb = inject(FormBuilder);

  // State
  accounts = signal<Account[]>([]);
  loading = signal(true);
  saving = signal(false);
  totalCount = signal(0);
  showAccountDialog = signal(false);
  editingAccount = signal<Account | null>(null);

  // Filter
  filter = signal<AccountFilter>({
    pageNumber: 1,
    pageSize: 25,
    search: '',
    sortBy: 'name',
    sortDirection: 'ASC'
  });

  // Table Configuration
  tableColumns: TableColumn[] = [
    {
      key: 'name',
      header: 'Account Name',
      sortable: true,
      width: '200px'
    },
    {
      key: 'customerCode',
      header: 'Customer Code',
      sortable: true,
      width: '120px'
    },
    {
      key: 'industry',
      header: 'Industry',
      sortable: true,
      width: '140px'
    },
    {
      key: 'status',
      header: 'Status',
      type: 'chip',
      sortable: true,
      width: '100px',
      chipColors: {
        'Active': '#10b981',
        'Inactive': '#6b7280',
        'Potential': '#f59e0b'
      }
    },
    {
      key: 'mainEmail',
      header: 'Email',
      width: '180px'
    },
    {
      key: 'mainPhone',
      header: 'Phone',
      width: '140px'
    },
    {
      key: 'createdDate',
      header: 'Created',
      type: 'date',
      sortable: true,
      width: '120px'
    }
  ];

  tableActions: TableAction[] = [
    {
      key: 'view',
      label: 'View Details',
      icon: 'visibility',
      color: 'primary'
    },
    {
      key: 'edit',
      label: 'Edit Account',
      icon: 'edit'
    },
    {
      key: 'delete',
      label: 'Delete Account',
      icon: 'delete',
      color: 'warn'
    }
  ];

  bulkActions: TableAction[] = [
    {
      key: 'bulk-edit',
      label: 'Bulk Edit',
      icon: 'edit'
    },
    {
      key: 'bulk-delete',
      label: 'Delete Selected',
      icon: 'delete'
    },
    {
      key: 'export-selected',
      label: 'Export Selected',
      icon: 'download'
    }
  ];

  // Form
  accountForm = this.fb.group({
    name: ['', [Validators.required]],
    legalName: [''],
    customerCode: [''],
    status: ['Active'],
    industry: [''],
    customerType: [''],
    mainEmail: ['', [Validators.email]],
    mainPhone: [''],
    website: [''],
    currency: ['TRY'],
    description: ['']
  });

  ngOnInit(): void {
    this.loadAccounts();
  }

  loadAccounts(): void {
    this.loading.set(true);
    this.accountService.getAccounts(this.filter()).subscribe({
      next: (response: PaginatedResponse<Account>) => {
        this.accounts.set(response.items);
        this.totalCount.set(response.totalCount);
        this.loading.set(false);
      },
      error: (error) => {
        this.errorHandler.handleError(error, 'Loading accounts');
        this.loading.set(false);
      }
    });
  }

  onSort(sort: any): void {
    this.filter.update(f => ({
      ...f,
      sortBy: sort.active,
      sortDirection: sort.direction?.toUpperCase() || 'ASC'
    }));
    this.loadAccounts();
  }

  onPageChange(page: any): void {
    this.filter.update(f => ({
      ...f,
      pageNumber: page.pageIndex + 1,
      pageSize: page.pageSize
    }));
    this.loadAccounts();
  }

  onFilterChange(filters: any): void {
    this.filter.update(f => ({
      ...f,
      search: filters.globalSearch || '',
      pageNumber: 1
    }));
    this.loadAccounts();
  }

  onAction(event: { action: string; row: Account }): void {
    switch (event.action) {
      case 'view':
        this.viewAccount(event.row);
        break;
      case 'edit':
        this.editAccount(event.row);
        break;
      case 'delete':
        this.deleteAccount(event.row);
        break;
    }
  }

  onBulkAction(event: { action: string; rows: Account[] }): void {
    console.log('Bulk action:', event.action, event.rows);
    // Implement bulk actions
  }

  onRowClick(account: Account): void {
    this.viewAccount(account);
  }

  // Dialog Management
  openCreateAccountDialog(): void {
    this.editingAccount.set(null);
    this.accountForm.reset({ status: 'Active', currency: 'TRY' });
    this.showAccountDialog.set(true);
  }

  editAccount(account: Account): void {
    this.editingAccount.set(account);
    this.accountForm.patchValue(account);
    this.showAccountDialog.set(true);
  }

  closeAccountDialog(): void {
    this.showAccountDialog.set(false);
    this.editingAccount.set(null);
    this.accountForm.reset();
  }

  saveAccount(): void {
    if (this.accountForm.invalid) return;

    this.saving.set(true);
    const formValue = this.accountForm.value as AccountCreateDto;

    const operation = this.editingAccount()
      ? this.accountService.updateAccount(this.editingAccount()!.id, formValue as AccountUpdateDto)
      : this.accountService.createAccount(formValue);

    operation.subscribe({
      next: () => {
        const message = this.editingAccount() ? 'Account updated successfully' : 'Account created successfully';
        this.snackBar.open(message, 'Close', { duration: 3000 });
        this.closeAccountDialog();
        this.loadAccounts();
        this.saving.set(false);
      },
      error: (error) => {
        console.error('Error saving account:', error);
        this.snackBar.open('Failed to save account', 'Close', { duration: 3000 });
        this.saving.set(false);
      }
    });
  }

  viewAccount(account: Account): void {
    // Navigate to account detail page
    console.log('View account:', account);
  }

  deleteAccount(account: Account): void {
    if (confirm(`Are you sure you want to delete "${account.name}"?`)) {
      this.accountService.deleteAccount(account.id).subscribe({
        next: () => {
          this.snackBar.open('Account deleted successfully', 'Close', { duration: 3000 });
          this.loadAccounts();
        },
        error: (error) => {
          console.error('Error deleting account:', error);
          this.snackBar.open('Failed to delete account', 'Close', { duration: 3000 });
        }
      });
    }
  }

  // Filter Management
  applyFilters(): void {
    this.filter.update(f => ({ ...f, pageNumber: 1 }));
    this.loadAccounts();
  }

  clearFilters(): void {
    this.filter.update(f => ({
      pageNumber: 1,
      pageSize: 25,
      search: '',
      sortBy: 'name',
      sortDirection: 'ASC' as const,
      status: undefined,
      industry: undefined,
      customerType: undefined
    }));
    this.loadAccounts();
  }

  exportAccounts(format: 'excel' | 'csv'): void {
    this.accountService.exportAccounts(this.filter()).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `accounts.${format === 'excel' ? 'xlsx' : 'csv'}`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Error exporting accounts:', error);
        this.snackBar.open('Failed to export accounts', 'Close', { duration: 3000 });
      }
    });
  }
}