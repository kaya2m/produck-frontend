import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

interface Activity {
  id: string;
  type: 'lead' | 'opportunity' | 'account' | 'task';
  title: string;
  description: string;
  timestamp: Date;
  user: string;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-recent-activity',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="activity-list">
      <div *ngFor="let activity of activities" class="activity-item">
        <div class="activity-icon" [ngClass]="'icon-' + activity.color">
          <mat-icon>{{ activity.icon }}</mat-icon>
        </div>
        <div class="activity-content">
          <h4 class="activity-title">{{ activity.title }}</h4>
          <p class="activity-description">{{ activity.description }}</p>
          <div class="activity-meta">
            <span class="activity-user">{{ activity.user }}</span>
            <span class="activity-time">{{ getRelativeTime(activity.timestamp) }}</span>
          </div>
        </div>
      </div>

      <div class="view-all">
        <button mat-button color="primary">
          View All Activity
          <mat-icon>arrow_forward</mat-icon>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .activity-list {
      max-height: 400px;
      overflow-y: auto;
    }

    .activity-item {
      display: flex;
      gap: 16px;
      padding: 16px 0;
      border-bottom: 1px solid #f3f4f6;
    }

    .activity-item:last-child {
      border-bottom: none;
    }

    .activity-icon {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .activity-icon mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      color: white;
    }

    .icon-blue {
      background: #3b82f6;
    }

    .icon-green {
      background: #10b981;
    }

    .icon-orange {
      background: #f59e0b;
    }

    .icon-purple {
      background: #8b5cf6;
    }

    .activity-content {
      flex: 1;
      min-width: 0;
    }

    .activity-title {
      font-size: 14px;
      font-weight: 600;
      color: #111827;
      margin: 0 0 4px 0;
    }

    .activity-description {
      font-size: 13px;
      color: #6b7280;
      margin: 0 0 8px 0;
      line-height: 1.4;
    }

    .activity-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
      color: #9ca3af;
    }

    .activity-user {
      font-weight: 500;
    }

    .view-all {
      text-align: center;
      padding-top: 16px;
      border-top: 1px solid #f3f4f6;
      margin-top: 16px;
    }

    .view-all button {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0 auto;
    }

    @media (max-width: 768px) {
      .activity-item {
        gap: 12px;
        padding: 12px 0;
      }

      .activity-icon {
        width: 36px;
        height: 36px;
      }

      .activity-meta {
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
      }
    }
  `]
})
export class RecentActivityComponent implements OnInit {
  activities: Activity[] = [
    {
      id: '1',
      type: 'lead',
      title: 'New lead created',
      description: 'John Doe from Acme Corp submitted a contact form',
      timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
      user: 'Sarah Johnson',
      icon: 'person_add',
      color: 'blue'
    },
    {
      id: '2',
      type: 'opportunity',
      title: 'Opportunity moved to negotiation',
      description: 'Software license deal worth $50,000 advanced to next stage',
      timestamp: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
      user: 'Mike Chen',
      icon: 'trending_up',
      color: 'green'
    },
    {
      id: '3',
      type: 'task',
      title: 'Follow-up call completed',
      description: 'Discussed requirements with TechStart Inc.',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      user: 'Emily Davis',
      icon: 'call',
      color: 'orange'
    },
    {
      id: '4',
      type: 'account',
      title: 'Account information updated',
      description: 'Contact details and billing address updated for GlobalTech',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      user: 'Alex Rodriguez',
      icon: 'business',
      color: 'purple'
    },
    {
      id: '5',
      type: 'lead',
      title: 'Lead qualification completed',
      description: 'Marketing qualified lead converted to sales qualified lead',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      user: 'Jessica Wang',
      icon: 'check_circle',
      color: 'green'
    }
  ];

  constructor() { }

  ngOnInit(): void { }

  getRelativeTime(timestamp: Date): string {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  }
}