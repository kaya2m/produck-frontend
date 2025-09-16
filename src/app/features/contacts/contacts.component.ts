import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { DataTableComponent, TableColumn, TableAction } from '../../shared/components/data-table/data-table.component';
import { ContactService } from '../../core/services/contact.service';
import { AccountService } from '../../core/services/account.service';
import { Contact, ContactMethod, Account } from '../../core/models/crm.models';
import { ContactFilter, ContactCreateDto, PaginatedResponse } from '../../core/models/api-response.models';

@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatSnackBarModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatChipsModule,
    MatMenuModule,
    MatTooltipModule,
    MatDividerModule,
    MatAutocompleteModule,
    MatCheckboxModule,
    DataTableComponent
  ],
  template: `
    <div class="contacts-container">
      <!-- Page Header -->
      <div class="page-header">
        <div class="header-content">
          <div class="title-section">
            <h1 class="page-title">
              <mat-icon>contacts</mat-icon>
              Contact Management
            </h1>
            <p class="page-subtitle">Manage your customer contacts and relationships</p>
          </div>
          <div class="header-actions">
            <button mat-raised-button color="primary" (click)="openContactDialog()">
              <mat-icon>person_add</mat-icon>
              Add Contact
            </button>
          </div>
        </div>
      </div>

      <!-- Contact Statistics -->
      <div class="stats-grid">
        <mat-card class="stat-card">
          <div class="stat-content">
            <div class="stat-value">{{ totalContactsCount() }}</div>
            <div class="stat-label">Total Contacts</div>
            <mat-icon class="stat-icon">contacts</mat-icon>
          </div>
        </mat-card>

        <mat-card class="stat-card">
          <div class="stat-content">
            <div class="stat-value">{{ activeContactsCount() }}</div>
            <div class="stat-label">Active Contacts</div>
            <mat-icon class="stat-icon">person</mat-icon>
          </div>
        </mat-card>

        <mat-card class="stat-card">
          <div class="stat-content">
            <div class="stat-value">{{ decisionMakersCount() }}</div>
            <div class="stat-label">Decision Makers</div>
            <mat-icon class="stat-icon">business_center</mat-icon>
          </div>
        </mat-card>

        <mat-card class="stat-card">
          <div class="stat-content">
            <div class="stat-value">{{ recentlyAddedCount() }}</div>
            <div class="stat-label">Added This Month</div>
            <mat-icon class="stat-icon">trending_up</mat-icon>
          </div>
        </mat-card>
      </div>

      <!-- Contact Table -->
      <mat-card class="table-card">
        <div class="table-header">
          <h2>Contacts</h2>
          <div class="table-actions">
            <!-- Quick Filters -->
            <div class="quick-filters">
              <button mat-button
                      [class.active]="currentFilter.type === 'all'"
                      (click)="applyQuickFilter('all')">
                All Contacts
              </button>
              <button mat-button
                      [class.active]="currentFilter.type === 'decision-makers'"
                      (click)="applyQuickFilter('decision-makers')">
                Decision Makers
              </button>
              <button mat-button
                      [class.active]="currentFilter.type === 'recent'"
                      (click)="applyQuickFilter('recent')">
                Recent
              </button>
            </div>

            <!-- Advanced Filters -->
            <button mat-icon-button [matMenuTriggerFor]="filterMenu" matTooltip="Advanced Filters">
              <mat-icon>filter_list</mat-icon>
            </button>
            <mat-menu #filterMenu="matMenu" class="filter-menu">
              <div class="filter-content" (click)="$event.stopPropagation()">
                <h4>Filter Contacts</h4>

                <mat-form-field appearance="outline" class="filter-field">
                  <mat-label>Account</mat-label>
                  <mat-select [(ngModel)]="filter().accountId" (selectionChange)="applyFilters()">
                    <mat-option value="">All Accounts</mat-option>
                    <mat-option *ngFor="let account of availableAccounts()" [value]="account.id">
                      {{ account.name }}
                    </mat-option>
                  </mat-select>
                </mat-form-field>

                <mat-form-field appearance="outline" class="filter-field">
                  <mat-label>Department</mat-label>
                  <mat-select [(ngModel)]="filter().department" (selectionChange)="applyFilters()">
                    <mat-option value="">All Departments</mat-option>
                    <mat-option value="Sales">Sales</mat-option>
                    <mat-option value="Marketing">Marketing</mat-option>
                    <mat-option value="IT">IT</mat-option>
                    <mat-option value="Finance">Finance</mat-option>
                    <mat-option value="Operations">Operations</mat-option>
                    <mat-option value="HR">HR</mat-option>
                  </mat-select>
                </mat-form-field>

                <mat-form-field appearance="outline" class="filter-field">
                  <mat-label>Contact Method</mat-label>
                  <mat-select [(ngModel)]="filter().preferredContactMethod" (selectionChange)="applyFilters()">
                    <mat-option value="">All Methods</mat-option>
                    <mat-option value="Email">Email</mat-option>
                    <mat-option value="Phone">Phone</mat-option>
                    <mat-option value="Mobile">Mobile</mat-option>
                    <mat-option value="LinkedIn">LinkedIn</mat-option>
                  </mat-select>
                </mat-form-field>

                <div class="filter-actions">
                  <button mat-button (click)="clearFilters()">Clear</button>
                  <button mat-raised-button color="primary" (click)="applyFilters()">Apply</button>
                </div>
              </div>
            </mat-menu>

            <!-- Export -->
            <button mat-icon-button matTooltip="Export Contacts">
              <mat-icon>download</mat-icon>
            </button>
          </div>
        </div>

        <app-data-table
          [data]="contacts()"
          [columns]="tableColumns"
          [actions]="tableActions"
          [loading]="loading()"
          [totalCount]="totalCount()"
          [pageSize]="filter().pageSize || 25"
          [pageIndex]="(filter().pageNumber || 1) - 1"
          (pageChange)="onPageChange($event)"
          (sortChange)="onSortChange($event)"
          (actionClick)="onActionClicked($event)"
          (selectionChange)="onSelectionChange($event)">
        </app-data-table>
      </mat-card>

      <!-- Contact Dialog -->
      @if (showContactDialog()) {
        <div class="dialog-overlay" (click)="closeContactDialog()">
          <div class="dialog-container" (click)="$event.stopPropagation()">
            <div class="dialog-header">
              <h2>{{ editingContact() ? 'Edit Contact' : 'Add New Contact' }}</h2>
              <button mat-icon-button (click)="closeContactDialog()">
                <mat-icon>close</mat-icon>
              </button>
            </div>

            <form [formGroup]="contactForm" (ngSubmit)="saveContact()" class="contact-form">
              <!-- Basic Information -->
              <div class="form-section">
                <h3>Basic Information</h3>

                <div class="form-row">
                  <mat-form-field appearance="outline" class="half-width">
                    <mat-label>First Name *</mat-label>
                    <input matInput formControlName="firstName" placeholder="Enter first name">
                    <mat-error *ngIf="contactForm.get('firstName')?.hasError('required')">
                      First name is required
                    </mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="half-width">
                    <mat-label>Last Name *</mat-label>
                    <input matInput formControlName="lastName" placeholder="Enter last name">
                    <mat-error *ngIf="contactForm.get('lastName')?.hasError('required')">
                      Last name is required
                    </mat-error>
                  </mat-form-field>
                </div>

                <div class="form-row">
                  <mat-form-field appearance="outline" class="half-width">
                    <mat-label>Job Title</mat-label>
                    <input matInput formControlName="title" placeholder="Enter job title">
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="half-width">
                    <mat-label>Department</mat-label>
                    <input matInput formControlName="department" placeholder="Enter department">
                  </mat-form-field>
                </div>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Account</mat-label>
                  <mat-select formControlName="accountId">
                    <mat-option value="">Select Account</mat-option>
                    <mat-option *ngFor="let account of availableAccounts()" [value]="account.id">
                      {{ account.name }}
                    </mat-option>
                  </mat-select>
                </mat-form-field>
              </div>

              <!-- Contact Information -->
              <div class="form-section">
                <h3>Contact Information</h3>

                <div class="form-row">
                  <mat-form-field appearance="outline" class="half-width">
                    <mat-label>Primary Email *</mat-label>
                    <input matInput type="email" formControlName="primaryEmail" placeholder="Enter email address">
                    <mat-error *ngIf="contactForm.get('primaryEmail')?.hasError('required')">
                      Email is required
                    </mat-error>
                    <mat-error *ngIf="contactForm.get('primaryEmail')?.hasError('email')">
                      Please enter a valid email
                    </mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="half-width">
                    <mat-label>Secondary Email</mat-label>
                    <input matInput type="email" formControlName="secondaryEmail" placeholder="Enter secondary email">
                  </mat-form-field>
                </div>

                <div class="form-row">
                  <mat-form-field appearance="outline" class="half-width">
                    <mat-label>Primary Phone</mat-label>
                    <input matInput formControlName="primaryPhone" placeholder="Enter phone number">
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="half-width">
                    <mat-label>Mobile Phone</mat-label>
                    <input matInput formControlName="mobilePhone" placeholder="Enter mobile number">
                  </mat-form-field>
                </div>

                <div class="form-row">
                  <mat-form-field appearance="outline" class="half-width">
                    <mat-label>LinkedIn</mat-label>
                    <input matInput formControlName="linkedin" placeholder="LinkedIn profile URL">
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="half-width">
                    <mat-label>Preferred Contact Method</mat-label>
                    <mat-select formControlName="preferredContactMethod">
                      <mat-option value="Email">Email</mat-option>
                      <mat-option value="Phone">Phone</mat-option>
                      <mat-option value="Mobile">Mobile</mat-option>
                      <mat-option value="LinkedIn">LinkedIn</mat-option>
                    </mat-select>
                  </mat-form-field>
                </div>
              </div>

              <!-- Reporting Structure -->
              <div class="form-section">
                <h3>Reporting Structure</h3>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Reports To</mat-label>
                  <mat-select formControlName="reportsToId">
                    <mat-option value="">Select Manager</mat-option>
                    <mat-option *ngFor="let contact of availableContacts()" [value]="contact.id">
                      {{ contact.firstName }} {{ contact.lastName }} - {{ contact.title }}
                    </mat-option>
                  </mat-select>
                </mat-form-field>
              </div>

              <!-- Communication Preferences -->
              <div class="form-section">
                <h3>Communication Preferences</h3>

                <div class="checkbox-row">
                  <mat-checkbox formControlName="doNotCall">Do Not Call</mat-checkbox>
                  <mat-checkbox formControlName="doNotEmail">Do Not Email</mat-checkbox>
                  <mat-checkbox formControlName="emailOptOut">Email Opt Out</mat-checkbox>
                </div>
              </div>

              <div class="dialog-actions">
                <button type="button" mat-button (click)="closeContactDialog()">
                  Cancel
                </button>
                <button type="submit" mat-raised-button color="primary" [disabled]="contactForm.invalid || saving()">
                  @if (saving()) {
                    <mat-icon class="loading-icon">refresh</mat-icon>
                  } @else {
                    <mat-icon>{{ editingContact() ? 'save' : 'add' }}</mat-icon>
                  }
                  {{ editingContact() ? 'Update' : 'Create' }} Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .contacts-container {
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
      color: #3182ce;
    }

    .page-subtitle {
      color: #718096;
      font-size: 16px;
      margin: 0;
    }

    .header-actions {
      display: flex;
      gap: 12px;
      align-items: center;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 20px;
      margin-bottom: 24px;
    }

    .stat-card {
      padding: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 12px;
    }

    .stat-card:nth-child(2) {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    }

    .stat-card:nth-child(3) {
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    }

    .stat-card:nth-child(4) {
      background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
    }

    .stat-content {
      display: flex;
      flex-direction: column;
      position: relative;
    }

    .stat-value {
      font-size: 32px;
      font-weight: 700;
      margin-bottom: 4px;
    }

    .stat-label {
      font-size: 14px;
      opacity: 0.9;
    }

    .stat-icon {
      position: absolute;
      top: 0;
      right: 0;
      font-size: 40px;
      width: 40px;
      height: 40px;
      opacity: 0.3;
    }

    .table-card {
      padding: 0;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    }

    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px;
      border-bottom: 1px solid #e2e8f0;
    }

    .table-header h2 {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      color: #2d3748;
    }

    .table-actions {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .quick-filters {
      display: flex;
      gap: 8px;
    }

    .quick-filters button {
      border-radius: 20px;
      padding: 6px 16px;
      font-size: 13px;
      transition: all 0.2s;
    }

    .quick-filters button.active {
      background-color: #3182ce;
      color: white;
    }

    .filter-menu {
      margin-top: 8px;
    }

    .filter-content {
      padding: 16px;
      min-width: 300px;
    }

    .filter-content h4 {
      margin: 0 0 16px 0;
      font-size: 16px;
      font-weight: 600;
    }

    .filter-field {
      width: 100%;
      margin-bottom: 12px;
    }

    .filter-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
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
      padding: 20px;
    }

    .dialog-container {
      background: white;
      border-radius: 12px;
      width: 100%;
      max-width: 800px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
    }

    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px;
      border-bottom: 1px solid #e2e8f0;
    }

    .dialog-header h2 {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
    }

    .contact-form {
      padding: 24px;
    }

    .form-section {
      margin-bottom: 32px;
    }

    .form-section h3 {
      margin: 0 0 16px 0;
      font-size: 16px;
      font-weight: 600;
      color: #2d3748;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 8px;
    }

    .form-row {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
    }

    .half-width {
      flex: 1;
    }

    .full-width {
      width: 100%;
    }

    .checkbox-row {
      display: flex;
      flex-wrap: wrap;
      gap: 24px;
      margin-top: 16px;
    }

    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding-top: 24px;
      border-top: 1px solid #e2e8f0;
      margin-top: 24px;
    }

    .loading-icon {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    /* Mobile Responsiveness */
    @media (max-width: 768px) {
      .contacts-container {
        padding: 16px;
      }

      .header-content {
        flex-direction: column;
        align-items: stretch;
        gap: 16px;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .table-header {
        flex-direction: column;
        align-items: stretch;
        gap: 16px;
      }

      .table-actions {
        flex-direction: column;
        align-items: stretch;
        gap: 12px;
      }

      .quick-filters {
        flex-wrap: wrap;
      }

      .form-row {
        flex-direction: column;
        gap: 12px;
      }

      .checkbox-row {
        flex-direction: column;
        gap: 16px;
      }
    }
  `]
})
export class ContactsComponent implements OnInit {
  private contactService = inject(ContactService);
  private accountService = inject(AccountService);
  private snackBar = inject(MatSnackBar);
  private fb = inject(FormBuilder);

  // State
  contacts = signal<Contact[]>([]);
  loading = signal(true);
  saving = signal(false);
  totalCount = signal(0);
  showContactDialog = signal(false);
  editingContact = signal<Contact | null>(null);

  // Statistics
  totalContactsCount = signal(156);
  activeContactsCount = signal(142);
  decisionMakersCount = signal(34);
  recentlyAddedCount = signal(12);

  // Filter
  filter = signal<ContactFilter>({
    pageNumber: 1,
    pageSize: 25,
    sortBy: 'lastName',
    sortDirection: 'ASC'
  });

  currentFilter: any = {};

  // Related Data
  availableAccounts = signal<Account[]>([]);
  availableContacts = signal<Contact[]>([]);

  // Table Configuration
  tableColumns: TableColumn[] = [
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      width: '200px',
      format: (value: any, row: any) => `${row.firstName} ${row.lastName}`
    },
    {
      key: 'title',
      header: 'Title',
      sortable: true,
      width: '150px'
    },
    {
      key: 'account',
      header: 'Account',
      sortable: true,
      width: '160px',
      format: (value: any, row: any) => row.account?.name || '-'
    },
    {
      key: 'department',
      header: 'Department',
      width: '120px'
    },
    {
      key: 'primaryEmail',
      header: 'Email',
      width: '200px'
    },
    {
      key: 'primaryPhone',
      header: 'Phone',
      width: '140px'
    },
    {
      key: 'preferredContactMethod',
      header: 'Contact Method',
      type: 'chip',
      width: '120px',
      chipColors: {
        'Email': '#e53e3e',
        'Phone': '#3182ce',
        'Mobile': '#38a169',
        'LinkedIn': '#0077b5'
      }
    },
    {
      key: 'createdDate',
      header: 'Created',
      type: 'date',
      sortable: true,
      width: '110px'
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
      label: 'Edit Contact',
      icon: 'edit',
      color: 'accent'
    },
    {
      key: 'activities',
      label: 'View Activities',
      icon: 'history',
      color: 'primary'
    },
    {
      key: 'delete',
      label: 'Delete Contact',
      icon: 'delete',
      color: 'warn'
    }
  ];

  // Form
  contactForm: FormGroup = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    title: [''],
    department: [''],
    accountId: [''],
    primaryEmail: ['', [Validators.required, Validators.email]],
    secondaryEmail: ['', Validators.email],
    primaryPhone: [''],
    mobilePhone: [''],
    linkedin: [''],
    preferredContactMethod: ['Email'],
    reportsToId: [''],
    doNotCall: [false],
    doNotEmail: [false],
    emailOptOut: [false]
  });

  ngOnInit() {
    this.loadContacts();
    this.loadAccounts();
    this.loadRelatedContacts();
    this.loadStatistics();
  }

  loadContacts() {
    this.loading.set(true);

    this.contactService.getContacts(this.filter()).subscribe({
      next: (response: PaginatedResponse<Contact>) => {
        this.contacts.set(response.items);
        this.totalCount.set(response.totalCount);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading contacts:', error);
        this.snackBar.open('Failed to load contacts', 'Close', { duration: 3000 });
        this.loading.set(false);
      }
    });
  }

  loadAccounts() {
    this.accountService.getAccounts().subscribe({
      next: (response: PaginatedResponse<Account>) => {
        this.availableAccounts.set(response.items);
      },
      error: (error) => {
        console.error('Error loading accounts:', error);
        this.snackBar.open('Failed to load accounts', 'Close', { duration: 3000 });
      }
    });
  }

  loadRelatedContacts() {
    // Load contacts for reporting structure
    // This would typically exclude the current contact being edited
    this.availableContacts.set(this.contacts());
  }

  loadStatistics() {
    this.contactService.getContactsDashboardMetrics().subscribe({
      next: (metrics) => {
        this.totalContactsCount.set(metrics.totalContacts);
        this.activeContactsCount.set(metrics.activeContacts);
        this.decisionMakersCount.set(metrics.decisionMakers);
        this.recentlyAddedCount.set(metrics.newContactsThisMonth);
      },
      error: (error) => {
        console.error('Error loading contact statistics:', error);
      }
    });
  }

  openContactDialog(contact?: Contact) {
    if (contact) {
      this.editingContact.set(contact);
      this.contactForm.patchValue({
        firstName: contact.firstName,
        lastName: contact.lastName,
        title: contact.title,
        department: contact.department,
        accountId: contact.accountId,
        primaryEmail: contact.primaryEmail,
        secondaryEmail: contact.secondaryEmail,
        primaryPhone: contact.primaryPhone,
        mobilePhone: contact.mobilePhone,
        linkedin: contact.linkedin,
        preferredContactMethod: contact.preferredContactMethod,
        reportsToId: contact.reportsToId,
        doNotCall: contact.doNotCall,
        doNotEmail: contact.doNotEmail,
        emailOptOut: contact.emailOptOut
      });
    } else {
      this.editingContact.set(null);
      this.contactForm.reset();
      this.contactForm.patchValue({
        preferredContactMethod: 'Email',
        doNotCall: false,
        doNotEmail: false,
        emailOptOut: false
      });
    }
    this.showContactDialog.set(true);
  }

  closeContactDialog() {
    this.showContactDialog.set(false);
    this.editingContact.set(null);
    this.contactForm.reset();
  }

  saveContact() {
    if (this.contactForm.valid) {
      this.saving.set(true);
      const formData = this.contactForm.value;

      const contactData: ContactCreateDto = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        jobTitle: formData.title,
        department: formData.department,
        accountId: formData.accountId,
        businessEmail: formData.primaryEmail,
        personalEmail: formData.secondaryEmail,
        businessPhone: formData.primaryPhone,
        mobilePhone: formData.mobilePhone,
        reportsToId: formData.reportsToId,
        notes: ''
      };

      const apiCall = this.editingContact()
        ? this.contactService.updateContact(this.editingContact()!.id, contactData)
        : this.contactService.createContact(contactData);

      apiCall.subscribe({
        next: (response) => {
          const message = this.editingContact() ? 'Contact updated successfully' : 'Contact created successfully';
          this.snackBar.open(message, 'Close', { duration: 3000 });
          this.saving.set(false);
          this.closeContactDialog();
          this.loadContacts();
        },
        error: (error) => {
          console.error('Error saving contact:', error);
          this.snackBar.open('Failed to save contact', 'Close', { duration: 3000 });
          this.saving.set(false);
        }
      });
    }
  }

  applyQuickFilter(type: string) {
    this.currentFilter = { type };
    const newFilter = { ...this.filter() };

    switch (type) {
      case 'decision-makers':
        newFilter.jobTitle = 'CEO,CTO,CFO,Director,VP,Manager';
        break;
      case 'recent':
        // Recent filter - would typically be handled server-side
        break;
      default:
        delete newFilter.jobTitle;
        // delete newFilter.createdDateFrom; // not available
    }

    this.filter.set(newFilter);
    this.loadContacts();
  }

  applyFilters() {
    this.loadContacts();
  }

  clearFilters() {
    this.filter.set({
      pageNumber: 1,
      pageSize: 25,
      sortBy: 'lastName',
      sortDirection: 'ASC'
    });
    this.currentFilter = {};
    this.loadContacts();
  }

  onPageChange(event: any) {
    const newFilter = { ...this.filter() };
    newFilter.pageNumber = event.pageIndex + 1;
    newFilter.pageSize = event.pageSize;
    this.filter.set(newFilter);
    this.loadContacts();
  }

  onSortChange(event: any) {
    const newFilter = { ...this.filter() };
    newFilter.sortBy = event.active;
    newFilter.sortDirection = event.direction.toUpperCase();
    this.filter.set(newFilter);
    this.loadContacts();
  }

  onActionClicked(event: any) {
    const { action, item } = event;

    switch (action.key) {
      case 'view':
        // Navigate to contact detail view
        this.snackBar.open('Contact details view - Coming soon', 'Close', { duration: 2000 });
        break;
      case 'edit':
        this.openContactDialog(item);
        break;
      case 'activities':
        // Navigate to contact activities
        this.snackBar.open('Contact activities view - Coming soon', 'Close', { duration: 2000 });
        break;
      case 'delete':
        if (confirm('Are you sure you want to delete this contact?')) {
          this.contactService.deleteContact(item.id).subscribe({
            next: () => {
              this.snackBar.open('Contact deleted successfully', 'Close', { duration: 3000 });
              this.loadContacts();
            },
            error: (error) => {
              console.error('Error deleting contact:', error);
              this.snackBar.open('Failed to delete contact', 'Close', { duration: 3000 });
            }
          });
        }
        break;
    }
  }

  onSelectionChange(selectedItems: any[]) {
    // Handle bulk actions
    console.log('Selected contacts:', selectedItems);
  }
}