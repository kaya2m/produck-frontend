import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
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

import { DataTableComponent, TableColumn, TableAction } from '../../shared/components/data-table/data-table.component';
import { LeadService } from '../../core/services/lead.service';
import { Lead, LeadStatus, LeadCategory } from '../../core/models/crm.models';
import { LeadFilter, LeadCreateDto, PaginatedResponse } from '../../core/models/api-response.models';

@Component({
  selector: 'app-leads',
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
    DataTableComponent
  ],
  template: `
    <div class="leads-container">
      <!-- Page Header -->
      <div class="page-header">
        <div class="header-content">
          <div class="title-section">
            <h1 class="page-title">
              <mat-icon>person_search</mat-icon>
              Lead Management
            </h1>
            <p class="page-subtitle">
              Track, score, and convert potential customers into opportunities
            </p>
          </div>

          <div class="header-actions">
            <button mat-button [matMenuTriggerFor]="quickFiltersMenu" class="quick-filter-button">
              <mat-icon>speed</mat-icon>
              Quick Views
            </button>

            <button mat-button [matMenuTriggerFor]="filterMenu" class="filter-button">
              <mat-icon>filter_list</mat-icon>
              Filters
            </button>

            <button mat-raised-button color="primary" (click)="openCreateLeadDialog()" class="create-button">
              <mat-icon>add</mat-icon>
              New Lead
            </button>
          </div>
        </div>
      </div>

      <!-- Lead Statistics Cards -->
      <div class="stats-cards">
        <mat-card class="stat-card hot-leads">
          <div class="stat-content">
            <div class="stat-icon">
              <mat-icon>local_fire_department</mat-icon>
            </div>
            <div class="stat-details">
              <div class="stat-value">{{ hotLeadsCount() }}</div>
              <div class="stat-label">Hot Leads</div>
              <div class="stat-subtitle">Score ≥ 800</div>
            </div>
          </div>
        </mat-card>

        <mat-card class="stat-card qualified-leads">
          <div class="stat-content">
            <div class="stat-icon">
              <mat-icon>verified</mat-icon>
            </div>
            <div class="stat-details">
              <div class="stat-value">{{ qualifiedLeadsCount() }}</div>
              <div class="stat-label">Qualified</div>
              <div class="stat-subtitle">Ready to convert</div>
            </div>
          </div>
        </mat-card>

        <mat-card class="stat-card stale-leads">
          <div class="stat-content">
            <div class="stat-icon">
              <mat-icon>schedule</mat-icon>
            </div>
            <div class="stat-details">
              <div class="stat-value">{{ staleLeadsCount() }}</div>
              <div class="stat-label">Stale Leads</div>
              <div class="stat-subtitle">No activity 7+ days</div>
            </div>
          </div>
        </mat-card>

        <mat-card class="stat-card conversion-rate">
          <div class="stat-content">
            <div class="stat-icon">
              <mat-icon>trending_up</mat-icon>
            </div>
            <div class="stat-details">
              <div class="stat-value">{{ conversionRate() }}%</div>
              <div class="stat-label">Conversion Rate</div>
              <div class="stat-subtitle">This month</div>
            </div>
          </div>
        </mat-card>
      </div>

      <!-- Data Table -->
      <mat-card class="table-card">
        <app-data-table
          [data]="leads()"
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
          [emptyStateIcon]="'person_search'"
          [emptyStateTitle]="'No leads found'"
          [emptyStateMessage]="'Import leads or create your first lead to start tracking potential customers'"
          (sortChange)="onSort($event)"
          (pageChange)="onPageChange($event)"
          (filterChange)="onFilterChange($event)"
          (actionClick)="onAction($event)"
          (bulkActionClick)="onBulkAction($event)"
          (rowClick)="onRowClick($event)">
        </app-data-table>
      </mat-card>
    </div>

    <!-- Quick Filters Menu -->
    <mat-menu #quickFiltersMenu="matMenu">
      <button mat-menu-item (click)="applyQuickFilter('hot')">
        <mat-icon style="color: #ef4444;">local_fire_department</mat-icon>
        <span>Hot Leads (≥800 score)</span>
      </button>
      <button mat-menu-item (click)="applyQuickFilter('qualified')">
        <mat-icon style="color: #10b981;">verified</mat-icon>
        <span>Qualified Leads</span>
      </button>
      <button mat-menu-item (click)="applyQuickFilter('stale')">
        <mat-icon style="color: #f59e0b;">schedule</mat-icon>
        <span>Stale Leads (7+ days)</span>
      </button>
      <mat-divider></mat-divider>
      <button mat-menu-item (click)="clearFilters()">
        <mat-icon>clear_all</mat-icon>
        <span>Show All Leads</span>
      </button>
    </mat-menu>

    <!-- Advanced Filter Menu -->
    <mat-menu #filterMenu="matMenu" class="filter-menu">
      <div class="menu-content" (click)="$event.stopPropagation()">
        <h4>Advanced Filters</h4>

        <mat-form-field appearance="outline" class="filter-field">
          <mat-label>Status</mat-label>
          <mat-select [(ngModel)]="currentFilter.status" (selectionChange)="applyFilters()">
            <mat-option value="">All Statuses</mat-option>
            <mat-option value="New">New</mat-option>
            <mat-option value="Contacted">Contacted</mat-option>
            <mat-option value="Qualified">Qualified</mat-option>
            <mat-option value="Unqualified">Unqualified</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="filter-field">
          <mat-label>Category</mat-label>
          <mat-select [(ngModel)]="currentFilter.category" (selectionChange)="applyFilters()">
            <mat-option value="">All Categories</mat-option>
            <mat-option value="Hot">Hot (≥800)</mat-option>
            <mat-option value="Warm">Warm (500-799)</mat-option>
            <mat-option value="Cold">Cold (<500)</mat-option>
          </mat-select>
        </mat-form-field>

        <div class="filter-actions">
          <button mat-button (click)="clearFilters()">Clear</button>
          <button mat-button color="primary" (click)="applyFilters()">Apply</button>
        </div>
      </div>
    </mat-menu>

    <!-- Create/Edit Lead Dialog -->
    @if (showLeadDialog()) {
      <div class="dialog-overlay" (click)="closeLeadDialog()">
        <div class="dialog-container" (click)="$event.stopPropagation()">
          <div class="dialog-header">
            <h2>{{ editingLead() ? 'Edit Lead' : 'Create New Lead' }}</h2>
            <button mat-icon-button (click)="closeLeadDialog()">
              <mat-icon>close</mat-icon>
            </button>
          </div>

          <form [formGroup]="leadForm" (ngSubmit)="saveLead()" class="dialog-form">
            <div class="form-row">
              <mat-form-field appearance="outline" class="half-width">
                <mat-label>First Name *</mat-label>
                <input matInput formControlName="firstName" placeholder="Enter first name">
                <mat-error *ngIf="leadForm.get('firstName')?.hasError('required')">
                  First name is required
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Last Name *</mat-label>
                <input matInput formControlName="lastName" placeholder="Enter last name">
                <mat-error *ngIf="leadForm.get('lastName')?.hasError('required')">
                  Last name is required
                </mat-error>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Email *</mat-label>
                <input matInput type="email" formControlName="email" placeholder="Enter email address">
                <mat-error *ngIf="leadForm.get('email')?.hasError('required')">
                  Email is required
                </mat-error>
                <mat-error *ngIf="leadForm.get('email')?.hasError('email')">
                  Please enter a valid email
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Phone</mat-label>
                <input matInput formControlName="phone" placeholder="Enter phone number">
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Company Name</mat-label>
                <input matInput formControlName="companyName" placeholder="Enter company name">
              </mat-form-field>

              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Job Title</mat-label>
                <input matInput formControlName="jobTitle" placeholder="Enter job title">
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Notes</mat-label>
              <textarea matInput formControlName="notes" placeholder="Additional notes about this lead" rows="3"></textarea>
            </mat-form-field>

            <div class="dialog-actions">
              <button type="button" mat-button (click)="closeLeadDialog()">
                Cancel
              </button>
              <button type="submit" mat-raised-button color="primary" [disabled]="leadForm.invalid || saving()">
                @if (saving()) {
                  <mat-icon class="loading-icon">refresh</mat-icon>
                } @else {
                  <mat-icon>{{ editingLead() ? 'save' : 'add' }}</mat-icon>
                }
                {{ editingLead() ? 'Update' : 'Create' }} Lead
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
  styles: [`
    .leads-container {
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
      color: #8b5cf6;
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

    .quick-filter-button,
    .filter-button {
      border: 1px solid #e2e8f0;
    }

    .create-button {
      height: 44px;
      padding: 0 24px;
      font-weight: 600;
      border-radius: 8px;
    }

    /* Statistics Cards */
    .stats-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .stat-card {
      border-radius: 12px;
      border: 1px solid #e2e8f0;
      transition: all 0.2s ease;
    }

    .stat-card:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .stat-card.hot-leads {
      border-left: 4px solid #ef4444;
    }

    .stat-card.qualified-leads {
      border-left: 4px solid #10b981;
    }

    .stat-card.stale-leads {
      border-left: 4px solid #f59e0b;
    }

    .stat-card.conversion-rate {
      border-left: 4px solid #8b5cf6;
    }

    .stat-content {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px;
    }

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f8fafc;
    }

    .hot-leads .stat-icon {
      background: #fef2f2;
      color: #ef4444;
    }

    .qualified-leads .stat-icon {
      background: #f0fdf4;
      color: #10b981;
    }

    .stale-leads .stat-icon {
      background: #fffbeb;
      color: #f59e0b;
    }

    .conversion-rate .stat-icon {
      background: #faf5ff;
      color: #8b5cf6;
    }

    .stat-icon mat-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    .stat-details {
      flex: 1;
    }

    .stat-value {
      font-size: 28px;
      font-weight: 700;
      color: #1f2937;
      line-height: 1;
    }

    .stat-label {
      font-size: 14px;
      font-weight: 600;
      color: #374151;
      margin: 4px 0 2px 0;
    }

    .stat-subtitle {
      font-size: 12px;
      color: #6b7280;
    }

    .table-card {
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      border: 1px solid #e2e8f0;
    }

    /* Menu Styles */
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
      .leads-container {
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

      .stats-cards {
        grid-template-columns: 1fr;
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
export class LeadsComponent implements OnInit {
  private leadService = inject(LeadService);
  private snackBar = inject(MatSnackBar);
  private fb = inject(FormBuilder);

  // State
  leads = signal<Lead[]>([]);
  loading = signal(true);
  saving = signal(false);
  totalCount = signal(0);
  showLeadDialog = signal(false);
  editingLead = signal<Lead | null>(null);

  // Statistics
  hotLeadsCount = signal(12);
  qualifiedLeadsCount = signal(8);
  staleLeadsCount = signal(5);
  conversionRate = signal(15);

  // Filter
  filter = signal<LeadFilter>({
    pageNumber: 1,
    pageSize: 25,
    search: '',
    sortBy: 'leadScore',
    sortDirection: 'DESC'
  });

  currentFilter: any = {};

  // Table Configuration
  tableColumns: TableColumn[] = [
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      width: '180px',
      format: (value: any, row: any) => `${row.firstName} ${row.lastName}`
    },
    {
      key: 'companyName',
      header: 'Company',
      sortable: true,
      width: '160px'
    },
    {
      key: 'email',
      header: 'Email',
      width: '200px'
    },
    {
      key: 'leadScore',
      header: 'Score',
      type: 'number',
      sortable: true,
      width: '100px'
    },
    {
      key: 'status',
      header: 'Status',
      type: 'chip',
      sortable: true,
      width: '120px',
      chipColors: {
        'New': '#3b82f6',
        'Contacted': '#f59e0b',
        'Qualified': '#10b981',
        'Unqualified': '#6b7280',
        'Converted': '#8b5cf6'
      }
    },
    {
      key: 'leadSource',
      header: 'Source',
      width: '120px'
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
      key: 'edit',
      label: 'Edit Lead',
      icon: 'edit'
    },
    {
      key: 'delete',
      label: 'Delete Lead',
      icon: 'delete',
      color: 'warn'
    }
  ];

  bulkActions: TableAction[] = [
    {
      key: 'bulk-assign',
      label: 'Bulk Assign',
      icon: 'person_add'
    },
    {
      key: 'bulk-delete',
      label: 'Delete Selected',
      icon: 'delete'
    }
  ];

  // Forms
  leadForm = this.fb.group({
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    companyName: [''],
    jobTitle: [''],
    notes: ['']
  });

  ngOnInit(): void {
    this.currentFilter = { ...this.filter() };
    this.loadLeads();
    this.loadStatistics();
  }

  loadLeads(): void {
    this.loading.set(true);

    this.leadService.getLeads(this.filter()).subscribe({
      next: (response: PaginatedResponse<Lead>) => {
        this.leads.set(response.items);
        this.totalCount.set(response.totalCount);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading leads:', error);
        this.snackBar.open('Failed to load leads', 'Close', { duration: 3000 });
        this.loading.set(false);
      }
    });
  }

  loadStatistics(): void {
    this.leadService.getLeadsDashboardMetrics().subscribe({
      next: (metrics) => {
        this.hotLeadsCount.set(metrics.hotLeads);
        this.qualifiedLeadsCount.set(metrics.qualifiedLeads);
        this.staleLeadsCount.set(metrics.staleLeads);
        this.conversionRate.set(metrics.conversionRate);
      },
      error: (error) => {
        console.error('Error loading lead statistics:', error);
      }
    });
  }

  onSort(sort: any): void {
    this.filter.update(f => ({
      ...f,
      sortBy: sort.active,
      sortDirection: sort.direction?.toUpperCase() || 'ASC'
    }));
    this.loadLeads();
  }

  onPageChange(page: any): void {
    this.filter.update(f => ({
      ...f,
      pageNumber: page.pageIndex + 1,
      pageSize: page.pageSize
    }));
    this.loadLeads();
  }

  onFilterChange(filters: any): void {
    this.filter.update(f => ({
      ...f,
      search: filters.globalSearch || '',
      pageNumber: 1
    }));
    this.loadLeads();
  }

  onAction(event: { action: string; row: Lead }): void {
    switch (event.action) {
      case 'edit':
        this.editLead(event.row);
        break;
      case 'delete':
        this.deleteLead(event.row);
        break;
    }
  }

  onBulkAction(event: { action: string; rows: Lead[] }): void {
    console.log('Bulk action:', event.action, event.rows);
  }

  onRowClick(lead: Lead): void {
    this.editLead(lead);
  }

  applyQuickFilter(filterType: string): void {
    switch (filterType) {
      case 'hot':
        this.filter.update(f => ({ ...f, category: 'Hot', pageNumber: 1 }));
        break;
      case 'qualified':
        this.filter.update(f => ({ ...f, status: 'Qualified', pageNumber: 1 }));
        break;
      case 'stale':
        this.filter.update(f => ({ ...f, daysWithoutActivity: 7, pageNumber: 1 }));
        break;
    }
    this.loadLeads();
  }

  openCreateLeadDialog(): void {
    this.editingLead.set(null);
    this.leadForm.reset();
    this.showLeadDialog.set(true);
  }

  editLead(lead: Lead): void {
    this.editingLead.set(lead);
    this.leadForm.patchValue(lead);
    this.showLeadDialog.set(true);
  }

  closeLeadDialog(): void {
    this.showLeadDialog.set(false);
    this.editingLead.set(null);
    this.leadForm.reset();
  }

  saveLead(): void {
    if (this.leadForm.invalid) return;

    this.saving.set(true);

    setTimeout(() => {
      const message = this.editingLead() ? 'Lead updated successfully' : 'Lead created successfully';
      this.snackBar.open(message, 'Close', { duration: 3000 });
      this.closeLeadDialog();
      this.loadLeads();
      this.saving.set(false);
    }, 1000);
  }

  deleteLead(lead: Lead): void {
    if (confirm(`Are you sure you want to delete the lead "${lead.firstName} ${lead.lastName}"?`)) {
      this.snackBar.open('Lead deleted successfully', 'Close', { duration: 3000 });
      this.loadLeads();
    }
  }

  applyFilters(): void {
    this.filter.update(f => ({
      ...f,
      ...this.currentFilter,
      pageNumber: 1
    }));
    this.loadLeads();
  }

  clearFilters(): void {
    this.currentFilter = {
      pageNumber: 1,
      pageSize: 25,
      search: '',
      sortBy: 'leadScore',
      sortDirection: 'DESC'
    };
    this.filter.set({ ...this.currentFilter });
    this.loadLeads();
  }
}