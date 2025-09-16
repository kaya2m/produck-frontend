import { computed, inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
  withHooks
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, catchError, EMPTY } from 'rxjs';
import { map } from 'rxjs/operators';
import { of } from 'rxjs';

// Models
export interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company: string;
  title?: string;
  status: 'new' | 'contacted' | 'qualified' | 'lost';
  source: string;
  value?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  assignedTo?: string;
}

export interface LeadsFilter {
  status?: string;
  source?: string;
  assignedTo?: string;
  search?: string;
}

export interface LeadsState {
  leads: Lead[];
  selectedLead: Lead | null;
  filters: LeadsFilter;
  loading: boolean;
  error: string | null;
  // Pagination
  currentPage: number;
  pageSize: number;
  totalCount: number;
  // UI State
  showAddDialog: boolean;
  showEditDialog: boolean;
}

const initialState: LeadsState = {
  leads: [],
  selectedLead: null,
  filters: {},
  loading: false,
  error: null,
  currentPage: 1,
  pageSize: 25,
  totalCount: 0,
  showAddDialog: false,
  showEditDialog: false
};

export const LeadsStore = signalStore(
  { providedIn: 'root' },

  // State
  withState(initialState),

  // Computed Values
  withComputed((store) => ({
    // Filtered leads
    filteredLeads: computed(() => {
      const leads = store.leads();
      const filters = store.filters();

      return leads.filter(lead => {
        if (filters.status && lead.status !== filters.status) return false;
        if (filters.source && lead.source !== filters.source) return false;
        if (filters.assignedTo && lead.assignedTo !== filters.assignedTo) return false;
        if (filters.search) {
          const search = filters.search.toLowerCase();
          return (
            lead.firstName.toLowerCase().includes(search) ||
            lead.lastName.toLowerCase().includes(search) ||
            lead.email.toLowerCase().includes(search) ||
            lead.company.toLowerCase().includes(search)
          );
        }
        return true;
      });
    }),

    // Statistics
    leadsByStatus: computed(() => {
      const leads = store.leads();
      return {
        new: leads.filter(l => l.status === 'new').length,
        contacted: leads.filter(l => l.status === 'contacted').length,
        qualified: leads.filter(l => l.status === 'qualified').length,
        lost: leads.filter(l => l.status === 'lost').length
      };
    }),

    totalValue: computed(() => {
      return store.leads().reduce((sum, lead) => sum + (lead.value || 0), 0);
    }),

    // Pagination
    totalPages: computed(() => {
      return Math.ceil(store.totalCount() / store.pageSize());
    }),

    hasNextPage: computed(() => {
      const totalPages = Math.ceil(store.totalCount() / store.pageSize());
      return store.currentPage() < totalPages;
    }),

    hasPreviousPage: computed(() => {
      return store.currentPage() > 1;
    }),

    // UI State
    isDialogOpen: computed(() => {
      return store.showAddDialog() || store.showEditDialog();
    })
  })),

  // Methods
  withMethods((store) => ({
    // CRUD Operations
    loadLeads: rxMethod<{ page?: number; filters?: LeadsFilter }>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(({ page = 1, filters = {} }) => {
          // Mock API call - replace with actual service
          return new Promise<{ leads: Lead[]; totalCount: number }>((resolve) => {
            setTimeout(() => {
              const mockLeads: Lead[] = [
                {
                  id: '1',
                  firstName: 'John',
                  lastName: 'Doe',
                  email: 'john.doe@example.com',
                  phone: '+1 555-0123',
                  company: 'Acme Corp',
                  title: 'CEO',
                  status: 'new',
                  source: 'website',
                  value: 50000,
                  notes: 'Interested in enterprise solution',
                  createdAt: new Date('2024-01-15'),
                  updatedAt: new Date('2024-01-15'),
                  assignedTo: 'user1'
                },
                {
                  id: '2',
                  firstName: 'Jane',
                  lastName: 'Smith',
                  email: 'jane.smith@techstart.com',
                  phone: '+1 555-0124',
                  company: 'TechStart Inc',
                  title: 'CTO',
                  status: 'contacted',
                  source: 'referral',
                  value: 75000,
                  notes: 'Follow up scheduled for next week',
                  createdAt: new Date('2024-01-16'),
                  updatedAt: new Date('2024-01-17'),
                  assignedTo: 'user2'
                },
                {
                  id: '3',
                  firstName: 'Mike',
                  lastName: 'Johnson',
                  email: 'mike@globaltech.com',
                  phone: '+1 555-0125',
                  company: 'GlobalTech',
                  title: 'VP Sales',
                  status: 'qualified',
                  source: 'linkedin',
                  value: 100000,
                  notes: 'Ready to sign contract',
                  createdAt: new Date('2024-01-14'),
                  updatedAt: new Date('2024-01-18'),
                  assignedTo: 'user1'
                }
              ];

              resolve({ leads: mockLeads, totalCount: mockLeads.length });
            }, 500);
          });
        }),
        tap({
          next: ({ leads, totalCount }: { leads: Lead[]; totalCount: number }) => {
            patchState(store, {
              leads,
              totalCount,
              loading: false
            });
          },
          error: (error: any) => {
            patchState(store, {
              error: error.message || 'Failed to load leads',
              loading: false
            });
          }
        })
      )
    ),

    addLead: (lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => {
      const newLead: Lead = {
        ...lead,
        id: Math.random().toString(36).substr(2, 9),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      patchState(store, (state) => ({
        leads: [...state.leads, newLead],
        totalCount: state.totalCount + 1,
        showAddDialog: false
      }));
    },

    updateLead: (id: string, updates: Partial<Lead>) => {
      patchState(store, (state) => ({
        leads: state.leads.map(lead =>
          lead.id === id
            ? { ...lead, ...updates, updatedAt: new Date() }
            : lead
        ),
        selectedLead: state.selectedLead?.id === id
          ? { ...state.selectedLead, ...updates, updatedAt: new Date() }
          : state.selectedLead,
        showEditDialog: false
      }));
    },

    deleteLead: (id: string) => {
      patchState(store, (state) => ({
        leads: state.leads.filter(lead => lead.id !== id),
        totalCount: state.totalCount - 1,
        selectedLead: state.selectedLead?.id === id ? null : state.selectedLead
      }));
    },

    // Selection
    selectLead: (lead: Lead | null) => {
      patchState(store, { selectedLead: lead });
    },

    // Filtering
    setFilters: (filters: LeadsFilter) => {
      patchState(store, { filters });
    },

    clearFilters: () => {
      patchState(store, { filters: {} });
    },

    // Pagination
    setPage: (page: number) => {
      patchState(store, { currentPage: page });
    },

    setPageSize: (pageSize: number) => {
      patchState(store, { pageSize, currentPage: 1 });
    },

    // Dialog Management
    openAddDialog: () => {
      patchState(store, { showAddDialog: true, selectedLead: null });
    },

    openEditDialog: (lead: Lead) => {
      patchState(store, { showEditDialog: true, selectedLead: lead });
    },

    closeDialogs: () => {
      patchState(store, {
        showAddDialog: false,
        showEditDialog: false,
        selectedLead: null
      });
    },

    // Bulk Operations
    updateLeadStatus: (ids: string[], status: Lead['status']) => {
      patchState(store, (state) => ({
        leads: state.leads.map(lead =>
          ids.includes(lead.id)
            ? { ...lead, status, updatedAt: new Date() }
            : lead
        )
      }));
    },

    bulkDelete: (ids: string[]) => {
      patchState(store, (state) => ({
        leads: state.leads.filter(lead => !ids.includes(lead.id)),
        totalCount: state.totalCount - ids.length
      }));
    }
  })),

  // Lifecycle Hooks
  withHooks({
    onInit(store) {
      // Auto-load leads when store is initialized
      store.loadLeads({});
    }
  })
);