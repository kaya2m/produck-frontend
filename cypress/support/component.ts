// Import Cypress Angular commands
import { mount } from 'cypress/angular';

// Import global styles for component testing
import '../../src/styles.css';

// Add mount command to Cypress
declare global {
  namespace Cypress {
    interface Chainable {
      mount: typeof mount;
    }
  }
}

Cypress.Commands.add('mount', mount);

// Component test setup
beforeEach(() => {
  // Set up any component test globals
});