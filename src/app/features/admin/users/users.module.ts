import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

// Material Modules
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatChipsModule } from '@angular/material/chips';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// Components
import { UsersComponent } from './users.component';
import { UserFormDialogComponent } from './user-form-dialog/user-form-dialog.component';
import { RoleAssignmentDialogComponent } from './role-assignment-dialog/role-assignment-dialog.component';

// Guards
import { AuthGuard } from '../../../core/guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: UsersComponent,
    canActivate: [AuthGuard],
    data: {
      title: 'User Management',
      breadcrumb: 'Users',
      requiresRole: 'Admin'
    }
  }
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),

    // Material Modules
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatChipsModule,
    MatSlideToggleModule,
    MatTooltipModule,
    MatMenuModule,
    MatDividerModule,
    MatProgressSpinnerModule,

    // Components
    UsersComponent,
    UserFormDialogComponent,
    RoleAssignmentDialogComponent
  ]
})
export class UsersModule { }