import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { RecentViewsService, RecentView } from '../../../core/services/recent-views.service';

@Component({
  selector: 'app-recent-views',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatMenuModule
  ],
  template: `
    <div class="recent-views-container">
      <button mat-icon-button
              [matMenuTriggerFor]="recentViewsMenu"
              class="recent-views-btn"
              matTooltip="Recently Viewed">
        <mat-icon>history</mat-icon>
      </button>

      <mat-menu #recentViewsMenu="matMenu" class="recent-views-menu">
        <div class="recent-views-header">
          <span class="recent-views-title">Recently Viewed</span>
          <button mat-icon-button
                  *ngIf="recentViewsService.recentViews().length > 0"
                  (click)="clearAll(); $event.stopPropagation()"
                  class="clear-all-btn"
                  matTooltip="Clear all">
            <mat-icon>clear_all</mat-icon>
          </button>
        </div>

        <div class="recent-views-content" *ngIf="recentViewsService.recentViews().length > 0; else emptyState">
          @for (view of recentViewsService.recentViews(); track view.id) {
            <div class="recent-view-item"
                 (click)="navigateToView(view)"
                 [matTooltip]="view.url">
              <div class="view-icon">
                <mat-icon [class]="getIconClass(view.type)">{{ view.icon }}</mat-icon>
              </div>
              <div class="view-content">
                <div class="view-title">{{ view.title }}</div>
                <div class="view-timestamp">{{ formatTimestamp(view.timestamp) }}</div>
              </div>
              <button mat-icon-button
                      class="remove-btn"
                      (click)="removeView(view, $event)"
                      matTooltip="Remove">
                <mat-icon>close</mat-icon>
              </button>
            </div>
          }
        </div>

        <ng-template #emptyState>
          <div class="empty-state">
            <mat-icon>history</mat-icon>
            <span>No recent views</span>
          </div>
        </ng-template>
      </mat-menu>
    </div>
  `,
  styles: [`
    .recent-views-btn {
      color: #64748b;
      width: 40px;
      height: 40px;
    }

    .recent-views-btn:hover {
      background: #f1f5f9;
      color: #2563eb;
    }

    .recent-views-menu {
      margin-top: 8px;
    }

    .recent-views-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px;
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
      margin: -8px -8px 0 -8px;
    }

    .recent-views-title {
      font-size: 14px;
      font-weight: 600;
      color: #1a202c;
    }

    .clear-all-btn {
      width: 32px;
      height: 32px;
      color: #64748b;
    }

    .recent-views-content {
      max-height: 400px;
      overflow-y: auto;
      padding: 8px 0;
    }

    .recent-view-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      cursor: pointer;
      transition: background 0.2s ease;
      position: relative;
    }

    .recent-view-item:hover {
      background: #f8fafc;
    }

    .recent-view-item:hover .remove-btn {
      opacity: 1;
    }

    .view-icon {
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: 6px;
      background: #f1f5f9;
    }

    .view-icon mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .icon-lead { color: #059669; }
    .icon-opportunity { color: #dc2626; }
    .icon-account { color: #2563eb; }
    .icon-contact { color: #7c3aed; }
    .icon-task { color: #ea580c; }
    .icon-report { color: #0891b2; }
    .icon-other { color: #64748b; }

    .view-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;
    }

    .view-title {
      font-size: 14px;
      font-weight: 500;
      color: #1a202c;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .view-timestamp {
      font-size: 12px;
      color: #64748b;
    }

    .remove-btn {
      opacity: 0;
      transition: opacity 0.2s ease;
      width: 24px;
      height: 24px;
      color: #94a3b8;
      flex-shrink: 0;
    }

    .remove-btn mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .remove-btn:hover {
      color: #dc2626;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 32px 16px;
      color: #94a3b8;
      text-align: center;
      gap: 8px;
    }

    .empty-state mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
    }
  `]
})
export class RecentViewsComponent {
  constructor(public recentViewsService: RecentViewsService) {}

  navigateToView(view: RecentView): void {
    this.recentViewsService.navigateToRecentView(view);
  }

  removeView(view: RecentView, event: Event): void {
    event.stopPropagation();
    this.recentViewsService.removeRecentView(view.id);
  }

  clearAll(): void {
    this.recentViewsService.clearRecentViews();
  }

  formatTimestamp(timestamp: Date): string {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;

    // For older items, show actual date
    return timestamp.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  }

  getIconClass(type: RecentView['type']): string {
    return `icon-${type}`;
  }
}