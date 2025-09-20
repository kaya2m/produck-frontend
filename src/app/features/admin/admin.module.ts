import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

// Guards
import { AuthGuard } from '../../core/guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'users',
    pathMatch: 'full'
  },
  {
    path: 'users',
    loadChildren: () => import('./users/users.module').then(m => m.UsersModule),
    canActivate: [AuthGuard],
    data: {
      title: 'User Management',
      breadcrumb: 'Users'
    }
  },
  {
    path: 'roles',
    loadComponent: () => import('./roles/roles.component').then(c => c.RolesComponent),
    canActivate: [AuthGuard],
    data: {
      title: 'Role Management',
      breadcrumb: 'Roles'
    }
  },
  {
    path: 'teams',
    loadComponent: () => import('./teams/teams.component').then(c => c.TeamsComponent),
    canActivate: [AuthGuard],
    data: {
      title: 'Team Management',
      breadcrumb: 'Teams'
    }
  },
  {
    path: 'security',
    loadComponent: () => import('./security/security.component').then(c => c.SecurityComponent),
    canActivate: [AuthGuard],
    data: {
      title: 'Security Management',
      breadcrumb: 'Security'
    }
  }
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ]
})
export class AdminModule { }