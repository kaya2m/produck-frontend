import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

// Material Components
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

// Services
import { AuthService } from '../../core/services/auth.service';

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
      @if (currentUser(); as user) {
        <div class="welcome-section">
          <div class="welcome-content">
            <h1 class="welcome-title">
              Welcome back, {{ user.firstName }}! 👋
            </h1>
            <p class="welcome-subtitle">
              Here's what's happening with your sales today.
            </p>
          </div>
        </div>
      }

      <!-- Stats Cards -->
      <div class="stats-grid">
        @for (stat of stats(); track stat.id) {
          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-content">
                <mat-icon [class]="'stat-icon ' + stat.color">{{ stat.icon }}</mat-icon>
                <div class="stat-details">
                  <h3>{{ stat.title }}</h3>
                  <p class="stat-value">{{ stat.value }}</p>
                  <div class="stat-change" [class]="stat.trend">
                    <mat-icon class="trend-icon">
                      {{ stat.trend === 'up' ? 'trending_up' : 'trending_down' }}
                    </mat-icon>
                    <span>{{ stat.change }}%</span>
                  </div>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        }
      </div>

      <!-- Main Content -->
      <div class="dashboard-grid">
        <mat-card>
          <mat-card-header>
            <mat-card-title>Welcome to Produck CRM</mat-card-title>
            <mat-card-subtitle>Enterprise Customer Relationship Management</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <p>Your enterprise CRM system is ready to use with modern Angular best practices!</p>
            <ul class="features-list">
              <li>✅ Standalone Components</li>
              <li>✅ Built-in Control Flow (&#64;if, &#64;for)</li>
              <li>✅ Signal-based State Management</li>
              <li>✅ Modern Dependency Injection</li>
              <li>✅ Enterprise Security Architecture</li>
            </ul>
            <div class="action-buttons">
              <button mat-raised-button color="primary" (click)="addLead()">
                <mat-icon>add</mat-icon>
                Add Lead
              </button>
              <button mat-stroked-button (click)="viewReports()">
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
      max-width: 1400px;
      margin: 0 auto;
      padding: 0;
    }

    .welcome-section {
      margin-bottom: 32px;
      padding: 32px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 16px;
      color: white;
      position: relative;
      overflow: hidden;
    }

    .welcome-section::before {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      width: 100%;
      height: 100%;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 400"><path d="M0,400L48,400C96,400,192,400,288,380C384,360,480,320,576,300C672,280,768,280,864,290C960,300,1056,320,1152,330L1200,340L1200,0L1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z" fill="rgba(255,255,255,0.1)"/></svg>') no-repeat center/cover;
      opacity: 0.3;
    }

    .welcome-content {
      position: relative;
      z-index: 1;
    }

    .welcome-title {
      font-size: 32px;
      font-weight: 700;
      margin: 0 0 12px 0;
    }

    .welcome-subtitle {
      font-size: 18px;
      opacity: 0.9;
      margin: 0;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 24px;
      margin-bottom: 32px;
    }

    .stat-card {
      border-radius: 16px;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      overflow: hidden;
      position: relative;
    }

    .stat-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
    }

    .stat-content {
      display: flex;
      align-items: center;
      gap: 20px;
      padding: 8px;
    }

    .stat-icon {
      font-size: 36px;
      width: 60px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 12px;
      background: rgba(59, 130, 246, 0.1);
    }

    .stat-icon.blue { color: #3b82f6; background: rgba(59, 130, 246, 0.1); }
    .stat-icon.green { color: #10b981; background: rgba(16, 185, 129, 0.1); }
    .stat-icon.orange { color: #f59e0b; background: rgba(245, 158, 11, 0.1); }
    .stat-icon.purple { color: #8b5cf6; background: rgba(139, 92, 246, 0.1); }

    .stat-details {
      flex: 1;
    }

    .stat-details h3 {
      font-size: 14px;
      font-weight: 500;
      color: #6b7280;
      margin: 0 0 8px 0;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .stat-value {
      font-size: 28px;
      font-weight: 700;
      color: #111827;
      margin: 0 0 8px 0;
      line-height: 1;
    }

    .stat-change {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 13px;
      font-weight: 500;
    }

    .stat-change.up {
      color: #10b981;
    }

    .stat-change.down {
      color: #ef4444;
    }

    .trend-icon {
      font-size: 16px !important;
      width: 16px !important;
      height: 16px !important;
    }

    .dashboard-grid {
      margin-top: 32px;
    }

    .features-list {
      margin: 16px 0;
      padding: 0;
      list-style: none;
    }

    .features-list li {
      padding: 4px 0;
      font-size: 14px;
      color: #6b7280;
    }

    .action-buttons {
      margin-top: 24px;
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    @media (max-width: 768px) {
      .stats-grid {
        grid-template-columns: 1fr;
        gap: 16px;
      }

      .welcome-section {
        padding: 24px;
      }

      .welcome-title {
        font-size: 24px;
      }

      .action-buttons {
        flex-direction: column;
      }
    }
  `]
})
export class DashboardComponent {
  private authService = inject(AuthService);

  // Modern Signal-based state
  currentUser = signal<any>(null);
  stats = signal([
    {
      id: 1,
      title: 'Total Leads',
      value: '1,234',
      change: 12.5,
      trend: 'up',
      icon: 'group',
      color: 'blue'
    },
    {
      id: 2,
      title: 'Active Opportunities',
      value: '89',
      change: 8.2,
      trend: 'up',
      icon: 'trending_up',
      color: 'green'
    },
    {
      id: 3,
      title: 'Revenue This Month',
      value: '$24,567',
      change: -3.1,
      trend: 'down',
      icon: 'attach_money',
      color: 'orange'
    },
    {
      id: 4,
      title: 'Conversion Rate',
      value: '23.4%',
      change: 5.7,
      trend: 'up',
      icon: 'show_chart',
      color: 'purple'
    }
  ]);

  // Computed values
  totalRevenue = computed(() => {
    return this.stats().reduce((total, stat) => {
      if (stat.title.includes('Revenue')) {
        return total + parseFloat(stat.value.replace('$', '').replace(',', ''));
      }
      return total;
    }, 0);
  });

  constructor() {
    // Modern lifecycle - initialize data
    this.loadUserData();
  }

  private loadUserData() {
    // Mock user data - in real app would come from authService
    this.currentUser.set({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@produck.com'
    });
  }

  addLead() {
    console.log('Navigate to add lead...');
  }

  viewReports() {
    console.log('Navigate to reports...');
  }
}