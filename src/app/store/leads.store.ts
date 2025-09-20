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
import { forkJoin, pipe, switchMap, tap, catchError, EMPTY } from 'rxjs';
import { map } from 'rxjs/operators';
import { LeadService } from '../core/services/lead.service';
import { Lead, LeadStatus } from '../core/models/crm.models';
import { LeadFilter, LeadCreateDto, LeadUpdateDto } from '../core/models/api-response.models';

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
        if (filters.status && lead.status.toLowerCase() !== filters.status.toLowerCase()) return false;
        if (filters.source && (lead.leadSource ?? '').toLowerCase() !== filters.source.toLowerCase()) return false;
        if (filters.assignedTo && (lead.assignedUserId ?? '').toLowerCase() !== filters.assignedTo.toLowerCase()) return false;
        if (filters.search) {
          const search = filters.search.toLowerCase();
          return (
            lead.firstName.toLowerCase().includes(search) ||
            lead.lastName.toLowerCase().includes(search) ||
            lead.email.toLowerCase().includes(search) ||
            (lead.companyName ?? '').toLowerCase().includes(search)
          );
        }
        return true;
      });
    }),

    // Statistics
    leadsByStatus: computed(() => {
      const leads = store.leads();
      return {
        new: leads.filter(l => l.status === LeadStatus.New).length,
        contacted: leads.filter(l => l.status === LeadStatus.Contacted).length,
        qualified: leads.filter(l => l.status === LeadStatus.Qualified).length,
        lost: leads.filter(l => l.status === LeadStatus.Unqualified).length
      };
    }),

    totalValue: computed(() => {
      return store.leads().reduce((sum, lead) => sum + (lead.budget || 0), 0);
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
  withMethods((store) => {
    const leadService = inject(LeadService);

    const normalizeStatus = (status?: string): string | undefined => {
      if (!status) {
        return undefined;
      }

      const normalized = status.toLowerCase();
      switch (normalized) {
        case 'new':
          return LeadStatus.New;
        case 'contacted':
          return LeadStatus.Contacted;
        case 'qualified':
          return LeadStatus.Qualified;
        case 'lost':
        case 'unqualified':
          return LeadStatus.Unqualified;
        case 'converted':
          return LeadStatus.Converted;
        default:
          return status;
      }
    };

    return {
    // CRUD Operations
    loadLeads: rxMethod<{ page?: number; filters?: LeadsFilter }>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(({ page = 1, filters = {} }) => {
          const apiFilter: LeadFilter = {
            pageNumber: page,
            pageSize: store.pageSize(),
            search: filters.search
          };

          const normalizedStatus = normalizeStatus(filters.status);
          if (normalizedStatus) {
            apiFilter.status = normalizedStatus;
          }

          if (filters.source) {
            (apiFilter as any).leadSource = filters.source;
          }

          if (filters.assignedTo) {
            apiFilter.assignedUserId = filters.assignedTo;
          }

          return leadService.getLeads(apiFilter).pipe(
            catchError((error) => {
              patchState(store, {
                error: error.message || 'Failed to load leads',
                loading: false
              });
              return EMPTY;
            })
          );
        }),
        tap((response) => {
          if (!response) {
            return;
          }

          patchState(store, {
            leads: response.items,
            totalCount: response.totalCount,
            currentPage: response.pageNumber,
            pageSize: response.pageSize,
            loading: false
          });
        })
      )
    ),

    addLead: rxMethod<LeadCreateDto>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((payload) =>
          leadService.createLead(payload).pipe(
            catchError((error) => {
              patchState(store, {
                error: error.message || 'Failed to create lead',
                loading: false
              });
              return EMPTY;
            })
          )
        ),
        tap((createdLead) => {
          if (!createdLead) return;

          patchState(store, (state) => ({
            leads: [createdLead, ...state.leads],
            totalCount: state.totalCount + 1,
            loading: false,
            showAddDialog: false
          }));
        })
      )
    ),

    updateLead: rxMethod<{ id: string; payload: LeadUpdateDto }>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(({ id, payload }) =>
          leadService.updateLead(id, payload).pipe(
            catchError((error) => {
              patchState(store, {
                error: error.message || 'Failed to update lead',
                loading: false
              });
              return EMPTY;
            })
          )
        ),
        tap((updatedLead) => {
          if (!updatedLead) return;

          patchState(store, (state) => ({
            leads: state.leads.map(lead =>
              lead.id === updatedLead.id ? updatedLead : lead
            ),
            selectedLead: state.selectedLead?.id === updatedLead.id ? updatedLead : state.selectedLead,
            loading: false,
            showEditDialog: false
          }));
        })
      )
    ),

    deleteLead: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((id) =>
          leadService.deleteLead(id).pipe(
            map(() => id),
            catchError((error) => {
              patchState(store, {
                error: error.message || 'Failed to delete lead',
                loading: false
              });
              return EMPTY;
            })
          )
        ),
        tap((id) => {
          if (!id) return;

          patchState(store, (state) => ({
            leads: state.leads.filter(lead => lead.id !== id),
            totalCount: Math.max(0, state.totalCount - 1),
            selectedLead: state.selectedLead?.id === id ? null : state.selectedLead,
            loading: false
          }));
        })
      )
    ),

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
    updateLeadStatus: rxMethod<{ ids: string[]; status: Lead['status']; notes?: string }>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(({ ids, status, notes }) => {
          const requests = ids.map(id =>
            leadService.updateLeadStatus(id, status, notes).pipe(
              catchError((error) => {
                patchState(store, {
                  error: error.message || 'Failed to update lead status',
                  loading: false
                });
                return EMPTY;
              })
            )
          );

          return forkJoin(requests).pipe(map(() => ({ ids, status })));
        }),
        tap(({ ids, status }) => {
          patchState(store, (state) => ({
            leads: state.leads.map(lead =>
              ids.includes(lead.id)
                ? { ...lead, status, lastModifiedDate: new Date() }
                : lead
            ),
            loading: false
          }));
        })
      )
    ),

    bulkDelete: rxMethod<string[]>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((ids) =>
          leadService.bulkDeleteLeads(ids).pipe(
            map(() => ids),
            catchError((error) => {
              patchState(store, {
                error: error.message || 'Failed to delete leads',
                loading: false
              });
              return EMPTY;
            })
          )
        ),
        tap((ids) => {
          patchState(store, (state) => ({
            leads: state.leads.filter(lead => !ids.includes(lead.id)),
            totalCount: Math.max(0, state.totalCount - ids.length),
            loading: false
          }));
        })
      )
    )
  };
  }),

  // Lifecycle Hooks
  withHooks({
    onInit(store) {
      // Auto-load leads when store is initialized
      store['loadLeads']({});
    }
  })
);
