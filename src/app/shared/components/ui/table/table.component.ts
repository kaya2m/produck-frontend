import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { SelectionModel } from '@angular/cdk/collections';

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  type?: 'text' | 'number' | 'date' | 'currency' | 'badge' | 'actions' | 'custom';
  width?: string;
  align?: 'left' | 'center' | 'right';
  sticky?: 'start' | 'end';
  template?: TemplateRef<any>;
  format?: (value: any) => string;
  badgeColor?: (value: any) => 'primary' | 'accent' | 'warn' | 'success' | 'info';
}

export interface TableAction {
  icon: string;
  label: string;
  action: string;
  color?: 'primary' | 'accent' | 'warn';
  disabled?: (row: any) => boolean;
  visible?: (row: any) => boolean;
}

export type TableSize = 'compact' | 'standard' | 'comfortable';
export type TableVariant = 'default' | 'striped' | 'bordered' | 'borderless';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatCheckboxModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatCardModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="table-container" [class]="containerClasses">
      <!-- Table Toolbar -->
      <div class="table-toolbar" *ngIf="showToolbar">
        <div class="table-title-section">
          <h3 *ngIf="title" class="table-title">{{ title }}</h3>
          <span *ngIf="subtitle" class="table-subtitle">{{ subtitle }}</span>
        </div>

        <div class="table-actions">
          <!-- Selection Info -->
          <div *ngIf="selectable && selection.hasValue()" class="selection-info">
            {{ selection.selected.length }} selected
          </div>

          <!-- Custom Toolbar Actions -->
          <ng-content select="[slot=toolbar-actions]"></ng-content>
        </div>
      </div>

      <!-- Table Wrapper -->
      <div class="table-wrapper" [class.loading]="loading">
        <!-- Loading Overlay -->
        <div *ngIf="loading" class="table-loading-overlay">
          <mat-spinner diameter="40"></mat-spinner>
          <span class="loading-text">{{ loadingText || 'Loading...' }}</span>
        </div>

        <!-- Empty State -->
        <div *ngIf="!loading && (!data || data.length === 0)" class="table-empty-state">
          <mat-icon class="empty-icon">{{ emptyStateIcon || 'inbox' }}</mat-icon>
          <h4 class="empty-title">{{ emptyStateTitle || 'No data available' }}</h4>
          <p class="empty-message">{{ emptyStateMessage || 'There are no items to display.' }}</p>
          <ng-content select="[slot=empty-actions]"></ng-content>
        </div>

        <!-- Data Table -->
        <table *ngIf="!loading && data && data.length > 0"
               mat-table
               [dataSource]="data"
               [class]="tableClasses"
               matSort
               (matSortChange)="onSortChange($event)">

          <!-- Selection Column -->
          <ng-container *ngIf="selectable" matColumnDef="select">
            <th mat-header-cell *matHeaderCellDef class="select-column">
              <mat-checkbox
                [checked]="selection.hasValue() && isAllSelected()"
                [indeterminate]="selection.hasValue() && !isAllSelected()"
                (change)="$event ? masterToggle() : null">
              </mat-checkbox>
            </th>
            <td mat-cell *matCellDef="let row" class="select-column">
              <mat-checkbox
                [checked]="selection.isSelected(row)"
                (click)="$event.stopPropagation()"
                (change)="$event ? selection.toggle(row) : null">
              </mat-checkbox>
            </td>
          </ng-container>

          <!-- Data Columns -->
          <ng-container *ngFor="let column of columns" [matColumnDef]="column.key">
            @if (column.sortable) {
              <th mat-header-cell
                  *matHeaderCellDef
                  [mat-sort-header]="column.key"
                  [class]="'column-' + column.align"
                  [style.width]="column.width"
                  class="sortable">
                {{ column.label }}
              </th>
            } @else {
              <th mat-header-cell
                  *matHeaderCellDef
                  [class]="'column-' + column.align"
                  [style.width]="column.width">
                {{ column.label }}
              </th>
            }
            <td mat-cell
                *matCellDef="let row"
                [class]="'column-' + column.align"
                [style.width]="column.width">

              <!-- Custom Template -->
              <ng-container *ngIf="column.template">
                <ng-container *ngTemplateOutlet="column.template; context: { $implicit: row, value: getValue(row, column.key) }">
                </ng-container>
              </ng-container>

              <!-- Built-in Types -->
              <ng-container *ngIf="!column.template">
                <!-- Text -->
                <span *ngIf="column.type === 'text' || !column.type">
                  {{ getFormattedValue(row, column) }}
                </span>

                <!-- Number -->
                <span *ngIf="column.type === 'number'" class="number-cell">
                  {{ getFormattedValue(row, column) }}
                </span>

                <!-- Date -->
                <span *ngIf="column.type === 'date'" class="date-cell">
                  {{ getFormattedValue(row, column) }}
                </span>

                <!-- Currency -->
                <span *ngIf="column.type === 'currency'" class="currency-cell">
                  {{ getFormattedValue(row, column) }}
                </span>

                <!-- Badge -->
                <span *ngIf="column.type === 'badge'"
                      class="badge"
                      [class]="'badge-' + getBadgeColor(row, column)">
                  {{ getFormattedValue(row, column) }}
                </span>

                <!-- Actions -->
                <div *ngIf="column.type === 'actions'" class="actions-cell">
                  <button *ngFor="let action of getVisibleActions(row)"
                          mat-icon-button
                          [color]="action.color"
                          [disabled]="isActionDisabled(row, action)"
                          [matTooltip]="action.label"
                          (click)="onActionClick(action.action, row)">
                    <mat-icon>{{ action.icon }}</mat-icon>
                  </button>
                </div>
              </ng-container>
            </td>
          </ng-container>

          <!-- Row Actions Column -->
          <ng-container *ngIf="rowActions && rowActions.length > 0" matColumnDef="rowActions">
            <th mat-header-cell *matHeaderCellDef class="actions-column"></th>
            <td mat-cell *matCellDef="let row" class="actions-column">
              <button mat-icon-button [matMenuTriggerFor]="actionsMenu">
                <mat-icon>more_vert</mat-icon>
              </button>
              <mat-menu #actionsMenu="matMenu">
                <button *ngFor="let action of getVisibleActions(row)"
                        mat-menu-item
                        [disabled]="isActionDisabled(row, action)"
                        (click)="onActionClick(action.action, row)">
                  <mat-icon>{{ action.icon }}</mat-icon>
                  <span>{{ action.label }}</span>
                </button>
              </mat-menu>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns; sticky: stickyHeader"></tr>
          <tr mat-row
              *matRowDef="let row; columns: displayedColumns;"
              [class.clickable]="clickableRows"
              (click)="onRowClick(row)"
              (contextmenu)="enableContextMenu ? onContextMenu($event, row) : null"></tr>
        </table>
      </div>

      <!-- Paginator -->
      <mat-paginator *ngIf="paginator && !loading && data && data.length > 0"
                     [length]="totalItems"
                     [pageSize]="pageSize"
                     [pageSizeOptions]="pageSizeOptions"
                     [pageIndex]="pageIndex"
                     [showFirstLastButtons]="showFirstLastButtons"
                     (page)="onPageChange($event)">
      </mat-paginator>
    </div>
  `,
  styles: [`
    .table-container {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
    }

    /* Variants */
    .table-default {
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
    }

    .table-card {
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
    }

    /* Toolbar */
    .table-toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 24px;
      border-bottom: 1px solid #e5e7eb;
      background: #fafafa;
    }

    .table-title-section {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .table-title {
      margin: 0;
      font-size: 1.125rem;
      font-weight: 600;
      color: #111827;
    }

    .table-subtitle {
      font-size: 0.875rem;
      color: #6b7280;
    }

    .table-actions {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .selection-info {
      font-size: 0.875rem;
      color: #6b7280;
      padding: 8px 12px;
      background: #f3f4f6;
      border-radius: 6px;
    }

    /* Table Wrapper */
    .table-wrapper {
      position: relative;
      flex: 1;
      overflow: auto;
    }

    .table-wrapper.loading {
      min-height: 300px;
    }

    /* Loading */
    .table-loading-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.8);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 16px;
      z-index: 10;
    }

    .loading-text {
      font-size: 0.875rem;
      color: #6b7280;
    }

    /* Empty State */
    .table-empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px 24px;
      text-align: center;
    }

    .empty-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #d1d5db;
      margin-bottom: 16px;
    }

    .empty-title {
      margin: 0 0 8px 0;
      font-size: 1.125rem;
      font-weight: 600;
      color: #374151;
    }

    .empty-message {
      margin: 0 0 24px 0;
      font-size: 0.875rem;
      color: #6b7280;
      max-width: 400px;
    }

    /* Table */
    .mat-mdc-table {
      width: 100%;
    }

    /* Size Variants */
    .table-compact .mat-mdc-cell,
    .table-compact .mat-mdc-header-cell {
      padding: 8px 16px;
      font-size: 0.875rem;
    }

    .table-standard .mat-mdc-cell,
    .table-standard .mat-mdc-header-cell {
      padding: 12px 16px;
      font-size: 1rem;
    }

    .table-comfortable .mat-mdc-cell,
    .table-comfortable .mat-mdc-header-cell {
      padding: 16px 24px;
      font-size: 1rem;
    }

    /* Style Variants */
    .table-striped .mat-mdc-row:nth-child(even) {
      background-color: #f9fafb;
    }

    .table-bordered {
      border: 1px solid #e5e7eb;
    }

    .table-bordered .mat-mdc-cell,
    .table-bordered .mat-mdc-header-cell {
      border-right: 1px solid #e5e7eb;
    }

    .table-borderless .mat-mdc-header-row {
      border-bottom: none;
    }

    /* Column Alignment */
    .column-left {
      text-align: left;
    }

    .column-center {
      text-align: center;
    }

    .column-right {
      text-align: right;
    }

    /* Cell Types */
    .number-cell {
      font-family: 'Roboto Mono', monospace;
      font-weight: 500;
    }

    .currency-cell {
      font-family: 'Roboto Mono', monospace;
      font-weight: 600;
      color: #059669;
    }

    .date-cell {
      color: #6b7280;
      font-size: 0.875rem;
    }

    /* Badge */
    .badge {
      display: inline-flex;
      align-items: center;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .badge-primary {
      background-color: #dbeafe;
      color: #1e40af;
    }

    .badge-accent {
      background-color: #fce7f3;
      color: #be185d;
    }

    .badge-warn {
      background-color: #fed7d7;
      color: #c53030;
    }

    .badge-success {
      background-color: #d1fae5;
      color: #065f46;
    }

    .badge-info {
      background-color: #dbeafe;
      color: #1e40af;
    }

    /* Actions */
    .actions-cell {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .actions-column {
      width: 48px;
      padding-right: 8px;
    }

    .select-column {
      width: 48px;
      padding-left: 8px;
    }

    /* Row Hover */
    .mat-mdc-row:hover {
      background-color: #f9fafb;
    }

    .mat-mdc-row.clickable {
      cursor: pointer;
    }

    .mat-mdc-row.clickable:hover {
      background-color: #f3f4f6;
    }

    /* Sticky */
    .mat-mdc-header-cell.mat-column-select,
    .mat-mdc-cell.mat-column-select {
      position: sticky;
      left: 0;
      background: white;
      z-index: 1;
    }

    .mat-mdc-header-cell.mat-column-rowActions,
    .mat-mdc-cell.mat-column-rowActions {
      position: sticky;
      right: 0;
      background: white;
      z-index: 1;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .table-toolbar {
        padding: 12px 16px;
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
      }

      .table-actions {
        width: 100%;
        justify-content: space-between;
      }

      .mat-mdc-cell,
      .mat-mdc-header-cell {
        padding: 8px 12px;
        font-size: 0.875rem;
      }
    }
  `]
})
export class TableComponent {
  @Input() title?: string;
  @Input() subtitle?: string;
  @Input() columns: TableColumn[] = [];
  @Input() data: any[] = [];
  @Input() loading = false;
  @Input() loadingText?: string;
  @Input() size: TableSize = 'standard';
  @Input() variant: TableVariant = 'default';
  @Input() selectable = false;
  @Input() clickableRows = false;
  @Input() stickyHeader = false;
  @Input() showToolbar = true;
  @Input() paginator = false;
  @Input() pageSize = 10;
  @Input() pageSizeOptions = [5, 10, 25, 50, 100];
  @Input() pageIndex = 0;
  @Input() totalItems = 0;
  @Input() showFirstLastButtons = true;
  @Input() rowActions?: TableAction[];
  @Input() emptyStateIcon?: string;
  @Input() emptyStateTitle?: string;
  @Input() emptyStateMessage?: string;
  @Input() enableContextMenu = false;

  @Output() sortChange = new EventEmitter<Sort>();
  @Output() pageChange = new EventEmitter<PageEvent>();
  @Output() rowClick = new EventEmitter<any>();
  @Output() actionClick = new EventEmitter<{ action: string; row: any }>();
  @Output() selectionChange = new EventEmitter<any[]>();
  @Output() contextMenuClick = new EventEmitter<{ event: MouseEvent; row: any }>();

  selection = new SelectionModel<any>(true, []);

  constructor() {
    this.selection.changed.subscribe(() => {
      this.selectionChange.emit(this.selection.selected);
    });
  }

  get containerClasses(): string {
    return `table-${this.variant}`;
  }

  get tableClasses(): string {
    const classes = [`table-${this.size}`];

    if (this.variant === 'striped') {
      classes.push('table-striped');
    }
    if (this.variant === 'bordered') {
      classes.push('table-bordered');
    }
    if (this.variant === 'borderless') {
      classes.push('table-borderless');
    }

    return classes.join(' ');
  }

  get displayedColumns(): string[] {
    const columns = [];

    if (this.selectable) {
      columns.push('select');
    }

    columns.push(...this.columns.map(col => col.key));

    if (this.rowActions && this.rowActions.length > 0) {
      columns.push('rowActions');
    }

    return columns;
  }

  getValue(row: any, key: string): any {
    return key.split('.').reduce((obj, prop) => obj?.[prop], row);
  }

  getFormattedValue(row: any, column: TableColumn): string {
    const value = this.getValue(row, column.key);

    if (column.format) {
      return column.format(value);
    }

    if (value == null) {
      return '';
    }

    switch (column.type) {
      case 'currency':
        return new Intl.NumberFormat('tr-TR', {
          style: 'currency',
          currency: 'TRY'
        }).format(value);
      case 'date':
        return new Date(value).toLocaleDateString('tr-TR');
      case 'number':
        return new Intl.NumberFormat('tr-TR').format(value);
      default:
        return String(value);
    }
  }

  getBadgeColor(row: any, column: TableColumn): string {
    const value = this.getValue(row, column.key);
    return column.badgeColor ? column.badgeColor(value) : 'primary';
  }

  getVisibleActions(row: any): TableAction[] {
    if (!this.rowActions) return [];
    return this.rowActions.filter(action =>
      !action.visible || action.visible(row)
    );
  }

  isActionDisabled(row: any, action: TableAction): boolean {
    return action.disabled ? action.disabled(row) : false;
  }

  onSortChange(sort: Sort): void {
    this.sortChange.emit(sort);
  }

  onPageChange(event: PageEvent): void {
    this.pageChange.emit(event);
  }

  onRowClick(row: any): void {
    if (this.clickableRows) {
      this.rowClick.emit(row);
    }
  }

  onActionClick(action: string, row: any): void {
    this.actionClick.emit({ action, row });
  }

  onContextMenu(event: MouseEvent, row: any): void {
    if (this.enableContextMenu) {
      event.preventDefault();
      this.contextMenuClick.emit({ event, row });
    }
  }

  isAllSelected(): boolean {
    const numSelected = this.selection.selected.length;
    const numRows = this.data.length;
    return numSelected === numRows;
  }

  masterToggle(): void {
    this.isAllSelected() ?
      this.selection.clear() :
      this.data.forEach(row => this.selection.select(row));
  }
}