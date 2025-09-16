// Import Cypress commands
import './commands';

// Global E2E test setup
Cypress.on('uncaught:exception', (err, runnable) => {
  // Prevent Cypress from failing the test on uncaught exceptions
  // that we're not interested in (like Angular hydration warnings)
  if (err.message.includes('hydrat')) {
    return false;
  }

  // Let other errors fail the test
  return true;
});

// Custom commands for common E2E operations
beforeEach(() => {
  // Clear local storage before each test
  cy.clearLocalStorage();

  // Set up any global test state
  cy.window().then((win) => {
    // Clear any cached data
    win.localStorage.clear();
    win.sessionStorage.clear();
  });
});