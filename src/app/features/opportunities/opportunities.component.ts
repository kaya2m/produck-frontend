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
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatBadgeModule } from '@angular/material/badge';
import { finalize } from 'rxjs/operators';

import { DataGridComponent, DataGridColumn, DataGridAction, DataGridConfig, DataGridPageChange } from '../../shared/components/data-grid/data-grid.component';
import { CellRendererHelpers } from '../../shared/components/data-grid/cell-renderers';
import { OpportunityService } from '../../core/services/opportunity.service';
import { AuthService } from '../../core/services/auth.service';
import {
  Opportunity,
  OpportunityListDto,
  OpportunityFilter,
  OpportunityCreateDto,
  OpportunityUpdateDto,
  SalesStage,
  OpportunityType,
  OpportunityStatus,
  HealthStatus,
  PriorityLevel,
  OpportunityDashboardMetrics,
  SalesPipelineStageDto
} from '../../core/models/opportunity.models';
import { PaginatedResponse } from '../../core/models/api-response.models';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { OpportunityFormDialogComponent } from './components/opportunity-form-dialog.component';
import { StageChangeDialogComponent } from './components/stage-change-dialog.component';

@Component({
  selector: 'app-opportunities',
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
    MatProgressBarModule,
    MatBadgeModule,
    DataGridComponent
  ],
  template: `
    <div class="page-container">
      <!-- Header -->
      <div class="page-header">
        <div class="title-section">
          <h1>
            <mat-icon>trending_up</mat-icon>
            Opportunities
          </h1>
          <p>Sales pipeline ve deal management</p>
        </div>
        <div class="actions-section">
          <button mat-raised-button color="primary" (click)="openCreateDialog()">
            <mat-icon>add</mat-icon>
            Yeni Opportunity
          </button>
          <button mat-raised-button color="accent" (click)="bulkActions()">
            <mat-icon>checklist</mat-icon>
            Toplu İşlem
          </button>
          <button mat-icon-button matTooltip="Excel'e Aktar" (click)="exportToExcel()">
            <mat-icon>download</mat-icon>
          </button>
          <button mat-icon-button matTooltip="Yenile" (click)="refresh()">
            <mat-icon>refresh</mat-icon>
          </button>
        </div>
      </div>

      <!-- Data Grid -->
      <div class="grid-section">
        <app-data-grid
          [data]="opportunities()"
          [columns]="gridColumns"
          [actions]="gridActions"
          [config]="gridConfig"
          [loading]="loading()"
          [totalCount]="totalCount()"
          [pageSize]="pageSize()"
          [currentPage]="pageNumber()"
          (pageChanged)="onPageChange($event)"
          (sortChange)="onSortChange($event)"
          (rowClick)="onRowClick($event)">
        </app-data-grid>
      </div>
    </div>
  `,
  styles: [`
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

    .title-section p {
      margin: 4px 0 0 0;
      font-size: 14px;
      color: #64748b;
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

    /* Responsive */
    @media (max-width: 768px) {
      .page-container {
        padding: 16px;
      }

      .page-header {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
      }

      .actions-section {
        justify-content: flex-start;
      }
    }
  `]
})
export class OpportunitiesComponent implements OnInit {
  private opportunityService = inject(OpportunityService);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private dialog = inject(MatDialog);

  // State
  opportunities = signal<OpportunityListDto[]>([]);
  loading = signal(true);
  totalCount = signal(0);

  // Pagination
  pageNumber = signal(1);
  pageSize = signal(15);

  // Filter
  filter = signal<OpportunityFilter>({
    pageNumber: 1,
    pageSize: 15,
    search: '',
    sortBy: 'expectedCloseDate',
    sortDirection: 'ASC'
  });

  // Grid Configuration - Unified Info Column Pattern
  gridColumns: DataGridColumn[] = [
    {
      field: 'opportunityInfo',
      headerName: 'Opportunity Bilgileri',
      flex: 1,
      minWidth: 350,
      pinned: 'left',
      cellRenderer: (params: any) => {
        const opportunity = params.data;
        const priorityColor = this.getPriorityColor(opportunity.priorityLevel);
        const healthColor = this.getHealthColor(opportunity.healthStatus);

        return `
          <div style="display: flex; align-items: center; gap: 12px; padding: 8px 0;">
            <div style="width: 4px; height: 40px; background: ${priorityColor}; border-radius: 2px;"></div>
            <div style="flex: 1;">
              <div style="font-weight: 600; color: #1e293b; margin-bottom: 4px;">${opportunity.name}</div>
              <div style="font-size: 13px; color: #64748b; margin-bottom: 2px;">${opportunity.accountName}</div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 600; background: ${healthColor.bg}; color: ${healthColor.text};">
                  ${opportunity.healthStatus}
                </span>
                ${opportunity.isOverdue ? '<span style="padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 600; background: #fef2f2; color: #dc2626;">GECIKEN</span>' : ''}
                ${opportunity.isClosingSoon ? '<span style="padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 600; background: #fef3c7; color: #d97706;">YAKINDA</span>' : ''}
              </div>
            </div>
          </div>
        `;
      },
      filter: 'agTextColumnFilter',
      hide: false
    },
    {
      field: 'amount',
      headerName: 'Tutar',
      width: 140,
      cellRenderer: (params: any) => {
        const amount = params.value || 0;
        const currency = params.data.currency || 'TRY';
        return `<div style="font-weight: 600; color: #059669;">${amount.toLocaleString('tr-TR')} ${currency}</div>`;
      },
      filter: 'agNumberColumnFilter',
      sortable: true,
      hide: false
    },
    {
      field: 'salesStageName',
      headerName: 'Sales Stage',
      width: 140,
      cellRenderer: (params: any) => {
        const stage = params.value;
        const probability = params.data.probability || 0;
        const stageType = params.data.stageType;

        let stageColor = '#64748b';
        if (stageType === 'Won') stageColor = '#10b981';
        else if (stageType === 'Lost') stageColor = '#ef4444';
        else if (probability >= 75) stageColor = '#3b82f6';

        return `
          <div style="display: flex; flex-direction: column; gap: 4px;">
            <span style="font-weight: 500; color: ${stageColor};">${stage}</span>
            <span style="font-size: 12px; color: #64748b;">${probability}% olasılık</span>
          </div>
        `;
      },
      filter: 'agTextColumnFilter',
      hide: false
    },
    {
      field: 'expectedCloseDate',
      headerName: 'Kapanış Tarihi',
      width: 140,
      cellRenderer: CellRendererHelpers.createDateRenderer(),
      filter: 'agDateColumnFilter',
      sortable: true,
      hide: false
    },
    {
      field: 'ownerUserName',
      headerName: 'Sorumlu',
      width: 120,
      cellRenderer: (params: any) => {
        const owner = params.value;
        if (!owner || owner === 'Atanmamış') {
          return `<span style="color: #ef4444; font-style: italic;">Atanmamış</span>`;
        }
        return `
          <div style="display: flex; align-items: center; gap: 6px;">
            <mat-icon style="font-size: 16px; width: 16px; height: 16px; color: #64748b;">person</mat-icon>
            <span style="font-size: 13px; color: #374151;">${owner}</span>
          </div>
        `;
      },
      filter: 'agTextColumnFilter',
      hide: false
    },
    {
      field: 'probabilityWeightedAmount',
      headerName: 'Ağırlıklı Tutar',
      width: 140,
      cellRenderer: (params: any) => {
        const amount = params.data.amount || 0;
        const probability = params.data.probability || 0;
        const weightedAmount = amount * (probability / 100);
        const currency = params.data.currency || 'TRY';
        return `<div style="font-weight: 500; color: #7c3aed;">${weightedAmount.toLocaleString('tr-TR')} ${currency}</div>`;
      },
      filter: 'agNumberColumnFilter',
      sortable: true,
      hide: true
    },
    {
      field: 'createdDate',
      headerName: 'Oluşturma Tarihi',
      width: 140,
      cellRenderer: CellRendererHelpers.createDateRenderer(),
      filter: 'agDateColumnFilter',
      sortable: true,
      hide: true
    },
    {
      field: 'lastModifiedDate',
      headerName: 'Son Güncelleme',
      width: 140,
      cellRenderer: CellRendererHelpers.createDateRenderer(),
      filter: 'agDateColumnFilter',
      sortable: true,
      hide: true
    }
  ];

  gridActions: DataGridAction[] = [
    {
      icon: 'visibility',
      tooltip: 'Detayları Görüntüle',
      color: undefined, // Default
      click: (row: OpportunityListDto) => this.viewOpportunityDetails(row)
    },
    {
      icon: 'edit',
      tooltip: 'Düzenle',
      color: 'primary',
      click: (row: OpportunityListDto) => this.editOpportunity(row)
    },
    {
      icon: 'swap_horiz',
      tooltip: 'Stage Değiştir',
      color: 'accent',
      click: (row: OpportunityListDto) => this.changeStage(row)
    },
    {
      icon: 'check_circle',
      tooltip: 'Won Olarak İşaretle',
      color: 'primary',
      click: (row: OpportunityListDto) => this.markAsWon(row)
    },
    {
      icon: 'cancel',
      tooltip: 'Lost Olarak İşaretle',
      color: 'warn',
      click: (row: OpportunityListDto) => this.markAsLost(row)
    }
  ];

  gridConfig: DataGridConfig = {
    enableContextMenu: true,
    enableExport: true,
    enableSelection: true,
    enablePagination: true,
    paginationPageSize: 15,
    rowHeight: 60,
    enableColumnResize: true,
    enableColumnReorder: true,
    enableAutoSizeColumns: false
  };

  ngOnInit(): void {
    this.loadInitialData();
  }

  private loadInitialData(): void {
    this.loadOpportunities();
  }

  private loadOpportunities(): void {
    this.loading.set(true);

    this.opportunityService.getOpportunities(this.filter()).subscribe({
      next: (response: PaginatedResponse<OpportunityListDto>) => {
        this.opportunities.set(response.items || []);
        this.totalCount.set(response.totalCount || 0);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading opportunities:', error);
        this.snackBar.open('Opportunities yüklenirken hata oluştu', 'Tamam', { duration: 3000 });
        this.loading.set(false);
      }
    });
  }

  // Pagination
  onPageChange(event: DataGridPageChange): void {
    const page = event.pageNumber;
    this.pageNumber.set(page);
    this.filter.update(f => ({ ...f, pageNumber: page }));
    this.loadOpportunities();
  }

  onRowClick(event: any): void {
    const opportunity = event.data as OpportunityListDto;
    this.viewOpportunityDetails(opportunity);
  }

  onSortChange(sort: any): void {
    this.filter.update(f => ({
      ...f,
      sortBy: sort.field || 'expectedCloseDate',
      sortDirection: sort.sort?.toUpperCase() || 'ASC'
    }));
    this.pageNumber.set(1);
    this.loadOpportunities();
  }

  // Action Methods
  openCreateDialog(): void {
    const dialogRef = this.dialog.open(OpportunityFormDialogComponent, {
      width: '700px',
      data: { isEdit: false }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.snackBar.open('Opportunity başarıyla oluşturuldu!', 'Tamam', { duration: 3000 });
        this.loadOpportunities();
      }
    });
  }

  viewOpportunityDetails(opportunity: OpportunityListDto): void {
    console.log('Viewing opportunity details:', opportunity);
    // TODO: Implement opportunity details view
  }

  editOpportunity(opportunity: OpportunityListDto): void {
    this.opportunityService.getOpportunityById(opportunity.id).subscribe({
      next: (fullOpportunity) => {
        const dialogRef = this.dialog.open(OpportunityFormDialogComponent, {
          width: '700px',
          data: {
            opportunity: fullOpportunity,
            isEdit: true
          }
        });

        dialogRef.afterClosed().subscribe(result => {
          if (result) {
            this.snackBar.open('Opportunity başarıyla güncellendi!', 'Tamam', { duration: 3000 });
            this.loadOpportunities();
          }
        });
      },
      error: (error) => {
        this.snackBar.open('Opportunity detayları yüklenirken hata oluştu', 'Tamam', { duration: 3000 });
        console.error('Error loading opportunity details:', error);
      }
    });
  }

  changeStage(opportunity: OpportunityListDto): void {
    this.opportunityService.getSalesStages().subscribe({
      next: (stages) => {
        this.opportunityService.getOpportunityById(opportunity.id).subscribe({
          next: (fullOpportunity) => {
            const dialogRef = this.dialog.open(StageChangeDialogComponent, {
              width: '600px',
              data: {
                opportunity: fullOpportunity,
                availableStages: stages
              }
            });

            dialogRef.afterClosed().subscribe(result => {
              if (result) {
                this.snackBar.open('Opportunity aşaması başarıyla güncellendi!', 'Tamam', { duration: 3000 });
                this.loadOpportunities();
              }
            });
          },
          error: (error) => {
            this.snackBar.open('Opportunity detayları yüklenirken hata oluştu', 'Tamam', { duration: 3000 });
            console.error('Error loading opportunity details:', error);
          }
        });
      },
      error: (error) => {
        this.snackBar.open('Sales stages yüklenirken hata oluştu', 'Tamam', { duration: 3000 });
        console.error('Error loading sales stages:', error);
      }
    });
  }

  markAsWon(opportunity: OpportunityListDto): void {
    this.opportunityService.getSalesStages().subscribe({
      next: (stages) => {
        const wonStage = stages.find(s => s.stageType === 'Won');
        if (!wonStage) {
          this.snackBar.open('Won aşaması bulunamadı', 'Tamam', { duration: 3000 });
          return;
        }

        this.opportunityService.getOpportunityById(opportunity.id).subscribe({
          next: (fullOpportunity) => {
            const dialogRef = this.dialog.open(StageChangeDialogComponent, {
              width: '600px',
              data: {
                opportunity: fullOpportunity,
                availableStages: [wonStage]
              }
            });

            dialogRef.afterClosed().subscribe(result => {
              if (result) {
                this.snackBar.open('Opportunity kazanıldı olarak işaretlendi!', 'Tamam', { duration: 4000 });
                this.loadOpportunities();
              }
            });
          },
          error: (error) => {
            this.snackBar.open('Opportunity detayları yüklenirken hata oluştu', 'Tamam', { duration: 3000 });
            console.error('Error loading opportunity details:', error);
          }
        });
      },
      error: (error) => {
        this.snackBar.open('Sales stages yüklenirken hata oluştu', 'Tamam', { duration: 3000 });
        console.error('Error loading sales stages:', error);
      }
    });
  }

  markAsLost(opportunity: OpportunityListDto): void {
    this.opportunityService.getSalesStages().subscribe({
      next: (stages) => {
        const lostStage = stages.find(s => s.stageType === 'Lost');
        if (!lostStage) {
          this.snackBar.open('Lost aşaması bulunamadı', 'Tamam', { duration: 3000 });
          return;
        }

        this.opportunityService.getOpportunityById(opportunity.id).subscribe({
          next: (fullOpportunity) => {
            const dialogRef = this.dialog.open(StageChangeDialogComponent, {
              width: '600px',
              data: {
                opportunity: fullOpportunity,
                availableStages: [lostStage]
              }
            });

            dialogRef.afterClosed().subscribe(result => {
              if (result) {
                this.snackBar.open('Opportunity kaybedildi olarak işaretlendi', 'Tamam', { duration: 3000 });
                this.loadOpportunities();
              }
            });
          },
          error: (error) => {
            this.snackBar.open('Opportunity detayları yüklenirken hata oluştu', 'Tamam', { duration: 3000 });
            console.error('Error loading opportunity details:', error);
          }
        });
      },
      error: (error) => {
        this.snackBar.open('Sales stages yüklenirken hata oluştu', 'Tamam', { duration: 3000 });
        console.error('Error loading sales stages:', error);
      }
    });
  }

  bulkActions(): void {
    this.snackBar.open('Toplu işlemler yakında eklenecek', 'Tamam', { duration: 3000 });
  }

  exportToExcel(): void {
    this.opportunityService.exportOpportunities(this.filter()).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `opportunities_${new Date().toISOString().split('T')[0]}.xlsx`;
        link.click();
        window.URL.revokeObjectURL(url);
        this.snackBar.open('Excel dosyası indirildi!', 'Tamam', { duration: 3000 });
      },
      error: (error) => {
        console.error('Error exporting opportunities:', error);
        this.snackBar.open('Excel export sırasında hata oluştu', 'Tamam', { duration: 5000 });
      }
    });
  }

  refresh(): void {
    this.loadOpportunities();
  }

  // Helper Methods
  private getPriorityColor(priority: PriorityLevel): string {
    switch (priority) {
      case PriorityLevel.Critical: return '#dc2626';
      case PriorityLevel.High: return '#ea580c';
      case PriorityLevel.Medium: return '#ca8a04';
      case PriorityLevel.Low: return '#16a34a';
      default: return '#64748b';
    }
  }

  private getHealthColor(health: HealthStatus): { bg: string; text: string } {
    switch (health) {
      case HealthStatus.Excellent:
        return { bg: '#dcfce7', text: '#166534' };
      case HealthStatus.Good:
        return { bg: '#dbeafe', text: '#1d4ed8' };
      case HealthStatus.Fair:
        return { bg: '#fef3c7', text: '#92400e' };
      case HealthStatus.Poor:
        return { bg: '#fed7aa', text: '#c2410c' };
      case HealthStatus.Critical:
        return { bg: '#fecaca', text: '#dc2626' };
      default:
        return { bg: '#f1f5f9', text: '#475569' };
    }
  }
}