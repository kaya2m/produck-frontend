import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import {
  Contact,
  ContactSummary,
  CreateContactRequest,
  UpdateContactRequest,
  UpdateContactStatusRequest,
  ContactsListParams
} from '../models/contact.models';
import { PaginatedResponse } from '../models/auth.models';

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private apiService = inject(ApiService);
  private readonly baseUrl = 'contacts';

  // Get paginated list of contacts
  getAllContacts(params?: ContactsListParams): Observable<PaginatedResponse<ContactSummary>> {
    return this.apiService.getPaginated<ContactSummary>(this.baseUrl, params);
  }

  // Get specific contact by ID
  getContactById(id: string): Observable<Contact> {
    return this.apiService.get<Contact>(`${this.baseUrl}/${id}`);
  }

  // Get contacts for a specific account
  getContactsByAccount(accountId: string): Observable<ContactSummary[]> {
    return this.apiService.get<ContactSummary[]>(`${this.baseUrl}/account/${accountId}`);
  }

  // Get direct reports of a contact
  getDirectReports(contactId: string): Observable<ContactSummary[]> {
    return this.apiService.get<ContactSummary[]>(`${this.baseUrl}/${contactId}/direct-reports`);
  }

  // Create new contact
  createContact(request: CreateContactRequest): Observable<Contact> {
    return this.apiService.post<Contact>(this.baseUrl, request);
  }

  // Update existing contact
  updateContact(id: string, request: UpdateContactRequest): Observable<Contact> {
    return this.apiService.put<Contact>(`${this.baseUrl}/${id}`, request);
  }

  // Update contact status
  updateContactStatus(id: string, request: UpdateContactStatusRequest): Observable<void> {
    return this.apiService.patch<void>(`${this.baseUrl}/${id}/status`, request);
  }

  // Delete contact (soft delete)
  deleteContact(id: string): Observable<void> {
    return this.apiService.delete<void>(`${this.baseUrl}/${id}`);
  }

  // Helper methods for UI formatting
  formatContactName(contact: ContactSummary | Contact): string {
    if (!contact) return '';
    return contact.fullName || `${contact.firstName} ${contact.lastName}`.trim();
  }

  formatDisplayName(contact: ContactSummary | Contact): string {
    if (!contact) return '';
    const name = this.formatContactName(contact);
    return contact.title ? `${name} - ${contact.title}` : name;
  }

  formatPhone(phone?: string): string {
    if (!phone) return '';
    const digits = phone.replace(/\D/g, '');
    if (digits.startsWith('90') && digits.length === 12) {
      return `+90 ${digits.slice(2, 5)} ${digits.slice(5, 8)} ${digits.slice(8, 10)} ${digits.slice(10)}`;
    } else if (digits.startsWith('0') && digits.length === 11) {
      return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 9)} ${digits.slice(9)}`;
    }
    return phone;
  }

  getContactStatusColor(status: string): string {
    switch (status) {
      case 'Active': return '#22c55e';
      case 'Inactive': return '#6b7280';
      case 'LeftCompany': return '#ef4444';
      default: return '#6b7280';
    }
  }

  getContactStatusIcon(status: string): string {
    switch (status) {
      case 'Active': return 'check_circle';
      case 'Inactive': return 'pause_circle';
      case 'LeftCompany': return 'cancel';
      default: return 'help';
    }
  }
}