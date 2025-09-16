import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

interface DashboardStat {
  title: string;
  value: string | number;
  change: number;
  changeType: 'increase' | 'decrease';
  icon: string;
  color: string;
}

@Component({
  selector: 'app-dashboard-stats',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule
  ],
  template: `
    <div class="stats-grid">
      <mat-card *ngFor="let stat of stats" class="stat-card" [ngClass]="'stat-' + stat.color">
        <div class="stat-content">
          <div class="stat-icon">
            <mat-icon [ngClass]="'icon-' + stat.color">{{ stat.icon }}</mat-icon>
          </div>
          <div class="stat-details">
            <h3 class="stat-title">{{ stat.title }}</h3>
            <p class="stat-value">{{ stat.value }}</p>
            <div class="stat-change" [ngClass]="stat.changeType">
              <mat-icon class="change-icon">
                {{ stat.changeType === 'increase' ? 'trending_up' : 'trending_down' }}
              </mat-icon>
              <span>{{ stat.change }}% from last month</span>
            </div>
          </div>
        </div>
      </mat-card>
    </div>
  `,
  styles: [`
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
      margin-bottom: 24px;
    }

    .stat-card {
      padding: 20px;
      border-radius: 12px;
      border-left: 4px solid;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    }

    .stat-card.stat-blue {
      border-left-color: #3b82f6;
      background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
    }

    .stat-card.stat-green {
      border-left-color: #10b981;
      background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
    }

    .stat-card.stat-yellow {
      border-left-color: #f59e0b;
      background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
    }

    .stat-card.stat-purple {
      border-left-color: #8b5cf6;
      background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%);
    }

    .stat-content {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .stat-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 60px;
      height: 60px;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.7);
    }

    .stat-icon mat-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
    }

    .icon-blue { color: #3b82f6; }
    .icon-green { color: #10b981; }
    .icon-yellow { color: #f59e0b; }
    .icon-purple { color: #8b5cf6; }

    .stat-details {
      flex: 1;
    }

    .stat-title {
      font-size: 14px;
      font-weight: 500;
      color: #6b7280;
      margin: 0 0 4px 0;
    }

    .stat-value {
      font-size: 32px;
      font-weight: 700;
      color: #111827;
      margin: 0 0 8px 0;
      line-height: 1;
    }

    .stat-change {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      font-weight: 500;
    }

    .stat-change.increase {
      color: #10b981;
    }

    .stat-change.decrease {
      color: #ef4444;
    }

    .change-icon {
      font-size: 16px !important;
      width: 16px !important;
      height: 16px !important;
    }

    @media (max-width: 768px) {
      .stats-grid {
        grid-template-columns: 1fr;
        gap: 16px;
      }

      .stat-card {
        padding: 16px;
      }

      .stat-content {
        gap: 12px;
      }

      .stat-icon {
        width: 50px;
        height: 50px;
      }

      .stat-icon mat-icon {
        font-size: 24px;
        width: 24px;
        height: 24px;
      }

      .stat-value {
        font-size: 24px;
      }
    }
  `]
})
export class DashboardStatsComponent implements OnInit {
  stats: DashboardStat[] = [
    {
      title: 'Total Leads',
      value: '1,234',
      change: 12.5,
      changeType: 'increase',
      icon: 'group',
      color: 'blue'
    },
    {
      title: 'Active Opportunities',
      value: '89',
      change: 8.2,
      changeType: 'increase',
      icon: 'trending_up',
      color: 'green'
    },
    {
      title: 'Revenue This Month',
      value: '$24,567',
      change: -3.1,
      changeType: 'decrease',
      icon: 'attach_money',
      color: 'yellow'
    },
    {
      title: 'Conversion Rate',
      value: '23.4%',
      change: 5.7,
      changeType: 'increase',
      icon: 'show_chart',
      color: 'purple'
    }
  ];

  constructor() { }

  ngOnInit(): void { }
}