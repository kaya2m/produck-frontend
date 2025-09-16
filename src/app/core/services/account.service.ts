import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Account, AccountType, Territory } from '../models/crm.models';
import {
  PaginatedResponse,
  ApiResponse,
  AccountFilter,
  AccountCreateDto,
  AccountUpdateDto,
  AccountStatusUpdateDto,
  BulkUpdateDto,
  BulkDeleteDto
} from '../models/api-response.models';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = `${environment.api.baseUrl}/v1/accounts`;

  // Account CRUD Operations
  getAccounts(filter?: AccountFilter): Observable<PaginatedResponse<Account>> {
    let params = new HttpParams();

    if (filter) {
      Object.keys(filter).forEach(key => {
        const value = (filter as any)[key];
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<PaginatedResponse<Account>>(this.API_URL, { params });
  }

  getAccountById(id: string): Observable<Account> {
    return this.http.get<Account>(`${this.API_URL}/${id}`);
  }

  createAccount(account: AccountCreateDto): Observable<Account> {
    return this.http.post<Account>(this.API_URL, account);
  }

  updateAccount(id: string, account: AccountUpdateDto): Observable<Account> {
    return this.http.put<Account>(`${this.API_URL}/${id}`, account);
  }

  updateAccountStatus(id: string, status: AccountStatusUpdateDto): Observable<void> {
    return this.http.patch<void>(`${this.API_URL}/${id}/status`, status);
  }

  deleteAccount(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.API_URL}/${id}`);
  }

  // Account Hierarchy
  getChildAccounts(parentAccountId: string): Observable<Account[]> {
    return this.http.get<Account[]>(`${this.API_URL}/${parentAccountId}/children`);
  }

  // Account Relationships
  getAccountContacts(accountId: string): Observable<PaginatedResponse<any>> {
    return this.http.get<PaginatedResponse<any>>(`${this.API_URL}/${accountId}/contacts`);
  }

  getAccountOpportunities(accountId: string): Observable<PaginatedResponse<any>> {
    return this.http.get<PaginatedResponse<any>>(`${this.API_URL}/${accountId}/opportunities`);
  }

  getAccountOrders(accountId: string): Observable<PaginatedResponse<any>> {
    return this.http.get<PaginatedResponse<any>>(`${this.API_URL}/${accountId}/orders`);
  }

  getAccountActivities(accountId: string): Observable<PaginatedResponse<any>> {
    return this.http.get<PaginatedResponse<any>>(`${this.API_URL}/${accountId}/activities`);
  }

  getAccountCases(accountId: string): Observable<PaginatedResponse<any>> {
    return this.http.get<PaginatedResponse<any>>(`${this.API_URL}/${accountId}/cases`);
  }

  // Account Types
  getAccountTypes(): Observable<AccountType[]> {
    return this.http.get<AccountType[]>(`${environment.api.baseUrl}/lookups/account-types`);
  }

  // Territories
  getTerritories(): Observable<Territory[]> {
    return this.http.get<Territory[]>(`${environment.api.baseUrl}/territories`);
  }

  // Account Assignment
  assignAccountToUser(accountId: string, userId: string): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.API_URL}/${accountId}/assign`, { userId });
  }

  assignAccountToTerritory(accountId: string, territoryId: string): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.API_URL}/${accountId}/territory`, { territoryId });
  }

  // Bulk Operations
  bulkUpdateAccounts(accountIds: string[], updates: Partial<Account>): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(`${this.API_URL}/bulk`, { accountIds, updates });
  }

  bulkDeleteAccounts(accountIds: string[]): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.API_URL}/bulk`, { body: { accountIds } });
  }

  // Search and Analytics
  searchAccounts(searchTerm: string, limit: number = 10): Observable<Account[]> {
    const params = new HttpParams()
      .set('q', searchTerm)
      .set('limit', limit.toString());

    return this.http.get<Account[]>(`${this.API_URL}/search`, { params });
  }

  getAccountMetrics(accountId: string): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/${accountId}/metrics`);
  }

  // Dashboard-level metrics
  getAccountsDashboardMetrics(): Observable<{
    totalAccounts: number;
    activeAccounts: number;
    inactiveAccounts: number;
    newAccountsThisMonth: number;
    totalRevenue: number;
    averageAccountValue: number;
  }> {
    return this.http.get<any>(`${this.API_URL}/dashboard-metrics`);
  }

  // Export
  exportAccounts(filter?: AccountFilter): Observable<Blob> {
    let params = new HttpParams();

    if (filter) {
      Object.keys(filter).forEach(key => {
        const value = (filter as any)[key];
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get(`${this.API_URL}/export`, {
      params,
      responseType: 'blob'
    });
  }
}