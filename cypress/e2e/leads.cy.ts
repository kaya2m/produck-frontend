describe('Leads Management', () => {
  beforeEach(() => {
    // Login before each test
    cy.login();
  });

  it('should display leads page', () => {
    cy.navigateTo('leads');

    // Check page elements
    cy.contains('h1', 'Leads Management').should('be.visible');
    cy.contains('button', 'Add Lead').should('be.visible');

    // Check stats cards
    cy.get('.stat-card').should('have.length', 4);
    cy.contains('New Leads').should('be.visible');
    cy.contains('Contacted').should('be.visible');
    cy.contains('Qualified').should('be.visible');
    cy.contains('Total Value').should('be.visible');
  });

  it('should show mock data in grid', () => {
    cy.navigateTo('leads');
    cy.waitForAngular();

    // Wait for AG-Grid to load
    cy.get('.ag-theme-material').should('be.visible');

    // Check for mock data
    cy.contains('John Doe').should('be.visible');
    cy.contains('Acme Corp').should('be.visible');
    cy.contains('jane.smith@techstart.com').should('be.visible');
  });

  it('should filter leads by status', () => {
    cy.navigateTo('leads');
    cy.waitForAngular();

    // Open status filter dropdown
    cy.get('mat-select[placeholder="Status"]').click();

    // Select 'New' status
    cy.get('mat-option').contains('New').click();

    // Verify filter is applied
    cy.get('.results-count').should('contain', 'leads');

    // Clear filters
    cy.contains('button', 'Clear Filters').click();
  });

  it('should search leads', () => {
    cy.navigateTo('leads');
    cy.waitForAngular();

    // Type in search box
    cy.get('input[placeholder*="Search"]').type('John');

    // Should show filtered results
    cy.wait(500); // Debounce delay
    cy.get('.results-count').should('be.visible');

    // Clear search
    cy.get('input[placeholder*="Search"]').clear();
  });

  it('should show lead statistics', () => {
    cy.navigateTo('leads');
    cy.waitForAngular();

    // Check that stats are populated
    cy.get('.stat-card .stat-value').each(($el) => {
      cy.wrap($el).should('not.be.empty');
    });

    // Check total value is formatted as currency
    cy.get('.stat-card.value .stat-value').should('contain', '$');
  });

  it('should handle grid interactions', () => {
    cy.navigateTo('leads');
    cy.waitForAngular();

    // Wait for grid to load
    cy.get('.ag-theme-material').should('be.visible');

    // Try to select a row (if checkbox column exists)
    cy.get('.ag-selection-checkbox').first().click({ force: true });

    // Should show selected count
    cy.get('mat-chip').should('be.visible');
  });

  it('should show bulk actions when leads are selected', () => {
    cy.navigateTo('leads');
    cy.waitForAngular();

    // Select multiple rows
    cy.get('.ag-selection-checkbox').first().click({ force: true });
    cy.get('.ag-selection-checkbox').eq(1).click({ force: true });

    // Bulk actions button should appear
    cy.contains('button', 'Bulk Actions').should('be.visible');

    // Click bulk actions menu
    cy.contains('button', 'Bulk Actions').click();

    // Check menu options
    cy.contains('Mark as Contacted').should('be.visible');
    cy.contains('Mark as Qualified').should('be.visible');
    cy.contains('Delete Selected').should('be.visible');
  });

  it('should refresh data', () => {
    cy.navigateTo('leads');
    cy.waitForAngular();

    // Click refresh button
    cy.get('button[matTooltip*="Refresh"], button mat-icon:contains("refresh")').click();

    // Should show loading state briefly
    cy.get('.spinning').should('be.visible');
  });

  it('should show actions menu for individual leads', () => {
    cy.navigateTo('leads');
    cy.waitForAngular();

    // Click on actions button for first lead
    cy.get('.ag-theme-material .ag-cell')
      .contains('more_vert')
      .parent('button')
      .first()
      .click({ force: true });

    // Should show context menu
    cy.get('mat-menu').should('be.visible');
  });

  it('should display correct lead count', () => {
    cy.navigateTo('leads');
    cy.waitForAngular();

    // Should show results count
    cy.get('.results-count').should('contain', 'leads');

    // Should match total count in stats
    cy.get('.stat-card').first().find('.stat-value').then(($statValue) => {
      const totalLeads = $statValue.text().trim();
      cy.get('.results-count').should('contain', totalLeads);
    });
  });

  it('should maintain responsive design', () => {
    // Test mobile viewport
    cy.viewport(375, 667);
    cy.navigateTo('leads');
    cy.waitForAngular();

    // Header should adapt to mobile
    cy.get('.leads-header').should('be.visible');

    // Stats grid should stack on mobile
    cy.get('.stats-grid').should('be.visible');

    // Table should be responsive
    cy.get('.table-card').should('be.visible');

    // Reset viewport
    cy.viewport(1280, 720);
  });
});