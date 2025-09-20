import { Component, OnInit, inject, signal, computed, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
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
import { DataGridComponent, DataGridColumn, DataGridAction, DataGridConfig } from '../../../shared/components/data-grid';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ContactService } from '../../../core/services/contact.service';
import { AccountService } from '../../../core/services/account.service';
import { UserManagementService } from '../../../core/services/user-management.service';
import { ConfigurationService, LookupOption } from '../../../core/services/configuration.service';
import {
  Contact,
  ContactSummary,
  CreateContactRequest,
  UpdateContactRequest,
  UpdateContactStatusRequest,
  ContactsListParams,
  CONTACT_STATUSES,
  SALUTATIONS,
  DEPARTMENTS
} from '../../../core/models/contact.models';
import { PaginatedResponse } from '../../../core/models/auth.models';

@Component({
  selector: 'app-contacts',
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
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.css']
})
export class ContactsComponent implements OnInit {
  private contactService = inject(ContactService);
  private accountService = inject(AccountService);
  private userService = inject(UserManagementService);
  private configService = inject(ConfigurationService);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);
  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);

  contacts = signal<ContactSummary[]>([]);
  loading = signal(true);
  saving = signal(false);
  showContactDialog = signal(false);
  editingContact = signal<Contact | null>(null);

  // Pagination
  totalCount = signal(0);
  pageNumber = signal(1);
  pageSize = signal(15);

  // Filters
  searchTerm = signal('');
  selectedStatus = signal('');
  selectedAccount = signal('');

  // Grid Configuration
  gridColumns: DataGridColumn[] = [
    {
      field: 'fullName',
      headerName: 'İsim',
      width: 200,
      cellRenderer: (params: any) => {
        const contact = params.data;
        return `<div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 32px; height: 32px; border-radius: 50%; background: #1976d2; color: white; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600;">${(contact.firstName || '').charAt(0).toUpperCase()}${(contact.lastName || '').charAt(0).toUpperCase()}</div>
          <div>
            <div style="font-weight: 500; color: #1f2937;">${contact.fullName || ''}</div>
            <div style="font-size: 12px; color: #6b7280;">${contact.title || ''}</div>
          </div>
        </div>`;
      }
    },
    {
      field: 'accountName',
      headerName: 'Hesap',
      width: 180,
      cellRenderer: (params: any) => {
        const accountName = params.data.accountName;
        return `<span style="color: #3b82f6; font-weight: 500;">${accountName || ''}</span>`;
      }
    },
    {
      field: 'businessEmail',
      headerName: 'E-posta',
      width: 200,
      cellRenderer: (params: any) => {
        const email = params.data.businessEmail;
        if (!email) return '-';
        return `<a href="mailto:${email}" style="color: #3b82f6; text-decoration: none;">${email}</a>`;
      }
    },
    {
      field: 'businessPhone',
      headerName: 'Telefon',
      width: 140,
      cellRenderer: (params: any) => {
        const phone = params.data.businessPhone;
        if (!phone) return '-';
        return this.contactService.formatPhone(phone);
      }
    },
    {
      field: 'status',
      headerName: 'Durum',
      width: 120,
      cellRenderer: (params: any) => {
        const status = params.data.status;
        const color = this.contactService.getContactStatusColor(status);
        const label = this.getStatusLabel(status);
        return `<div style="display: flex; align-items: center; gap: 6px;">
          <div style="width: 8px; height: 8px; border-radius: 50%; background: ${color};"></div>
          <span style="color: ${color}; font-weight: 500;">${label}</span>
        </div>`;
      }
    },
    {
      field: 'ownerUserName',
      headerName: 'Sorumlu',
      width: 140,
      cellRenderer: (params: any) => {
        return params.data.ownerUserName || '-';
      }
    },
    {
      field: 'createdDate',
      headerName: 'Oluşturulma',
      width: 130,
      cellRenderer: (params: any) => {
        const date = new Date(params.data.createdDate);
        return date.toLocaleDateString('tr-TR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
      }
    }
  ];

  gridActions: DataGridAction[] = [
    {
      icon: 'edit',
      tooltip: 'Düzenle',
      click: (item: ContactSummary) => this.editContact(item.id)
    },
    {
      icon: 'visibility',
      tooltip: 'Görüntüle',
      click: (item: ContactSummary) => this.viewContact(item.id)
    },
    {
      icon: 'delete',
      tooltip: 'Sil',
      click: (item: ContactSummary) => this.confirmDelete(item.id),
      color: 'warn'
    }
  ];

  gridConfig: DataGridConfig = {
    enableSorting: true,
    enableFiltering: true,
    enableSelection: false,
    enablePagination: true,
    enableContextMenu: true,
    paginationPageSize: this.pageSize(),
    sideBar: false
  };

  // Dropdown data
  contactStatuses = CONTACT_STATUSES;
  salutations = SALUTATIONS;
  departments = DEPARTMENTS;

  // Dynamic dropdown data
  users = signal<{id: string, name: string}[]>([]);
  accounts = signal<{id: string, name: string}[]>([]);
  availableContacts = signal<{id: string, name: string}[]>([]);

  // Autocomplete filtering
  userSearchTerm = signal('');
  accountSearchTerm = signal('');
  reportsToSearchTerm = signal('');

  filteredUsers = computed(() => {
    const searchTerm = this.userSearchTerm().toLowerCase();
    if (!searchTerm) return this.users();
    return this.users().filter(user =>
      user.name.toLowerCase().includes(searchTerm)
    );
  });

  filteredAccounts = computed(() => {
    const searchTerm = this.accountSearchTerm().toLowerCase();
    if (!searchTerm) return this.accounts();
    return this.accounts().filter(account =>
      account.name.toLowerCase().includes(searchTerm)
    );
  });

  filteredReportsToContacts = computed(() => {
    const searchTerm = this.reportsToSearchTerm().toLowerCase();
    if (!searchTerm) return this.availableContacts();
    return this.availableContacts().filter(contact =>
      contact.name.toLowerCase().includes(searchTerm)
    );
  });

  filterForm: FormGroup = this.fb.group({
    search: [''],
    status: [''],
    accountId: ['']
  });

  contactForm: FormGroup = this.fb.group({
    accountId: ['', [Validators.required]],
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    salutation: [''],
    title: [''],
    department: [''],
    businessEmail: ['', [Validators.email]],
    personalEmail: ['', [Validators.email]],
    businessPhone: [''],
    mobilePhone: [''],
    status: ['Active', [Validators.required]],
    description: [''],
    reportsToContactId: [''],
    ownerUserId: ['', [Validators.required]]
  });

  ngOnInit(): void {
    this.loadContacts();
    this.setupFilterSubscriptions();
    this.setupAutocompleteSubscriptions();
    this.loadUsers();
    this.loadAccounts();
    this.handleUrlParameters();
  }

  handleUrlParameters(): void {
    this.route.queryParams.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(params => {
      if (params['accountId']) {
        // Pre-select account in filter
        this.filterForm.patchValue({ accountId: params['accountId'] });

        // If action is create, open dialog with account pre-selected
        if (params['action'] === 'create') {
          setTimeout(() => {
            this.openCreateContactDialog();
            this.contactForm.patchValue({ accountId: params['accountId'] });
            // Load contacts for the selected account for reports-to dropdown
            this.loadContactsForAccount(params['accountId']);
          }, 500); // Small delay to ensure data is loaded
        }
      }
    });
  }

  setupFilterSubscriptions(): void {
    this.filterForm.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => {
      this.pageNumber.set(1);
      this.loadContacts();
    });
  }

  setupAutocompleteSubscriptions(): void {
    // User autocomplete
    this.contactForm.get('ownerUserId')?.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(value => {
      if (typeof value === 'string') {
        this.userSearchTerm.set(value);
      }
    });

    // Account autocomplete
    this.contactForm.get('accountId')?.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(value => {
      if (typeof value === 'string') {
        this.accountSearchTerm.set(value);
        // Load contacts for reports-to dropdown when account changes
        if (value) {
          this.loadContactsForAccount(value);
        }
      }
    });

    // Reports-to autocomplete
    this.contactForm.get('reportsToContactId')?.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(value => {
      if (typeof value === 'string') {
        this.reportsToSearchTerm.set(value);
      }
    });
  }

  loadContacts(): void {
    this.loading.set(true);
    const formValue = this.filterForm.value;

    const params: ContactsListParams = {
      pageNumber: this.pageNumber(),
      pageSize: this.pageSize(),
      search: formValue.search || undefined,
      status: formValue.status || undefined,
      accountId: formValue.accountId || undefined
    };

    this.contactService.getAllContacts(params).subscribe({
      next: (response: PaginatedResponse<ContactSummary>) => {
        this.contacts.set(response.items);
        this.totalCount.set(response.totalCount);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading contacts:', error);
        this.snackBar.open('Kişiler yüklenirken hata oluştu', 'Tamam', { duration: 3000 });
        this.loading.set(false);
      }
    });
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users.set(users.map(user => ({
          id: user.id,
          name: user.username || user.email || user.id
        })));
      },
      error: (error) => {
        console.error('Error loading users:', error);
      }
    });
  }

  loadAccounts(): void {
    this.accountService.getAllAccounts({ pageSize: 1000 }).subscribe({
      next: (response) => {
        this.accounts.set(response.items.map(account => ({
          id: account.id,
          name: account.name
        })));
      },
      error: (error) => {
        console.error('Error loading accounts:', error);
      }
    });
  }

  loadContactsForAccount(accountId: string): void {
    this.contactService.getContactsByAccount(accountId).subscribe({
      next: (contacts) => {
        this.availableContacts.set(contacts.map(contact => ({
          id: contact.id,
          name: contact.fullName
        })));
      },
      error: (error) => {
        console.error('Error loading contacts for account:', error);
      }
    });
  }

  onPageChange(event: { pageNumber: number; pageSize: number }): void {
    this.pageNumber.set(event.pageNumber);
    this.pageSize.set(event.pageSize);
    this.loadContacts();
  }

  openCreateContactDialog(): void {
    this.editingContact.set(null);
    this.contactForm.reset({
      status: 'Active'
    });
    this.showContactDialog.set(true);
  }

  editContact(id: string): void {
    this.contactService.getContactById(id).subscribe({
      next: (contact) => {
        this.editingContact.set(contact);
        this.contactForm.patchValue({
          accountId: contact.accountId,
          firstName: contact.firstName,
          lastName: contact.lastName,
          salutation: contact.salutation,
          title: contact.title,
          department: contact.department,
          businessEmail: contact.businessEmail,
          personalEmail: contact.personalEmail,
          businessPhone: contact.businessPhone,
          mobilePhone: contact.mobilePhone,
          status: contact.status,
          description: contact.description,
          reportsToContactId: contact.reportsToContactId,
          ownerUserId: contact.ownerUserId
        });

        // Load contacts for the selected account
        if (contact.accountId) {
          this.loadContactsForAccount(contact.accountId);
        }

        this.showContactDialog.set(true);
      },
      error: (error) => {
        console.error('Error loading contact:', error);
        this.snackBar.open('Kişi bilgileri yüklenirken hata oluştu', 'Tamam', { duration: 3000 });
      }
    });
  }

  viewContact(id: string): void {
    // For now, same as edit - could be expanded to a read-only view
    this.editContact(id);
  }

  closeContactDialog(): void {
    this.showContactDialog.set(false);
    this.editingContact.set(null);
    this.contactForm.reset();
  }

  saveContact(): void {
    if (this.contactForm.invalid) {
      Object.keys(this.contactForm.controls).forEach(key => {
        const control = this.contactForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
      return;
    }

    this.saving.set(true);
    const formValue = this.contactForm.value;

    if (this.editingContact()) {
      // Update existing contact
      const updateRequest: UpdateContactRequest = {
        id: this.editingContact()!.id,
        ...formValue
      };

      this.contactService.updateContact(this.editingContact()!.id, updateRequest).subscribe({
        next: () => {
          this.snackBar.open('Kişi başarıyla güncellendi', 'Tamam', { duration: 3000 });
          this.closeContactDialog();
          this.loadContacts();
          this.saving.set(false);
        },
        error: (error) => {
          console.error('Error updating contact:', error);
          this.snackBar.open('Kişi güncellenirken hata oluştu', 'Tamam', { duration: 3000 });
          this.saving.set(false);
        }
      });
    } else {
      // Create new contact
      const createRequest: CreateContactRequest = formValue;

      this.contactService.createContact(createRequest).subscribe({
        next: () => {
          this.snackBar.open('Kişi başarıyla oluşturuldu', 'Tamam', { duration: 3000 });
          this.closeContactDialog();
          this.loadContacts();
          this.saving.set(false);
        },
        error: (error) => {
          console.error('Error creating contact:', error);
          this.snackBar.open('Kişi oluşturulurken hata oluştu', 'Tamam', { duration: 3000 });
          this.saving.set(false);
        }
      });
    }
  }

  confirmDelete(id: string): void {
    if (confirm('Bu kişiyi silmek istediğinizden emin misiniz?')) {
      this.contactService.deleteContact(id).subscribe({
        next: () => {
          this.snackBar.open('Kişi başarıyla silindi', 'Tamam', { duration: 3000 });
          this.loadContacts();
        },
        error: (error) => {
          console.error('Error deleting contact:', error);
          this.snackBar.open('Kişi silinirken hata oluştu', 'Tamam', { duration: 3000 });
        }
      });
    }
  }

  getStatusLabel(status: string): string {
    return this.contactStatuses.find(s => s.value === status)?.label || status;
  }

  // Display functions for autocomplete
  displayUserFn = (userId: string): string => {
    if (!userId) return '';
    const user = this.users().find(u => u.id === userId);
    return user?.name || '';
  };

  displayAccountFn = (accountId: string): string => {
    if (!accountId) return '';
    const account = this.accounts().find(a => a.id === accountId);
    return account?.name || '';
  };

  displayContactFn = (contactId: string): string => {
    if (!contactId) return '';
    const contact = this.availableContacts().find(c => c.id === contactId);
    return contact?.name || '';
  };

  exportToExcel(): void {
    // Simple CSV export for now
    const csvData = this.contacts().map(contact => ({
      'İsim': contact.fullName,
      'Hesap': contact.accountName,
      'Unvan': contact.title || '',
      'E-posta': contact.businessEmail || '',
      'Telefon': contact.businessPhone || '',
      'Durum': this.getStatusLabel(contact.status),
      'Sorumlu': contact.ownerUserName,
      'Oluşturulma': new Date(contact.createdDate).toLocaleDateString('tr-TR')
    }));

    const csvContent = this.convertToCSV(csvData);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `contacts-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  }

  private convertToCSV(data: any[]): string {
    if (!data.length) return '';

    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map(row =>
        headers.map(header => {
          const value = row[header] || '';
          return `"${value.toString().replace(/"/g, '""')}"`;
        }).join(',')
      )
    ];

    return csvRows.join('\n');
  }
}