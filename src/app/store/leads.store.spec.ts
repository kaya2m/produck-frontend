import { TestBed } from '@angular/core/testing';
import { LeadsStore, Lead } from './leads.store';

describe('LeadsStore', () => {
  let store: InstanceType<typeof LeadsStore>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LeadsStore]
    });

    store = TestBed.inject(LeadsStore);
  });

  it('should be created', () => {
    expect(store).toBeTruthy();
  });

  it('should have initial state', () => {
    expect(store.leads()).toEqual([]);
    expect(store.selectedLead()).toBeNull();
    expect(store.loading()).toBe(false);
    expect(store.error()).toBeNull();
    expect(store.currentPage()).toBe(1);
    expect(store.pageSize()).toBe(25);
    expect(store.totalCount()).toBe(0);
  });

  it('should add a lead', () => {
    const newLead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'> = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      company: 'Test Corp',
      status: 'new',
      source: 'website'
    };

    store.addLead(newLead);

    expect(store.leads()).toHaveLength(1);
    expect(store.totalCount()).toBe(1);

    const addedLead = store.leads()[0];
    expect(addedLead.firstName).toBe('John');
    expect(addedLead.lastName).toBe('Doe');
    expect(addedLead.email).toBe('john.doe@example.com');
    expect(addedLead.id).toBeDefined();
    expect(addedLead.createdAt).toBeInstanceOf(Date);
  });

  it('should update a lead', () => {
    // First add a lead
    const newLead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'> = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      company: 'Test Corp',
      status: 'new',
      source: 'website'
    };

    store.addLead(newLead);
    const leadId = store.leads()[0].id;

    // Then update it
    store.updateLead(leadId, {
      status: 'contacted',
      notes: 'Called and left voicemail'
    });

    const updatedLead = store.leads()[0];
    expect(updatedLead.status).toBe('contacted');
    expect(updatedLead.notes).toBe('Called and left voicemail');
    expect(updatedLead.updatedAt).toBeInstanceOf(Date);
  });

  it('should delete a lead', () => {
    // Add two leads
    const lead1: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'> = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      company: 'Test Corp',
      status: 'new',
      source: 'website'
    };

    const lead2: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'> = {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      company: 'Another Corp',
      status: 'contacted',
      source: 'referral'
    };

    store.addLead(lead1);
    store.addLead(lead2);

    expect(store.leads()).toHaveLength(2);
    expect(store.totalCount()).toBe(2);

    // Delete first lead
    const firstLeadId = store.leads()[0].id;
    store.deleteLead(firstLeadId);

    expect(store.leads()).toHaveLength(1);
    expect(store.totalCount()).toBe(1);
    expect(store.leads()[0].firstName).toBe('Jane');
  });

  it('should filter leads by status', () => {
    // Add leads with different statuses
    store.addLead({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      company: 'Corp A',
      status: 'new',
      source: 'website'
    });

    store.addLead({
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
      company: 'Corp B',
      status: 'contacted',
      source: 'referral'
    });

    // Filter by status
    store.setFilters({ status: 'new' });

    const filtered = store.filteredLeads();
    expect(filtered).toHaveLength(1);
    expect(filtered[0].firstName).toBe('John');
    expect(filtered[0].status).toBe('new');
  });

  it('should calculate leadsByStatus correctly', () => {
    // Add leads with different statuses
    store.addLead({ firstName: 'A', lastName: 'A', email: 'a@test.com', company: 'A', status: 'new', source: 'web' });
    store.addLead({ firstName: 'B', lastName: 'B', email: 'b@test.com', company: 'B', status: 'new', source: 'web' });
    store.addLead({ firstName: 'C', lastName: 'C', email: 'c@test.com', company: 'C', status: 'contacted', source: 'web' });
    store.addLead({ firstName: 'D', lastName: 'D', email: 'd@test.com', company: 'D', status: 'qualified', source: 'web' });

    const stats = store.leadsByStatus();

    expect(stats.new).toBe(2);
    expect(stats.contacted).toBe(1);
    expect(stats.qualified).toBe(1);
    expect(stats.lost).toBe(0);
  });

  it('should calculate total value correctly', () => {
    store.addLead({
      firstName: 'A', lastName: 'A', email: 'a@test.com',
      company: 'A', status: 'new', source: 'web', value: 1000
    });
    store.addLead({
      firstName: 'B', lastName: 'B', email: 'b@test.com',
      company: 'B', status: 'new', source: 'web', value: 2000
    });
    store.addLead({
      firstName: 'C', lastName: 'C', email: 'c@test.com',
      company: 'C', status: 'new', source: 'web' // no value
    });

    expect(store.totalValue()).toBe(3000);
  });

  it('should handle bulk operations', () => {
    // Add multiple leads
    store.addLead({ firstName: 'A', lastName: 'A', email: 'a@test.com', company: 'A', status: 'new', source: 'web' });
    store.addLead({ firstName: 'B', lastName: 'B', email: 'b@test.com', company: 'B', status: 'new', source: 'web' });
    store.addLead({ firstName: 'C', lastName: 'C', email: 'c@test.com', company: 'C', status: 'new', source: 'web' });

    const leadIds = store.leads().map(l => l.id);

    // Bulk update status
    store.updateLeadStatus([leadIds[0], leadIds[1]], 'contacted');

    const leads = store.leads();
    expect(leads[0].status).toBe('contacted');
    expect(leads[1].status).toBe('contacted');
    expect(leads[2].status).toBe('new');

    // Bulk delete
    store.bulkDelete([leadIds[0], leadIds[2]]);

    expect(store.leads()).toHaveLength(1);
    expect(store.leads()[0].firstName).toBe('B');
    expect(store.totalCount()).toBe(1);
  });

  it('should handle dialog state management', () => {
    expect(store.showAddDialog()).toBe(false);
    expect(store.showEditDialog()).toBe(false);
    expect(store.isDialogOpen()).toBe(false);

    // Show add dialog
    store.showAddDialog();
    expect(store.showAddDialog()).toBe(true);
    expect(store.isDialogOpen()).toBe(true);

    // Close dialogs
    store.closeDialogs();
    expect(store.showAddDialog()).toBe(false);
    expect(store.showEditDialog()).toBe(false);
    expect(store.isDialogOpen()).toBe(false);
  });

  it('should search leads correctly', () => {
    store.addLead({
      firstName: 'John', lastName: 'Doe', email: 'john.doe@acme.com',
      company: 'Acme Corp', status: 'new', source: 'web'
    });
    store.addLead({
      firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@techstart.com',
      company: 'TechStart Inc', status: 'contacted', source: 'referral'
    });

    // Search by first name
    store.setFilters({ search: 'john' });
    expect(store.filteredLeads()).toHaveLength(1);
    expect(store.filteredLeads()[0].firstName).toBe('John');

    // Search by company
    store.setFilters({ search: 'techstart' });
    expect(store.filteredLeads()).toHaveLength(1);
    expect(store.filteredLeads()[0].company).toBe('TechStart Inc');

    // Clear search
    store.clearFilters();
    expect(store.filteredLeads()).toHaveLength(2);
  });
});