import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Lead, LeadSource, LeadCategory, LeadStatusEntity, LeadRating, LeadStatus } from '../models/crm.models';
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
  private readonly API_URL = `${environment.api.baseUrl}/Leads`;

  // Lead CRUD Operations
  getLeads(filter?: LeadFilter): Observable<PaginatedResponse<Lead>> {
    let params = new HttpParams();
    const normalizedFilter = this.normalizeFilter(filter);

    Object.entries(normalizedFilter).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, value.toString());
      }
    });

    return this.http.get<any>(this.API_URL, { params })
      .pipe(map(response => this.mapPaginatedResponse(response)));
  }

  getLeadById(id: string): Observable<Lead> {
    return this.http.get<any>(`${this.API_URL}/${id}`)
      .pipe(map(response => this.mapLeadDetail(response)));
  }

  createLead(payload: LeadCreateDto): Observable<Lead> {
    return this.http.post<any>(this.API_URL, payload)
      .pipe(map(response => this.mapLeadDetail(response)));
  }

  updateLead(id: string, payload: LeadUpdateDto): Observable<Lead> {
    return this.http.put<any>(`${this.API_URL}/${id}`, payload)
      .pipe(map(response => this.mapLeadDetail(response)));
  }

  deleteLead(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
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
  updateLeadStatus(leadId: string, status: LeadStatus | string, notes?: string): Observable<void> {
    return this.http.patch<void>(`${this.API_URL}/${leadId}/status`, {
      status,
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

  // Enhanced Lead Views for specialized filtering
  getHotLeads(filter?: LeadFilter): Observable<PaginatedResponse<Lead>> {
    let params = new HttpParams();
    const normalizedFilter = this.normalizeFilter(filter);

    Object.entries(normalizedFilter).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, value.toString());
      }
    });

    return this.http.get<any>(`${this.API_URL}/hot`, { params })
      .pipe(map(response => this.mapPaginatedResponse(response)));
  }

  getQualifiedLeads(filter?: LeadFilter): Observable<PaginatedResponse<Lead>> {
    let params = new HttpParams();
    const normalizedFilter = this.normalizeFilter(filter);

    Object.entries(normalizedFilter).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, value.toString());
      }
    });

    return this.http.get<any>(`${this.API_URL}/qualified`, { params })
      .pipe(map(response => this.mapPaginatedResponse(response)));
  }

  getMyLeads(filter?: LeadFilter): Observable<PaginatedResponse<Lead>> {
    let params = new HttpParams();
    const normalizedFilter = this.normalizeFilter(filter);

    Object.entries(normalizedFilter).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, value.toString());
      }
    });

    return this.http.get<any>(`${this.API_URL}/my-leads`, { params })
      .pipe(map(response => this.mapPaginatedResponse(response)));
  }

  getStaleLeads(filter?: LeadFilter): Observable<PaginatedResponse<Lead>> {
    let params = new HttpParams();
    const normalizedFilter = this.normalizeFilter(filter);

    Object.entries(normalizedFilter).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, value.toString());
      }
    });

    return this.http.get<any>(`${this.API_URL}/stale`, { params })
      .pipe(map(response => this.mapPaginatedResponse(response)));
  }

  // Enhanced Lead Scoring Methods
  recalculateLeadScore(leadId: string): Observable<ApiResponse<{
    previousScore: number;
    newScore: number;
    scoreBreakdown: LeadScoreBreakdown;
  }>> {
    return this.http.post<ApiResponse<{
      previousScore: number;
      newScore: number;
      scoreBreakdown: LeadScoreBreakdown;
    }>>(`${this.API_URL}/${leadId}/recalculate-score`, {});
  }

  getLeadScoreBreakdown(leadId: string): Observable<ApiResponse<LeadScoreBreakdown>> {
    return this.http.get<ApiResponse<LeadScoreBreakdown>>(`${this.API_URL}/${leadId}/score-breakdown`);
  }

  bulkRecalculateScores(leadIds?: string[]): Observable<ApiResponse<{
    processed: number;
    updated: number;
    failed: number;
  }>> {
    const payload = leadIds ? { leadIds } : {};
    return this.http.post<ApiResponse<{
      processed: number;
      updated: number;
      failed: number;
    }>>(`${this.API_URL}/bulk-recalculate-scores`, payload);
  }

  // Enhanced Lead Conversion with detailed tracking
  getLeadConversionPreview(leadId: string): Observable<ApiResponse<{
    accountExists: boolean;
    contactExists: boolean;
    suggestedAccountName: string;
    suggestedContactName: string;
    duplicateWarnings: string[];
  }>> {
    return this.http.get<ApiResponse<{
      accountExists: boolean;
      contactExists: boolean;
      suggestedAccountName: string;
      suggestedContactName: string;
      duplicateWarnings: string[];
    }>>(`${this.API_URL}/${leadId}/conversion-preview`);
  }

  private normalizeFilter(filter?: LeadFilter): Record<string, string | number | boolean | undefined> {
    if (!filter) {
      return {};
    }

    return {
      pageNumber: filter.pageNumber,
      pageSize: filter.pageSize,
      search: filter.search,
      status: filter.status,
      assignedUserId: filter.assignedUserId,
      industryId: filter.industryId,
      sortBy: filter.sortBy,
      sortDirection: filter.sortDirection,
      leadSource: (filter as any).leadSource ?? filter.leadSourceId,
      scoreRange: filter.category ? filter.category.toString().toLowerCase() : undefined,
      daysWithoutActivity: filter.daysWithoutActivity
    };
  }

  private mapPaginatedResponse(response: any): PaginatedResponse<Lead> {
    const payload = response?.data ?? response;
    const rawItems = payload?.items ?? payload?.Items ?? [];
    const items = rawItems.map((item: any) => this.mapLeadList(item));

    return {
      items,
      totalCount: payload?.totalCount ?? payload?.TotalCount ?? items.length,
      pageNumber: payload?.pageNumber ?? payload?.PageNumber ?? 1,
      pageSize: payload?.pageSize ?? payload?.PageSize ?? items.length,
      totalPages: payload?.totalPages ?? payload?.TotalPages ?? 1,
      hasPreviousPage: payload?.hasPreviousPage ?? payload?.HasPreviousPage ?? false,
      hasNextPage: payload?.hasNextPage ?? payload?.HasNextPage ?? false
    };
  }

  private mapLeadList(dto: any): Lead {
    return this.mapLeadFromDto(dto, {
      firstName: dto?.firstName ?? dto?.FirstName,
      lastName: dto?.lastName ?? dto?.LastName,
      fullName: dto?.fullName ?? dto?.FullName,
      leadStatus: dto?.leadStatus ?? dto?.LeadStatus,
      leadSource: dto?.leadSource ?? dto?.LeadSource,
      assignedUserId: dto?.assignedUserId ?? dto?.AssignedUserId,
      statusId: dto?.statusId ?? dto?.StatusId
    });
  }

  private mapLeadDetail(dto: any): Lead {
    const payload = dto?.data ?? dto;
    return this.mapLeadFromDto(payload, {
      firstName: payload?.firstName ?? payload?.FirstName,
      lastName: payload?.lastName ?? payload?.LastName,
      fullName: payload?.fullName ?? payload?.FullName,
      leadStatus: payload?.leadStatus ?? payload?.LeadStatus ?? payload?.statusName ?? payload?.StatusName,
      leadSource: payload?.leadSource ?? payload?.LeadSource ?? payload?.leadSourceName ?? payload?.LeadSourceName,
      assignedUserId: payload?.assignedUserId ?? payload?.AssignedUserId,
      statusId: payload?.statusId ?? payload?.StatusId,
      industryId: payload?.industryId ?? payload?.IndustryId,
      leadSourceId: payload?.leadSourceId ?? payload?.LeadSourceId,
      companySizeId: payload?.companySizeId ?? payload?.CompanySizeId,
      budget: payload?.budget ?? payload?.Budget,
      timeline: payload?.timeline ?? payload?.Timeline,
      decisionMakerLevel: payload?.decisionMakerLevel ?? payload?.DecisionMakerLevel,
      companySize: payload?.companySize ?? payload?.CompanySize,
      painPoints: payload?.painPoints ?? payload?.PainPoints,
      notes: payload?.notes ?? payload?.Notes
    });
  }

  private mapLeadFromDto(dto: any, overrides: Record<string, any>): Lead {
    const fullName = overrides['fullName'] ?? dto?.fullName ?? dto?.FullName ?? '';
    const [firstName, lastName] = this.splitName(overrides['firstName'], overrides['lastName'], fullName);

    return {
      id: (dto?.id ?? dto?.Id ?? '').toString(),
      firstName,
      lastName,
      fullName,
      companyName: dto?.companyName ?? dto?.CompanyName,
      email: dto?.email ?? dto?.Email ?? '',
      phone: dto?.phone ?? dto?.Phone,
      jobTitle: dto?.jobTitle ?? dto?.JobTitle,
      industryId: this.normalizeId(overrides['industryId'] ?? dto?.industryId ?? dto?.IndustryId),
      leadSourceId: this.normalizeId(overrides['leadSourceId'] ?? dto?.leadSourceId ?? dto?.LeadSourceId),
      companySizeId: this.normalizeId(overrides['companySizeId'] ?? dto?.companySizeId ?? dto?.CompanySizeId),
      leadSource: overrides['leadSource'] ?? dto?.leadSource ?? dto?.LeadSource,
      companySize: overrides['companySize'] ?? dto?.companySize ?? dto?.CompanySize,
      budget: this.toNumber(overrides['budget'] ?? dto?.budget ?? dto?.Budget),
      timeline: overrides['timeline'] ?? dto?.timeline ?? dto?.Timeline,
      decisionMakerLevel: overrides['decisionMakerLevel'] ?? dto?.decisionMakerLevel ?? dto?.DecisionMakerLevel,
      painPoints: overrides['painPoints'] ?? dto?.painPoints ?? dto?.PainPoints,
      notes: overrides['notes'] ?? dto?.notes ?? dto?.Notes,
      assignedUserId: this.normalizeId(overrides['assignedUserId'] ?? dto?.assignedUserId ?? dto?.AssignedUserId),
      leadScore: this.toNumber(dto?.leadScore ?? dto?.LeadScore) ?? 0,
      qualificationScore: this.toNumber(dto?.qualificationScore ?? dto?.QualificationScore) ?? 0,
      leadCategory: this.mapLeadCategory(dto?.scoreGrade ?? dto?.ScoreGrade),
      statusId: this.normalizeId(overrides['statusId'] ?? dto?.statusId ?? dto?.StatusId),
      status: this.mapLeadStatus(overrides['leadStatus'] ?? dto?.leadStatus ?? dto?.LeadStatus),
      lastActivityDate: this.parseDate(dto?.lastActivityDate ?? dto?.LastActivityDate),
      daysWithoutActivity: dto?.daysSinceLastActivity ?? dto?.DaysSinceLastActivity,
      isConverted: (dto?.isConverted ?? dto?.IsConverted) ?? Boolean(dto?.conversionDate ?? dto?.ConversionDate),
      convertedDate: this.parseDate(dto?.conversionDate ?? dto?.ConversionDate),
      convertedAccountId: this.normalizeId(dto?.convertedAccountId ?? dto?.ConvertedAccountId),
      convertedContactId: this.normalizeId(dto?.convertedContactId ?? dto?.ConvertedContactId),
      convertedOpportunityId: this.normalizeId(dto?.convertedOpportunityId ?? dto?.ConvertedOpportunityId),
      activities: dto?.activities,
      // Base entity fields
      createdByUserId: dto?.createdByUserId ?? dto?.CreatedByUserId,
      createdDate: this.parseDate(dto?.createdDate ?? dto?.CreatedDate) ?? new Date(),
      lastModifiedByUserId: dto?.lastModifiedByUserId ?? dto?.LastModifiedByUserId,
      lastModifiedDate: this.parseDate(dto?.lastModifiedDate ?? dto?.LastModifiedDate),
      isDeleted: dto?.isDeleted ?? dto?.IsDeleted ?? false,
      deletedDate: this.parseDate(dto?.deletedDate ?? dto?.DeletedDate)
    } as Lead;
  }

  private splitName(firstName?: string, lastName?: string, fullName?: string): [string, string] {
    if (firstName && lastName) {
      return [firstName, lastName];
    }

    if (!fullName) {
      return [firstName ?? '', lastName ?? ''];
    }

    const parts = fullName.trim().split(' ');
    if (parts.length === 1) {
      return [parts[0], ''];
    }

    const first = parts.shift() ?? '';
    const last = parts.join(' ');
    return [first, last];
  }

  private mapLeadCategory(value?: string): LeadCategory {
    const normalized = (value ?? '').toLowerCase();
    switch (normalized) {
      case 'hot':
        return LeadCategory.Hot;
      case 'warm':
        return LeadCategory.Warm;
      case 'cold':
      default:
        return LeadCategory.Cold;
    }
  }

  private mapLeadStatus(value?: string): LeadStatus {
    const normalized = (value ?? '').toLowerCase();
    switch (normalized) {
      case 'contacted':
        return LeadStatus.Contacted;
      case 'qualified':
        return LeadStatus.Qualified;
      case 'unqualified':
        return LeadStatus.Unqualified;
      case 'converted':
        return LeadStatus.Converted;
      case 'new':
      default:
        return LeadStatus.New;
    }
  }

  private parseDate(value: string | Date | undefined | null): Date | undefined {
    if (!value) {
      return undefined;
    }

    if (value instanceof Date) {
      return value;
    }

    return new Date(value);
  }

  private toNumber(value: any): number | undefined {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }

    const parsed = Number(value);
    return Number.isNaN(parsed) ? undefined : parsed;
  }

  private normalizeId(value: any): string | undefined {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }

    return value.toString();
  }
}
