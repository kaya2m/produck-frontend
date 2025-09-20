import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import {
  Role,
  RoleWithPermissions,
  Permission,
  CreateRoleRequest,
  CreateRoleResponse,
  UpdateRoleRequest,
  UpdateRoleResponse,
  AssignPermissionsRequest,
  AssignPermissionsResponse,
  RemovePermissionsRequest,
  RemovePermissionsResponse
} from '../models/user-management.models';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private apiService = inject(ApiService);
  private readonly baseUrl = 'roles';

  getAllRoles(): Observable<Role[]> {
    return this.apiService.get<Role[]>(this.baseUrl);
  }

  getRoleById(id: string): Observable<Role> {
    return this.apiService.get<Role>(`${this.baseUrl}/${id}`);
  }

  createRole(request: CreateRoleRequest): Observable<CreateRoleResponse> {
    return this.apiService.post<CreateRoleResponse>(this.baseUrl, request);
  }

  updateRole(id: string, request: UpdateRoleRequest): Observable<UpdateRoleResponse> {
    return this.apiService.put<UpdateRoleResponse>(`${this.baseUrl}/${id}`, request);
  }

  deleteRole(id: string): Observable<void> {
    return this.apiService.delete<void>(`${this.baseUrl}/${id}`);
  }

  getRolePermissions(roleId: string): Observable<Permission[]> {
    return this.apiService.get<Permission[]>(`${this.baseUrl}/${roleId}/permissions`);
  }

  assignPermissions(roleId: string, request: AssignPermissionsRequest): Observable<AssignPermissionsResponse> {
    return this.apiService.post<AssignPermissionsResponse>(`${this.baseUrl}/${roleId}/assign-permissions`, request);
  }

  removePermissions(roleId: string, request: RemovePermissionsRequest): Observable<RemovePermissionsResponse> {
    return this.apiService.delete<RemovePermissionsResponse>(`${this.baseUrl}/${roleId}/remove-permissions`, request);
  }

  getRoleWithPermissions(roleId: string): Observable<RoleWithPermissions> {
    return new Observable(observer => {
      this.getRoleById(roleId).subscribe({
        next: (role) => {
          this.getRolePermissions(roleId).subscribe({
            next: (permissions) => {
              observer.next({ ...role, permissions });
              observer.complete();
            },
            error: (error) => observer.error(error)
          });
        },
        error: (error) => observer.error(error)
      });
    });
  }

  // Legacy methods for backward compatibility
  getRoles(): Observable<Role[]> {
    return this.getAllRoles();
  }

  assignPermissions_legacy(id: string, permissionIds: string[]): Observable<AssignPermissionsResponse> {
    return this.assignPermissions(id, { permissionIds });
  }
}