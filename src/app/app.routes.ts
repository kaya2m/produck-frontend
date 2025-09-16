import { Routes } from '@angular/router';
import { signalAuthGuard } from './core/guards/modern-auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login.component').then(c => c.LoginComponent)
  },
  {
    path: '',
    loadComponent: () => import('./layout/main-layout/main-layout.component').then(c => c.MainLayoutComponent),
    canActivate: [signalAuthGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(c => c.DashboardComponent)
      },
      {
        path: 'leads',
        loadComponent: () => import('./features/leads/leads.component').then(c => c.LeadsComponent)
      },
      {
        path: 'opportunities',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(c => c.DashboardComponent) // Geçici
      },
      {
        path: 'accounts',
        loadComponent: () => import('./features/accounts/accounts.component').then(c => c.AccountsComponent)
      },
      {
        path: 'contacts',
        loadComponent: () => import('./features/contacts/contacts.component').then(c => c.ContactsComponent)
      },
      {
        path: 'pipeline',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(c => c.DashboardComponent) // Geçici
      },
      {
        path: 'marketing',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(c => c.DashboardComponent) // Geçici
      },
      {
        path: 'tasks',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(c => c.DashboardComponent) // Geçici
      },
      {
        path: 'calendar',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(c => c.DashboardComponent) // Geçici
      },
      {
        path: 'workflow',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(c => c.DashboardComponent) // Geçici
      },
      {
        path: 'reports',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(c => c.DashboardComponent) // Geçici
      },
      {
        path: 'insights',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(c => c.DashboardComponent) // Geçici
      },
      {
        path: 'team',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(c => c.DashboardComponent) // Geçici
      },
      {
        path: 'settings',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(c => c.DashboardComponent) // Geçici
      },
      {
        path: 'admin',
        children: [
          {
            path: 'users',
            loadComponent: () => import('./features/admin/users/users.component').then(c => c.UsersComponent)
          },
          {
            path: 'roles',
            loadComponent: () => import('./features/admin/roles/roles.component').then(c => c.RolesComponent)
          }
        ]
      }
    ]
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];
