import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  Opportunity,
  OpportunityCreateDto,
  OpportunityUpdateDto,
  OpportunityStageUpdateDto,
  OpportunityListDto,
  SalesStage,
  OpportunityType,
  SalesPipelineStageDto,
  OpportunityForecast,
  OpportunityAnalytics,
  OpportunityFilter,
  OpportunityStatus,
  OpportunityStageType,
  HealthStatus,
  PriorityLevel,
  OpportunityDashboardMetrics
} from '../models/opportunity.models';
import { PaginatedResponse, ApiResponse } from '../models/api-response.models';
import { Account } from '../models/account.models';
import { Contact } from '../models/contact.models';
import { UserDto } from '../models/user-management.models';

@Injectable({
  providedIn: 'root'
})
export class OpportunityService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = `${environment.api.baseUrl}/opportunities`;

  // Core CRUD Operations
  getOpportunities(filter?: OpportunityFilter): Observable<PaginatedResponse<OpportunityListDto>> {
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

  getOpportunityById(id: string): Observable<Opportunity> {
    return this.http.get<any>(`${this.API_URL}/${id}`)
      .pipe(map(response => this.mapOpportunityDetail(response)));
  }

  createOpportunity(payload: OpportunityCreateDto): Observable<Opportunity> {
    return this.http.post<any>(this.API_URL, payload)
      .pipe(map(response => this.mapOpportunityDetail(response)));
  }

  updateOpportunity(id: string, payload: OpportunityUpdateDto): Observable<Opportunity> {
    return this.http.put<any>(`${this.API_URL}/${id}`, payload)
      .pipe(map(response => this.mapOpportunityDetail(response)));
  }

  deleteOpportunity(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  // Pipeline Management
  getSalesPipeline(ownerId?: string, startDate?: Date, endDate?: Date): Observable<SalesPipelineStageDto[]> {
    let params = new HttpParams();
    if (ownerId) params = params.set('ownerId', ownerId);
    if (startDate) params = params.set('startDate', startDate.toISOString());
    if (endDate) params = params.set('endDate', endDate.toISOString());

    return this.http.get<SalesPipelineStageDto[]>(`${this.API_URL}/pipeline`, { params })
      .pipe(map(response => this.mapPipelineResponse(response)));
  }

  updateOpportunityStage(id: string, stageUpdate: OpportunityStageUpdateDto): Observable<Opportunity> {
    return this.http.patch<any>(`${this.API_URL}/${id}/stage`, stageUpdate)
      .pipe(map(response => this.mapOpportunityDetail(response)));
  }

  // Specialized Views
  getMyOpportunities(filter?: OpportunityFilter): Observable<PaginatedResponse<OpportunityListDto>> {
    let params = new HttpParams();
    const normalizedFilter = this.normalizeFilter(filter);

    Object.entries(normalizedFilter).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, value.toString());
      }
    });

    return this.http.get<any>(`${this.API_URL}/my-opportunities`, { params })
      .pipe(map(response => this.mapPaginatedResponse(response)));
  }

  getOpportunitiesByAccount(accountId: string, filter?: OpportunityFilter): Observable<PaginatedResponse<OpportunityListDto>> {
    let params = new HttpParams();
    const normalizedFilter = this.normalizeFilter(filter);

    Object.entries(normalizedFilter).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, value.toString());
      }
    });

    return this.http.get<any>(`${this.API_URL}/by-account/${accountId}`, { params })
      .pipe(map(response => this.mapPaginatedResponse(response)));
  }

  getOverdueOpportunities(filter?: OpportunityFilter): Observable<PaginatedResponse<OpportunityListDto>> {
    let params = new HttpParams();
    const normalizedFilter = this.normalizeFilter(filter);

    Object.entries(normalizedFilter).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, value.toString());
      }
    });

    return this.http.get<any>(`${this.API_URL}/overdue`, { params })
      .pipe(map(response => this.mapPaginatedResponse(response)));
  }

  getClosingSoonOpportunities(days: number = 30, filter?: OpportunityFilter): Observable<PaginatedResponse<OpportunityListDto>> {
    let params = new HttpParams().set('days', days.toString());
    const normalizedFilter = this.normalizeFilter(filter);

    Object.entries(normalizedFilter).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, value.toString());
      }
    });

    return this.http.get<any>(`${this.API_URL}/closing-soon`, { params })
      .pipe(map(response => this.mapPaginatedResponse(response)));
  }

  // Analytics and Forecasting
  getRevenueForecast(startDate: Date, endDate: Date, ownerId?: string): Observable<OpportunityForecast> {
    let params = new HttpParams()
      .set('startDate', startDate.toISOString())
      .set('endDate', endDate.toISOString());

    if (ownerId) params = params.set('ownerId', ownerId);

    return this.http.get<any>(`${this.API_URL}/forecast`, { params })
      .pipe(map(response => this.mapForecastResponse(response)));
  }

  getOpportunityAnalytics(startDate?: Date, endDate?: Date, ownerId?: string): Observable<OpportunityAnalytics> {
    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate.toISOString());
    if (endDate) params = params.set('endDate', endDate.toISOString());
    if (ownerId) params = params.set('ownerId', ownerId);

    return this.http.get<any>(`${this.API_URL}/analytics`, { params })
      .pipe(map(response => this.mapAnalyticsResponse(response)));
  }

  getDashboardMetrics(): Observable<OpportunityDashboardMetrics> {
    return this.http.get<any>(`${this.API_URL}/dashboard-metrics`)
      .pipe(map(response => this.mapDashboardMetrics(response)));
  }

  // Reference Data

  // Bulk Operations
  bulkUpdateStage(opportunityIds: string[], salesStageId: number, reasonWonLost?: string): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(`${this.API_URL}/bulk-stage-update`, {
      opportunityIds,
      salesStageId,
      reasonWonLost
    });
  }

  bulkAssignOwner(opportunityIds: string[], ownerUserId: string): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(`${this.API_URL}/bulk-assign`, {
      opportunityIds,
      ownerUserId
    });
  }

  bulkDelete(opportunityIds: string[]): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.API_URL}/bulk`, {
      body: { opportunityIds }
    });
  }

  // Search and Filtering
  searchOpportunities(searchTerm: string, limit: number = 10): Observable<OpportunityListDto[]> {
    const params = new HttpParams()
      .set('q', searchTerm)
      .set('limit', limit.toString());

    return this.http.get<OpportunityListDto[]>(`${this.API_URL}/search`, { params });
  }

  // Win/Loss Analysis
  markAsWon(id: string, reasonWon: string): Observable<Opportunity> {
    return this.http.patch<any>(`${this.API_URL}/${id}/win`, { reasonWon })
      .pipe(map(response => this.mapOpportunityDetail(response)));
  }

  markAsLost(id: string, reasonLost: string): Observable<Opportunity> {
    return this.http.patch<any>(`${this.API_URL}/${id}/lose`, { reasonLost })
      .pipe(map(response => this.mapOpportunityDetail(response)));
  }

  reopenOpportunity(id: string, salesStageId: number): Observable<Opportunity> {
    return this.http.patch<any>(`${this.API_URL}/${id}/reopen`, { salesStageId })
      .pipe(map(response => this.mapOpportunityDetail(response)));
  }

  // Export/Import
  exportOpportunities(filter?: OpportunityFilter): Observable<Blob> {
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

  // Private Helper Methods
  private normalizeFilter(filter?: OpportunityFilter): Record<string, string | number | boolean | undefined> {
    if (!filter) {
      return {};
    }

    return {
      pageNumber: filter.pageNumber,
      pageSize: filter.pageSize,
      search: filter.search,
      salesStageId: filter.salesStageId,
      opportunityTypeId: filter.opportunityTypeId,
      ownerId: filter.ownerId,
      accountId: filter.accountId,
      minAmount: filter.minAmount,
      maxAmount: filter.maxAmount,
      expectedCloseDateFrom: filter.expectedCloseDateFrom?.toISOString(),
      expectedCloseDateTo: filter.expectedCloseDateTo?.toISOString(),
      status: filter.status,
      isOverdue: filter.isOverdue,
      stageType: filter.stageType,
      healthStatus: filter.healthStatus,
      priorityLevel: filter.priorityLevel,
      sortBy: filter.sortBy,
      sortDirection: filter.sortDirection
    };
  }

  private mapPaginatedResponse(response: any): PaginatedResponse<OpportunityListDto> {
    const payload = response?.data ?? response;
    const rawItems = payload?.items ?? payload?.Items ?? [];
    const items = rawItems.map((item: any) => this.mapOpportunityList(item));

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

  private mapOpportunityList(dto: any): OpportunityListDto {
    return {
      id: (dto?.id ?? dto?.Id ?? '').toString(),
      name: dto?.name ?? dto?.Name ?? '',
      accountName: dto?.accountName ?? dto?.AccountName ?? '',
      amount: this.toNumber(dto?.amount ?? dto?.Amount) ?? 0,
      currency: dto?.currency ?? dto?.Currency ?? 'TRY',
      weightedAmount: this.toNumber(dto?.weightedAmount ?? dto?.WeightedAmount) ?? 0,
      expectedCloseDate: this.parseDate(dto?.expectedCloseDate ?? dto?.ExpectedCloseDate),
      salesStageName: dto?.salesStageName ?? dto?.SalesStageName ?? dto?.saleStageName ?? '',
      probability: this.toNumber(dto?.probability ?? dto?.Probability) ?? 0,
      stageType: this.mapStageType(dto?.stageType ?? dto?.StageType),
      status: this.mapOpportunityStatus(dto?.status ?? dto?.Status),
      healthStatus: this.mapHealthStatus(dto?.healthStatus ?? dto?.HealthStatus),
      priorityLevel: this.mapPriorityLevel(dto?.priorityLevel ?? dto?.PriorityLevel),
      isOverdue: Boolean(dto?.isOverdue ?? dto?.IsOverdue),
      isClosingSoon: Boolean(dto?.isClosingSoon ?? dto?.IsClosingSoon),
      daysToClose: this.toNumber(dto?.daysToClose ?? dto?.DaysToClose) ?? 0,
      ownerUserName: dto?.ownerUserName ?? dto?.OwnerUserName ?? '',
      lastActivityDate: this.parseDate(dto?.lastActivityDate ?? dto?.LastActivityDate)
    };
  }

  private mapOpportunityDetail(dto: any): Opportunity {
    const payload = dto?.data ?? dto;

    return {
      id: (payload?.id ?? payload?.Id ?? '').toString(),
      name: payload?.name ?? payload?.Name ?? '',
      accountId: (payload?.accountId ?? payload?.AccountId ?? '').toString(),
      accountName: payload?.accountName ?? payload?.AccountName ?? '',
      primaryContactId: payload?.primaryContactId ?? payload?.PrimaryContactId,
      primaryContactName: payload?.primaryContactName ?? payload?.PrimaryContactName,
      amount: this.toNumber(payload?.amount ?? payload?.Amount) ?? 0,
      currency: payload?.currency ?? payload?.Currency ?? 'TRY',
      weightedAmount: this.toNumber(payload?.weightedAmount ?? payload?.WeightedAmount) ?? 0,
      expectedCloseDate: this.parseDate(payload?.expectedCloseDate ?? payload?.ExpectedCloseDate),
      closeDate: this.parseDate(payload?.closeDate ?? payload?.CloseDate),
      opportunityTypeId: this.toNumber(payload?.opportunityTypeId ?? payload?.OpportunityTypeId) ?? 0,
      opportunityTypeName: payload?.opportunityTypeName ?? payload?.OpportunityTypeName ?? '',
      salesStageId: this.toNumber(payload?.salesStageId ?? payload?.SalesStageId) ?? 0,
      salesStageName: payload?.salesStageName ?? payload?.SalesStageName ?? payload?.saleStageName ?? '',
      probability: this.toNumber(payload?.probability ?? payload?.Probability) ?? 0,
      stageType: this.mapStageType(payload?.stageType ?? payload?.StageType),
      status: this.mapOpportunityStatus(payload?.status ?? payload?.Status),
      healthStatus: this.mapHealthStatus(payload?.healthStatus ?? payload?.HealthStatus),
      priorityLevel: this.mapPriorityLevel(payload?.priorityLevel ?? payload?.PriorityLevel),
      dealHealthScore: this.toNumber(payload?.dealHealthScore ?? payload?.DealHealthScore) ?? 0,
      isOverdue: Boolean(payload?.isOverdue ?? payload?.IsOverdue),
      isClosingSoon: Boolean(payload?.isClosingSoon ?? payload?.IsClosingSoon),
      daysOverdue: this.toNumber(payload?.daysOverdue ?? payload?.DaysOverdue) ?? 0,
      daysToClose: this.toNumber(payload?.daysToClose ?? payload?.DaysToClose) ?? 0,
      daysInCurrentStage: this.toNumber(payload?.daysInCurrentStage ?? payload?.DaysInCurrentStage) ?? 0,
      daysInPipeline: this.toNumber(payload?.daysInPipeline ?? payload?.DaysInPipeline) ?? 0,
      reasonWonLost: payload?.reasonWonLost ?? payload?.ReasonWonLost,
      lastActivityDate: this.parseDate(payload?.lastActivityDate ?? payload?.LastActivityDate),
      competitorName: payload?.competitorName ?? payload?.CompetitorName,
      competitivePosition: payload?.competitivePosition ?? payload?.CompetitivePosition,
      nextStepDescription: payload?.nextStepDescription ?? payload?.NextStepDescription,
      nextStepDate: this.parseDate(payload?.nextStepDate ?? payload?.NextStepDate),
      ownerUserId: (payload?.ownerUserId ?? payload?.OwnerUserId ?? '').toString(),
      ownerUserName: payload?.ownerUserName ?? payload?.OwnerUserName ?? '',
      leadSource: payload?.leadSource ?? payload?.LeadSource,
      description: payload?.description ?? payload?.Description,
      createdDate: this.parseDate(payload?.createdDate ?? payload?.CreatedDate) ?? new Date(),
      lastModifiedDate: this.parseDate(payload?.lastModifiedDate ?? payload?.LastModifiedDate),
      activityCount: this.toNumber(payload?.activityCount ?? payload?.ActivityCount) ?? 0,
      openActivityCount: this.toNumber(payload?.openActivityCount ?? payload?.OpenActivityCount) ?? 0,
      completedActivityCount: this.toNumber(payload?.completedActivityCount ?? payload?.CompletedActivityCount) ?? 0
    };
  }

  private mapPipelineResponse(response: any): SalesPipelineStageDto[] {
    const data = response?.data ?? response;
    if (!Array.isArray(data)) return [];

    return data.map((stage: any) => ({
      stageId: this.toNumber(stage?.stageId ?? stage?.StageId) ?? 0,
      stageName: stage?.stageName ?? stage?.StageName ?? '',
      order: this.toNumber(stage?.order ?? stage?.Order) ?? 0,
      probability: this.toNumber(stage?.probability ?? stage?.Probability) ?? 0,
      stageType: this.mapStageType(stage?.stageType ?? stage?.StageType),
      opportunityCount: this.toNumber(stage?.opportunityCount ?? stage?.OpportunityCount) ?? 0,
      totalAmount: this.toNumber(stage?.totalAmount ?? stage?.TotalAmount) ?? 0,
      weightedAmount: this.toNumber(stage?.weightedAmount ?? stage?.WeightedAmount) ?? 0,
      opportunities: (stage?.opportunities ?? []).map((opp: any) => this.mapOpportunityList(opp))
    }));
  }

  private mapForecastResponse(response: any): OpportunityForecast {
    const data = response?.data ?? response;

    return {
      startDate: this.parseDate(data?.startDate ?? data?.StartDate) ?? new Date(),
      endDate: this.parseDate(data?.endDate ?? data?.EndDate) ?? new Date(),
      ownerId: data?.ownerId ?? data?.OwnerId,
      totalForecastAmount: this.toNumber(data?.totalForecastAmount ?? data?.TotalForecastAmount) ?? 0,
      currency: data?.currency ?? data?.Currency ?? 'TRY',
      forecastByStage: data?.forecastByStage ?? data?.ForecastByStage ?? {},
      probabilityWeightedForecast: this.toNumber(data?.probabilityWeightedForecast ?? data?.ProbabilityWeightedForecast) ?? 0
    };
  }

  private mapAnalyticsResponse(response: any): OpportunityAnalytics {
    const data = response?.data ?? response;

    return {
      revenueByStage: data?.revenueByStage ?? data?.RevenueByStage ?? {},
      countByStage: data?.countByStage ?? data?.CountByStage ?? {},
      conversionRatesBySource: data?.conversionRatesBySource ?? data?.ConversionRatesBySource ?? {},
      averageDealSizeByStage: data?.averageDealSizeByStage ?? data?.AverageDealSizeByStage ?? {},
      totalRevenue: this.toNumber(data?.totalRevenue ?? data?.TotalRevenue) ?? 0,
      totalOpportunities: this.toNumber(data?.totalOpportunities ?? data?.TotalOpportunities) ?? 0,
      averageDealSize: this.toNumber(data?.averageDealSize ?? data?.AverageDealSize) ?? 0,
      averageSalesCycle: this.toNumber(data?.averageSalesCycle ?? data?.AverageSalesCycle) ?? 0,
      winRate: this.toNumber(data?.winRate ?? data?.WinRate) ?? 0,
      lossRate: this.toNumber(data?.lossRate ?? data?.LossRate) ?? 0
    };
  }

  private mapDashboardMetrics(response: any): OpportunityDashboardMetrics {
    const data = response?.data ?? response;

    return {
      totalRevenue: this.toNumber(data?.totalRevenue ?? data?.TotalRevenue) ?? 0,
      totalOpportunities: this.toNumber(data?.totalOpportunities ?? data?.TotalOpportunities) ?? 0,
      openOpportunities: this.toNumber(data?.openOpportunities ?? data?.OpenOpportunities) ?? 0,
      closingThisMonth: this.toNumber(data?.closingThisMonth ?? data?.ClosingThisMonth) ?? 0,
      wonThisMonth: this.toNumber(data?.wonThisMonth ?? data?.WonThisMonth) ?? 0,
      lostThisMonth: this.toNumber(data?.lostThisMonth ?? data?.LostThisMonth) ?? 0,
      averageDealSize: this.toNumber(data?.averageDealSize ?? data?.AverageDealSize) ?? 0,
      winRate: this.toNumber(data?.winRate ?? data?.WinRate) ?? 0,
      pipelineValue: this.toNumber(data?.pipelineValue ?? data?.PipelineValue) ?? 0,
      weightedPipelineValue: this.toNumber(data?.weightedPipelineValue ?? data?.WeightedPipelineValue) ?? 0,
      overdueOpportunities: this.toNumber(data?.overdueOpportunities ?? data?.OverdueOpportunities) ?? 0,
      hotOpportunities: this.toNumber(data?.hotOpportunities ?? data?.HotOpportunities) ?? 0,
      revenueTarget: this.toNumber(data?.revenueTarget ?? data?.RevenueTarget) ?? 0,
      targetAchievement: this.toNumber(data?.targetAchievement ?? data?.TargetAchievement) ?? 0
    };
  }

  // Enum Mapping Methods
  private mapOpportunityStatus(value?: string): OpportunityStatus {
    const normalized = (value ?? '').toLowerCase();
    switch (normalized) {
      case 'won':
        return OpportunityStatus.Won;
      case 'lost':
        return OpportunityStatus.Lost;
      case 'open':
      default:
        return OpportunityStatus.Open;
    }
  }

  private mapStageType(value?: string): OpportunityStageType {
    const normalized = (value ?? '').toLowerCase();
    switch (normalized) {
      case 'won':
        return OpportunityStageType.Won;
      case 'lost':
        return OpportunityStageType.Lost;
      case 'open':
      default:
        return OpportunityStageType.Open;
    }
  }

  private mapHealthStatus(value?: string): HealthStatus {
    const normalized = (value ?? '').toLowerCase();
    switch (normalized) {
      case 'excellent':
        return HealthStatus.Excellent;
      case 'good':
        return HealthStatus.Good;
      case 'fair':
        return HealthStatus.Fair;
      case 'poor':
        return HealthStatus.Poor;
      case 'critical':
        return HealthStatus.Critical;
      default:
        return HealthStatus.Fair;
    }
  }

  private mapPriorityLevel(value?: string): PriorityLevel {
    const normalized = (value ?? '').toLowerCase();
    switch (normalized) {
      case 'critical':
        return PriorityLevel.Critical;
      case 'high':
        return PriorityLevel.High;
      case 'medium':
        return PriorityLevel.Medium;
      case 'low':
        return PriorityLevel.Low;
      default:
        return PriorityLevel.Medium;
    }
  }

  // Reference Data Methods
  getAccounts(): Observable<Account[]> {
    return this.http.get<any>(`${environment.api.baseUrl}/accounts`)
      .pipe(map(response => response?.data || response || []));
  }

  getContacts(): Observable<Contact[]> {
    return this.http.get<any>(`${environment.api.baseUrl}/contacts`)
      .pipe(map(response => response?.data || response || []));
  }

  getUsers(): Observable<UserDto[]> {
    return this.http.get<any>(`${environment.api.baseUrl}/users`)
      .pipe(map(response => response?.data || response || []));
  }

  getSalesStages(): Observable<SalesStage[]> {
    return this.http.get<any>(`${this.API_URL}/sales-stages`)
      .pipe(map(response => response?.data || response || []));
  }

  getOpportunityTypes(): Observable<OpportunityType[]> {
    return this.http.get<any>(`${this.API_URL}/types`)
      .pipe(map(response => response?.data || response || []));
  }

  // Utility Methods
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
}