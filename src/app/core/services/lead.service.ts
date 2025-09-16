import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Lead, LeadSource, LeadCategory, LeadStatusEntity, LeadRating } from '../models/crm.models';
import {
  PaginatedResponse,
  ApiResponse,
  LeadFilter,
  LeadCreateDto,
  LeadUpdateDto,
  LeadStatusUpdateDto,
  LeadConversionDto,
  LeadConversionResult,
  LeadScoreBreakdown,
  LeadSourceAnalytics,
  ConversionRateAnalytics,
  BulkUpdateDto,
  BulkDeleteDto,
  BulkAssignmentDto
} from '../models/api-response.models';

@Injectable({
  providedIn: 'root'
})
export class LeadService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = `${environment.api.baseUrl}/v1/leads`;

  // Lead CRUD Operations
  getLeads(filter?: LeadFilter): Observable<PaginatedResponse<Lead>> {
    let params = new HttpParams();

    if (filter) {
      Object.keys(filter).forEach(key => {
        const value = (filter as any)[key];
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<PaginatedResponse<Lead>>(this.API_URL, { params });
  }

  getLeadById(id: string): Observable<Lead> {
    return this.http.get<Lead>(`${this.API_URL}/${id}`);
  }

  createLead(lead: Partial<Lead>): Observable<ApiResponse<Lead>> {
    return this.http.post<ApiResponse<Lead>>(this.API_URL, lead);
  }

  updateLead(id: string, lead: Partial<Lead>): Observable<ApiResponse<Lead>> {
    return this.http.put<ApiResponse<Lead>>(`${this.API_URL}/${id}`, lead);
  }

  deleteLead(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.API_URL}/${id}`);
  }

  // Lead Scoring
  updateLeadScore(leadId: string, score: number): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(`${this.API_URL}/${leadId}/score`, { score });
  }

  calculateLeadScore(leadId: string): Observable<ApiResponse<{ score: number; factors: any[] }>> {
    return this.http.post<ApiResponse<{ score: number; factors: any[] }>>(`${this.API_URL}/${leadId}/calculate-score`, {});
  }

  getLeadsByScore(minScore: number, maxScore: number): Observable<Lead[]> {
    const params = new HttpParams()
      .set('minScore', minScore.toString())
      .set('maxScore', maxScore.toString());

    return this.http.get<Lead[]>(`${this.API_URL}/by-score`, { params });
  }

  // Lead Qualification
  qualifyLead(leadId: string, qualificationData: {
    budget?: number;
    authority?: boolean;
    need?: string;
    timeline?: string;
    notes?: string;
  }): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.API_URL}/${leadId}/qualify`, qualificationData);
  }

  disqualifyLead(leadId: string, reason: string): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.API_URL}/${leadId}/disqualify`, { reason });
  }

  // Lead Conversion
  convertLead(leadId: string, conversionData: {
    createAccount: boolean;
    accountName?: string;
    createContact: boolean;
    createOpportunity: boolean;
    opportunityName?: string;
    opportunityAmount?: number;
    opportunityCloseDate?: Date;
  }): Observable<ApiResponse<{
    accountId?: string;
    contactId?: string;
    opportunityId?: string;
  }>> {
    return this.http.post<ApiResponse<{
      accountId?: string;
      contactId?: string;
      opportunityId?: string;
    }>>(`${this.API_URL}/${leadId}/convert`, conversionData);
  }

  getConversionHistory(leadId: string): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/${leadId}/conversion-history`);
  }

  // Lead Assignment and Distribution
  assignLead(leadId: string, userId: string): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.API_URL}/${leadId}/assign`, { userId });
  }

  distributeLeads(leadIds: string[], distributionRules: {
    method: 'RoundRobin' | 'Territory' | 'Workload' | 'Random';
    userIds?: string[];
    territoryId?: string;
  }): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.API_URL}/distribute`, {
      leadIds,
      distributionRules
    });
  }

  // Lead Status Management
  updateLeadStatus(leadId: string, statusId: string, notes?: string): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(`${this.API_URL}/${leadId}/status`, {
      statusId,
      notes
    });
  }

  getLeadStatusHistory(leadId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/${leadId}/status-history`);
  }

  // Lead Activities
  getLeadActivities(leadId: string): Observable<PaginatedResponse<any>> {
    return this.http.get<PaginatedResponse<any>>(`${this.API_URL}/${leadId}/activities`);
  }

  // Lead Sources and Analytics
  getLeadSources(): Observable<LeadSource[]> {
    return this.http.get<LeadSource[]>(`${environment.api.baseUrl}/lookups/lead-sources`);
  }

  getLeadStatuses(): Observable<LeadStatusEntity[]> {
    return this.http.get<LeadStatusEntity[]>(`${environment.api.baseUrl}/lookups/lead-statuses`);
  }

  getLeadMetrics(leadId: string): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/${leadId}/metrics`);
  }

  getLeadSourceAnalytics(dateFrom?: Date, dateTo?: Date): Observable<any[]> {
    let params = new HttpParams();
    if (dateFrom) params = params.set('dateFrom', dateFrom.toISOString());
    if (dateTo) params = params.set('dateTo', dateTo.toISOString());

    return this.http.get<any[]>(`${this.API_URL}/source-analytics`, { params });
  }

  getLeadConversionRates(period: 'Week' | 'Month' | 'Quarter' | 'Year'): Observable<any> {
    const params = new HttpParams().set('period', period);
    return this.http.get<any>(`${this.API_URL}/conversion-rates`, { params });
  }

  // Bulk Operations
  bulkUpdateLeads(leadIds: string[], updates: Partial<Lead>): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(`${this.API_URL}/bulk`, { leadIds, updates });
  }

  bulkDeleteLeads(leadIds: string[]): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.API_URL}/bulk`, { body: { leadIds } });
  }

  bulkAssignLeads(leadIds: string[], userId: string): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.API_URL}/bulk-assign`, { leadIds, userId });
  }

  bulkConvertLeads(leadIds: string[], conversionTemplate: any): Observable<ApiResponse<any[]>> {
    return this.http.post<ApiResponse<any[]>>(`${this.API_URL}/bulk-convert`, {
      leadIds,
      conversionTemplate
    });
  }

  // Search and Filtering
  searchLeads(searchTerm: string, limit: number = 10): Observable<Lead[]> {
    const params = new HttpParams()
      .set('q', searchTerm)
      .set('limit', limit.toString());

    return this.http.get<Lead[]>(`${this.API_URL}/search`, { params });
  }

  getLeadsByOwner(ownerId: string): Observable<Lead[]> {
    return this.http.get<Lead[]>(`${this.API_URL}/by-owner/${ownerId}`);
  }

  getLeadsByStatus(statusId: string): Observable<Lead[]> {
    return this.http.get<Lead[]>(`${this.API_URL}/by-status/${statusId}`);
  }

  getLeadsBySource(sourceId: string): Observable<Lead[]> {
    return this.http.get<Lead[]>(`${this.API_URL}/by-source/${sourceId}`);
  }

  getLeadsByRating(rating: LeadRating): Observable<Lead[]> {
    return this.http.get<Lead[]>(`${this.API_URL}/by-rating/${rating}`);
  }

  // Duplicate Detection
  findDuplicateLeads(lead: Partial<Lead>): Observable<Lead[]> {
    return this.http.post<Lead[]>(`${this.API_URL}/find-duplicates`, lead);
  }

  mergeDuplicateLeads(primaryLeadId: string, duplicateLeadIds: string[]): Observable<ApiResponse<Lead>> {
    return this.http.post<ApiResponse<Lead>>(`${this.API_URL}/merge`, {
      primaryLeadId,
      duplicateLeadIds
    });
  }

  // Import/Export
  exportLeads(filter?: LeadFilter): Observable<Blob> {
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

  importLeads(file: File, options?: {
    assignToUser?: string;
    defaultSource?: string;
    defaultStatus?: string;
  }): Observable<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('file', file);

    if (options) {
      formData.append('options', JSON.stringify(options));
    }

    return this.http.post<ApiResponse<any>>(`${this.API_URL}/import`, formData);
  }

  // Lead Nurturing
  addToNurturingCampaign(leadId: string, campaignId: string): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.API_URL}/${leadId}/nurturing`, { campaignId });
  }

  removeFromNurturingCampaign(leadId: string, campaignId: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.API_URL}/${leadId}/nurturing/${campaignId}`);
  }

  getNurturingCampaigns(leadId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/${leadId}/nurturing-campaigns`);
  }

  // Dashboard-level metrics
  getLeadsDashboardMetrics(): Observable<{
    totalLeads: number;
    hotLeads: number;
    qualifiedLeads: number;
    staleLeads: number;
    conversionRate: number;
    averageLeadScore: number;
    newLeadsThisMonth: number;
  }> {
    return this.http.get<any>(`${this.API_URL}/dashboard-metrics`);
  }
}