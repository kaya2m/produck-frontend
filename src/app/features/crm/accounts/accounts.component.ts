import { Component, OnInit, inject, signal, computed, DestroyRef } from '@angular/core';
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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatTabsModule } from '@angular/material/tabs';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { DataGridComponent, DataGridColumn, DataGridAction, DataGridConfig, CellRendererHelpers } from '../../../shared/components/data-grid';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AccountService } from '../../../core/services/account.service';
import { UserManagementService } from '../../../core/services/user-management.service';
import { ConfigurationService, LookupOption } from '../../../core/services/configuration.service';
import {
  AccountSummary,
  Account,
  CreateAccountRequest,
  UpdateAccountRequest,
  UpdateAccountStatusRequest,
  AccountsListParams
} from '../../../core/models/account.models';
import { PaginatedResponse } from '../../../core/models/auth.models';

@Component({
  selector: 'app-accounts',
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
    MatProgressSpinnerModule,
    MatDividerModule,
    MatTabsModule,
    MatAutocompleteModule,
    ReactiveFormsModule
  ],
  templateUrl: './accounts.component.html',
  styleUrls: ['./accounts.component.css']
})
export class AccountsComponent implements OnInit {
  private accountService = inject(AccountService);
  private userService = inject(UserManagementService);
  private configService = inject(ConfigurationService);
  private snackBar = inject(MatSnackBar);
  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);

  accounts = signal<AccountSummary[]>([]);
  loading = signal(true);
  saving = signal(false);
  showAccountDialog = signal(false);
  editingAccount = signal<Account | null>(null);

  // Pagination - Updated for new standards
  totalCount = signal(0);
  pageNumber = signal(1);
  pageSize = signal(15); // Standard: İlk yükleme 15 satır

  // Filters
  searchTerm = signal('');
  selectedStatus = signal('');
  selectedIndustry = signal('');

  // AG Grid Configuration - Updated for separated columns
  gridColumns: DataGridColumn[] = [
    {
      field: 'name',
      headerName: 'Hesap Adı',
      width: 200,
      cellRenderer: (params: any) => {
        const data = params.data;
        return `<div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 32px; height: 32px; border-radius: 50%; background: #1976d2; color: white; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600;">${(data.name || '').substring(0, 2).toUpperCase()}</div>
          <div style="font-weight: 500; color: #1f2937;">${data.name || ''}</div>
        </div>`;
      }
    },
    {
      field: 'customerCode',
      headerName: 'Müşteri Kodu',
      width: 120,
      filter: 'agTextColumnFilter'
    },
    {
      field: 'mainEmail',
      headerName: 'E-posta',
      width: 180,
      cellRenderer: (params: any) => {
        const email = params.data.mainEmail;
        if (!email) return '-';
        return `<a href="mailto:${email}" style="color: #3b82f6; text-decoration: none;">${email}</a>`;
      },
      filter: 'agTextColumnFilter'
    },
    {
      field: 'mainPhone',
      headerName: 'Telefon',
      width: 140,
      cellRenderer: (params: any) => {
        const phone = params.data.mainPhone;
        if (!phone) return '-';
        return this.formatPhone(phone);
      },
      filter: 'agTextColumnFilter'
    },
    {
      field: 'industry',
      headerName: 'Sektör',
      width: 120,
      cellRenderer: (params: any) => {
        const industry = params.data.industry;
        return industry || 'Belirtilmemiş';
      },
      filter: 'agTextColumnFilter'
    },
    {
      field: 'ownerUserName',
      headerName: 'Sorumlu',
      width: 140,
      cellRenderer: (params: any) => {
        const owner = params.data.ownerUserName;
        if (!owner) {
          return `<span style="color: #ef4444; font-style: italic;">Atanmamış</span>`;
        }
        return `
          <div style="display: flex; align-items: center; gap: 6px;">
            <div style="width: 24px; height: 24px; border-radius: 50%; background: #3b82f6; color: white; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 600;">
              ${owner.charAt(0).toUpperCase()}
            </div>
            <span style="color: #1e293b; font-weight: 500;">${owner}</span>
          </div>
        `;
      },
      filter: 'agTextColumnFilter'
    },
    {
      field: 'createdDate',
      headerName: 'Oluşturma Tarihi',
      width: 140,
      cellRenderer: (params: any) => {
        const date = new Date(params.data.createdDate);
        return date.toLocaleDateString('tr-TR');
      },
      filter: 'agDateColumnFilter'
    },
    {
      field: 'status',
      headerName: 'Durum',
      width: 100,
      cellRenderer: (params: any) => {
        const status = params.value;
        const colors = {
          'Active': '#10b981',
          'Inactive': '#6b7280',
          'Potential': '#f59e0b'
        };
        const color = colors[status as keyof typeof colors] || '#6b7280';
        return `<span style="background: ${color}; color: white; padding: 4px 8px; border-radius: 12px; font-size: 11px; font-weight: 500;">${status}</span>`;
      },
      filter: 'agTextColumnFilter'
    }
  ];

  // Context Menu Actions - Updated for new color standards
  gridActions: DataGridAction[] = [
    // Görüntüleme grup - Default renk
    {
      icon: 'visibility',
      tooltip: 'Detayları Görüntüle',
      color: undefined, // Default gri renk
      click: (row: AccountSummary) => this.viewAccountDetails(row)
    },
    // Düzenleme grup - Primary ve Accent
    {
      icon: 'edit',
      tooltip: 'Düzenle',
      color: 'primary',
      click: (row: AccountSummary) => this.editAccount(row)
    },
    {
      icon: 'content_copy',
      tooltip: 'Hesap Kopyala',
      color: 'accent',
      click: (row: AccountSummary) => this.duplicateAccount(row)
    },
    {
      icon: 'person_add',
      tooltip: 'Kişi Ekle',
      color: 'accent',
      click: (row: AccountSummary) => this.addContact(row)
    },
    {
      icon: 'business_center',
      tooltip: 'Fırsat Oluştur',
      color: 'accent',
      click: (row: AccountSummary) => this.createOpportunity(row)
    },
    {
      icon: 'mail',
      tooltip: 'E-posta Gönder',
      color: 'accent',
      visible: (row: AccountSummary) => !!row.mainEmail,
      click: (row: AccountSummary) => this.sendEmail(row)
    },
    {
      icon: 'phone',
      tooltip: 'Ara',
      color: 'accent',
      visible: (row: AccountSummary) => !!row.mainPhone,
      click: (row: AccountSummary) => this.makeCall(row)
    },
    // Tehlikeli işlemler - Warn renk, en altta
    {
      icon: 'delete',
      tooltip: 'Hesap Sil',
      color: 'warn',
      click: (row: AccountSummary) => this.deleteAccount(row)
    }
  ];

  // Grid Configuration - Updated for new standards
  gridConfig: DataGridConfig = {
    // Core Features
    enableSorting: true,
    enableFiltering: true,
    enablePagination: true,
    paginationPageSize: 15, // Standard: İlk yükleme 15 satır
    paginationPageSizeSelector: [15, 30, 50, 100],

    // Selection
    enableSelection: false, // Standard: Context menu kullanılacak
    selectionMode: 'single',
    enableRowClickSelection: false,
    enableHeaderCheckboxSelection: false,
    enableContextMenu: true, // Context menu aktif

    // Layout & Appearance
    enableColumnResize: true,
    enableColumnReorder: true,
    enableAutoSizeColumns: false, // Standard: Manuel kontrol
    rowHeight: 60, // Standard: 15 satır * 60px = 900px optimal
    headerHeight: 48,
    animateRows: true,

    // Advanced Features
    enableCellSelection: false, // Enterprise feature
    enableRowGrouping: false, // Enterprise feature
    enableSideBar: false, // Enterprise feature
    suppressCellFocus: false,
    suppressMenuHide: false,
    suppressRowHoverHighlight: false,

    // Performance
    suppressColumnVirtualisation: false,
    suppressRowVirtualisation: false,

    // Export
    enableExport: true,

    // Default Column Definition
    defaultColDef: {
      sortable: true,
      filter: true,
      resizable: true,
      minWidth: 120,
      flex: 1,
      filterParams: {
        buttons: ['reset', 'apply'],
        closeOnApply: true,
        debounceMs: 300
      },
      cellClass: 'cell-wrap-text',
      autoHeight: false,
      wrapText: false,
      cellStyle: {
        display: 'flex',
        alignItems: 'center',
        lineHeight: '1.5'
      }
    },

    // Sidebar Configuration (Enterprise feature disabled)
    sideBar: false
  };

  // Dropdown data from configuration service
  customerTypes = this.configService.customerTypes;
  accountStatuses = this.configService.accountStatuses;
  currencies = this.configService.currencies;
  paymentTerms = this.configService.paymentTerms;
  industries = this.configService.industries;

  // Dropdown data
  users = signal<{id: string, name: string}[]>([]);
  parentAccounts = signal<{id: string, name: string}[]>([]);

  // Autocomplete filtering
  userSearchTerm = signal('');
  parentAccountSearchTerm = signal('');

  filteredUsers = computed(() => {
    const searchTerm = this.userSearchTerm().toLowerCase();
    if (!searchTerm) return this.users();
    return this.users().filter(user =>
      user.name.toLowerCase().includes(searchTerm)
    );
  });

  filteredParentAccounts = computed(() => {
    const searchTerm = this.parentAccountSearchTerm().toLowerCase();
    if (!searchTerm) return this.parentAccounts();
    return this.parentAccounts().filter(account =>
      account.name.toLowerCase().includes(searchTerm)
    );
  });

  filterForm: FormGroup = this.fb.group({
    search: [''],
    status: [''],
    industry: ['']
  });

  accountForm: FormGroup = this.fb.group({
    name: ['', [Validators.required]],
    legalName: [''],
    customerCode: ['', [Validators.required]],
    taxId: [''],
    taxOffice: [''],
    industry: [''],
    customerType: ['Corporate', [Validators.required]],
    status: ['Active', [Validators.required]],
    mainPhone: [''],
    mainEmail: ['', [Validators.email]],
    website: [''],
    currency: ['TRY'],
    paymentTerms: ['Net 30'],
    description: [''],
    parentAccountId: [''],
    ownerUserId: ['', [Validators.required]]
  });

  ngOnInit(): void {
    this.loadAccounts();
    this.setupFilterSubscriptions();
    this.loadUsers();
    this.loadParentAccounts();
    this.setupAutocompleteSubscriptions();
  }

  setupAutocompleteSubscriptions(): void {
    // User autocomplete
    this.accountForm.get('ownerUserId')?.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(value => {
      if (typeof value === 'string') {
        this.userSearchTerm.set(value);
      }
    });

    // Parent account autocomplete
    this.accountForm.get('parentAccountId')?.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(value => {
      if (typeof value === 'string') {
        this.parentAccountSearchTerm.set(value);
      }
    });
  }

  displayUserFn = (userId: string): string => {
    if (!userId) return '';
    const user = this.users().find(u => u.id === userId);
    return user?.name || '';
  };

  displayAccountFn = (accountId: string): string => {
    if (!accountId) return '';
    const account = this.parentAccounts().find(a => a.id === accountId);
    return account?.name || '';
  };


  setupFilterSubscriptions(): void {
    this.filterForm.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => {
      this.pageNumber.set(1);
      this.loadAccounts();
    });
  }

  loadAccounts(): void {
    this.loading.set(true);

    const params: AccountsListParams = {
      pageNumber: this.pageNumber(),
      pageSize: this.pageSize(),
      search: this.filterForm.get('search')?.value || undefined,
      status: this.filterForm.get('status')?.value || undefined,
      industry: this.filterForm.get('industry')?.value || undefined
    };

    this.accountService.getAllAccounts(params).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (response: PaginatedResponse<AccountSummary>) => {
        this.accounts.set(response.items || []);
        this.totalCount.set(response.totalCount || 0);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading accounts:', error);
        this.accounts.set([]);
        this.totalCount.set(0);
        this.snackBar.open('Failed to load accounts', 'Close', { duration: 3000 });
        this.loading.set(false);
      }
    });
  }

  onPageChange(event: { page: number; pageSize: number }): void {
    this.pageNumber.set(event.page);
    this.pageSize.set(event.pageSize);
    this.loadAccounts();
  }

  openCreateAccountDialog(): void {
    this.editingAccount.set(null);
    this.accountForm.reset({
      customerType: 'Corporate',
      status: 'Active',
      currency: 'TRY',
      paymentTerms: 'Net 30'
    });
    this.showAccountDialog.set(true);
  }

  editAccount(account: AccountSummary): void {
    this.accountService.getAccountById(account.id).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (fullAccount) => {
        this.editingAccount.set(fullAccount);
        this.accountForm.patchValue({
          name: fullAccount.name,
          legalName: fullAccount.legalName,
          customerCode: fullAccount.customerCode,
          taxId: fullAccount.taxId,
          taxOffice: fullAccount.taxOffice,
          industry: fullAccount.industry,
          customerType: fullAccount.customerType,
          status: fullAccount.status,
          mainPhone: fullAccount.mainPhone,
          mainEmail: fullAccount.mainEmail,
          website: fullAccount.website,
          currency: fullAccount.currency,
          paymentTerms: fullAccount.paymentTerms,
          description: fullAccount.description,
          parentAccountId: fullAccount.parentAccountId,
          ownerUserId: fullAccount.ownerUserId
        });
        this.showAccountDialog.set(true);
      },
      error: (error) => {
        console.error('Error loading account details:', error);
        this.snackBar.open('Failed to load account details', 'Close', { duration: 3000 });
      }
    });
  }

  closeAccountDialog(): void {
    this.showAccountDialog.set(false);
    this.editingAccount.set(null);
    this.accountForm.reset();
  }

  saveAccount(): void {
    if (this.accountForm.invalid) return;

    this.saving.set(true);
    const formValue = this.accountForm.value;

    if (this.editingAccount()) {
      const request: UpdateAccountRequest = {
        ...formValue,
        id: this.editingAccount()!.id
      };

      this.accountService.updateAccount(this.editingAccount()!.id, request).pipe(
        takeUntilDestroyed(this.destroyRef)
      ).subscribe({
        next: () => {
          this.snackBar.open('Account updated successfully', 'Close', { duration: 3000 });
          this.closeAccountDialog();
          this.loadAccounts();
          this.saving.set(false);
        },
        error: (error) => {
          console.error('Error updating account:', error);
          this.snackBar.open('Failed to update account', 'Close', { duration: 3000 });
          this.saving.set(false);
        }
      });
    } else {
      const request: CreateAccountRequest = formValue;

      this.accountService.createAccount(request).pipe(
        takeUntilDestroyed(this.destroyRef)
      ).subscribe({
        next: () => {
          this.snackBar.open('Account created successfully', 'Close', { duration: 3000 });
          this.closeAccountDialog();
          this.loadAccounts();
          this.saving.set(false);
        },
        error: (error) => {
          console.error('Error creating account:', error);
          this.snackBar.open('Failed to create account', 'Close', { duration: 3000 });
          this.saving.set(false);
        }
      });
    }
  }

  updateAccountStatus(account: AccountSummary, newStatus: string): void {
    const request: UpdateAccountStatusRequest = { status: newStatus as any };

    this.accountService.updateAccountStatus(account.id, request).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: () => {
        this.snackBar.open('Account status updated successfully', 'Close', { duration: 3000 });
        this.loadAccounts();
      },
      error: (error) => {
        console.error('Error updating account status:', error);
        this.snackBar.open('Failed to update account status', 'Close', { duration: 3000 });
      }
    });
  }

  deleteAccount(account: AccountSummary): void {
    if (confirm(`Are you sure you want to delete the account "${account.name}"?`)) {
      this.accountService.deleteAccount(account.id).pipe(
        takeUntilDestroyed(this.destroyRef)
      ).subscribe({
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

  getStatusChipClass(status: string): string {
    switch (status) {
      case 'Active': return 'status-active';
      case 'Inactive': return 'status-inactive';
      case 'Potential': return 'status-potential';
      default: return '';
    }
  }

  getCustomerTypeLabel(type: string): string {
    return this.customerTypes().find(t => t.value === type)?.label || type;
  }

  getStatusLabel(status: string): string {
    return this.accountStatuses().find(s => s.value === status)?.label || status;
  }

  exportToExcel(): void {
    // Simple CSV export for now
    const csvData = this.accounts().map(account => ({
      'Hesap Adı': account.name,
      'Kod': account.customerCode,
      'Tür': this.getCustomerTypeLabel(account.customerType),
      'Durum': this.getStatusLabel(account.status),
      'Sektör': account.industry || 'Belirtilmemiş',
      'E-posta': account.mainEmail || '',
      'Sorumlu': account.ownerUserName || 'Atanmamış',
      'Oluşturma Tarihi': new Date(account.createdDate).toLocaleDateString('tr-TR')
    }));

    const csvContent = this.convertToCSV(csvData);
    this.downloadCSV(csvContent, 'hesaplar.csv');
  }

  private convertToCSV(data: any[]): string {
    if (!data.length) return '';

    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map(row =>
        headers.map(header => {
          const value = row[header]?.toString() || '';
          return `"${value.replace(/"/g, '""')}"`;
        }).join(',')
      )
    ];

    return csvRows.join('\n');
  }

  private downloadCSV(content: string, filename: string): void {
    const blob = new Blob(['\ufeff' + content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  // New CRM-specific action methods
  viewAccountDetails(account: AccountSummary): void {
    console.log('Viewing account details:', account);
    this.snackBar.open(`${account.name} hesabının detayları görüntüleniyor`, 'Kapat', { duration: 2000 });
    // TODO: Navigate to account detail page
  }

  addContact(account: AccountSummary): void {
    // Navigate to contacts page with account pre-selected
    window.location.href = `/contacts?accountId=${account.id}&action=create`;
  }

  createOpportunity(account: AccountSummary): void {
    console.log('Creating opportunity for account:', account);
    this.snackBar.open(`${account.name} hesabı için yeni fırsat oluşturuluyor`, 'Kapat', { duration: 2000 });
    // TODO: Open create opportunity dialog
  }

  sendEmail(account: AccountSummary): void {
    if (account.mainEmail) {
      window.open(`mailto:${account.mainEmail}?subject=Produck CRM - ${account.name}`, '_blank');
      this.snackBar.open(`${account.mainEmail} adresine e-posta gönderiliyor`, 'Kapat', { duration: 2000 });
    }
  }

  makeCall(account: AccountSummary): void {
    if (account.mainPhone) {
      window.open(`tel:${account.mainPhone}`, '_blank');
      this.snackBar.open(`${account.mainPhone} numarası aranıyor`, 'Kapat', { duration: 2000 });
    }
  }

  duplicateAccount(account: AccountSummary): void {
    console.log('Duplicating account:', account);
    this.snackBar.open(`${account.name} hesabı kopyalanıyor`, 'Kapat', { duration: 2000 });
    // TODO: Implement account duplication logic
  }

  formatPhone(phone: string): string {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `${cleaned.substring(0, 3)} ${cleaned.substring(3, 6)} ${cleaned.substring(6, 8)} ${cleaned.substring(8)}`;
    }
    if (cleaned.length === 11 && cleaned.startsWith('0')) {
      return `${cleaned.substring(0, 4)} ${cleaned.substring(4, 7)} ${cleaned.substring(7, 9)} ${cleaned.substring(9)}`;
    }
    return phone;
  }

  loadUsers(): void {
    this.userService.getUsers().pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (users) => {
        const userOptions = users.map(user => ({
          id: user.id,
          name: user.username || user.email
        }));
        this.users.set(userOptions);
      },
      error: (error) => {
        console.error('Error loading users:', error);
        // Fallback to mock data if API fails
        this.users.set([
          { id: '1', name: 'Muhammet Kullanıcı' },
          { id: '2', name: 'Ali Veli' },
          { id: '3', name: 'Ayşe Fatma' }
        ]);
      }
    });
  }

  loadParentAccounts(): void {
    // Load existing accounts as potential parent accounts
    this.accountService.getAllAccounts().pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (response) => {
        const parentAccountOptions = response.items.map(account => ({
          id: account.id,
          name: account.name
        }));
        this.parentAccounts.set(parentAccountOptions);
      },
      error: (error) => {
        console.error('Error loading parent accounts:', error);
      }
    });
  }

}