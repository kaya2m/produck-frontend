import { Component, Input, Output, EventEmitter, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { SelectionModel } from '@angular/cdk/collections';

export interface TableColumn {
  key: string;
  header: string;
  type?: 'text' | 'number' | 'date' | 'boolean' | 'chip' | 'custom';
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  format?: (value: any, row?: any) => string;
  chipColors?: { [key: string]: string };
}

export interface TableAction {
  key: string;
  label: string;
  icon: string;
  color?: 'primary' | 'accent' | 'warn';
  condition?: (row: any) => boolean;
}

export interface TableFilter {
  [key: string]: any;
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatMenuModule,
    MatTooltipModule,
    MatChipsModule
  ],
  template: `
    <div class="data-table-container">
      <!-- Table Header -->
      <div class="table-header" *ngIf="showHeader">
        <div class="header-left">
          <h3 class="table-title" *ngIf="title">{{ title }}</h3>
          <span class="table-subtitle" *ngIf="subtitle">{{ subtitle }}</span>
        </div>

        <div class="header-actions">
          <!-- Global Search -->
          <mat-form-field appearance="outline" class="search-field" *ngIf="globalSearch">
            <mat-icon matPrefix>search</mat-icon>
            <input matInput
                   placeholder="Search..."
                   [(ngModel)]="searchTerm"
                   (input)="onGlobalSearch()"
                   class="search-input">
            <button mat-icon-button matSuffix *ngIf="searchTerm" (click)="clearSearch()">
              <mat-icon>close</mat-icon>
            </button>
          </mat-form-field>

          <!-- Custom Actions -->
          <ng-content select="[slot=header-actions]"></ng-content>

          <!-- Bulk Actions -->
          <button mat-button
                  [matMenuTriggerFor]="bulkMenu"
                  *ngIf="bulkActions.length > 0 && selection.hasValue()"
                  class="bulk-actions-btn">
            <mat-icon>more_vert</mat-icon>
            {{ selection.selected.length }} selected
          </button>
        </div>
      </div>

      <!-- Column Filters -->
      <div class="column-filters" *ngIf="showColumnFilters && filterableColumns().length > 0">
        <div class="filter-row">
          <div class="filter-item" *ngFor="let column of filterableColumns()">
            <mat-form-field appearance="outline" class="filter-field">
              <mat-label>{{ column.header }}</mat-label>
              <input matInput
                     [placeholder]="'Filter ' + column.header"
                     [(ngModel)]="columnFilters[column.key]"
                     (input)="onColumnFilter()">
            </mat-form-field>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div class="loading-state" *ngIf="loading">
        <mat-icon class="loading-icon">refresh</mat-icon>
        <p>Loading data...</p>
      </div>

      <!-- Empty State -->
      <div class="empty-state" *ngIf="!loading && data.length === 0">
        <mat-icon>{{ emptyStateIcon }}</mat-icon>
        <h3>{{ emptyStateTitle }}</h3>
        <p>{{ emptyStateMessage }}</p>
        <ng-content select="[slot=empty-actions]"></ng-content>
      </div>

      <!-- Data Table -->
      <div class="table-wrapper" *ngIf="!loading && data.length > 0">
        <table mat-table
               [dataSource]="data"
               matSort
               (matSortChange)="onSort($event)"
               class="data-table">

          <!-- Selection Column -->
          <ng-container matColumnDef="select" *ngIf="selectable">
            <th mat-header-cell *matHeaderCellDef class="select-header">
              <mat-checkbox
                [checked]="selection.hasValue() && isAllSelected()"
                [indeterminate]="selection.hasValue() && !isAllSelected()"
                (change)="$event ? toggleAllRows() : null">
              </mat-checkbox>
            </th>
            <td mat-cell *matCellDef="let row" class="select-cell">
              <mat-checkbox
                [checked]="selection.isSelected(row)"
                (change)="$event ? selection.toggle(row) : null">
              </mat-checkbox>
            </td>
          </ng-container>

          <!-- Data Columns -->
          <ng-container *ngFor="let column of columns" [matColumnDef]="column.key">
            <th mat-header-cell
                *matHeaderCellDef
                [mat-sort-header]="column.sortable ? column.key : ''"
                [style.width]="column.width"
                [style.text-align]="column.align || 'left'"
                class="data-header">
              {{ column.header }}
            </th>
            <td mat-cell
                *matCellDef="let row"
                [style.text-align]="column.align || 'left'"
                class="data-cell">

              <!-- Text Type -->
              <span *ngIf="!column.type || column.type === 'text'">
                {{ column.format ? column.format(getCellValue(row, column.key), row) : getCellValue(row, column.key) }}
              </span>

              <!-- Number Type -->
              <span *ngIf="column.type === 'number'" class="number-cell">
                {{ formatNumber(getCellValue(row, column.key), column.format) }}
              </span>

              <!-- Date Type -->
              <span *ngIf="column.type === 'date'" class="date-cell">
                {{ formatDate(getCellValue(row, column.key), column.format) }}
              </span>

              <!-- Boolean Type -->
              <mat-icon *ngIf="column.type === 'boolean'" class="boolean-icon"
                        [class.true]="getCellValue(row, column.key)"
                        [class.false]="!getCellValue(row, column.key)">
                {{ getCellValue(row, column.key) ? 'check_circle' : 'cancel' }}
              </mat-icon>

              <!-- Chip Type -->
              <mat-chip *ngIf="column.type === 'chip'"
                        [style.background-color]="getChipColor(column, getCellValue(row, column.key))"
                        class="status-chip">
                {{ getCellValue(row, column.key) }}
              </mat-chip>

              <!-- Custom Type -->
              <ng-container *ngIf="column.type === 'custom'">
                <ng-content select="[slot=custom-cell]" [ngTemplateOutlet]="customCellTemplate"
                           [ngTemplateOutletContext]="{ $implicit: row, column: column, value: getCellValue(row, column.key) }">
                </ng-content>
              </ng-container>
            </td>
          </ng-container>

          <!-- Actions Column -->
          <ng-container matColumnDef="actions" *ngIf="actions.length > 0">
            <th mat-header-cell *matHeaderCellDef class="actions-header">Actions</th>
            <td mat-cell *matCellDef="let row" class="actions-cell">
              <div class="action-buttons">
                <button mat-icon-button
                        *ngFor="let action of getAvailableActions(row)"
                        [color]="action.color"
                        [matTooltip]="action.label"
                        (click)="onAction(action.key, row)"
                        class="action-btn">
                  <mat-icon>{{ action.icon }}</mat-icon>
                </button>
              </div>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns; sticky: stickyHeader"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"
              [class.selected]="selection.isSelected(row)"
              (click)="onRowClick(row)"></tr>
        </table>
      </div>

      <!-- Pagination -->
      <mat-paginator
        *ngIf="!loading && data.length > 0 && pagination"
        [pageSize]="pageSize"
        [pageSizeOptions]="pageSizeOptions"
        [length]="totalCount"
        [pageIndex]="pageIndex"
        (page)="onPageChange($event)"
        showFirstLastButtons
        class="table-paginator">
      </mat-paginator>
    </div>

    <!-- Bulk Actions Menu -->
    <mat-menu #bulkMenu="matMenu">
      <button mat-menu-item
              *ngFor="let action of bulkActions"
              (click)="onBulkAction(action.key)">
        <mat-icon>{{ action.icon }}</mat-icon>
        <span>{{ action.label }}</span>
      </button>
    </mat-menu>
  `,
  styles: [`
    .data-table-container {
      background: white;
      border-radius: 8px;
      overflow: hidden;
    }

    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px;
      border-bottom: 1px solid #e0e0e0;
    }

    .header-left {
      flex: 1;
    }

    .table-title {
      margin: 0 0 4px 0;
      font-size: 20px;
      font-weight: 600;
      color: #333;
    }

    .table-subtitle {
      color: #666;
      font-size: 14px;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .search-field {
      width: 300px;
    }

    .search-input {
      font-size: 14px;
    }

    .bulk-actions-btn {
      background: #e3f2fd;
      color: #1976d2;
    }

    .column-filters {
      padding: 16px 24px;
      background: #fafafa;
      border-bottom: 1px solid #e0e0e0;
    }

    .filter-row {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
    }

    .filter-item {
      min-width: 200px;
    }

    .filter-field {
      width: 100%;
    }

    .loading-state, .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px 24px;
      text-align: center;
      color: #666;
    }

    .loading-state mat-icon, .empty-state mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
      color: #ccc;
    }

    .loading-icon {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    .empty-state h3 {
      margin: 0 0 8px 0;
      font-size: 18px;
      font-weight: 500;
      color: #333;
    }

    .empty-state p {
      margin: 0 0 24px 0;
      font-size: 14px;
    }

    .table-wrapper {
      overflow-x: auto;
    }

    .data-table {
      width: 100%;
      background: white;
    }

    .select-header, .select-cell {
      width: 48px;
      padding-right: 8px;
    }

    .data-header {
      font-weight: 600;
      color: #333;
      padding: 16px 12px;
    }

    .data-cell {
      padding: 16px 12px;
      border-bottom: 1px solid #f0f0f0;
    }

    .number-cell {
      font-family: monospace;
      font-weight: 500;
    }

    .date-cell {
      font-size: 13px;
      color: #666;
    }

    .boolean-icon.true {
      color: #4caf50;
    }

    .boolean-icon.false {
      color: #f44336;
    }

    .status-chip {
      font-size: 12px;
      font-weight: 500;
      height: 24px;
      color: white;
    }

    .actions-header {
      width: 120px;
      text-align: right;
    }

    .actions-cell {
      width: 120px;
    }

    .action-buttons {
      display: flex;
      justify-content: flex-end;
      gap: 4px;
    }

    .action-btn {
      width: 32px;
      height: 32px;
    }

    .action-btn mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .table-paginator {
      border-top: 1px solid #e0e0e0;
    }

    .data-table tr.selected {
      background: #e3f2fd;
    }

    .data-table tr:hover {
      background: #f5f5f5;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .table-header {
        flex-direction: column;
        align-items: stretch;
        gap: 16px;
      }

      .header-actions {
        justify-content: flex-end;
      }

      .search-field {
        width: 100%;
      }

      .filter-row {
        flex-direction: column;
      }

      .filter-item {
        min-width: unset;
      }
    }
  `]
})
export class DataTableComponent implements OnInit {
  @Input() data: any[] = [];
  @Input() columns: TableColumn[] = [];
  @Input() actions: TableAction[] = [];
  @Input() bulkActions: TableAction[] = [];
  @Input() loading = false;
  @Input() selectable = false;
  @Input() pagination = true;
  @Input() pageSize = 25;
  @Input() pageSizeOptions = [10, 25, 50, 100];
  @Input() totalCount = 0;
  @Input() pageIndex = 0;
  @Input() globalSearch = true;
  @Input() showColumnFilters = false;
  @Input() showHeader = true;
  @Input() stickyHeader = false;
  @Input() title?: string;
  @Input() subtitle?: string;
  @Input() emptyStateIcon = 'inbox';
  @Input() emptyStateTitle = 'No data found';
  @Input() emptyStateMessage = 'There are no records to display';
  @Input() customCellTemplate?: any;

  @Output() sortChange = new EventEmitter<Sort>();
  @Output() pageChange = new EventEmitter<PageEvent>();
  @Output() filterChange = new EventEmitter<TableFilter>();
  @Output() actionClick = new EventEmitter<{ action: string; row: any }>();
  @Output() bulkActionClick = new EventEmitter<{ action: string; rows: any[] }>();
  @Output() rowClick = new EventEmitter<any>();
  @Output() selectionChange = new EventEmitter<any[]>();

  searchTerm = '';
  columnFilters: TableFilter = {};
  selection = new SelectionModel<any>(true, []);

  displayedColumns = computed(() => {
    const columns = [];
    if (this.selectable) columns.push('select');
    columns.push(...this.columns.map(col => col.key));
    if (this.actions.length > 0) columns.push('actions');
    return columns;
  });

  filterableColumns = computed(() =>
    this.columns.filter(col => col.filterable !== false)
  );

  ngOnInit(): void {
    this.selection.changed.subscribe(() => {
      this.selectionChange.emit(this.selection.selected);
    });
  }

  onSort(sort: Sort): void {
    this.sortChange.emit(sort);
  }

  onPageChange(event: PageEvent): void {
    this.pageChange.emit(event);
  }

  onGlobalSearch(): void {
    this.emitFilterChange();
  }

  onColumnFilter(): void {
    this.emitFilterChange();
  }

  private emitFilterChange(): void {
    const filters: TableFilter = {
      globalSearch: this.searchTerm,
      ...this.columnFilters
    };
    this.filterChange.emit(filters);
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.onGlobalSearch();
  }

  onAction(action: string, row: any): void {
    this.actionClick.emit({ action, row });
  }

  onBulkAction(action: string): void {
    this.bulkActionClick.emit({ action, rows: this.selection.selected });
  }

  onRowClick(row: any): void {
    this.rowClick.emit(row);
  }

  isAllSelected(): boolean {
    return this.selection.selected.length === this.data.length;
  }

  toggleAllRows(): void {
    if (this.isAllSelected()) {
      this.selection.clear();
    } else {
      this.selection.select(...this.data);
    }
  }

  getAvailableActions(row: any): TableAction[] {
    return this.actions.filter(action =>
      !action.condition || action.condition(row)
    );
  }

  getCellValue(row: any, key: string): any {
    return key.split('.').reduce((obj, prop) => obj?.[prop], row);
  }

  formatNumber(value: any, formatter?: (value: any) => string): string {
    if (formatter) return formatter(value);
    if (typeof value === 'number') {
      return value.toLocaleString();
    }
    return value?.toString() || '';
  }

  formatDate(value: any, formatter?: (value: any) => string): string {
    if (formatter) return formatter(value);
    if (value) {
      const date = new Date(value);
      return date.toLocaleDateString();
    }
    return '';
  }

  getChipColor(column: TableColumn, value: any): string {
    if (column.chipColors && value) {
      return column.chipColors[value] || '#666';
    }
    return '#666';
  }
}