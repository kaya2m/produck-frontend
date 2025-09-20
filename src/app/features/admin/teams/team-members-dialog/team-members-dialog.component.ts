import { Component, Inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatCheckboxModule } from '@angular/material/checkbox';

// Custom UI Components
import { CardComponent } from '../../../../shared/components/ui/card/card.component';
import { ButtonComponent } from '../../../../shared/components/ui/button/button.component';
import { InputComponent } from '../../../../shared/components/ui/input/input.component';

// Services
import { TeamService } from '../../../../core/services/team.service';
import { UserManagementService } from '../../../../core/services/user-management.service';

// Models
import { Team, TeamMember } from '../../../../core/services/team.service';
import { UserDetailDto } from '../../../../core/models/user-management.models';

export interface TeamMemberDialogData {
  team: Team;
}

@Component({
  selector: 'app-team-members-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatCheckboxModule,
    CardComponent,
    ButtonComponent,
    InputComponent
  ],
  templateUrl: './team-members-dialog.component.html',
  styleUrls: ['./team-members-dialog.component.css']
})
export class TeamMembersDialogComponent implements OnInit {
  // Signals
  currentMembers = signal<TeamMember[]>([]);
  availableUsers = signal<UserDetailDto[]>([]);
  filteredUsers = signal<UserDetailDto[]>([]);
  searchTerm = signal<string>('');
  selectedAdmins = signal<Set<string>>(new Set<string>());

  // Loading states
  isLoadingMembers = signal(false);
  isLoadingUsers = signal(false);
  isAddingUser = signal<string | null>(null);

  constructor(
    private fb: FormBuilder,
    private teamService: TeamService,
    private userManagementService: UserManagementService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<TeamMembersDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: TeamMemberDialogData
  ) {}

  ngOnInit(): void {
    this.loadTeamMembers();
    this.loadAvailableUsers();
  }

  async loadTeamMembers(): Promise<void> {
    this.isLoadingMembers.set(true);
    try {
      const members = await this.teamService.getTeamMembers(this.data.team.id).toPromise();
      // Ensure we always set an array
      const membersArray = Array.isArray(members) ? members : [];
      this.currentMembers.set(membersArray);
    } catch (error) {
      console.error('Error loading team members:', error);
      this.currentMembers.set([]); // Set empty array on error
      this.snackBar.open('Failed to load team members', 'Close', { duration: 3000 });
    } finally {
      this.isLoadingMembers.set(false);
    }
  }

  async loadAvailableUsers(): Promise<void> {
    this.isLoadingUsers.set(true);
    try {
      const allUsers = await this.userManagementService.getUsers().toPromise();
      // Ensure we have an array
      const usersArray = Array.isArray(allUsers) ? allUsers : [];
      const currentMembers = this.currentMembers();
      const currentMemberIds = Array.isArray(currentMembers) ? currentMembers.map(m => m.userId) : [];

      const available = usersArray.filter((user: UserDetailDto) => !currentMemberIds.includes(user.id));
      this.availableUsers.set(available);
      this.filteredUsers.set(available);
    } catch (error) {
      console.error('Error loading users:', error);
      this.availableUsers.set([]); // Set empty arrays on error
      this.filteredUsers.set([]);
      this.snackBar.open('Failed to load users', 'Close', { duration: 3000 });
    } finally {
      this.isLoadingUsers.set(false);
    }
  }

  onSearchChange(event: any): void {
    const term = event.target.value?.toLowerCase() || '';
    this.searchTerm.set(term);

    const users = this.availableUsers();
    const filtered = Array.isArray(users) ? users.filter(user =>
      user.username?.toLowerCase().includes(term) ||
      user.email?.toLowerCase().includes(term)
    ) : [];
    this.filteredUsers.set(filtered);
  }

  toggleUserAdmin(userId: string, event: any): void {
    const admins = new Set(this.selectedAdmins());
    if (event.target.checked) {
      admins.add(userId);
    } else {
      admins.delete(userId);
    }
    this.selectedAdmins.set(admins);
  }

  async addMemberToTeam(user: UserDetailDto): Promise<void> {
    this.isAddingUser.set(user.id);
    try {
      const isAdmin = this.selectedAdmins().has(user.id);
      await this.teamService.addMember(this.data.team.id, {
        userId: user.id,
        isAdmin
      }).toPromise();

      // Remove from available users and reload members
      this.availableUsers.update(users => users.filter(u => u.id !== user.id));
      this.filteredUsers.update(users => users.filter(u => u.id !== user.id));

      // Remove from selected admins
      this.selectedAdmins.update(admins => {
        const newSet = new Set(admins);
        newSet.delete(user.id);
        return newSet;
      });

      await this.loadTeamMembers();
      this.snackBar.open(`${user.username} added to team successfully`, 'Close', { duration: 3000 });
    } catch (error) {
      console.error('Error adding user to team:', error);
      this.snackBar.open('Failed to add user to team', 'Close', { duration: 3000 });
    } finally {
      this.isAddingUser.set(null);
    }
  }

  async toggleMemberAdmin(member: TeamMember): Promise<void> {
    try {
      await this.teamService.updateMemberRole(this.data.team.id, member.userId, {
        isAdmin: !member.isTeamAdmin
      }).toPromise();

      this.currentMembers.update(members =>
        members.map(m => m.userId === member.userId ? { ...m, isTeamAdmin: !m.isTeamAdmin } : m)
      );

      this.snackBar.open(
        `${member.username} ${!member.isTeamAdmin ? 'promoted to' : 'removed from'} admin role`,
        'Close',
        { duration: 3000 }
      );
    } catch (error) {
      console.error('Error updating member role:', error);
      this.snackBar.open('Failed to update member role', 'Close', { duration: 3000 });
    }
  }

  async removeMember(member: TeamMember): Promise<void> {
    if (confirm(`Are you sure you want to remove ${member.username} from the team?`)) {
      try {
        await this.teamService.removeMember(this.data.team.id, member.userId).toPromise();

        this.currentMembers.update(members => members.filter(m => m.userId !== member.userId));
        await this.loadAvailableUsers(); // Refresh available users

        this.snackBar.open(`${member.username} removed from team`, 'Close', { duration: 3000 });
      } catch (error) {
        console.error('Error removing member:', error);
        this.snackBar.open('Failed to remove member', 'Close', { duration: 3000 });
      }
    }
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}