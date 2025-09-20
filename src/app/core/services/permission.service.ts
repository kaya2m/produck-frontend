import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import {
  Permission,
  CreatePermissionRequest,
  CreatePermissionResponse,
  UpdatePermissionRequest,
  UpdatePermissionResponse,
  InitializeDefaultPermissionsResponse
} from '../models/user-management.models';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  private apiService = inject(ApiService);
  private readonly baseUrl = 'permissions';

  getAllPermissions(): Observable<Permission[]> {
    return this.apiService.get<Permission[]>(this.baseUrl);
  }

  getPermissionById(id: string): Observable<Permission> {
    return this.apiService.get<Permission>(`${this.baseUrl}/${id}`);
  }

  getPermissionsByCategory(category: string): Observable<Permission[]> {
    return this.apiService.get<Permission[]>(`${this.baseUrl}/category/${category}`);
  }

  createPermission(request: CreatePermissionRequest): Observable<CreatePermissionResponse> {
    return this.apiService.post<CreatePermissionResponse>(this.baseUrl, request);
  }

  updatePermission(id: string, request: UpdatePermissionRequest): Observable<UpdatePermissionResponse> {
    return this.apiService.put<UpdatePermissionResponse>(`${this.baseUrl}/${id}`, request);
  }

  deletePermission(id: string): Observable<void> {
    return this.apiService.delete<void>(`${this.baseUrl}/${id}`);
  }

  initializeDefaultPermissions(): Observable<InitializeDefaultPermissionsResponse> {
    return this.apiService.post<InitializeDefaultPermissionsResponse>(`${this.baseUrl}/initialize-defaults`, {});
  }

  getPermissionCategories(): Observable<string[]> {
    return new Observable(observer => {
      this.getAllPermissions().subscribe({
        next: (permissions) => {
          const categories = [...new Set(permissions.map(p => p.category))].sort();
          observer.next(categories);
          observer.complete();
        },
        error: (error) => observer.error(error)
      });
    });
  }
}