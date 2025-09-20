import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChild,
  EventEmitter,
  HostListener,
  Input,
  LOCALE_ID,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  TemplateRef,
  ViewChild,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenu, MatMenuModule } from '@angular/material/menu';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AgGridAngular } from 'ag-grid-angular';
import {
  AllCommunityModule,
  CellClickedEvent,
  CellDoubleClickedEvent,
  ColDef,
  FilterChangedEvent,
  FirstDataRenderedEvent,
  GridApi,
  GridOptions,
  GridReadyEvent,
  GridSizeChangedEvent,
  ModuleRegistry,
  PaginationChangedEvent,
  RowClickedEvent,
  RowDoubleClickedEvent,
  RowSelectedEvent,
  RowSelectionOptions,
  SelectionChangedEvent,
  SideBarDef,
  SortChangedEvent
} from 'ag-grid-community';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

ModuleRegistry.registerModules([AllCommunityModule]);

export type DataGridColumn<T = any> = ColDef<T> & {
  field: string;
  headerName: string;
};

export interface DataGridAction<T = any> {
  icon: string;
  tooltip: string;
  color?: 'primary' | 'accent' | 'warn';
  disabled?: (row: T) => boolean;
  visible?: (row: T) => boolean;
  click: (row: T) => void;
  permission?: string;
}

export interface DataGridConfig {
  enableSorting?: boolean;
  enableFiltering?: boolean;
  enablePagination?: boolean;
  paginationPageSize?: number;
  paginationPageSizeSelector?: number[];
  enableSelection?: boolean;
  selectionMode?: 'single' | 'multiple';
  enableRowClickSelection?: boolean;
  enableHeaderCheckboxSelection?: boolean;
  enableColumnResize?: boolean;
  enableColumnReorder?: boolean;
  enableAutoSizeColumns?: boolean;
  rowHeight?: number;
  headerHeight?: number;
  animateRows?: boolean;
  enableCellSelection?: boolean;
  enableRowGrouping?: boolean;
  enableSideBar?: boolean;
  sideBar?: SideBarDef | boolean;
  suppressCellFocus?: boolean;
  suppressMenuHide?: boolean;
  suppressRowHoverHighlight?: boolean;
  suppressColumnVirtualisation?: boolean;
  suppressRowVirtualisation?: boolean;
  enableExport?: boolean;
  enableContextMenu?: boolean;
  defaultColDef?: ColDef;
  loadingOverlayComponent?: string;
  noRowsOverlayComponent?: string;
  localeText?: { [key: string]: string };
}

export interface DataGridPageChange {
  page: number;
  pageNumber: number;
  pageIndex: number;
  pageSize: number;
}

@Component({
  selector: 'app-data-grid',
  standalone: true,
  imports: [
    CommonModule,
    AgGridAngular,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatToolbarModule,
    MatTooltipModule,
    MatMenuModule,
    MatDividerModule,
    MatPaginatorModule
  ],
  templateUrl: './data-grid.component.html',
  styleUrls: ['./data-grid.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DataGridComponent<T = any> implements OnInit, OnDestroy, OnChanges, AfterViewInit {
  @ViewChild(AgGridAngular) agGrid?: AgGridAngular;
  @ViewChild('exportMenu') exportMenu?: MatMenu;
  @ViewChild('columnsMenu') columnsMenu?: MatMenu;
  @ViewChild(MatPaginator) paginator?: MatPaginator;
  @ContentChild('toolbar') toolbarTemplate?: TemplateRef<unknown>;

  @Input() data: T[] = [];
  @Input() columns: DataGridColumn<T>[] = [];
  @Input() loading = false;
  @Input() config: DataGridConfig = {};
  @Input() actions: DataGridAction<T>[] = [];
  @Input() title?: string;
  @Input() showDefaultToolbar = true;
  @Input() showRowCount = true;
  @Input() enableQuickFilter = true;
  @Input() quickFilterPlaceholder = 'Ara...';
  @Input() quickFilterDebounce = 250;
  @Input() loadingText?: string;
  @Input() totalCount = 0;
  @Input() pageSize = 15;
  @Input() currentPage = 1;
  @Input() serverSidePagination = false;
  @Input() gridHeight = 560;
  @Input() stateKey?: string;
  @Input() autoSaveState = true;

  @Output() rowClick = new EventEmitter<RowClickedEvent>();
  @Output() rowDoubleClick = new EventEmitter<RowDoubleClickedEvent>();
  @Output() selectionChanged = new EventEmitter<SelectionChangedEvent>();
  @Output() sortChanged = new EventEmitter<SortChangedEvent>();
  @Output() filterChanged = new EventEmitter<FilterChangedEvent>();
  @Output() pageChanged = new EventEmitter<DataGridPageChange>();
  @Output() gridReady = new EventEmitter<GridReadyEvent>();
  @Output() cellClick = new EventEmitter<CellClickedEvent>();
  @Output() cellDoubleClick = new EventEmitter<CellDoubleClickedEvent>();
  @Output() rowSelected = new EventEmitter<RowSelectedEvent>();
  @Output() contextMenuAction = new EventEmitter<{action: DataGridAction<T>, row: T}>();

  gridOptions: GridOptions<T> = {};
  columnDefs: ColDef<T>[] = [];

  currentPageState = 1;
  pageSizeState = 15;
  totalCountState = 0;
  pageSizeOptions: number[] = [15, 30, 50, 100];
  quickFilterValue = '';


  private gridApi?: GridApi<T>;
  private readonly destroy$ = new Subject<void>();
  private readonly quickFilter$ = new Subject<string>();
  private lastPagination?: { page: number; pageSize: number };
  private readonly locale = inject(LOCALE_ID);
  private readonly cdr = inject(ChangeDetectorRef);

  private readonly defaultConfig: DataGridConfig = {
    enableSorting: true,
    enableFiltering: true,
    enablePagination: true,
    paginationPageSize: 15,
    paginationPageSizeSelector: [15, 30, 50, 100],
    enableSelection: true,
    selectionMode: 'single',
    enableRowClickSelection: true,
    enableHeaderCheckboxSelection: false,
    enableColumnResize: true,
    enableColumnReorder: true,
    enableAutoSizeColumns: false,
    rowHeight: 60,
    headerHeight: 56,
    animateRows: true,
    enableCellSelection: false,
    enableRowGrouping: false,
    enableSideBar: false,
    suppressCellFocus: true,
    suppressMenuHide: false,
    suppressRowHoverHighlight: false,
    suppressColumnVirtualisation: false,
    suppressRowVirtualisation: false,
    enableExport: true
  };

  ngOnInit(): void {
    this.initializeQuickFilterStream();
    this.initializeGrid();
    this.currentPageState = this.currentPage || 1;
    this.pageSizeState = this.pageSize || this.defaultConfig.paginationPageSize!;
    this.totalCountState = this.totalCount ?? 0;
    this.updatePageSizeOptions();
  }

  ngAfterViewInit(): void {
    this.syncPaginator();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.gridApi && !this.gridApi.isDestroyed()) {
      this.gridOptions.rowData = this.data;
      this.gridApi.setGridOption('rowData', this.data);
      this.gridApi.refreshClientSideRowModel('everything');
      this.cdr.markForCheck();
    }

    if (changes['columns'] && this.columns.length > 0) {
      this.updateColumnDefs();
      if (this.gridApi && !this.gridApi.isDestroyed()) {
        this.gridOptions.columnDefs = this.columnDefs;
        this.gridApi.setGridOption('columnDefs', this.columnDefs);
        this.gridApi.refreshClientSideRowModel('everything');
      }
      this.cdr.markForCheck();
    }

    if (changes['config']) {
      this.updatePageSizeOptions();
      this.updateGridOptions();
      this.applyGridOptionsToApi();
      this.cdr.markForCheck();
    }

    if (changes['loading'] && this.gridApi && !this.gridApi.isDestroyed()) {
      this.gridApi.setGridOption('loading', this.loading);
      this.cdr.markForCheck();
    }

    if (changes['pageSize']) {
      this.pageSizeState = this.pageSize || this.pageSizeState;
      this.gridOptions.paginationPageSize = this.pageSizeState;
      this.applyGridOptionsToApi();
      this.syncPaginator();
      this.cdr.markForCheck();
    }

    if (changes['currentPage']) {
      this.currentPageState = this.currentPage || this.currentPageState;
      this.syncPaginator();
      this.cdr.markForCheck();
    }

    if (changes['totalCount']) {
      this.totalCountState = this.totalCount ?? 0;
      this.syncPaginator();
      this.cdr.markForCheck();
    }

    if (changes['serverSidePagination']) {
      this.updateGridOptions();
      this.applyGridOptionsToApi();
      this.syncPaginator();
      this.cdr.markForCheck();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get rowCount(): number {
    return this.serverSidePagination ? this.totalCountState : this.data?.length ?? 0;
  }

  onGridReady(event: GridReadyEvent): void {
    this.gridApi = event.api as GridApi<T>;

    if (this.data?.length) {
      this.gridApi.setGridOption('rowData', this.data);
    }

    this.gridApi.setGridOption('loading', this.loading);
    this.restoreState();

    if (this.gridOptions.pagination) {
      this.gridApi.setGridOption('paginationPageSize', this.pageSizeState);
    }

    if (this.gridOptions.defaultColDef?.flex) {
      this.autoSizeAllColumns();
    }

    this.gridReady.emit(event);
    this.cdr.markForCheck();
  }

  onFirstDataRendered(event: FirstDataRenderedEvent): void {
    if (this.config.enableAutoSizeColumns) {
      this.autoSizeAllColumns();
    }
  }

  onRowClicked(event: RowClickedEvent): void {
    this.rowClick.emit(event);
  }

  onRowDoubleClicked(event: RowDoubleClickedEvent): void {
    this.rowDoubleClick.emit(event);
  }

  onSelectionChanged(event: SelectionChangedEvent): void {
    this.selectionChanged.emit(event);
  }

  onSortChanged(event: SortChangedEvent): void {
    this.sortChanged.emit(event);
    this.persistState();
  }

  onFilterChanged(event: FilterChangedEvent): void {
    this.filterChanged.emit(event);
    this.persistState();
  }

  onCellClicked(event: CellClickedEvent): void {
    this.cellClick.emit(event);
  }

  onCellDoubleClicked(event: CellDoubleClickedEvent): void {
    this.cellDoubleClick.emit(event);
  }

  onCellMouseDown(event: any): void {
    // Not needed anymore - using simple contextmenu event
  }

  onRowSelected(event: RowSelectedEvent): void {
    this.rowSelected.emit(event);
  }

  onGridSizeChanged(event: GridSizeChangedEvent): void {
    if (this.config.enableAutoSizeColumns) {
      this.autoSizeAllColumns();
    }
  }

  onPaginationChanged(event: PaginationChangedEvent): void {
    if (!this.gridApi || this.gridApi.isDestroyed() || this.serverSidePagination) {
      return;
    }

    const currentPage = this.gridApi.paginationGetCurrentPage() + 1;
    const pageSize = this.gridApi.paginationGetPageSize();
    this.emitPageChange(currentPage, pageSize);
  }

  onMatPageChange(event: PageEvent): void {
    const nextPage = event.pageIndex + 1;
    const nextSize = event.pageSize;
    this.emitPageChange(nextPage, nextSize);
  }

  onQuickFilterChanged(event: Event | string): void {
    const value = typeof event === 'string'
      ? event
      : (event.target as HTMLInputElement | null)?.value ?? '';
    this.quickFilter$.next(value);
  }

  clearQuickFilter(): void {
    this.quickFilter$.next('');
  }

  refreshGrid(): void {
    if (this.gridApi && !this.gridApi.isDestroyed()) {
      this.gridApi.refreshClientSideRowModel('everything');
    }
  }

  autoSizeAllColumns(): void {
    if (!this.gridApi || this.gridApi.isDestroyed()) {
      return;
    }

    this.gridApi.autoSizeAllColumns();
  }

  clearAllFilters(): void {
    if (!this.gridApi || this.gridApi.isDestroyed()) {
      return;
    }

    this.gridApi.setFilterModel(null);
    this.gridApi.applyColumnState({ defaultState: { sort: null } });
    this.quickFilter$.next('');
    this.persistState();
  }

  exportToCsv(): void {
    if (this.gridApi && !this.gridApi.isDestroyed()) {
      this.gridApi.exportDataAsCsv({
        suppressQuotes: true,
        fileName: `${this.title || 'data-grid'}-${new Date().toISOString()}.csv`
      });
    }
  }

  exportToExcel(): void {
    if (this.gridApi && !this.gridApi.isDestroyed()) {
      this.gridApi.exportDataAsExcel({
        fileName: `${this.title || 'data-grid'}-${new Date().toISOString()}.xlsx`
      });
    }
  }

  toggleColumn(field: string): void {
    if (!this.gridApi || this.gridApi.isDestroyed()) {
      return;
    }

    const columnState = this.gridApi.getColumnState();
    const target = columnState.find(col => col.colId === field);
    if (target) {
      target.hide = !target.hide;
      this.gridApi.applyColumnState({ state: columnState, applyOrder: true });
      this.persistState();
    }
  }

  isColumnVisible(field: string): boolean {
    if (!this.gridApi || this.gridApi.isDestroyed()) {
      return true;
    }

    const columnState = this.gridApi.getColumnState();
    const target = columnState.find(col => col.colId === field);
    return target ? !target.hide : true;
  }

  resetColumns(): void {
    if (!this.gridApi || this.gridApi.isDestroyed()) {
      return;
    }

    this.gridApi.resetColumnState();
    this.persistState();
  }

  preventContextMenu(event: MouseEvent): void {
    event.preventDefault();
  }

  showContextMenu = false;
  contextMenuX = 0;
  contextMenuY = 0;
  contextMenuRow: T | null = null;

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (this.showContextMenu) {
      this.hideContextMenu();
    }
  }

  onGridContextMenu(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();

    if (!this.config.enableContextMenu || !this.actions.length) {
      return;
    }

    // Simple approach: try to find row data from clicked element
    const target = event.target as HTMLElement;
    const rowElement = target.closest('[row-index]') || target.closest('.ag-row');

    if (rowElement) {
      const rowIndex = parseInt(rowElement.getAttribute('row-index') || '0');
      const rowData = this.data[rowIndex] || this.gridApi?.getDisplayedRowAtIndex(rowIndex)?.data;

      if (rowData) {
        this.contextMenuRow = rowData;
        this.contextMenuX = event.clientX;
        this.contextMenuY = event.clientY;
        this.showContextMenu = true;
        this.cdr.markForCheck();
      }
    }
  }

  hideContextMenu(): void {
    this.showContextMenu = false;
    this.contextMenuRow = null;
    this.cdr.markForCheck();
  }

  executeContextAction(action: DataGridAction<T>): void {
    if (this.contextMenuRow && action.click) {
      action.click(this.contextMenuRow);
    }
    this.hideContextMenu();
  }


  goToPage(pageNumber: number): void {
    if (this.serverSidePagination) {
      this.emitPageChange(pageNumber, this.pageSizeState);
    } else if (this.gridApi && !this.gridApi.isDestroyed()) {
      this.gridApi.paginationGoToPage(pageNumber - 1);
    }
  }

  totalPages(): number {
    if (this.pageSizeState === 0) {
      return 1;
    }
    return Math.max(1, Math.ceil(this.totalCountState / this.pageSizeState));
  }

  private initializeGrid(): void {
    this.updateColumnDefs();
    this.updateGridOptions();
  }

  private initializeQuickFilterStream(): void {
    this.quickFilter$
      .pipe(
        debounceTime(this.quickFilterDebounce),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(value => {
        this.quickFilterValue = value;
        if (this.gridApi && !this.gridApi.isDestroyed()) {
          this.gridApi.setGridOption('quickFilterText', value);
        }
        this.persistState();
        this.cdr.markForCheck();
      });
  }

  private updateGridOptions(): void {
    const mergedConfig = { ...this.defaultConfig, ...this.config };

    let rowSelectionOptions: RowSelectionOptions<T> | undefined;

    if (mergedConfig.enableSelection) {
      rowSelectionOptions = {
        mode: mergedConfig.selectionMode === 'multiple' ? 'multiRow' : 'singleRow',
        enableClickSelection: mergedConfig.enableRowClickSelection,
        enableSelectionWithoutKeys: mergedConfig.selectionMode === 'multiple'
      };
    }

    this.gridOptions = {
      rowData: this.data,
      columnDefs: this.columnDefs,
      loading: this.loading,
      rowSelection: rowSelectionOptions,
      theme: 'legacy',
      pagination: !this.serverSidePagination && mergedConfig.enablePagination,
      paginationPageSize: this.pageSizeState,
      paginationPageSizeSelector: this.pageSizeOptions,
      animateRows: mergedConfig.animateRows,
      rowHeight: mergedConfig.rowHeight,
      headerHeight: mergedConfig.headerHeight,
      suppressCellFocus: mergedConfig.suppressCellFocus,
      suppressMenuHide: mergedConfig.suppressMenuHide,
      suppressRowHoverHighlight: mergedConfig.suppressRowHoverHighlight,
      suppressColumnVirtualisation: mergedConfig.suppressColumnVirtualisation,
      suppressRowVirtualisation: mergedConfig.suppressRowVirtualisation,
      sideBar: mergedConfig.enableSideBar ? (mergedConfig.sideBar || true) : false,
      suppressContextMenu: true,  // ag-Grid'in context menu'sunu tamamen devre dışı bırak
      defaultColDef: {
        sortable: mergedConfig.enableSorting,
        filter: mergedConfig.enableFiltering,
        resizable: mergedConfig.enableColumnResize,
        minWidth: 120,
        flex: 1,
        ...mergedConfig.defaultColDef
      },
      localeText: mergedConfig.localeText || this.getDefaultLocaleText()
    } as GridOptions<T>;
  }

  private updateColumnDefs(): void {
    this.columnDefs = this.columns?.length ? this.columns.map(col => {
      const colDef = { ...col };

      // Object türündeki değerler için otomatik value formatter ekle
      if (!colDef.valueFormatter) {
        colDef.valueFormatter = (params: any) => {
          const value = params.value;
          if (value === null || value === undefined) {
            return '';
          }
          if (typeof value === 'object') {
            // Object ise JSON string'e çevir veya toString kullan
            try {
              return JSON.stringify(value);
            } catch {
              return String(value);
            }
          }
          return String(value);
        };
      }

      return colDef;
    }) : [];
  }

  private applyGridOptionsToApi(): void {
    if (!this.gridApi || this.gridApi.isDestroyed()) {
      return;
    }

    this.gridApi.setGridOption('pagination', this.gridOptions.pagination);
    this.gridApi.setGridOption('paginationPageSize', this.gridOptions.paginationPageSize);
    this.gridApi.setGridOption('rowHeight', this.gridOptions.rowHeight);
    this.gridApi.setGridOption('headerHeight', this.gridOptions.headerHeight);
    this.gridApi.setGridOption('suppressRowHoverHighlight', this.gridOptions.suppressRowHoverHighlight);
    this.gridApi.setGridOption('animateRows', this.gridOptions.animateRows);
    this.gridApi.setGridOption('sideBar', this.gridOptions.sideBar);
    this.gridApi.setGridOption('defaultColDef', this.gridOptions.defaultColDef);
    this.gridApi.setGridOption('rowSelection', this.gridOptions.rowSelection);
    this.gridApi.setGridOption('theme', this.gridOptions.theme);
  }

  private emitPageChange(page: number, pageSize: number): void {
    const hasChanged =
      !this.lastPagination ||
      this.lastPagination.page !== page ||
      this.lastPagination.pageSize !== pageSize;

    if (!hasChanged) {
      return;
    }

    this.lastPagination = { page, pageSize };
    this.currentPageState = page;
    this.pageSizeState = pageSize;
    this.syncPaginator();
    this.pageChanged.emit({
      page,
      pageNumber: page,
      pageIndex: page - 1,
      pageSize
    });
  }

  private updatePageSizeOptions(): void {
    const options = this.config.paginationPageSizeSelector?.length
      ? [...this.config.paginationPageSizeSelector]
      : [...(this.defaultConfig.paginationPageSizeSelector || [15, 30, 50, 100])];

    if (!options.includes(this.pageSizeState)) {
      options.push(this.pageSizeState);
    }

    options.sort((a, b) => a - b);
    this.pageSizeOptions = options;
  }

  private syncPaginator(): void {
    if (!this.paginator) {
      return;
    }

    this.paginator.length = this.totalCountState;
    this.paginator.pageSize = this.pageSizeState;
    this.paginator.pageIndex = Math.max(0, this.currentPageState - 1);
    this.cdr.markForCheck();
  }

  private persistState(): void {
    if (!this.autoSaveState || !this.stateKey || !this.gridApi || this.gridApi.isDestroyed()) {
      return;
    }

    const state = {
      columnState: this.gridApi.getColumnState(),
      filterModel: this.gridApi.getFilterModel(),
      sortModel: this.gridApi.getColumnState().filter(col => col.sort).map(col => ({ colId: col.colId, sort: col.sort })),
      quickFilter: this.quickFilterValue
    };

    try {
      localStorage.setItem(this.stateKey, JSON.stringify(state));
    } catch (error) {
      console.warn('Grid state could not be saved', error);
    }
  }

  private restoreState(): void {
    if (!this.stateKey || !this.gridApi || this.gridApi.isDestroyed()) {
      return;
    }

    const storedState = localStorage.getItem(this.stateKey);
    if (!storedState) {
      return;
    }

    try {
      const parsed = JSON.parse(storedState);
      if (parsed.columnState) {
        this.gridApi.applyColumnState({ state: parsed.columnState, applyOrder: true });
      }
      if (parsed.filterModel) {
        this.gridApi.setFilterModel(parsed.filterModel);
      }
      if (parsed.sortModel) {
        this.gridApi.applyColumnState({
          state: parsed.sortModel.map((sort: any) => ({
            colId: sort.colId,
            sort: sort.sort
          }))
        });
      }
      if (typeof parsed.quickFilter === 'string') {
        this.quickFilterValue = parsed.quickFilter;
        this.gridApi.setGridOption('quickFilterText', parsed.quickFilter);
      }
      this.syncPaginator();
    } catch (error) {
      console.warn('Grid state could not be restored', error);
    }
  }

  private getDefaultLocaleText(): { [key: string]: string } {
    return {
      page: 'Sayfa',
      more: 'Daha Fazla',
      to: '-',
      of: '/',
      next: 'Sonraki',
      last: 'Son',
      first: 'İlk',
      previous: 'Önceki',
      loadingOoo: 'Yükleniyor...',
      noRowsToShow: 'Gösterilecek kayıt yok',
      selectAll: 'Tümünü Seç',
      searchOoo: 'Ara...',
      blanks: 'Boş',
      filterOoo: 'Filtrele...',
      equals: 'Eşittir',
      notEqual: 'Eşit Değil',
      lessThan: 'Küçüktür',
      greaterThan: 'Büyüktür',
      inRange: 'Aralıkta',
      contains: 'İçerir',
      notContains: 'İçermez',
      startsWith: 'İle Başlar',
      endsWith: 'İle Biter',
      resetFilter: 'Filtreyi Sıfırla'
    };
  }
}
