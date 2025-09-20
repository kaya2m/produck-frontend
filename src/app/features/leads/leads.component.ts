import { Component, OnInit, signal, computed, inject, DestroyRef } from '@angular/core';
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
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { finalize } from 'rxjs/operators';

import { DataGridComponent, DataGridColumn, DataGridAction, DataGridConfig } from '../../shared/components/data-grid/data-grid.component';
import { CellRendererHelpers } from '../../shared/components/data-grid/cell-renderers';
import { LeadService } from '../../core/services/lead.service';
import { AuthService } from '../../core/services/auth.service';
import { Lead, LeadStatus, LeadCategory } from '../../core/models/crm.models';
import { LeadFilter, LeadCreateDto, PaginatedResponse, LeadUpdateDto } from '../../core/models/api-response.models';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LeadConversionDialogComponent } from './components/lead-conversion-dialog.component';
import { LeadAnalyticsDialogComponent } from './components/lead-analytics-dialog.component';

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
    MatDialogModule,
    DataGridComponent
  ],
  template: `
    <div class="page-container">
      <!-- Header - Updated for new standards -->
      <div class="page-header">
        <div class="title-section">
          <h1><mat-icon>psychology</mat-icon>Lead Yönetimi</h1>
          <p>Potansiyel müşteriler ve scoring sistemi</p>
        </div>

        <div class="actions-section">
          <!-- Lead View Filters -->
          <button mat-stroked-button [matMenuTriggerFor]="viewMenu" class="view-filter-btn">
            <mat-icon>filter_list</mat-icon>{{ currentView() }}
          </button>

          <button mat-raised-button color="primary" (click)="openCreateLeadDialog()">
            <mat-icon>add</mat-icon>Yeni Lead
          </button>
          <button mat-raised-button color="accent" (click)="bulkAction()" *ngIf="hasBulkActions">
            <mat-icon>checklist</mat-icon>Toplu İşlem
          </button>
          <button mat-icon-button matTooltip="Excel'e Aktar" (click)="exportToExcel()">
            <mat-icon>download</mat-icon>
          </button>
          <button mat-icon-button matTooltip="Yenile" (click)="loadLeads()">
            <mat-icon>refresh</mat-icon>
          </button>
        </div>
      </div>

      <!-- Data Grid - Standard: Sadece grid, card wrapper yok -->
      <div class="grid-section">
        <app-data-grid
          [data]="leads()"
          [columns]="gridColumns"
          [actions]="gridActions"
          [config]="gridConfig"
          [loading]="loading()"
          [totalCount]="totalCount()"
          [pageSize]="pageSize()"
          [currentPage]="pageNumber()"
          [serverSidePagination]="true"
          [stateKey]="'crm-leads-grid'"
          [title]="'Leadler'"
          [showDefaultToolbar]="true"
          [enableQuickFilter]="true"
          (pageChanged)="onPageChange($event)">
        </app-data-grid>
      </div>
    </div>

    <!-- View Menu -->
    <mat-menu #viewMenu="matMenu">
      <button mat-menu-item (click)="setView('all')">
        <mat-icon>list</mat-icon>
        <span>Tüm Leadler</span>
      </button>
      <button mat-menu-item (click)="setView('hot')">
        <mat-icon>local_fire_department</mat-icon>
        <span>Hot Leadler (Score ≥ 800)</span>
      </button>
      <button mat-menu-item (click)="setView('qualified')">
        <mat-icon>verified</mat-icon>
        <span>Qualified Leadler (Score ≥ 70)</span>
      </button>
      <button mat-menu-item (click)="setView('my-leads')">
        <mat-icon>person</mat-icon>
        <span>Benim Leadlerim</span>
      </button>
      <button mat-menu-item (click)="setView('stale')">
        <mat-icon>schedule</mat-icon>
        <span>Stale Leadler (30+ gün)</span>
      </button>
      <mat-divider></mat-divider>
      <button mat-menu-item (click)="showAnalytics()">
        <mat-icon>analytics</mat-icon>
        <span>Analytics</span>
      </button>
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

    /* Responsive Design */
    @media (max-width: 768px) {
      .page-container {
        padding: 16px;
      }

      .page-header {
        flex-direction: column;
        align-items: stretch;
      }

      .form-row {
        flex-direction: column;
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
export class LeadsComponent implements OnInit {
  private leadService = inject(LeadService);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private dialog = inject(MatDialog);

  // State
  leads = signal<Lead[]>([]);
  loading = signal(true);
  saving = signal(false);
  totalCount = signal(0);
  showLeadDialog = signal(false);
  editingLead = signal<Lead | null>(null);

  // Statistics
  hotLeadsCount = signal(0);
  qualifiedLeadsCount = signal(0);
  staleLeadsCount = signal(0);
  conversionRate = signal(0);
  pageNumber = signal(1);
  pageSize = signal(15); // Standard: İlk yükleme 15 satır

  // View Management
  currentView = signal('Tüm Leadler');

  // Filter
  filter = signal<LeadFilter>({
    pageNumber: 1,
    pageSize: 15,
    search: '',
    sortBy: 'leadScore',
    sortDirection: 'DESC'
  });

  // Grid Configuration - Updated for new standards
  gridColumns: DataGridColumn[] = [
    {
      field: 'leadInfo',
      headerName: 'Lead Bilgileri',
      flex: 1,
      minWidth: 350,
      pinned: 'left',
      cellRenderer: CellRendererHelpers.createLeadInfoRenderer(),
      filter: 'agTextColumnFilter',
      valueGetter: (params: any) => {
        const data = params.data;
        return `${data.firstName} ${data.lastName} ${data.email} ${data.phone}`;
      },
      hide: false
    },
    {
      field: 'status',
      headerName: 'Durum',
      width: 120,
      cellRenderer: (params: any) => {
        const status = params.value;
        const statusColors: Record<string, string> = {
          'New': 'background: #dbeafe; color: #1e40af;',
          'Contacted': 'background: #fef3c7; color: #d97706;',
          'Qualified': 'background: #dcfce7; color: #166534;',
          'Unqualified': 'background: #fef2f2; color: #dc2626;'
        };
        const style = statusColors[status] || 'background: #f1f5f9; color: #64748b;';
        return `<span style="padding: 4px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; ${style}">${status || 'Bilinmiyor'}</span>`;
      },
      filter: 'agTextColumnFilter',
      hide: false
    },
    {
      field: 'leadScore',
      headerName: 'Lead Skoru',
      width: 140,
      cellRenderer: (params: any) => {
        const lead = params.data;
        const leadScore = lead.leadScore || 0;
        const qualificationScore = lead.qualificationScore || 0;

        // Lead Score Badge
        let leadColor = '#64748b', leadBg = '#f1f5f9', leadLabel = 'Cold';
        if (leadScore >= 800) {
          leadColor = '#dc2626'; leadBg = '#fef2f2'; leadLabel = 'Hot';
        } else if (leadScore >= 500) {
          leadColor = '#d97706'; leadBg = '#fef3c7'; leadLabel = 'Warm';
        }

        // Qualification Badge
        const isQualified = qualificationScore >= 70;
        const qualBadge = isQualified
          ? `<span style="padding: 2px 6px; border-radius: 6px; font-size: 10px; font-weight: 600; color: #166534; background: #dcfce7; margin-left: 4px;">Q</span>`
          : '';

        return `
          <div style="display: flex; align-items: center; gap: 4px;">
            <span style="padding: 4px 8px; border-radius: 8px; font-weight: 600; color: ${leadColor}; background: ${leadBg}; font-size: 11px;">
              ${leadScore} ${leadLabel}
            </span>
            ${qualBadge}
          </div>
        `;
      },
      filter: 'agNumberColumnFilter',
      sortable: true,
      hide: false
    },
    {
      field: 'source',
      headerName: 'Kaynak',
      width: 140,
      valueGetter: (params: any) => params.data.source || 'Belirtilmemiş',
      filter: 'agTextColumnFilter',
      hide: false
    },
    {
      field: 'assignedTo',
      headerName: 'Sorumlu',
      width: 140,
      valueGetter: (params: any) => params.data.assignedTo || 'Atanmamış',
      cellRenderer: (params: any) => {
        const owner = params.value;
        if (!owner || owner === 'Atanmamış') {
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
      filter: 'agTextColumnFilter',
      hide: false
    },
    // Ek sütunlar - varsayılan gizli
    {
      field: 'category',
      headerName: 'Kategori',
      width: 120,
      filter: 'agTextColumnFilter',
      hide: true
    },
    {
      field: 'company',
      headerName: 'Şirket',
      width: 150,
      filter: 'agTextColumnFilter',
      hide: true
    },
    {
      field: 'createdDate',
      headerName: 'Oluşturma Tarihi',
      width: 140,
      cellRenderer: CellRendererHelpers.createDateRenderer(),
      filter: 'agDateColumnFilter',
      hide: true
    }
  ];

  // Context Menu Actions - Enhanced with Lead-specific features
  gridActions: DataGridAction[] = [
    {
      icon: 'visibility',
      tooltip: 'Detayları Görüntüle',
      color: undefined,
      click: (row: Lead) => this.viewLeadDetails(row)
    },
    {
      icon: 'edit',
      tooltip: 'Düzenle',
      color: 'primary',
      click: (row: Lead) => this.editLead(row)
    },
    {
      icon: 'analytics',
      tooltip: 'Score Detaylarını Görüntüle',
      color: 'primary',
      click: (row: Lead) => this.viewScoreBreakdown(row)
    },
    {
      icon: 'refresh',
      tooltip: 'Score Yeniden Hesapla',
      color: 'accent',
      click: (row: Lead) => this.recalculateScore(row)
    },
    {
      icon: 'transform',
      tooltip: 'Account/Contact\'a Dönüştür',
      color: 'accent',
      visible: (row: Lead) => (row.qualificationScore || 0) >= 70,
      click: (row: Lead) => this.convertLead(row)
    },
    {
      icon: 'phone',
      tooltip: 'Ara',
      color: 'accent',
      visible: (row: Lead) => !!row.phone,
      click: (row: Lead) => this.makeCall(row)
    },
    {
      icon: 'mail',
      tooltip: 'E-posta Gönder',
      color: 'accent',
      visible: (row: Lead) => !!row.email,
      click: (row: Lead) => this.sendEmail(row)
    },
    {
      icon: 'content_copy',
      tooltip: 'Kopyala',
      color: 'accent',
      click: (row: Lead) => this.duplicateLead(row)
    },
    {
      icon: 'delete',
      tooltip: 'Sil',
      color: 'warn',
      click: (row: Lead) => this.deleteLead(row)
    }
  ];

  gridConfig: DataGridConfig = {
    enableSorting: true,
    enableFiltering: true,
    enablePagination: true,
    paginationPageSize: 15,
    paginationPageSizeSelector: [15, 30, 50, 100],
    enableSelection: false,
    enableColumnResize: true,
    enableColumnReorder: true,
    enableAutoSizeColumns: false,
    rowHeight: 60,
    headerHeight: 48
  };

  // Bulk Actions Support
  hasBulkActions = false; // Standard: Context menu kullanılacak

  // Lead Form
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
    this.loadLeads();
  }

  loadLeads(): void {
    this.loading.set(true);

    this.leadService
      .getLeads(this.filter())
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: (response: PaginatedResponse<Lead>) => {
        const currentFilter = this.filter();
        let leads = response.items;

        if (currentFilter.daysWithoutActivity) {
          leads = leads.filter(lead => (lead.daysWithoutActivity ?? 0) >= (currentFilter.daysWithoutActivity ?? 0));
        }

        this.leads.set(leads);
        this.totalCount.set(currentFilter.daysWithoutActivity ? leads.length : response.totalCount);
        this.updateLeadStatistics(leads);
        },
        error: (error) => {
          console.error('Error loading leads:', error);
          this.snackBar.open('Failed to load leads', 'Close', { duration: 3000 });
        }
      });
  }

  private updateLeadStatistics(leads: Lead[]): void {
    this.hotLeadsCount.set(leads.filter(lead => lead.leadCategory === LeadCategory.Hot).length);
    this.qualifiedLeadsCount.set(leads.filter(lead => lead.status === LeadStatus.Qualified).length);
    this.staleLeadsCount.set(leads.filter(lead => (lead.daysWithoutActivity ?? 0) >= 7).length);

    if (leads.length === 0) {
      this.conversionRate.set(0);
      return;
    }

    const convertedCount = leads.filter(lead => lead.isConverted).length;
    this.conversionRate.set(Math.round((convertedCount / leads.length) * 100));
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
    const nextPageNumber = page?.pageNumber ?? page?.page ?? (
      page?.pageIndex !== undefined ? page.pageIndex + 1 : this.pageNumber()
    );
    const nextPageSize = page?.pageSize ?? this.pageSize();

    const hasPageChanged = nextPageNumber !== this.pageNumber();
    const hasPageSizeChanged = nextPageSize !== this.pageSize();

    if (!hasPageChanged && !hasPageSizeChanged) {
      return;
    }

    this.pageNumber.set(nextPageNumber);
    this.pageSize.set(nextPageSize);
    this.filter.update(f => ({
      ...f,
      pageNumber: nextPageNumber,
      pageSize: nextPageSize
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

  // Grid Action Methods - New implementations
  viewLeadDetails(lead: Lead): void {
    console.log('Viewing lead details:', lead);
    // TODO: Implement lead details view
  }


  convertToOpportunity(lead: Lead): void {
    console.log('Converting lead to opportunity:', lead);
    // TODO: Implement lead to opportunity conversion
    this.snackBar.open('Lead fırsata dönüştürülecek', 'Tamam', { duration: 3000 });
  }

  duplicateLead(lead: Lead): void {
    const duplicated = { ...lead };
    delete (duplicated as any).id;
    duplicated.firstName = `${duplicated.firstName} (Kopya)`;
    this.editingLead.set(duplicated);
    this.showLeadDialog.set(true);
    this.leadForm.patchValue(duplicated);
  }

  deleteLead(lead: Lead): void {
    if (confirm(`${lead.firstName} ${lead.lastName} adlı lead'i silmek istediğinizden emin misiniz?`)) {
      this.leadService.deleteLead(lead.id!).subscribe({
        next: () => {
          this.snackBar.open('Lead başarıyla silindi', 'Tamam', { duration: 3000 });
          this.loadLeads();
        },
        error: (error) => {
          console.error('Error deleting lead:', error);
          this.snackBar.open('Lead silinirken hata oluştu', 'Tamam', { duration: 3000 });
        }
      });
    }
  }

  exportToExcel(): void {
    console.log('Exporting leads to Excel');
    // TODO: Implement Excel export
    this.snackBar.open('Excel export özelliği yakında eklenecek', 'Tamam', { duration: 3000 });
  }

  bulkAction(): void {
    console.log('Bulk action');
    // TODO: Implement bulk actions
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
    this.leadService.getLeadById(lead.id).subscribe({
      next: (leadDetails) => {
        this.editingLead.set(leadDetails);
        this.leadForm.patchValue({
          firstName: leadDetails.firstName,
          lastName: leadDetails.lastName,
          email: leadDetails.email,
          phone: leadDetails.phone ?? '',
          companyName: leadDetails.companyName ?? '',
          jobTitle: leadDetails.jobTitle ?? '',
          notes: leadDetails.notes ?? ''
        });
        this.showLeadDialog.set(true);
      },
      error: (error) => {
        console.error('Error loading lead details:', error);
        this.snackBar.open('Failed to load lead details', 'Close', { duration: 4000 });
      }
    });
  }

  closeLeadDialog(): void {
    this.showLeadDialog.set(false);
    this.editingLead.set(null);
    this.leadForm.reset();
  }

  saveLead(): void {
    if (this.leadForm.invalid) return;

    const formValue = this.leadForm.value;
    const currentUserId = this.authService.getCurrentUser()?.id;

    const basePayload = {
      firstName: formValue.firstName?.trim() ?? '',
      lastName: formValue.lastName?.trim() ?? '',
      email: formValue.email?.trim() ?? '',
      phone: formValue.phone?.trim() || undefined,
      companyName: formValue.companyName?.trim() || undefined,
      jobTitle: formValue.jobTitle?.trim() || undefined,
      notes: formValue.notes?.trim() || undefined
    };

    this.saving.set(true);

    if (this.editingLead()) {
      const existingLead = this.editingLead()!;

      const updatePayload: LeadUpdateDto = {
        id: existingLead.id,
        firstName: basePayload.firstName,
        lastName: basePayload.lastName,
        email: basePayload.email,
        phone: basePayload.phone,
        companyName: basePayload.companyName,
        jobTitle: basePayload.jobTitle,
        notes: basePayload.notes,
        leadSource: existingLead.leadSource ?? 'Manual',
        leadStatus: existingLead.status ?? LeadStatus.New,
        statusId: existingLead.statusId ?? '',
        assignedUserId: existingLead.assignedUserId ?? currentUserId ?? ''
      };

      if (existingLead.industryId) updatePayload.industryId = existingLead.industryId;
      if (existingLead.leadSourceId) updatePayload.leadSourceId = existingLead.leadSourceId;
      if (existingLead.companySizeId) updatePayload.companySizeId = existingLead.companySizeId;
      if (existingLead.budget !== undefined) updatePayload.budget = existingLead.budget;
      if (existingLead.timeline) updatePayload.timeline = existingLead.timeline;
      if (existingLead.decisionMakerLevel) updatePayload.decisionMakerLevel = existingLead.decisionMakerLevel;
      if (existingLead.companySize) updatePayload.companySize = existingLead.companySize;
      if (existingLead.painPoints) updatePayload.painPoints = existingLead.painPoints;

      if (!updatePayload.statusId || !updatePayload.assignedUserId) {
        this.saving.set(false);
        this.snackBar.open('Missing lead assignment or status information. Please try again.', 'Close', { duration: 4000 });
        return;
      }

      this.leadService.updateLead(existingLead.id, updatePayload)
        .pipe(finalize(() => this.saving.set(false)))
        .subscribe({
          next: () => {
            this.snackBar.open('Lead updated successfully', 'Close', { duration: 3000 });
            this.closeLeadDialog();
            this.loadLeads();
          },
          error: (error) => {
            console.error('Error updating lead:', error);
            this.snackBar.open(error.message || 'Failed to update lead', 'Close', { duration: 4000 });
          }
        });
      return;
    }

    const createPayload: LeadCreateDto = {
      firstName: basePayload.firstName,
      lastName: basePayload.lastName,
      email: basePayload.email,
      phone: basePayload.phone,
      companyName: basePayload.companyName,
      jobTitle: basePayload.jobTitle,
      notes: basePayload.notes,
      leadSource: 'Manual',
      assignedUserId: currentUserId
    };

    this.leadService.createLead(createPayload)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => {
          this.snackBar.open('Lead created successfully', 'Close', { duration: 3000 });
          this.closeLeadDialog();
          this.loadLeads();
        },
        error: (error) => {
          console.error('Error creating lead:', error);
          this.snackBar.open(error.message || 'Failed to create lead', 'Close', { duration: 4000 });
        }
      });
  }

  applyFilters(): void {
    this.filter.update(f => ({
      ...f,
      pageNumber: 1
    }));
    this.loadLeads();
  }

  clearFilters(): void {
    this.filter.set({
      pageNumber: 1,
      pageSize: 15,
      search: '',
      sortBy: 'leadScore',
      sortDirection: 'DESC'
    });
    this.loadLeads();
  }

  // Enhanced Lead Management Methods

  setView(view: string): void {
    this.currentView.set(
      view === 'all' ? 'Tüm Leadler' :
      view === 'hot' ? 'Hot Leadler' :
      view === 'qualified' ? 'Qualified Leadler' :
      view === 'my-leads' ? 'Benim Leadlerim' :
      view === 'stale' ? 'Stale Leadler' : 'Tüm Leadler'
    );

    // Call different API endpoints based on view
    this.loading.set(true);
    let apiCall;

    switch (view) {
      case 'hot':
        apiCall = this.leadService.getHotLeads();
        break;
      case 'qualified':
        apiCall = this.leadService.getQualifiedLeads();
        break;
      case 'my-leads':
        apiCall = this.leadService.getMyLeads();
        break;
      case 'stale':
        apiCall = this.leadService.getStaleLeads();
        break;
      default:
        this.loadLeads();
        return;
    }

    apiCall.pipe(
      finalize(() => this.loading.set(false)),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (response: PaginatedResponse<Lead>) => {
        this.leads.set(response.items || []);
        this.totalCount.set(response.totalCount || 0);
      },
      error: (error) => {
        console.error(`Error loading ${view} leads:`, error);
        this.snackBar.open(`Failed to load ${view} leads`, 'Close', { duration: 3000 });
      }
    });
  }

  viewScoreBreakdown(lead: Lead): void {
    // TODO: Create score breakdown modal
    this.snackBar.open('Score breakdown özelliği yakında eklenecek', 'Close', { duration: 3000 });
  }

  recalculateScore(lead: Lead): void {
    this.leadService.recalculateLeadScore(lead.id).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: () => {
        this.snackBar.open('Lead score yeniden hesaplandı', 'Close', { duration: 2000 });
        this.loadLeads(); // Refresh to show updated score
      },
      error: (error) => {
        console.error('Error recalculating score:', error);
        this.snackBar.open('Score hesaplama hatası', 'Close', { duration: 3000 });
      }
    });
  }

  convertLead(lead: Lead): void {
    const dialogRef = this.dialog.open(LeadConversionDialogComponent, {
      width: '600px',
      maxWidth: '90vw',
      data: { lead },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Refresh the leads list to show updated status
        this.loadLeads();

        // Show success message with created records
        let message = 'Lead başarıyla dönüştürüldü!';
        if (result.accountId && result.contactId && result.opportunityId) {
          message = 'Account, Contact ve Opportunity oluşturuldu!';
        } else if (result.accountId && result.contactId) {
          message = 'Account ve Contact oluşturuldu!';
        }

        this.snackBar.open(message, 'Tamam', {
          duration: 4000,
          panelClass: ['success-snackbar']
        });
      }
    });
  }

  showAnalytics(): void {
    const dialogRef = this.dialog.open(LeadAnalyticsDialogComponent, {
      width: '1000px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      disableClose: false
    });

    dialogRef.afterClosed().subscribe(() => {
      // Optional: Refresh data if needed
    });
  }

  // Keep existing methods with enhanced error handling
  makeCall(lead: Lead): void {
    if (lead.phone) {
      window.open(`tel:${lead.phone}`, '_self');
    }
  }

  sendEmail(lead: Lead): void {
    if (lead.email) {
      window.open(`mailto:${lead.email}`, '_self');
    }
  }
}
