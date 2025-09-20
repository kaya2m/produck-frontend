import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import {
  Account,
  AccountSummary,
  CreateAccountRequest,
  UpdateAccountRequest,
  UpdateAccountStatusRequest,
  AccountsListParams
} from '../models/account.models';
import { PaginatedResponse } from '../models/auth.models';
import { LookupOption } from './configuration.service';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private apiService = inject(ApiService);
  private readonly baseUrl = 'accounts';

  getAllAccounts(params?: AccountsListParams): Observable<PaginatedResponse<AccountSummary>> {
    return this.apiService.getPaginated<AccountSummary>(this.baseUrl, params);
  }

  getAccountById(id: string): Observable<Account> {
    return this.apiService.get<Account>(`${this.baseUrl}/${id}`);
  }

  createAccount(request: CreateAccountRequest): Observable<Account> {
    return this.apiService.post<Account>(this.baseUrl, request);
  }

  updateAccount(id: string, request: UpdateAccountRequest): Observable<Account> {
    return this.apiService.put<Account>(`${this.baseUrl}/${id}`, request);
  }

  updateAccountStatus(id: string, request: UpdateAccountStatusRequest): Observable<void> {
    return this.apiService.patch<void>(`${this.baseUrl}/${id}/status`, request);
  }

  deleteAccount(id: string): Observable<void> {
    return this.apiService.delete<void>(`${this.baseUrl}/${id}`);
  }

  getChildAccounts(id: string): Observable<AccountSummary[]> {
    return this.apiService.get<AccountSummary[]>(`${this.baseUrl}/${id}/children`);
  }

  // Dropdown/Lookup methods - ready for API integration
  getCustomerTypes(): Observable<LookupOption[]> {
    // TODO: When backend is ready, replace with:
    // return this.apiService.get<LookupOption[]>('lookup/customer-types');
    return this.apiService.get<LookupOption[]>('lookup/customer-types');
  }

  getAccountStatuses(): Observable<LookupOption[]> {
    // TODO: When backend is ready, replace with:
    // return this.apiService.get<LookupOption[]>('lookup/account-statuses');
    return this.apiService.get<LookupOption[]>('lookup/account-statuses');
  }

  getCurrencies(): Observable<LookupOption[]> {
    // TODO: When backend is ready, replace with:
    // return this.apiService.get<LookupOption[]>('lookup/currencies');
    return this.apiService.get<LookupOption[]>('lookup/currencies');
  }

  getPaymentTerms(): Observable<LookupOption[]> {
    // TODO: When backend is ready, replace with:
    // return this.apiService.get<LookupOption[]>('lookup/payment-terms');
    return this.apiService.get<LookupOption[]>('lookup/payment-terms');
  }

  getIndustries(): Observable<LookupOption[]> {
    // TODO: When backend is ready, replace with:
    // return this.apiService.get<LookupOption[]>('lookup/industries');
    return this.apiService.get<LookupOption[]>('lookup/industries');
  }

}