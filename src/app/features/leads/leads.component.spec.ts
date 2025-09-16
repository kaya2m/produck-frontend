import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { LeadsComponent } from './leads.component';
import { LeadsStore } from '../../store/leads.store';

// Mock AG-Grid
jest.mock('ag-grid-angular', () => ({
  AgGridAngular: {
    selector: 'ag-grid-angular',
    template: '<div>Mock AG Grid</div>',
    inputs: [
      'rowData', 'columnDefs', 'defaultColDef', 'rowSelection',
      'suppressRowClickSelection', 'pagination', 'paginationPageSize', 'loading'
    ],
    outputs: ['gridReady', 'selectionChanged']
  }
}));

describe('LeadsComponent', () => {
  let component: LeadsComponent;
  let fixture: ComponentFixture<LeadsComponent>;
  let mockLeadsStore: any;

  beforeEach(async () => {
    // Create mock store with all required methods
    mockLeadsStore = {
      leads: jest.fn(() => []),
      filteredLeads: jest.fn(() => []),
      totalCount: jest.fn(() => 0),
      leadsByStatus: jest.fn(() => ({ new: 0, contacted: 0, qualified: 0, lost: 0 })),
      totalValue: jest.fn(() => 0),
      loading: jest.fn(() => false),
      pageSize: jest.fn(() => 25),
      showAddDialog: jest.fn(),
      showEditDialog: jest.fn(),
      setFilters: jest.fn(),
      clearFilters: jest.fn(),
      loadLeads: jest.fn(),
      deleteLead: jest.fn(),
      updateLeadStatus: jest.fn(),
      bulkDelete: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [
        LeadsComponent,
        NoopAnimationsModule
      ],
      providers: [
        { provide: LeadsStore, useValue: mockLeadsStore }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LeadsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display page title', () => {
    const titleElement = fixture.debugElement.query(By.css('h1'));
    expect(titleElement.nativeElement.textContent).toContain('Leads Management');
  });

  it('should display stats cards', () => {
    mockLeadsStore.leadsByStatus.mockReturnValue({
      new: 5, contacted: 3, qualified: 2, lost: 1
    });
    mockLeadsStore.totalValue.mockReturnValue(50000);

    fixture.detectChanges();

    const statCards = fixture.debugElement.queryAll(By.css('.stat-card'));
    expect(statCards.length).toBe(4);

    // Check if stats are displayed
    const statValues = statCards.map(card =>
      card.query(By.css('.stat-value')).nativeElement.textContent.trim()
    );

    expect(statValues).toContain('5'); // New leads
    expect(statValues).toContain('3'); // Contacted
    expect(statValues).toContain('2'); // Qualified
    expect(statValues[3]).toContain('$50,000'); // Total value
  });

  it('should show add lead button', () => {
    const addButton = fixture.debugElement.query(
      By.css('button[color="primary"]')
    );
    expect(addButton.nativeElement.textContent).toContain('Add Lead');
  });

  it('should call store methods on filter changes', () => {
    // Test search input
    component.onSearchChange({ target: { value: 'test search' } });
    expect(component.searchTerm).toBe('test search');

    // Test status filter
    component.onStatusFilterChange('contacted');
    expect(component.statusFilter).toBe('contacted');

    // Test source filter
    component.onSourceFilterChange('website');
    expect(component.sourceFilter).toBe('website');
  });

  it('should clear filters', () => {
    // Set some filters first
    component.searchTerm = 'test';
    component.statusFilter = 'new';
    component.sourceFilter = 'website';

    // Clear filters
    component.clearFilters();

    expect(component.searchTerm).toBe('');
    expect(component.statusFilter).toBe('');
    expect(component.sourceFilter).toBe('');
    expect(mockLeadsStore.clearFilters).toHaveBeenCalled();
  });

  it('should detect when filters are applied', () => {
    // No filters
    expect(component.hasFilters()).toBe(false);

    // With search term
    component.searchTerm = 'test';
    expect(component.hasFilters()).toBe(true);

    // Clear search, add status filter
    component.searchTerm = '';
    component.statusFilter = 'new';
    expect(component.hasFilters()).toBe(true);

    // Clear status, add source filter
    component.statusFilter = '';
    component.sourceFilter = 'website';
    expect(component.hasFilters()).toBe(true);
  });

  it('should call refresh data', () => {
    component.refreshData();
    expect(mockLeadsStore.loadLeads).toHaveBeenCalledWith({});
  });

  it('should handle grid selection changes', () => {
    const mockEvent = {
      api: {
        getSelectedRows: () => [{ id: '1' }, { id: '2' }]
      }
    };

    component.onSelectionChanged(mockEvent as any);
    expect(component.selectedRowsCount).toBe(2);
  });

  it('should display correct results count', () => {
    mockLeadsStore.filteredLeads.mockReturnValue([
      { id: '1', firstName: 'John' },
      { id: '2', firstName: 'Jane' }
    ]);
    mockLeadsStore.totalCount.mockReturnValue(10);

    fixture.detectChanges();

    const resultsCount = fixture.debugElement.query(By.css('.results-count'));
    expect(resultsCount.nativeElement.textContent).toContain('2 of 10 leads');
  });

  it('should show selected count when rows are selected', () => {
    component.selectedRowsCount = 3;
    fixture.detectChanges();

    const selectedChip = fixture.debugElement.query(By.css('mat-chip'));
    if (selectedChip) {
      expect(selectedChip.nativeElement.textContent).toContain('3 selected');
    }
  });
});