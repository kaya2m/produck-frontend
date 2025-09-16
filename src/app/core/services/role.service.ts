import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Role } from '../models/user-management.models';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private readonly API_URL = `${environment.api.baseUrl}/roles`;

  constructor(private http: HttpClient) {}

  // Get all roles
  getRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(this.API_URL);
  }

  // Create new role
  createRole(request: { name: string; description?: string }): Observable<Role> {
    return this.http.post<Role>(this.API_URL, request);
  }

  // Update role
  updateRole(id: string, request: { name: string; description?: string }): Observable<Role> {
    return this.http.put<Role>(`${this.API_URL}/${id}`, request);
  }

  // Delete role
  deleteRole(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }
}