import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

// Material Components
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';

// Custom UI Components
import { InputComponent, ButtonComponent, CardComponent } from '../../../shared/components/ui';

// Services
import { TeamService, Team, CreateTeamRequest } from '../../../core/services/team.service';

// Dialogs
import { TeamMembersDialogComponent } from './team-members-dialog/team-members-dialog.component';

@Component({
  selector: 'app-teams',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatMenuModule,
    MatDividerModule,
    MatChipsModule,
    InputComponent,
    ButtonComponent,
    CardComponent
  ],
  templateUrl: './teams.component.html',
  styleUrls: ['./teams.component.css']
})
export class TeamsComponent implements OnInit {
  private teamService = inject(TeamService);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  teams = signal<Team[]>([]);
  isLoading = signal(false);
  showCreateForm = false;
  editingTeam: Team | null = null;

  createTeamForm: FormGroup;

  constructor() {
    this.createTeamForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
      isActive: [true]
    });
  }

  ngOnInit(): void {
    this.loadTeams();
  }

  loadTeams(): void {
    this.isLoading.set(true);
    this.teamService.getTeams().subscribe({
      next: (response) => {
        this.teams.set(response.teams || []);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading teams:', error);
        this.snackBar.open('Failed to load teams', 'Close', { duration: 3000 });
        this.isLoading.set(false);
      }
    });
  }

  toggleCreateForm(): void {
    this.showCreateForm = !this.showCreateForm;
    if (this.showCreateForm) {
      this.createTeamForm.reset({ isActive: true });
    }
  }

  cancelCreate(): void {
    this.resetForm();
  }

  private resetForm(): void {
    this.showCreateForm = false;
    this.editingTeam = null;
    this.createTeamForm.reset({ isActive: true });
  }

  createTeam(): void {
    if (this.createTeamForm.valid) {
      this.isLoading.set(true);
      const formValue = this.createTeamForm.value;

      if (this.editingTeam) {
        // Update existing team
        const updateRequest = {
          name: formValue.name,
          description: formValue.description,
          isActive: formValue.isActive
        };

        this.teamService.updateTeam(this.editingTeam.id, updateRequest).subscribe({
          next: (updatedTeam) => {
            this.teams.update(teams =>
              teams.map(t => t.id === this.editingTeam!.id ? { ...t, ...updatedTeam } : t)
            );
            this.resetForm();
            this.snackBar.open('Team updated successfully', 'Close', { duration: 3000 });
            this.isLoading.set(false);
          },
          error: (error) => {
            console.error('Error updating team:', error);
            this.snackBar.open('Failed to update team', 'Close', { duration: 3000 });
            this.isLoading.set(false);
          }
        });
      } else {
        // Create new team
        const createRequest: CreateTeamRequest = formValue;

        this.teamService.createTeam(createRequest).subscribe({
          next: (team) => {
            this.teams.update(teams => [...teams, team]);
            this.resetForm();
            this.snackBar.open('Team created successfully', 'Close', { duration: 3000 });
            this.isLoading.set(false);
          },
          error: (error) => {
            console.error('Error creating team:', error);
            this.snackBar.open('Failed to create team', 'Close', { duration: 3000 });
            this.isLoading.set(false);
          }
        });
      }
    }
  }

  editTeam(team: Team): void {
    // Set the form to edit mode and populate with team data
    this.showCreateForm = true;
    this.createTeamForm.patchValue({
      name: team.name,
      description: team.description || '',
      isActive: team.isActive
    });

    // Store the team being edited
    this.editingTeam = team;
  }

  viewMembers(team: Team): void {
    const dialogRef = this.dialog.open(TeamMembersDialogComponent, {
      width: '800px',
      maxWidth: '90vw',
      maxHeight: '90vh',
      data: { team },
      disableClose: false,
      autoFocus: false
    });

    dialogRef.afterClosed().subscribe(result => {
      // Refresh teams list in case member counts changed
      this.loadTeams();
    });
  }

  toggleTeamStatus(team: Team): void {
    const newStatus = !team.isActive;
    this.isLoading.set(true);

    const updateRequest = {
      name: team.name,
      description: team.description,
      isActive: newStatus
    };

    this.teamService.updateTeam(team.id, updateRequest).subscribe({
      next: (updatedTeam) => {
        this.teams.update(teams =>
          teams.map(t => t.id === team.id ? { ...t, isActive: newStatus } : t)
        );
        this.snackBar.open(
          `Team ${newStatus ? 'activated' : 'deactivated'} successfully`,
          'Close',
          { duration: 3000 }
        );
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error updating team status:', error);
        this.snackBar.open('Failed to update team status', 'Close', { duration: 3000 });
        this.isLoading.set(false);
      }
    });
  }

  deleteTeam(teamId: string): void {
    if (confirm('Are you sure you want to delete this team? This action cannot be undone.')) {
      this.teamService.deleteTeam(teamId).subscribe({
        next: () => {
          this.teams.update(teams => teams.filter(t => t.id !== teamId));
          this.snackBar.open('Team deleted successfully', 'Close', { duration: 3000 });
        },
        error: (error) => {
          console.error('Error deleting team:', error);
          this.snackBar.open('Failed to delete team', 'Close', { duration: 3000 });
        }
      });
    }
  }


  // Context Menu Methods
  viewTeamDetails(team: Team): void {
    console.log('View team details:', team);
    this.snackBar.open('Takım detayları özelliği yakında eklenecek', 'Close', { duration: 3000 });
  }

  duplicateTeam(team: Team): void {
    const duplicatedTeam = {
      name: `${team.name} (Kopya)`,
      description: team.description,
      isActive: true
    };

    this.teamService.createTeam(duplicatedTeam).subscribe({
      next: () => {
        this.snackBar.open('Takım başarıyla kopyalandı', 'Close', { duration: 3000 });
        this.loadTeams();
      },
      error: (error) => {
        console.error('Error duplicating team:', error);
        this.snackBar.open('Takım kopyalanırken hata oluştu', 'Close', { duration: 3000 });
      }
    });
  }

  exportTeamData(team: Team): void {
    console.log('Export team data:', team);
    this.snackBar.open('Takım verilerini dışa aktarma özelliği yakında eklenecek', 'Close', { duration: 3000 });
  }
}