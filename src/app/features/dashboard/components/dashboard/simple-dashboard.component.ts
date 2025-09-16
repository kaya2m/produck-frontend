import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../../core/services/auth.service';
import { User } from '../../../../core/models/auth.models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule
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
      </div>

      <!-- Simple Stats Cards -->
      <div class="stats-grid">
        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <mat-icon>group</mat-icon>
              <div class="stat-details">
                <h3>Total Leads</h3>
                <p class="stat-value">1,234</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <mat-icon>trending_up</mat-icon>
              <div class="stat-details">
                <h3>Opportunities</h3>
                <p class="stat-value">89</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <mat-icon>attach_money</mat-icon>
              <div class="stat-details">
                <h3>Revenue</h3>
                <p class="stat-value">$24,567</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Simple Content -->
      <div class="dashboard-grid">
        <mat-card>
          <mat-card-header>
            <mat-card-title>Welcome to Produck CRM</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <p>Your enterprise CRM system is ready to use!</p>
            <div class="mt-4">
              <button mat-raised-button color="primary" class="mr-2">
                <mat-icon>add</mat-icon>
                Add Lead
              </button>
              <button mat-stroked-button>
                <mat-icon>assessment</mat-icon>
                View Reports
              </button>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0;
    }

    .welcome-section {
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

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 24px;
    }

    .stat-card {
      padding: 20px;
      border-radius: 12px;
    }

    .stat-content {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .stat-content mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: #3b82f6;
    }

    .stat-details h3 {
      font-size: 14px;
      color: #6b7280;
      margin: 0 0 4px 0;
    }

    .stat-value {
      font-size: 24px;
      font-weight: 700;
      color: #111827;
      margin: 0;
    }

    .dashboard-grid {
      margin-top: 24px;
    }

    .mt-4 {
      margin-top: 16px;
    }

    .mr-2 {
      margin-right: 8px;
    }
  `]
})
export class DashboardComponent implements OnInit {
  currentUser$: Observable<User | null>;

  constructor(private authService: AuthService) {
    this.currentUser$ = this.authService.currentUser$;
  }

  ngOnInit(): void {}
}