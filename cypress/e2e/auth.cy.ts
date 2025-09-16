describe('Authentication', () => {
  beforeEach(() => {
    // Clear any existing authentication
    cy.clearLocalStorage();
  });

  it('should redirect unauthenticated users to login', () => {
    cy.visit('/dashboard');
    cy.url().should('include', '/login');
  });

  it('should display login form', () => {
    cy.visit('/login');
    cy.waitForAngular();

    // Check for login form elements
    cy.get('h1').should('contain', 'Produck CRM');
    cy.get('input[name="email"]').should('be.visible');
    cy.get('input[name="password"]').should('be.visible');
    cy.get('button[type="submit"]').should('contain', 'Sign In');
  });

  it('should login with demo credentials', () => {
    cy.visit('/login');
    cy.waitForAngular();

    // Fill in demo credentials
    cy.get('input[name="email"]').type(Cypress.env('demoUser').email);
    cy.get('input[name="password"]').type(Cypress.env('demoUser').password);

    // Submit form
    cy.get('button[type="submit"]').click();

    // Should redirect to dashboard
    cy.url().should('include', '/dashboard');

    // Should show welcome message
    cy.contains('Welcome back').should('be.visible');

    // Should persist authentication
    cy.window().its('localStorage.produck_demo_auth').should('equal', 'true');
  });

  it('should show loading state during login', () => {
    cy.visit('/login');
    cy.waitForAngular();

    // Fill credentials
    cy.get('input[name="email"]').type(Cypress.env('demoUser').email);
    cy.get('input[name="password"]').type(Cypress.env('demoUser').password);

    // Submit and check loading state
    cy.get('button[type="submit"]').click();
    cy.get('mat-spinner').should('be.visible');
    cy.contains('Signing in...').should('be.visible');
  });

  it('should fill demo credentials when button is clicked', () => {
    cy.visit('/login');
    cy.waitForAngular();

    // Click fill demo data button
    cy.contains('button', 'Fill Demo Data').click();

    // Check that fields are filled
    cy.get('input[name="email"]').should('have.value', Cypress.env('demoUser').email);
    cy.get('input[name="password"]').should('have.value', Cypress.env('demoUser').password);
  });

  it('should show password when visibility toggle is clicked', () => {
    cy.visit('/login');
    cy.waitForAngular();

    const passwordInput = cy.get('input[name="password"]');

    // Initially password should be hidden
    passwordInput.should('have.attr', 'type', 'password');

    // Click visibility toggle
    cy.get('button[matSuffix]').click();

    // Password should now be visible
    passwordInput.should('have.attr', 'type', 'text');
  });

  it('should disable submit button when form is invalid', () => {
    cy.visit('/login');
    cy.waitForAngular();

    // Submit button should be disabled initially
    cy.get('button[type="submit"]').should('be.disabled');

    // Fill only email
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('button[type="submit"]').should('be.disabled');

    // Fill password too
    cy.get('input[name="password"]').type('password123');
    cy.get('button[type="submit"]').should('not.be.disabled');
  });
});