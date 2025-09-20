import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';

import { LeadService } from '../../../core/services/lead.service';

interface LeadMetrics {
  totalLeads: number;
  hotLeads: number;
  qualifiedLeads: number;
  staleLeads: number;
  conversionRate: number;
  averageLeadScore: number;
  newLeadsThisMonth: number;
}

interface SourceAnalytics {
  sourceName: string;
  leadCount: number;
  conversionRate: number;
  averageScore: number;
  qualifiedCount: number;
}

interface ConversionAnalytics {
  period: string;
  totalLeads: number;
  convertedLeads: number;
  conversionRate: number;
  averageTimeToConvert: number;
}

@Component({
  selector: 'app-lead-analytics-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatFormFieldModule
  ],
  template: `
    <div class="analytics-dialog">
      <div mat-dialog-title class="dialog-header">
        <mat-icon class="header-icon">analytics</mat-icon>
        <div class="header-content">
          <h2>Lead Analytics Dashboard</h2>
          <p>Detaylı Lead performans analizi ve trend raporları</p>
        </div>
      </div>

      <mat-dialog-content class="dialog-content">
        @if (loading()) {
          <div class="loading-container">
            <mat-spinner diameter="40"></mat-spinner>
            <p>Analytics verileri yükleniyor...</p>
          </div>
        } @else {
          <mat-tab-group class="analytics-tabs">
            <!-- Overview Tab -->
            <mat-tab label="Genel Bakış">
              <div class="tab-content">
                @if (dashboardMetrics()) {
                  <div class="metrics-grid">
                    <mat-card class="metric-card">
                      <mat-card-header>
                        <mat-icon mat-card-avatar class="icon-blue">people</mat-icon>
                        <mat-card-title>Toplam Lead</mat-card-title>
                      </mat-card-header>
                      <mat-card-content>
                        <div class="metric-value">{{ dashboardMetrics()!.totalLeads | number }}</div>
                        <div class="metric-subtitle">Aktif leadler</div>
                      </mat-card-content>
                    </mat-card>

                    <mat-card class="metric-card">
                      <mat-card-header>
                        <mat-icon mat-card-avatar class="icon-red">local_fire_department</mat-icon>
                        <mat-card-title>Hot Leadler</mat-card-title>
                      </mat-card-header>
                      <mat-card-content>
                        <div class="metric-value">{{ dashboardMetrics()!.hotLeads | number }}</div>
                        <div class="metric-subtitle">Yüksek öncelikli</div>
                      </mat-card-content>
                    </mat-card>

                    <mat-card class="metric-card">
                      <mat-card-header>
                        <mat-icon mat-card-avatar class="icon-green">verified</mat-icon>
                        <mat-card-title>Qualified</mat-card-title>
                      </mat-card-header>
                      <mat-card-content>
                        <div class="metric-value">{{ dashboardMetrics()!.qualifiedLeads | number }}</div>
                        <div class="metric-subtitle">Nitelikli leadler</div>
                      </mat-card-content>
                    </mat-card>

                    <mat-card class="metric-card">
                      <mat-card-header>
                        <mat-icon mat-card-avatar class="icon-orange">schedule</mat-icon>
                        <mat-card-title>Stale Leadler</mat-card-title>
                      </mat-card-header>
                      <mat-card-content>
                        <div class="metric-value">{{ dashboardMetrics()!.staleLeads | number }}</div>
                        <div class="metric-subtitle">Takip gereken</div>
                      </mat-card-content>
                    </mat-card>

                    <mat-card class="metric-card wide">
                      <mat-card-header>
                        <mat-icon mat-card-avatar class="icon-purple">trending_up</mat-icon>
                        <mat-card-title>Dönüşüm Oranı</mat-card-title>
                      </mat-card-header>
                      <mat-card-content>
                        <div class="metric-value">{{ dashboardMetrics()!.conversionRate | number:'1.1-2' }}%</div>
                        <div class="metric-subtitle">Lead to Customer</div>
                      </mat-card-content>
                    </mat-card>

                    <mat-card class="metric-card wide">
                      <mat-card-header>
                        <mat-icon mat-card-avatar class="icon-teal">grade</mat-icon>
                        <mat-card-title>Ortalama Lead Skoru</mat-card-title>
                      </mat-card-header>
                      <mat-card-content>
                        <div class="metric-value">{{ dashboardMetrics()!.averageLeadScore | number:'1.0-0' }}</div>
                        <div class="metric-subtitle">Tüm leadler ortalaması</div>
                      </mat-card-content>
                    </mat-card>
                  </div>

                  <!-- Performance Indicators -->
                  <mat-card class="performance-card">
                    <mat-card-header>
                      <mat-card-title>Bu Ay Yeni Leadler</mat-card-title>
                    </mat-card-header>
                    <mat-card-content>
                      <div class="performance-content">
                        <div class="performance-number">
                          {{ dashboardMetrics()!.newLeadsThisMonth | number }}
                        </div>
                        <div class="performance-trend">
                          <mat-icon class="trend-icon positive">trending_up</mat-icon>
                          <span>Bu ay eklenen</span>
                        </div>
                      </div>
                    </mat-card-content>
                  </mat-card>
                }
              </div>
            </mat-tab>

            <!-- Source Analysis Tab -->
            <mat-tab label="Kaynak Analizi">
              <div class="tab-content">
                <div class="section-header">
                  <h3>Lead Kaynakları Performansı</h3>
                  <p>Hangi kaynaklardan gelen leadlerin daha başarılı olduğunu görün</p>
                </div>

                @if (sourceAnalytics().length) {
                  <div class="source-analytics">
                    @for (source of sourceAnalytics(); track source.sourceName) {
                      <mat-card class="source-card">
                        <mat-card-header>
                          <mat-card-title>{{ source.sourceName }}</mat-card-title>
                        </mat-card-header>
                        <mat-card-content>
                          <div class="source-metrics">
                            <div class="source-metric">
                              <span class="metric-label">Lead Sayısı</span>
                              <span class="metric-value">{{ source.leadCount | number }}</span>
                            </div>
                            <div class="source-metric">
                              <span class="metric-label">Dönüşüm Oranı</span>
                              <span class="metric-value conversion">{{ source.conversionRate | number:'1.1-2' }}%</span>
                            </div>
                            <div class="source-metric">
                              <span class="metric-label">Ortalama Skor</span>
                              <span class="metric-value score">{{ source.averageScore | number:'1.0-0' }}</span>
                            </div>
                            <div class="source-metric">
                              <span class="metric-label">Qualified</span>
                              <span class="metric-value qualified">{{ source.qualifiedCount | number }}</span>
                            </div>
                          </div>

                          <!-- Performance Indicator -->
                          <div class="performance-indicator">
                            <div class="performance-bar">
                              <div class="performance-fill"
                                   [style.width.%]="source.conversionRate"
                                   [class]="getPerformanceClass(source.conversionRate)">
                              </div>
                            </div>
                            <span class="performance-label">
                              {{ getPerformanceLabel(source.conversionRate) }}
                            </span>
                          </div>
                        </mat-card-content>
                      </mat-card>
                    }
                  </div>
                } @else {
                  <div class="empty-state">
                    <mat-icon>pie_chart</mat-icon>
                    <p>Kaynak analizi verileri yükleniyor...</p>
                  </div>
                }
              </div>
            </mat-tab>

            <!-- Conversion Trends Tab -->
            <mat-tab label="Dönüşüm Trendleri">
              <div class="tab-content">
                <div class="section-header">
                  <h3>Dönüşüm Oranları Trendi</h3>

                  <mat-form-field appearance="outline" class="period-selector">
                    <mat-label>Dönem</mat-label>
                    <mat-select [(ngModel)]="selectedPeriod" (selectionChange)="loadConversionRates()">
                      <mat-option value="Week">Haftalık</mat-option>
                      <mat-option value="Month">Aylık</mat-option>
                      <mat-option value="Quarter">Çeyreklik</mat-option>
                      <mat-option value="Year">Yıllık</mat-option>
                    </mat-select>
                  </mat-form-field>
                </div>

                @if (conversionRates()) {
                  <mat-card class="conversion-trends-card">
                    <mat-card-content>
                      <div class="conversion-summary">
                        <div class="summary-item">
                          <span class="summary-label">Toplam Lead</span>
                          <span class="summary-value">{{ conversionRates()!.totalLeads | number }}</span>
                        </div>
                        <div class="summary-item">
                          <span class="summary-label">Dönüştürülen</span>
                          <span class="summary-value">{{ conversionRates()!.convertedLeads | number }}</span>
                        </div>
                        <div class="summary-item">
                          <span class="summary-label">Dönüşüm Oranı</span>
                          <span class="summary-value highlight">{{ conversionRates()!.conversionRate | number:'1.1-2' }}%</span>
                        </div>
                        <div class="summary-item">
                          <span class="summary-label">Ort. Dönüşüm Süresi</span>
                          <span class="summary-value">{{ conversionRates()!.averageTimeToConvert | number:'1.0-0' }} gün</span>
                        </div>
                      </div>
                    </mat-card-content>
                  </mat-card>
                } @else {
                  <div class="empty-state">
                    <mat-icon>show_chart</mat-icon>
                    <p>Dönüşüm trend verileri yükleniyor...</p>
                  </div>
                }
              </div>
            </mat-tab>

            <!-- Scoring Analysis Tab -->
            <mat-tab label="Skor Analizi">
              <div class="tab-content">
                <div class="section-header">
                  <h3>Lead Scoring Dağılımı</h3>
                  <p>Leadlerinizin skor dağılımını ve performansını analiz edin</p>
                </div>

                <div class="scoring-analysis">
                  <mat-card class="score-distribution-card">
                    <mat-card-header>
                      <mat-card-title>Skor Dağılımı</mat-card-title>
                    </mat-card-header>
                    <mat-card-content>
                      <div class="score-ranges">
                        <div class="score-range hot">
                          <div class="range-header">
                            <mat-icon>local_fire_department</mat-icon>
                            <span>Hot (800+)</span>
                          </div>
                          <div class="range-count">{{ getScoreRangeCount('hot') }}</div>
                          <div class="range-percentage">{{ getScoreRangePercentage('hot') }}%</div>
                        </div>

                        <div class="score-range warm">
                          <div class="range-header">
                            <mat-icon>trending_up</mat-icon>
                            <span>Warm (500-799)</span>
                          </div>
                          <div class="range-count">{{ getScoreRangeCount('warm') }}</div>
                          <div class="range-percentage">{{ getScoreRangePercentage('warm') }}%</div>
                        </div>

                        <div class="score-range cold">
                          <div class="range-header">
                            <mat-icon>ac_unit</mat-icon>
                            <span>Cold (<500)</span>
                          </div>
                          <div class="range-count">{{ getScoreRangeCount('cold') }}</div>
                          <div class="range-percentage">{{ getScoreRangePercentage('cold') }}%</div>
                        </div>
                      </div>
                    </mat-card-content>
                  </mat-card>
                </div>
              </div>
            </mat-tab>
          </mat-tab-group>
        }
      </mat-dialog-content>

      <mat-dialog-actions class="dialog-actions">
        <button mat-button (click)="onClose()">Kapat</button>
        <button mat-raised-button color="primary" (click)="exportReport()">
          <mat-icon>file_download</mat-icon>
          Rapor İndir
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .analytics-dialog {
      width: 100%;
      max-width: 1000px;
      max-height: 90vh;
    }

    .dialog-header {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 24px 24px 16px;
      border-bottom: 1px solid #e2e8f0;
    }

    .header-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: #3b82f6;
    }

    .header-content h2 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
      color: #1e293b;
    }

    .header-content p {
      margin: 4px 0 0 0;
      font-size: 14px;
      color: #64748b;
    }

    .dialog-content {
      padding: 0;
      max-height: 70vh;
      overflow: hidden;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 40px;
      gap: 16px;
    }

    .analytics-tabs {
      height: 100%;
    }

    .tab-content {
      padding: 20px;
      max-height: 60vh;
      overflow-y: auto;
    }

    /* Metrics Grid */
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .metric-card {
      border: 1px solid #e2e8f0;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .metric-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    .metric-card.wide {
      grid-column: span 2;
    }

    .metric-value {
      font-size: 28px;
      font-weight: 700;
      color: #1e293b;
      margin: 8px 0;
    }

    .metric-subtitle {
      font-size: 12px;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    /* Icon Colors */
    .icon-blue { background: #3b82f6; color: white; }
    .icon-red { background: #ef4444; color: white; }
    .icon-green { background: #10b981; color: white; }
    .icon-orange { background: #f59e0b; color: white; }
    .icon-purple { background: #8b5cf6; color: white; }
    .icon-teal { background: #14b8a6; color: white; }

    /* Performance Card */
    .performance-card {
      margin-top: 20px;
      border: 1px solid #e2e8f0;
    }

    .performance-content {
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .performance-number {
      font-size: 36px;
      font-weight: 700;
      color: #1e293b;
    }

    .performance-trend {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #10b981;
    }

    .trend-icon.positive {
      color: #10b981;
    }

    /* Source Analytics */
    .section-header {
      margin-bottom: 24px;
    }

    .section-header h3 {
      margin: 0 0 8px 0;
      font-size: 20px;
      font-weight: 600;
      color: #1e293b;
    }

    .section-header p {
      margin: 0;
      color: #64748b;
    }

    .period-selector {
      width: 150px;
      margin-left: auto;
    }

    .source-analytics {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 16px;
    }

    .source-card {
      border: 1px solid #e2e8f0;
    }

    .source-metrics {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
      margin-bottom: 16px;
    }

    .source-metric {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .metric-label {
      font-size: 12px;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .metric-value {
      font-size: 18px;
      font-weight: 600;
      color: #1e293b;
    }

    .metric-value.conversion { color: #3b82f6; }
    .metric-value.score { color: #8b5cf6; }
    .metric-value.qualified { color: #10b981; }

    .performance-indicator {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .performance-bar {
      flex: 1;
      height: 8px;
      background: #f1f5f9;
      border-radius: 4px;
      overflow: hidden;
    }

    .performance-fill {
      height: 100%;
      border-radius: 4px;
      transition: width 0.3s ease;
    }

    .performance-fill.excellent { background: #10b981; }
    .performance-fill.good { background: #3b82f6; }
    .performance-fill.average { background: #f59e0b; }
    .performance-fill.poor { background: #ef4444; }

    .performance-label {
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
    }

    /* Conversion Trends */
    .conversion-trends-card {
      border: 1px solid #e2e8f0;
    }

    .conversion-summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 20px;
    }

    .summary-item {
      display: flex;
      flex-direction: column;
      gap: 8px;
      text-align: center;
      padding: 16px;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
    }

    .summary-label {
      font-size: 12px;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .summary-value {
      font-size: 24px;
      font-weight: 700;
      color: #1e293b;
    }

    .summary-value.highlight {
      color: #3b82f6;
    }

    /* Scoring Analysis */
    .scoring-analysis {
      display: grid;
      grid-template-columns: 1fr;
      gap: 20px;
    }

    .score-distribution-card {
      border: 1px solid #e2e8f0;
    }

    .score-ranges {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .score-range {
      padding: 16px;
      border-radius: 8px;
      border: 2px solid;
    }

    .score-range.hot {
      border-color: #ef4444;
      background: #fef2f2;
    }

    .score-range.warm {
      border-color: #f59e0b;
      background: #fef3c7;
    }

    .score-range.cold {
      border-color: #64748b;
      background: #f8fafc;
    }

    .range-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
      font-weight: 600;
    }

    .range-count {
      font-size: 24px;
      font-weight: 700;
      color: #1e293b;
    }

    .range-percentage {
      font-size: 14px;
      color: #64748b;
    }

    /* Empty State */
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 40px;
      color: #64748b;
    }

    .empty-state mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
    }

    /* Dialog Actions */
    .dialog-actions {
      padding: 16px 24px;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .analytics-dialog {
        max-width: 100%;
        max-height: 100vh;
      }

      .metrics-grid {
        grid-template-columns: 1fr;
      }

      .metric-card.wide {
        grid-column: span 1;
      }

      .source-analytics {
        grid-template-columns: 1fr;
      }

      .conversion-summary {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  `]
})
export class LeadAnalyticsDialogComponent implements OnInit {
  private leadService = inject(LeadService);
  private dialogRef = inject(MatDialogRef<LeadAnalyticsDialogComponent>);

  // State
  loading = signal(true);
  dashboardMetrics = signal<LeadMetrics | null>(null);
  sourceAnalytics = signal<SourceAnalytics[]>([]);
  conversionRates = signal<ConversionAnalytics | null>(null);
  selectedPeriod = 'Month';

  ngOnInit(): void {
    this.loadAnalyticsData();
  }

  private loadAnalyticsData(): void {
    this.loading.set(true);

    // Load dashboard metrics
    this.leadService.getLeadsDashboardMetrics().subscribe({
      next: (metrics) => {
        this.dashboardMetrics.set(metrics);
      },
      error: (error) => {
        console.error('Error loading dashboard metrics:', error);
      }
    });

    // Load source analytics
    this.leadService.getLeadSourceAnalytics().subscribe({
      next: (analytics) => {
        this.sourceAnalytics.set(this.mapSourceAnalytics(analytics));
      },
      error: (error) => {
        console.error('Error loading source analytics:', error);
      }
    });

    // Load conversion rates
    this.loadConversionRates();

    this.loading.set(false);
  }

  loadConversionRates(): void {
    this.leadService.getLeadConversionRates(this.selectedPeriod as any).subscribe({
      next: (rates) => {
        this.conversionRates.set(rates);
      },
      error: (error) => {
        console.error('Error loading conversion rates:', error);
      }
    });
  }

  private mapSourceAnalytics(data: any[]): SourceAnalytics[] {
    return data.map(item => ({
      sourceName: item.sourceName || item.leadSource || 'Unknown',
      leadCount: item.leadCount || item.count || 0,
      conversionRate: item.conversionRate || 0,
      averageScore: item.averageScore || item.avgScore || 0,
      qualifiedCount: item.qualifiedCount || item.qualified || 0
    }));
  }

  getPerformanceClass(conversionRate: number): string {
    if (conversionRate >= 25) return 'excellent';
    if (conversionRate >= 15) return 'good';
    if (conversionRate >= 5) return 'average';
    return 'poor';
  }

  getPerformanceLabel(conversionRate: number): string {
    if (conversionRate >= 25) return 'Mükemmel';
    if (conversionRate >= 15) return 'İyi';
    if (conversionRate >= 5) return 'Ortalama';
    return 'Zayıf';
  }

  getScoreRangeCount(range: 'hot' | 'warm' | 'cold'): number {
    const metrics = this.dashboardMetrics();
    if (!metrics) return 0;

    switch (range) {
      case 'hot':
        return metrics.hotLeads;
      case 'warm':
        return Math.max(0, metrics.totalLeads - metrics.hotLeads - this.getScoreRangeCount('cold'));
      case 'cold':
        return Math.max(0, metrics.totalLeads - metrics.hotLeads - metrics.qualifiedLeads);
      default:
        return 0;
    }
  }

  getScoreRangePercentage(range: 'hot' | 'warm' | 'cold'): number {
    const metrics = this.dashboardMetrics();
    if (!metrics || metrics.totalLeads === 0) return 0;

    const count = this.getScoreRangeCount(range);
    return Math.round((count / metrics.totalLeads) * 100);
  }

  exportReport(): void {
    this.leadService.exportLeads().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `lead-analytics-report-${new Date().toISOString().split('T')[0]}.xlsx`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Error exporting report:', error);
      }
    });
  }

  onClose(): void {
    this.dialogRef.close();
  }
}