import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Contact } from '../models/crm.models';
import {
  PaginatedResponse,
  ApiResponse,
  ContactFilter,
  ContactCreateDto,
  ContactUpdateDto
} from '../models/api-response.models';

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.api.baseUrl}/v1/contacts`;

  // CRUD Operations
  getContacts(filter?: ContactFilter): Observable<PaginatedResponse<Contact>> {
    let params = new HttpParams();

    if (filter) {
      if (filter.pageNumber) params = params.set('pageNumber', filter.pageNumber.toString());
      if (filter.pageSize) params = params.set('pageSize', filter.pageSize.toString());
      if (filter.sortBy) params = params.set('sortBy', filter.sortBy);
      if (filter.sortDirection) params = params.set('sortDirection', filter.sortDirection);
      if (filter.search) params = params.set('searchTerm', filter.search);
      // isActive filter not available in ContactFilter interface
      if (filter.accountId) params = params.set('accountId', filter.accountId);
      if (filter.ownerId) params = params.set('ownerId', filter.ownerId);
      if (filter.department) params = params.set('department', filter.department);
      if (filter.title) params = params.set('title', filter.title);
      // createdDateFrom filter not available in ContactFilter interface
      // createdDateTo filter not available in ContactFilter interface
    }

    return this.http.get<PaginatedResponse<Contact>>(this.baseUrl, { params });
  }

  getContact(id: string): Observable<Contact> {
    return this.http.get<Contact>(`${this.baseUrl}/${id}`);
  }

  createContact(contact: ContactCreateDto): Observable<ApiResponse<Contact>> {
    return this.http.post<ApiResponse<Contact>>(this.baseUrl, contact);
  }

  updateContact(id: string, contact: ContactUpdateDto): Observable<ApiResponse<Contact>> {
    return this.http.put<ApiResponse<Contact>>(`${this.baseUrl}/${id}`, contact);
  }

  deleteContact(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/${id}`);
  }

  // Relationship Management
  getContactHierarchy(contactId: string): Observable<Contact[]> {
    return this.http.get<Contact[]>(`${this.baseUrl}/${contactId}/hierarchy`);
  }

  getDirectReports(contactId: string): Observable<Contact[]> {
    return this.http.get<Contact[]>(`${this.baseUrl}/${contactId}/direct-reports`);
  }

  // Account Relationships
  getContactsByAccount(accountId: string): Observable<Contact[]> {
    return this.http.get<Contact[]>(`${this.baseUrl}/by-account/${accountId}`);
  }

  // Search and Filtering
  searchContacts(query: string, filters?: {
    accountId?: string;
    department?: string;
    title?: string;
    limit?: number;
  }): Observable<Contact[]> {
    let params = new HttpParams().set('q', query);

    if (filters) {
      if (filters.accountId) params = params.set('accountId', filters.accountId);
      if (filters.department) params = params.set('department', filters.department);
      if (filters.title) params = params.set('title', filters.title);
      if (filters.limit) params = params.set('limit', filters.limit.toString());
    }

    return this.http.get<Contact[]>(`${this.baseUrl}/search`, { params });
  }

  getDecisionMakers(accountId?: string): Observable<Contact[]> {
    let params = new HttpParams();
    if (accountId) params = params.set('accountId', accountId);

    return this.http.get<Contact[]>(`${this.baseUrl}/decision-makers`, { params });
  }

  // Export
  exportContacts(filter?: ContactFilter, format: 'csv' | 'excel' = 'csv'): Observable<Blob> {
    let params = new HttpParams().set('format', format);

    if (filter) {
      if (filter.accountId) params = params.set('accountId', filter.accountId);
      if (filter.department) params = params.set('department', filter.department);
      if (filter.ownerId) params = params.set('ownerId', filter.ownerId);
    }

    return this.http.get(`${this.baseUrl}/export`, {
      params,
      responseType: 'blob'
    });
  }

  // Dashboard-level metrics
  getContactsDashboardMetrics(): Observable<{
    totalContacts: number;
    activeContacts: number;
    decisionMakers: number;
    newContactsThisMonth: number;
    contactsByDepartment: { [department: string]: number };
    communicationPreferences: { [method: string]: number };
  }> {
    return this.http.get<any>(`${this.baseUrl}/dashboard-metrics`);
  }
}