import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { environment } from '../../../environments/environment';
import { User } from '../models/auth.models';
import {
  CreateUserRequest,
  CreateUserResponse,
  UpdateUserRequest,
  UpdateUserProfileRequest,
  UpdateUserProfileResponse,
  AssignRolesRequest,
  AssignRolesToUserResponse,
  UserDetailDto,
  UserDto
} from '../models/user-management.models';

@Injectable({
  providedIn: 'root'
})
export class UserManagementService {
  private apiService = inject(ApiService);
  private http = inject(HttpClient);
  private readonly API_ENDPOINT = 'users';

  // Get all users
  getUsers(): Observable<UserDetailDto[]> {
    return this.http.get<any[]>(`${environment.api.baseUrl}/${this.API_ENDPOINT}`)
      .pipe(
        map(users => users.map(user => this.mapToUserDetailDto(user)))
      );
  }

  private mapToUserDetailDto(user: any): UserDetailDto {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      emailConfirmed: user.emailConfirmed,
      phoneNumber: user.phoneNumber,
      phoneNumberConfirmed: user.phoneNumberConfirmed,
      twoFactorEnabled: user.twoFactorEnabled,
      isActive: user.isActive,
      createdDate: user.createdDate,
      roles: user.roles || [],
      lastModifiedDate: user.lastModifiedDate || user.createdDate,
      lockoutEnd: user.lockoutEnd,
      lockoutEnabled: user.lockoutEnabled || false,
      accessFailedCount: user.accessFailedCount || 0
    };
  }

  // Get user by ID
  getUserById(id: string): Observable<UserDetailDto> {
    return this.apiService.get<UserDetailDto>(`${this.API_ENDPOINT}/${id}`);
  }

  // Create new user
  createUser(request: CreateUserRequest): Observable<CreateUserResponse> {
    return this.http.post<CreateUserResponse>(`${environment.api.baseUrl}/${this.API_ENDPOINT}`, request);
  }

  // Update user
  updateUser(id: string, request: UpdateUserRequest): Observable<UserDetailDto> {
    return this.apiService.patch<UserDetailDto>(`${this.API_ENDPOINT}/${id}`, request);
  }

  // Update user profile
  updateUserProfile(id: string, request: UpdateUserProfileRequest): Observable<UpdateUserProfileResponse> {
    return this.apiService.patch<UpdateUserProfileResponse>(`${this.API_ENDPOINT}/${id}/profile`, request);
  }

  // Assign roles to user
  assignRolesToUser(id: string, request: AssignRolesRequest): Observable<AssignRolesToUserResponse> {
    return this.apiService.post<AssignRolesToUserResponse>(`${this.API_ENDPOINT}/${id}/assign-roles`, request);
  }

  // Get all users (simple list)
  getAllUsers(): Observable<UserDto[]> {
    return this.apiService.get<UserDto[]>(this.API_ENDPOINT);
  }

  // Get user with roles (detailed)
  getUserWithRoles(id: string): Observable<UserDetailDto> {
    return this.getUserById(id);
  }

  // Bulk assign roles to multiple users
  bulkAssignRoles(userIds: string[], roleIds: string[]): Observable<AssignRolesToUserResponse[]> {
    const requests = userIds.map(userId =>
      this.assignRolesToUser(userId, { roleIds })
    );

    return new Observable(observer => {
      let completed = 0;
      const results: AssignRolesToUserResponse[] = [];

      requests.forEach((request, index) => {
        request.subscribe({
          next: (response) => {
            results[index] = response;
            completed++;
            if (completed === requests.length) {
              observer.next(results);
              observer.complete();
            }
          },
          error: (error) => observer.error(error)
        });
      });
    });
  }

  // Check if user has specific role
  userHasRole(userId: string, roleName: string): Observable<boolean> {
    return new Observable(observer => {
      this.getUserById(userId).subscribe({
        next: (user) => {
          const hasRole = user.roles.some(role => role.name === roleName);
          observer.next(hasRole);
          observer.complete();
        },
        error: (error) => observer.error(error)
      });
    });
  }

  // Delete user
  deleteUser(id: string): Observable<void> {
    return this.apiService.delete<void>(`${this.API_ENDPOINT}/${id}`);
  }
}