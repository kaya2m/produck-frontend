import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../../core/services/auth.service';
import { User } from '../../../../core/models/auth.models';
import { DashboardStatsComponent } from '../dashboard-stats/dashboard-stats.component';
import { SalesChartComponent } from '../sales-chart/sales-chart.component';
import { LeadsPipelineComponent } from '../leads-pipeline/leads-pipeline.component';
import { RecentActivityComponent } from '../recent-activity/recent-activity.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    DashboardStatsComponent,
    SalesChartComponent,
    LeadsPipelineComponent,
    RecentActivityComponent
  ],
  template: `
    <div class="dashboard-container">
      <!-- Welcome Section -->
      <div class="welcome-section" *ngIf="currentUser$ | async as user">
        <div class="welcome-content">
          <h1 class="welcome-title">
            Welcome back, {{ user.firstName }}! 👋
          </h1>
          <p class="welcome-subtitle">
            Here's what's happening with your sales today.
          </p>
        </div>
        <div class="welcome-actions">
          <button mat-raised-button color="primary" (click)="addLead()">
            <mat-icon>add</mat-icon>
            Add Lead
          </button>
          <button mat-stroked-button (click)="viewReports()">
            <mat-icon>assessment</mat-icon>
            View Reports
          </button>
        </div>
      </div>

      <!-- Stats Cards -->
      <app-dashboard-stats></app-dashboard-stats>

      <!-- Main Content Grid -->
      <div class="dashboard-grid">
        <!-- Sales Chart -->
        <div class="chart-container">
          <mat-card class="dashboard-card">
            <mat-card-header>
              <mat-card-title>Sales Performance</mat-card-title>
              <mat-card-subtitle>Revenue trend over the last 6 months</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <app-sales-chart></app-sales-chart>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Leads Pipeline -->
        <div class="pipeline-container">
          <mat-card class="dashboard-card">
            <mat-card-header>
              <mat-card-title>Leads Pipeline</mat-card-title>
              <mat-card-subtitle>Current leads by stage</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <app-leads-pipeline></app-leads-pipeline>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Recent Activity -->
        <div class="activity-container">
          <mat-card class="dashboard-card">
            <mat-card-header>
              <mat-card-title>Recent Activity</mat-card-title>
              <mat-card-subtitle>Latest updates and actions</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <app-recent-activity></app-recent-activity>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Quick Actions -->
        <div class="quick-actions-container">
          <mat-card class="dashboard-card">
            <mat-card-header>
              <mat-card-title>Quick Actions</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="quick-actions-grid">
                <button mat-stroked-button class="quick-action-btn" (click)="importLeads()">
                  <mat-icon>upload</mat-icon>
                  <span>Import Leads</span>
                </button>
                <button mat-stroked-button class="quick-action-btn" (click)="scheduleCall()">
                  <mat-icon>call</mat-icon>
                  <span>Schedule Call</span>
                </button>
                <button mat-stroked-button class="quick-action-btn" (click)="sendEmail()">
                  <mat-icon>email</mat-icon>
                  <span>Send Email</span>
                </button>
                <button mat-stroked-button class="quick-action-btn" (click)="createTask()">
                  <mat-icon>task</mat-icon>
                  <span>Create Task</span>
                </button>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0;
    }

    .welcome-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 32px;
      padding: 24px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 12px;
      color: white;
    }

    .welcome-title {
      font-size: 28px;
      font-weight: 700;
      margin: 0 0 8px 0;
    }

    .welcome-subtitle {
      font-size: 16px;
      opacity: 0.9;
      margin: 0;
    }

    .welcome-actions {
      display: flex;
      gap: 12px;
    }

    .dashboard-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      grid-template-rows: auto auto;
      gap: 24px;
      margin-top: 24px;
    }

    .chart-container {
      grid-column: 1;
      grid-row: 1;
    }

    .pipeline-container {
      grid-column: 2;
      grid-row: 1;
    }

    .activity-container {
      grid-column: 1;
      grid-row: 2;
    }

    .quick-actions-container {
      grid-column: 2;
      grid-row: 2;
    }

    .dashboard-card {
      height: 100%;
    }

    .dashboard-card .mat-mdc-card-content {
      padding-top: 16px;
    }

    .quick-actions-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    .quick-action-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 16px;
      height: auto;
      min-height: 80px;
    }

    .quick-action-btn mat-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    .quick-action-btn span {
      font-size: 12px;
      text-align: center;
    }

    @media (max-width: 1024px) {
      .dashboard-grid {
        grid-template-columns: 1fr;
        grid-template-rows: auto auto auto auto;
      }

      .chart-container,
      .pipeline-container,
      .activity-container,
      .quick-actions-container {
        grid-column: 1;
      }

      .chart-container { grid-row: 1; }
      .pipeline-container { grid-row: 2; }
      .activity-container { grid-row: 3; }
      .quick-actions-container { grid-row: 4; }
    }

    @media (max-width: 768px) {
      .welcome-section {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
      }

      .welcome-actions {
        width: 100%;
        justify-content: flex-start;
      }

      .dashboard-grid {
        gap: 16px;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  currentUser$: Observable<User | null>;

  constructor(private authService: AuthService) {
    this.currentUser$ = this.authService.currentUser$;
  }

  ngOnInit(): void {}

  addLead(): void {
    // Navigate to add lead
  }

  viewReports(): void {
    // Navigate to reports
  }

  importLeads(): void {
    // Open import dialog
  }

  scheduleCall(): void {
    // Open schedule dialog
  }

  sendEmail(): void {
    // Open email composer
  }

  createTask(): void {
    // Open task creation dialog
  }
}