import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface Team {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  memberCount: number;
}

export interface CreateTeamRequest {
  name: string;
  description?: string;
  isActive: boolean;
}

export interface AddMemberRequest {
  userId: string;
  isAdmin: boolean;
}

export interface UpdateMemberRequest {
  isAdmin: boolean;
}

export interface TeamMember {
  userId: string;
  username: string;
  email: string;
  isTeamAdmin: boolean;
  joinedDate: string;
}

export interface GetTeamMembersResponse {
  members: TeamMember[];
}

@Injectable({
  providedIn: 'root'
})
export class TeamService {
  private readonly BASE_URL = `${environment.api.baseUrl}/teams`;

  constructor(private http: HttpClient) {}

  // Get all teams
  getTeams(): Observable<{ teams: Team[] }> {
    return this.http.get<{ teams: Team[] }>(this.BASE_URL);
  }

  // Get team by ID
  getTeamById(id: string): Observable<Team> {
    return this.http.get<Team>(`${this.BASE_URL}/${id}`);
  }

  // Create new team
  createTeam(request: CreateTeamRequest): Observable<Team> {
    return this.http.post<Team>(this.BASE_URL, request);
  }

  // Update team
  updateTeam(id: string, request: Partial<CreateTeamRequest>): Observable<Team> {
    return this.http.put<Team>(`${this.BASE_URL}/${id}`, request);
  }

  // Delete team
  deleteTeam(id: string): Observable<void> {
    return this.http.delete<void>(`${this.BASE_URL}/${id}`);
  }

  // Add member to team
  addMember(teamId: string, request: AddMemberRequest): Observable<any> {
    return this.http.post(`${this.BASE_URL}/${teamId}/members`, request);
  }

  // Update member role
  updateMemberRole(teamId: string, userId: string, request: UpdateMemberRequest): Observable<any> {
    return this.http.put(`${this.BASE_URL}/${teamId}/members/${userId}/admin`, request);
  }

  // Remove member from team
  removeMember(teamId: string, userId: string): Observable<void> {
    return this.http.delete<void>(`${this.BASE_URL}/${teamId}/members/${userId}`);
  }

  // Get team members
  getTeamMembers(teamId: string): Observable<TeamMember[]> {
    return this.http.get<GetTeamMembersResponse>(`${this.BASE_URL}/${teamId}/members`)
      .pipe(map(response => response.members || []));
  }
}