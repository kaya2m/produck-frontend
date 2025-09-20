import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

// Material Components
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule } from '@angular/material/badge';

// Custom UI Components
import { InputComponent, ButtonComponent, CardComponent, TableComponent } from '../../../shared/components/ui';
import type { TableColumn, TableAction } from '../../../shared/components/ui';

// Services
import {
  SecurityService,
  SecurityDashboard,
  AuditLog,
  SecurityAlert,
  SecurityPolicy,
  SecurityConfiguration
} from '../../../core/services/security.service';

@Component({
  selector: 'app-security',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatTabsModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    MatMenuModule,
    MatTooltipModule,
    MatDividerModule,
    MatBadgeModule,
    InputComponent,
    ButtonComponent,
    CardComponent,
    TableComponent
  ],
  templateUrl: './security.component.html',
  styleUrls: ['./security.component.css']
})
export class SecurityComponent implements OnInit {
  private securityService = inject(SecurityService);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);

  // Signals
  dashboard = signal<SecurityDashboard | null>(null);
  auditLogs = signal<AuditLog[]>([]);
  securityAlerts = signal<SecurityAlert[]>([]);
  securityConfig = signal<SecurityConfiguration | null>(null);

  isLoadingDashboard = signal(false);
  isLoadingAuditLogs = signal(false);
  isRefreshing = signal(false);
  isSavingConfig = signal(false);

  // Forms
  auditFiltersForm: FormGroup;
  configForm: FormGroup;

  // Table Configuration

  auditLogColumns: TableColumn[] = [
    {
      key: 'timestamp',
      label: 'Timestamp',
      sortable: true,
      type: 'date'
    },
    {
      key: 'userName',
      label: 'User',
      sortable: true,
      type: 'text'
    },
    {
      key: 'action',
      label: 'Action',
      sortable: true,
      type: 'text'
    },
    {
      key: 'entityType',
      label: 'Entity Type',
      sortable: true,
      type: 'text'
    },
    {
      key: 'result',
      label: 'Result',
      sortable: false,
      type: 'badge',
      badgeColor: (value) => value === 'Success' ? 'success' : 'warn'
    }
  ];

  constructor() {
    this.auditFiltersForm = this.fb.group({
      dateFrom: [''],
      dateTo: [''],
      user: ['']
    });

    this.configForm = this.fb.group({
      minPasswordLength: [8, [Validators.required, Validators.min(6)]],
      maxFailedAttempts: [3, [Validators.required, Validators.min(1)]],
      passwordExpiryDays: [90, [Validators.required, Validators.min(1)]],
      sessionTimeoutMinutes: [30, [Validators.required, Validators.min(5)]],
      maxConcurrentSessions: [3, [Validators.required, Validators.min(1)]],
      lowRiskThreshold: [30, [Validators.required, Validators.min(0)]],
      mediumRiskThreshold: [60, [Validators.required, Validators.min(0)]],
      highRiskThreshold: [80, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    this.loadDashboard();
    this.loadAuditLogs();
    this.loadSecurityAlerts();
    this.loadSecurityConfiguration();
  }

  // Computed values
  filteredAuditLogs = computed(() => {
    let logs = this.auditLogs();
    const filters = this.auditFiltersForm.value;

    if (filters.user) {
      logs = logs.filter(log =>
        log.userName?.toLowerCase().includes(filters.user.toLowerCase())
      );
    }

    if (filters.dateFrom) {
      logs = logs.filter(log =>
        new Date(log.timestamp) >= new Date(filters.dateFrom)
      );
    }

    if (filters.dateTo) {
      logs = logs.filter(log =>
        new Date(log.timestamp) <= new Date(filters.dateTo)
      );
    }

    return logs;
  });

  // Data loading methods
  async loadDashboard(): Promise<void> {
    this.isLoadingDashboard.set(true);
    try {
      const dashboard = await this.securityService.getDashboard().toPromise();
      this.dashboard.set(dashboard || null);
    } catch (error) {
      console.error('Failed to load security dashboard:', error);
      this.snackBar.open('Failed to load security dashboard', 'Close', { duration: 3000 });
    } finally {
      this.isLoadingDashboard.set(false);
    }
  }

  async loadAuditLogs(): Promise<void> {
    this.isLoadingAuditLogs.set(true);
    try {
      const logs = await this.securityService.getAuditLogs().toPromise();
      this.auditLogs.set(logs || []);
    } catch (error) {
      console.error('Failed to load audit logs:', error);
      this.snackBar.open('Failed to load audit logs', 'Close', { duration: 3000 });
    } finally {
      this.isLoadingAuditLogs.set(false);
    }
  }

  async loadSecurityAlerts(): Promise<void> {
    try {
      const alerts = await this.securityService.getSecurityAlerts().toPromise();
      this.securityAlerts.set(alerts || []);
    } catch (error) {
      console.error('Failed to load security alerts:', error);
      this.snackBar.open('Failed to load security alerts', 'Close', { duration: 3000 });
    }
  }

  async loadSecurityConfiguration(): Promise<void> {
    try {
      const config = await this.securityService.getConfiguration().toPromise();
      this.securityConfig.set(config || null);
      if (config) {
        this.configForm.patchValue(config);
      }
    } catch (error) {
      console.error('Failed to load security configuration:', error);
      this.snackBar.open('Failed to load security configuration', 'Close', { duration: 3000 });
    }
  }

  // Event handlers
  async refreshData(): Promise<void> {
    this.isRefreshing.set(true);
    try {
      await Promise.all([
        this.loadDashboard(),
        this.loadAuditLogs(),
        this.loadSecurityAlerts(),
        this.loadSecurityConfiguration()
      ]);
      this.snackBar.open('Data refreshed successfully', 'Close', { duration: 2000 });
    } finally {
      this.isRefreshing.set(false);
    }
  }

  exportReport(): void {
    // TODO: Implement export functionality
    this.snackBar.open('Export functionality coming soon', 'Close', { duration: 2000 });
  }

  applyAuditFilters(): void {
    // Filters are automatically applied via computed signal
    this.snackBar.open('Filters applied', 'Close', { duration: 1000 });
  }

  clearAuditFilters(): void {
    this.auditFiltersForm.reset();
  }

  onAuditLogSort(sort: any): void {
    console.log('Audit log sort:', sort);
  }

  onAuditLogPageChange(page: any): void {
    console.log('Audit log page:', page);
  }


  // Context Menu Methods
  viewAuditLogDetails(log: any): void {
    console.log('View audit log details:', log);
    this.snackBar.open('Denetim kaydı detayları özelliği yakında eklenecek', 'Close', { duration: 3000 });
  }

  exportAuditLog(log: any): void {
    console.log('Export audit log:', log);
    this.snackBar.open('Denetim kaydını dışa aktarma özelliği yakında eklenecek', 'Close', { duration: 3000 });
  }

  generateSecurityReport(): void {
    console.log('Generate security report');
    this.snackBar.open('Güvenlik raporu oluşturma özelliği yakında eklenecek', 'Close', { duration: 3000 });
  }

  viewUserSecurityProfile(log: any): void {
    console.log('View user security profile for:', log.userName);
    this.snackBar.open('Kullanıcı güvenlik profili özelliği yakında eklenecek', 'Close', { duration: 3000 });
  }

  async acknowledgeAlert(alertId: string): Promise<void> {
    try {
      await this.securityService.acknowledgeAlert(alertId).toPromise();
      this.securityAlerts.update(alerts =>
        alerts.map(alert =>
          alert.id === alertId ? { ...alert, isAcknowledged: true } : alert
        )
      );
      this.snackBar.open('Alert acknowledged', 'Close', { duration: 2000 });
    } catch (error) {
      console.error('Failed to acknowledge alert:', error);
      this.snackBar.open('Failed to acknowledge alert', 'Close', { duration: 3000 });
    }
  }

  async markAllAlertsAsRead(): Promise<void> {
    try {
      const unacknowledgedAlerts = this.securityAlerts().filter(alert => !alert.isAcknowledged);
      for (const alert of unacknowledgedAlerts) {
        await this.securityService.acknowledgeAlert(alert.id).toPromise();
      }
      this.securityAlerts.update(alerts =>
        alerts.map(alert => ({ ...alert, isAcknowledged: true }))
      );
      this.snackBar.open('All alerts marked as read', 'Close', { duration: 2000 });
    } catch (error) {
      console.error('Failed to mark alerts as read:', error);
      this.snackBar.open('Failed to mark alerts as read', 'Close', { duration: 3000 });
    }
  }

  viewAlertDetails(alert: SecurityAlert): void {
    // TODO: Implement alert details modal
    console.log('View alert details:', alert);
    this.snackBar.open('Alert details modal coming soon', 'Close', { duration: 2000 });
  }

  async saveConfiguration(): Promise<void> {
    if (this.configForm.valid) {
      this.isSavingConfig.set(true);
      try {
        const config = this.configForm.value;
        await this.securityService.updateConfiguration(config).toPromise();
        this.securityConfig.set(config);
        this.snackBar.open('Configuration saved successfully', 'Close', { duration: 3000 });
      } catch (error) {
        console.error('Failed to save configuration:', error);
        this.snackBar.open('Failed to save configuration', 'Close', { duration: 3000 });
      } finally {
        this.isSavingConfig.set(false);
      }
    }
  }

  resetToDefaults(): void {
    this.configForm.reset({
      minPasswordLength: 8,
      maxFailedAttempts: 3,
      passwordExpiryDays: 90,
      sessionTimeoutMinutes: 30,
      maxConcurrentSessions: 3,
      lowRiskThreshold: 30,
      mediumRiskThreshold: 60,
      highRiskThreshold: 80
    });
  }

  // Helper methods
  getTotalSuccessful(): number {
    const dashboard = this.dashboard();
    return dashboard ? dashboard.totalAccesses - dashboard.deniedAccesses : 0;
  }

  getDeniedPercentage(): number {
    const dashboard = this.dashboard();
    if (!dashboard || dashboard.totalAccesses === 0) return 0;
    return Math.round((dashboard.deniedAccesses / dashboard.totalAccesses) * 100);
  }

  getActiveAlertsCount(): number {
    return this.securityAlerts().filter(alert => !alert.isAcknowledged).length;
  }

  getRiskUsers(): any[] {
    const dashboard = this.dashboard();
    if (!dashboard || !dashboard.accessByUser) return [];

    return Object.entries(dashboard.accessByUser)
      .map(([userId, accessCount]) => ({
        userId,
        userName: userId,
        accessCount,
        riskScore: Math.min(100, Math.round(accessCount / 10))
      }))
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, 5);
  }

  getRiskScoreClass(score: number): string {
    if (score >= 80) return 'high';
    if (score >= 60) return 'medium';
    return 'low';
  }

  hasUnacknowledgedAlerts(): boolean {
    return this.securityAlerts().some(alert => !alert.isAcknowledged);
  }

  getAlertState(severity: string): 'success' | 'warning' | 'error' | undefined {
    switch (severity.toLowerCase()) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high': return 'error';
      default: return undefined;
    }
  }

  getSeverityIcon(severity: string): string {
    switch (severity.toLowerCase()) {
      case 'low': return 'info';
      case 'medium': return 'warning';
      case 'high': return 'error';
      default: return 'info';
    }
  }

  getSeverityIconClass(severity: string): string {
    switch (severity.toLowerCase()) {
      case 'low': return 'text-success';
      case 'medium': return 'text-warning';
      case 'high': return 'text-danger';
      default: return '';
    }
  }
}
