// Custom Cypress commands for Produck CRM

declare namespace Cypress {
  interface Chainable {
    /**
     * Login to the application with demo credentials
     */
    login(): Chainable<void>;

    /**
     * Navigate to a specific page in the app
     */
    navigateTo(page: string): Chainable<void>;

    /**
     * Wait for Angular to be ready
     */
    waitForAngular(): Chainable<void>;

    /**
     * Get element by data-cy attribute
     */
    getByCy(selector: string): Chainable<JQuery<HTMLElement>>;

    /**
     * Create a test lead via UI
     */
    createLead(lead: {
      firstName: string;
      lastName: string;
      email: string;
      company: string;
    }): Chainable<void>;
  }
}

// Login command
Cypress.Commands.add('login', () => {
  cy.visit('/login');
  cy.waitForAngular();

  // Fill in demo credentials
  cy.get('input[name="email"]').type(Cypress.env('demoUser').email);
  cy.get('input[name="password"]').type(Cypress.env('demoUser').password);

  // Submit form
  cy.get('button[type="submit"]').click();

  // Wait for redirect to dashboard
  cy.url().should('include', '/dashboard');
  cy.waitForAngular();
});

// Navigate to page
Cypress.Commands.add('navigateTo', (page: string) => {
  cy.visit(`/${page}`);
  cy.waitForAngular();
});

// Wait for Angular
Cypress.Commands.add('waitForAngular', () => {
  // Wait for Angular to be ready
  cy.window().should('have.property', 'ng');

  // Wait for any pending HTTP requests
  cy.intercept('**').as('anyRequest');
  cy.wait('@anyRequest', { timeout: 1000 }).then(() => {
    // Additional wait for Angular change detection
    cy.wait(100);
  });
});

// Get by data-cy attribute
Cypress.Commands.add('getByCy', (selector: string) => {
  return cy.get(`[data-cy="${selector}"]`);
});

// Create lead command
Cypress.Commands.add('createLead', (lead) => {
  // Navigate to leads page
  cy.navigateTo('leads');

  // Click add lead button
  cy.contains('button', 'Add Lead').click();

  // Wait for dialog to open
  cy.get('mat-dialog-container').should('be.visible');

  // Fill in lead form
  cy.get('input[formControlName="firstName"]').type(lead.firstName);
  cy.get('input[formControlName="lastName"]').type(lead.lastName);
  cy.get('input[formControlName="email"]').type(lead.email);
  cy.get('input[formControlName="company"]').type(lead.company);

  // Submit form
  cy.contains('button', 'Save').click();

  // Wait for dialog to close
  cy.get('mat-dialog-container').should('not.exist');
});