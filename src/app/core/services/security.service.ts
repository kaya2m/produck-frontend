import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

// Types
export interface FieldPermission {
  fieldName: string;
  canRead: boolean;
  canWrite: boolean;
  maskingLevel?: 'None' | 'Partial' | 'Full';
}

export interface EntityFieldPermissions {
  entityType: string;
  userId: string;
  fieldPermissions: FieldPermission[];
}

export interface RecordAccess {
  entityType: string;
  entityId: string;
  userId: string;
  canRead: boolean;
  canWrite: boolean;
  canDelete: boolean;
  canShare: boolean;
  accessReason: string;
  appliedPolicies: string[];
  restrictions: string[];
}

export interface SecurityPolicy {
  id?: string;
  name: string;
  description: string;
  entityType: string;
  priority: number;
  isActive: boolean;
  ownerCanRead: boolean;
  ownerCanEdit: boolean;
  ownerCanDelete?: boolean;
  ownerCanShare?: boolean;
  managerCanRead: boolean;
  managerCanEdit?: boolean;
  managerCanDelete?: boolean;
  teamCanRead: boolean;
  teamCanEdit?: boolean;
  teamAccessScope?: string;
  useTerritoryAccess?: boolean;
  territoryField?: string;
  sensitivityLevel?: string;
  requireApprovalForAccess?: boolean;
  logAllAccess?: boolean;
  useTimeBasedAccess?: boolean;
  accessStartTime?: string;
  accessEndTime?: string;
  allowedDays?: string;
  useIpRestrictions?: boolean;
  allowedIpRanges?: string;
  useLocationRestrictions?: boolean;
  allowedLocations?: string;
  accessConditions?: string;
  filterExpression?: string;
  createdDate?: string;
  createdByUserId?: string;
}

export interface AccessValidation {
  userId: string;
  entityType: string;
  entityId: string;
  accessType: 'read' | 'write' | 'delete';
  fieldName?: string;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
}

export interface AccessValidationResult {
  isAccessGranted: boolean;
  reason: string;
  appliedPolicies: string[];
  violations: string[];
  riskLevel: 'Low' | 'Medium' | 'High';
  requiresApproval: boolean;
  maskedFields: string[];
  accessLogged: boolean;
}

export interface RiskAssessment {
  riskScore: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  riskFactors: string[];
  recommendation: string;
  requiresApproval: boolean;
  suggestedActions: string[];
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  action: string;
  entityType: string;
  entityId: string;
  fieldName?: string;
  accessLevel: string;
  reason: string;
  policyName?: string;
  ipAddress: string;
  userAgent: string;
  location?: string;
  sessionId: string;
  sensitivityLevel: string;
  wasDataMasked: boolean;
  riskLevel: string;
  duration: string;
  timestamp: string;
  createdDate: string;
}

export interface SecurityDashboard {
  totalAccesses: number;
  deniedAccesses: number;
  highRiskAccesses: number;
  suspiciousActivities: number;
  accessByEntityType: { [key: string]: number };
  accessByUser: { [key: string]: number };
  riskLevelDistribution: { [key: string]: number };
  trends: Array<{
    date: string;
    metric: string;
    value: number;
  }>;
}

export interface SecurityAlert {
  id: string;
  alertType: string;
  severity: string; // Low, Medium, High, Critical
  description: string;
  userId?: string;
  entityType: string;
  createdDate: string;
  isAcknowledged: boolean;
  acknowledgedByUserId?: string;
  acknowledgedAt?: string;
}

export interface ComplianceReport {
  reportPeriod: {
    from: string;
    to: string;
  };
  totalDataAccesses: number;
  authorizedAccesses: number;
  unauthorizedAttempts: number;
  dataExports: number;
  dataExportsRequiringApproval: number;
  policyViolations: number;
  securityIncidents: number;
  averageResponseTime: string;
  complianceScore: number;
  recommendations: string[];
}

export interface PermissionMatrix {
  userId: string;
  userName: string;
  roles: string[];
  permissions: Array<{
    entityType: string;
    permissions: {
      create: boolean;
      read: boolean;
      update: boolean;
      delete: boolean;
    };
  }>;
  fieldPermissions: FieldPermission[];
}

export interface UserWithAccess {
  id: string;
  username: string;
  email: string;
  accessLevel: string;
  canRead: boolean;
  canWrite: boolean;
  canDelete: boolean;
}

export interface SecurityConfiguration {
  enableFieldLevelSecurity: boolean;
  enableRecordLevelSecurity: boolean;
  enableAuditLogging: boolean;
  enableRiskAssessment: boolean;
  maxLoginAttempts: number;
  sessionTimeout: string; // TimeSpan as string
  permissionCacheDuration: string; // TimeSpan as string
  sensitiveFields: string[];
  defaultMaskingPatterns: { [key: string]: string };
}

export interface Permission {
  id: string;
  name: string;
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class SecurityService {
  private readonly BASE_URL = `${environment.api.baseUrl}/security`;

  constructor(private http: HttpClient) {}

  // Field Permissions
  getFieldPermissions(entityType: string, userId?: string): Observable<EntityFieldPermissions> {
    let params = new HttpParams();
    if (userId) params = params.set('userId', userId);
    return this.http.get<EntityFieldPermissions>(`${this.BASE_URL}/field-permissions/${entityType}`, { params });
  }

  canAccessField(entityType: string, fieldName: string, accessType: 'read' | 'write' = 'read', userId?: string): Observable<boolean> {
    let params = new HttpParams()
      .set('entityType', entityType)
      .set('fieldName', fieldName)
      .set('accessType', accessType);
    if (userId) params = params.set('userId', userId);
    return this.http.get<boolean>(`${this.BASE_URL}/can-access-field`, { params });
  }

  applyFieldSecurity(userId: string, entityType: string, entity: any): Observable<any> {
    return this.http.post<any>(`${this.BASE_URL}/apply-field-security`, {
      userId,
      entityType,
      entity
    });
  }

  // Record Access
  canAccessRecord(entityType: string, recordId: string, accessType: 'read' | 'write' | 'delete' = 'read', userId?: string): Observable<boolean> {
    let params = new HttpParams()
      .set('entityType', entityType)
      .set('recordId', recordId)
      .set('accessType', accessType);
    if (userId) params = params.set('userId', userId);
    return this.http.get<boolean>(`${this.BASE_URL}/can-access-record`, { params });
  }

  getRecordAccess(entityType: string, recordId: string, userId?: string): Observable<RecordAccess> {
    let params = new HttpParams()
      .set('entityType', entityType)
      .set('recordId', recordId);
    if (userId) params = params.set('userId', userId);
    return this.http.get<RecordAccess>(`${this.BASE_URL}/record-access`, { params });
  }

  getAccessibleRecords(entityType: string, userId?: string): Observable<string[]> {
    let params = new HttpParams();
    if (userId) params = params.set('userId', userId);
    return this.http.get<string[]>(`${this.BASE_URL}/accessible-records/${entityType}`, { params });
  }

  // Access Policies
  getPolicies(entityType: string): Observable<SecurityPolicy[]> {
    return this.http.get<SecurityPolicy[]>(`${this.BASE_URL}/policies/${entityType}`);
  }

  createPolicy(policy: SecurityPolicy): Observable<SecurityPolicy> {
    return this.http.post<SecurityPolicy>(`${this.BASE_URL}/policies`, policy);
  }

  updatePolicy(id: string, policy: SecurityPolicy): Observable<SecurityPolicy> {
    return this.http.put<SecurityPolicy>(`${this.BASE_URL}/policies/${id}`, policy);
  }

  deletePolicy(id: string): Observable<void> {
    return this.http.delete<void>(`${this.BASE_URL}/policies/${id}`);
  }

  // Security Validation
  validateAccess(validation: AccessValidation): Observable<AccessValidationResult> {
    return this.http.post<AccessValidationResult>(`${this.BASE_URL}/validate-access`, validation);
  }

  assessRisk(validation: AccessValidation): Observable<RiskAssessment> {
    return this.http.post<RiskAssessment>(`${this.BASE_URL}/assess-risk`, validation);
  }

  validateContext(userId?: string): Observable<boolean> {
    let params = new HttpParams();
    if (userId) params = params.set('userId', userId);
    return this.http.get<boolean>(`${this.BASE_URL}/validate-context`, { params });
  }

  // Audit and Monitoring
  getAuditLogs(params?: {
    userId?: string;
    entityType?: string;
    action?: string;
    from?: string;
    to?: string;
    page?: number;
    pageSize?: number;
  }): Observable<AuditLog[]> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        const value = (params as any)[key];
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }
    return this.http.get<AuditLog[]>(`${this.BASE_URL}/audit-logs`, { params: httpParams });
  }

  getSecurityDashboard(from?: string, to?: string): Observable<SecurityDashboard> {
    let params = new HttpParams();
    if (from) params = params.set('from', from);
    if (to) params = params.set('to', to);
    return this.http.get<SecurityDashboard>(`${this.BASE_URL}/dashboard`, { params });
  }

  getSecurityAlerts(userId?: string): Observable<SecurityAlert[]> {
    let params = new HttpParams();
    if (userId) params = params.set('userId', userId);
    return this.http.get<SecurityAlert[]>(`${this.BASE_URL}/alerts`, { params });
  }

  getComplianceReport(from: string, to: string): Observable<ComplianceReport> {
    const params = new HttpParams()
      .set('from', from)
      .set('to', to);
    return this.http.get<ComplianceReport>(`${this.BASE_URL}/compliance-report`, { params });
  }

  logSecurityEvent(event: {
    userId: string;
    action: string;
    entityType: string;
    entityId: string;
    fieldName?: string;
    accessLevel: string;
    reason: string;
    sensitivityLevel: string;
    durationMs: number;
    additionalData?: string;
  }): Observable<void> {
    return this.http.post<void>(`${this.BASE_URL}/log-event`, event);
  }

  // Data Protection
  maskData(data: string, maskingPattern: string): Observable<string> {
    return this.http.post<string>(`${this.BASE_URL}/mask-data`, {
      data,
      maskingPattern
    });
  }

  getPermissionMatrix(userId?: string): Observable<PermissionMatrix> {
    let params = new HttpParams();
    if (userId) params = params.set('userId', userId);
    return this.http.get<PermissionMatrix>(`${this.BASE_URL}/permission-matrix`, { params });
  }

  invalidateCache(userId: string): Observable<void> {
    return this.http.post<void>(`${this.BASE_URL}/invalidate-cache/${userId}`, {});
  }

  getUsersWithAccess(entityType: string, recordId: string): Observable<UserWithAccess[]> {
    const params = new HttpParams()
      .set('entityType', entityType)
      .set('recordId', recordId);
    return this.http.get<UserWithAccess[]>(`${this.BASE_URL}/users-with-access`, { params });
  }

  // Security Configuration
  getConfiguration(): Observable<SecurityConfiguration> {
    return this.http.get<SecurityConfiguration>(`${this.BASE_URL}/configuration`);
  }

  updateConfiguration(config: SecurityConfiguration): Observable<void> {
    return this.http.put<void>(`${this.BASE_URL}/configuration`, config);
  }

  // Alias methods for backward compatibility
  getDashboard(from?: string, to?: string): Observable<SecurityDashboard> {
    return this.getSecurityDashboard(from, to);
  }

  acknowledgeAlert(alertId: string): Observable<void> {
    return this.http.put<void>(`${this.BASE_URL}/alerts/${alertId}/acknowledge`, {});
  }

  // Permissions
  getPermissions(): Observable<Permission[]> {
    return this.http.get<Permission[]>(`${environment.api.baseUrl}/permissions`);
  }
}