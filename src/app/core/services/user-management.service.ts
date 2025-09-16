import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
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
  UserDetailDto
} from '../models/user-management.models';

@Injectable({
  providedIn: 'root'
})
export class UserManagementService {
  private readonly API_URL = `${environment.api.baseUrl}/users`;

  constructor(private http: HttpClient) {}

  // Get all users
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.API_URL);
  }

  // Get user by ID
  getUserById(id: string): Observable<UserDetailDto> {
    return this.http.get<UserDetailDto>(`${this.API_URL}/${id}`);
  }

  // Create new user
  createUser(request: CreateUserRequest): Observable<CreateUserResponse> {
    return this.http.post<CreateUserResponse>(this.API_URL, request);
  }

  // Update user
  updateUser(id: string, request: UpdateUserRequest): Observable<User> {
    return this.http.patch<User>(`${this.API_URL}/${id}`, request);
  }

  // Update user profile
  updateUserProfile(id: string, request: UpdateUserProfileRequest): Observable<UpdateUserProfileResponse> {
    return this.http.patch<UpdateUserProfileResponse>(`${this.API_URL}/${id}/profile`, request);
  }

  // Assign roles to user
  assignRolesToUser(id: string, request: AssignRolesRequest): Observable<AssignRolesToUserResponse> {
    return this.http.post<AssignRolesToUserResponse>(`${this.API_URL}/${id}/assign-roles`, request);
  }

  // Delete user
  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }
}