import { Component, EventEmitter, Input, Output, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/auth.models';
import { RecentViewsService } from '../../core/services/recent-views.service';

// Material Components
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { RecentViewsComponent } from '../../shared/components/recent-views/recent-views.component';

interface Breadcrumb {
  label: string;
  url: string;
}

interface SearchSuggestion {
  id: string;
  text: string;
  type: string;
  icon: string;
  url: string;
}

interface Notification {
  id: string;
  message: string;
  timestamp: Date;
  read: boolean;
  icon: string;
  iconClass: string;
  type: 'info' | 'warning' | 'error' | 'success';
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatMenuModule,
    MatBadgeModule,
    MatDividerModule,
    MatChipsModule,
    MatTooltipModule,
    MatProgressBarModule,
    RecentViewsComponent
  ],
  template: `
    <header class="modern-header" [class.sidebar-collapsed]="sidebarCollapsed">
      <!-- Main Header Row -->
      <div class="header-main">
        <div class="header-content">
          <!-- Left Section -->
          <div class="header-left">
            <!-- Mobile Menu Button -->
            <button mat-icon-button
                    *ngIf="isHandset"
                    (click)="menuClick.emit()"
                    class="mobile-menu-btn"
                    matTooltip="Toggle menu">
              <mat-icon>menu</mat-icon>
            </button>

            <!-- Page Title & Breadcrumbs -->
            <div class="title-section">
              <h1 class="page-title">{{ getPageTitle() }}</h1>
              <nav class="breadcrumbs" *ngIf="!isHandset">
                <ol class="breadcrumb-list">
                  <li class="breadcrumb-item">
                    <a routerLink="/dashboard" class="breadcrumb-link">
                      <mat-icon class="breadcrumb-icon">home</mat-icon>
                      Dashboard
                    </a>
                  </li>
                  @if (getCurrentBreadcrumbs().length > 0) {
                    @for (crumb of getCurrentBreadcrumbs(); track crumb.url) {
                      <li class="breadcrumb-separator">
                        <mat-icon>chevron_right</mat-icon>
                      </li>
                      <li class="breadcrumb-item">
                        <a [routerLink]="crumb.url" class="breadcrumb-link">
                          {{ crumb.label }}
                        </a>
                      </li>
                    }
                  }
                </ol>
              </nav>
            </div>
          </div>

          <!-- Center Section - Search -->
          <div class="header-center">
            <div class="global-search">
              <mat-form-field appearance="outline" class="search-field">
                <mat-icon matPrefix class="search-icon">search</mat-icon>
                <input matInput
                       placeholder="Search leads, accounts, contacts..."
                       [value]="searchQuery()"
                       (input)="onSearchInput($event)"
                       (keydown.enter)="performSearch()"
                       class="search-input">
                <button mat-icon-button
                        matSuffix
                        *ngIf="searchQuery()"
                        (click)="clearSearch()"
                        class="clear-search-btn">
                  <mat-icon>close</mat-icon>
                </button>
              </mat-form-field>

              <!-- Search Suggestions -->
              @if (showSearchSuggestions() && searchSuggestions().length > 0) {
                <div class="search-suggestions">
                  @for (suggestion of searchSuggestions(); track suggestion.id) {
                    <div class="suggestion-item" (click)="selectSuggestion(suggestion)">
                      <mat-icon class="suggestion-icon">{{ suggestion.icon }}</mat-icon>
                      <span class="suggestion-text">{{ suggestion.text }}</span>
                      <span class="suggestion-type">{{ suggestion.type }}</span>
                    </div>
                  }
                </div>
              }
            </div>
          </div>

          <!-- Right Section -->
          <div class="header-right">
            <!-- Quick Actions -->
            <div class="quick-actions">
              <app-recent-views></app-recent-views>

              <button mat-icon-button
                      matTooltip="Create New"
                      [matMenuTriggerFor]="quickCreateMenu"
                      class="action-btn">
                <mat-icon>add_circle</mat-icon>
              </button>

              <button mat-icon-button
                      matTooltip="Calendar"
                      routerLink="/calendar"
                      class="action-btn">
                <mat-icon>event</mat-icon>
              </button>

              <button mat-icon-button
                      matTooltip="Tasks"
                      routerLink="/tasks"
                      [matBadge]="taskCount()"
                      matBadgeColor="primary"
                      [matBadgeHidden]="taskCount() === 0"
                      class="action-btn">
                <mat-icon>task</mat-icon>
              </button>
            </div>

            <!-- Notifications -->
            <div class="notifications">
              <button mat-icon-button
                      [matBadge]="notificationCount()"
                      matBadgeColor="warn"
                      [matBadgeHidden]="notificationCount() === 0"
                      [matMenuTriggerFor]="notificationMenu"
                      class="notification-btn"
                      matTooltip="Notifications">
                <mat-icon>notifications</mat-icon>
              </button>
            </div>

            <!-- User Profile -->
            <div class="user-section" *ngIf="currentUser$ | async as user">
              <button mat-button [matMenuTriggerFor]="userMenu" class="user-profile-btn">
                <div class="user-info">
                  <span class="user-name">{{ user.firstName }} {{ user.lastName }}</span>
                  <span class="user-role">Administrator</span>
                </div>
                <mat-icon class="dropdown-icon">keyboard_arrow_down</mat-icon>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Progress Bar for Loading States -->
      @if (isLoading()) {
        <mat-progress-bar mode="indeterminate" class="loading-bar"></mat-progress-bar>
      }
    </header>

    <!-- Quick Create Menu -->
    <mat-menu #quickCreateMenu="matMenu" class="quick-create-menu">
      <button mat-menu-item (click)="quickCreate('lead')">
        <mat-icon>person_add</mat-icon>
        <span>New Lead</span>
      </button>
      <button mat-menu-item (click)="quickCreate('opportunity')">
        <mat-icon>trending_up</mat-icon>
        <span>New Opportunity</span>
      </button>
      <button mat-menu-item (click)="quickCreate('account')">
        <mat-icon>business</mat-icon>
        <span>New Account</span>
      </button>
      <button mat-menu-item (click)="quickCreate('contact')">
        <mat-icon>contacts</mat-icon>
        <span>New Contact</span>
      </button>
      <mat-divider></mat-divider>
      <button mat-menu-item (click)="quickCreate('task')">
        <mat-icon>task</mat-icon>
        <span>New Task</span>
      </button>
      <button mat-menu-item (click)="quickCreate('meeting')">
        <mat-icon>event</mat-icon>
        <span>Schedule Meeting</span>
      </button>
    </mat-menu>

    <!-- Notifications Menu -->
    <mat-menu #notificationMenu="matMenu" class="notification-menu">
      <div class="notification-header">
        <span class="notification-title">Notifications</span>
        <button mat-icon-button class="mark-all-read-btn" (click)="markAllNotificationsRead()">
          <mat-icon>done_all</mat-icon>
        </button>
      </div>
      <mat-divider></mat-divider>

      @if (notifications().length === 0) {
        <div class="no-notifications">
          <mat-icon>notifications_none</mat-icon>
          <span>No new notifications</span>
        </div>
      } @else {
        @for (notification of notifications(); track notification.id) {
          <div class="notification-item" [class.unread]="!notification.read" (click)="markNotificationRead(notification)">
            <div class="notification-icon">
              <mat-icon [class]="notification.iconClass">{{ notification.icon }}</mat-icon>
            </div>
            <div class="notification-content">
              <p class="notification-text">{{ notification.message }}</p>
              <span class="notification-time">{{ notification.timestamp | date:'short' }}</span>
            </div>
          </div>
        }
      }

      <mat-divider></mat-divider>
      <button mat-menu-item class="view-all-btn" routerLink="/notifications">
        <span>View All Notifications</span>
      </button>
    </mat-menu>

    <!-- User Menu -->
    <mat-menu #userMenu="matMenu" class="user-menu">
      @if (currentUser$ | async; as user) {
        <div class="user-menu-header">
          <div class="user-menu-avatar">
            {{ getUserInitials(user) }}
            <div class="status-indicator online"></div>
          </div>
          <div class="user-menu-info">
            <div class="user-menu-name">{{ user.firstName }} {{ user.lastName }}</div>
            <div class="user-menu-email">{{ user.email }}</div>
            <div class="user-menu-role">Administrator</div>
          </div>
        </div>
        <mat-divider></mat-divider>
      }

      <button mat-menu-item (click)="navigateToProfile()">
        <mat-icon>person</mat-icon>
        <span>My Profile</span>
      </button>
      <button mat-menu-item (click)="navigateToSettings()">
        <mat-icon>settings</mat-icon>
        <span>Account Settings</span>
      </button>
      <button mat-menu-item>
        <mat-icon>palette</mat-icon>
        <span>Appearance</span>
      </button>
      <mat-divider></mat-divider>
      <button mat-menu-item>
        <mat-icon>help</mat-icon>
        <span>Help & Support</span>
      </button>
      <button mat-menu-item>
        <mat-icon>feedback</mat-icon>
        <span>Send Feedback</span>
      </button>
      <mat-divider></mat-divider>
      <button mat-menu-item (click)="logout()" class="logout-item">
        <mat-icon>logout</mat-icon>
        <span>Sign Out</span>
      </button>
    </mat-menu>
  `,
  styles: [`
    /* Modern Header Base */
    .modern-header {
      background: #ffffff;
      border-bottom: 1px solid #e2e8f0;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      z-index: 50;
    }

    .header-main {
      height: 64px;
      display: flex;
      align-items: center;
    }

    .header-content {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      align-items: center;
      width: 100%;
      padding: 0 24px;
      gap: 24px;
    }

    .modern-header.sidebar-collapsed .header-content {
      padding-left: 32px;
    }

    /* Left Section */
    .header-left {
      display: flex;
      align-items: center;
      gap: 16px;
      min-width: 0;
      justify-self: flex-start;
    }

    .mobile-menu-btn {
      color: #64748b;
    }

    .title-section {
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;
    }

    .page-title {
      font-size: 20px;
      font-weight: 600;
      color: #1a202c;
      margin: 0;
      line-height: 1.2;
    }

    .breadcrumbs {
      display: flex;
      align-items: center;
    }

    .breadcrumb-list {
      display: flex;
      align-items: center;
      margin: 0;
      padding: 0;
      list-style: none;
      gap: 4px;
    }

    .breadcrumb-item {
      display: flex;
      align-items: center;
    }

    .breadcrumb-link {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 4px 8px;
      border-radius: 4px;
      text-decoration: none;
      color: #64748b;
      font-size: 13px;
      font-weight: 500;
      transition: all 0.2s ease;
    }

    .breadcrumb-link:hover {
      color: #2563eb;
      background: #eff6ff;
    }

    .breadcrumb-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .breadcrumb-separator {
      display: flex;
      align-items: center;
      color: #cbd5e1;
    }

    .breadcrumb-separator mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    /* Center Section - Search */
    .header-center {
      position: relative;
      display: flex;
      justify-content: center;
      align-items: center;
      justify-self: center;
    }

    .global-search {
      position: relative;
      width: 100%;
      max-width: 500px;
    }

    .search-field {
      width: 100%;
    }

    .search-input {
      height: 40px;
    }

    .search-icon {
      color: #94a3b8;
    }

    .clear-search-btn {
      color: #94a3b8;
      width: 24px;
      height: 24px;
    }

    .search-suggestions {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
      z-index: 1000;
      max-height: 300px;
      overflow-y: auto;
    }

    .suggestion-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      cursor: pointer;
      transition: background 0.2s ease;
    }

    .suggestion-item:hover {
      background: #f8fafc;
    }

    .suggestion-icon {
      color: #64748b;
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .suggestion-text {
      flex: 1;
      font-size: 14px;
      color: #1a202c;
      font-weight: 500;
    }

    .suggestion-type {
      font-size: 12px;
      color: #64748b;
      background: #f1f5f9;
      padding: 2px 6px;
      border-radius: 4px;
    }

    /* Right Section */
    .header-right {
      display: flex;
      align-items: center;
      gap: 8px;
      justify-self: flex-end;
    }

    .quick-actions {
      display: flex;
      align-items: center;
      gap: 4px;
      border-right: 1px solid #e2e8f0;
      padding-right: 16px;
      margin-right: 8px;
    }

    .action-btn,
    .notification-btn {
      width: 40px;
      height: 40px;
      color: #64748b;
      transition: all 0.2s ease;
    }

    .action-btn:hover,
    .notification-btn:hover {
      background: #f1f5f9;
      color: #2563eb;
    }

    .notifications {
      border-right: 1px solid #e2e8f0;
      padding-right: 16px;
      margin-right: 8px;
    }

    /* User Profile */
    .user-section {
      display: flex;
      align-items: center;
    }

    .user-profile-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      border-radius: 8px;
      transition: all 0.2s ease;
      min-width: 100px;
      height: 44px;
      width: auto;
      justify-content: flex-start;
    }

    .user-profile-btn:hover {
      background: #f8fafc;
    }

    .user-avatar {
      position: relative;
      width: 32px;
      height: 32px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 13px;
      font-weight: 600;
    }

    .status-indicator {
      position: absolute;
      bottom: -2px;
      right: -2px;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      border: 2px solid white;
    }

    .status-indicator.online {
      background: #10b981;
    }

    .user-info {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      min-width: 80px;
      gap: 1px;
    }

    .user-name {
      font-size: 14px;
      font-weight: 600;
      color: #1a202c;
      line-height: 1;
      white-space: nowrap;
    }

    .user-role {
      font-size: 12px;
      color: #64748b;
      line-height: 1;
      white-space: nowrap;
      font-weight: 500;
    }

    .dropdown-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      color: #94a3b8;
      transition: transform 0.2s ease;
    }

    .user-profile-btn:hover .dropdown-icon {
      color: #64748b;
    }

    /* Loading Bar */
    .loading-bar {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 2px;
    }

    /* Menu Styles */
    .quick-create-menu,
    .notification-menu,
    .user-menu {
      margin-top: 8px;
      min-width: 280px;
    }

    .notification-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px;
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
    }

    .notification-title {
      font-size: 16px;
      font-weight: 600;
      color: #1a202c;
    }

    .mark-all-read-btn {
      width: 32px;
      height: 32px;
      color: #64748b;
    }

    .no-notifications {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 32px 16px;
      color: #94a3b8;
      text-align: center;
      gap: 8px;
    }

    .notification-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 16px;
      cursor: pointer;
      transition: background 0.2s ease;
      border-left: 3px solid transparent;
    }

    .notification-item:hover {
      background: #f8fafc;
    }

    .notification-item.unread {
      background: #eff6ff;
      border-left-color: #2563eb;
    }

    .notification-icon {
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: 6px;
      background: #f1f5f9;
    }

    .notification-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .notification-text {
      font-size: 14px;
      color: #1a202c;
      margin: 0;
      line-height: 1.4;
    }

    .notification-time {
      font-size: 12px;
      color: #64748b;
    }

    .user-menu-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      background: #f8fafc;
    }

    .user-menu-avatar {
      position: relative;
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 14px;
      font-weight: 600;
    }

    .user-menu-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
      min-width: 0;
    }

    .user-menu-name {
      font-size: 15px;
      font-weight: 600;
      color: #1a202c;
      line-height: 1.2;
    }

    .user-menu-email {
      font-size: 12px;
      color: #64748b;
      line-height: 1.2;
      margin-bottom: 2px;
    }

    .user-menu-role {
      font-size: 11px;
      color: #10b981;
      font-weight: 600;
      background: #dcfce7;
      padding: 3px 8px;
      border-radius: 6px;
      width: fit-content;
      letter-spacing: 0.5px;
    }

    .logout-item {
      color: #dc2626 !important;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .header-content {
        display: flex;
        justify-content: space-between;
        padding: 0 16px;
        gap: 12px;
      }

      .modern-header.sidebar-collapsed .header-content {
        padding-left: 16px;
      }

      .page-title {
        font-size: 18px;
      }

      .breadcrumbs {
        display: none;
      }

      .header-center {
        display: none;
      }

      .user-profile-btn {
        gap: 6px;
        padding: 6px;
      }

      .quick-actions {
        gap: 2px;
        padding-right: 8px;
        margin-right: 4px;
      }

      .user-info {
        display: none;
      }

      .user-avatar {
        width: 36px;
        height: 36px;
      }
    }

    @media (max-width: 480px) {
      .quick-actions {
        display: none;
      }

      .notifications {
        padding-right: 8px;
        margin-right: 4px;
      }
    }
  `]
})
export class HeaderComponent implements OnInit {
  @Input() isHandset: boolean | null = false;
  @Input() sidebarCollapsed = false;
  @Output() menuClick = new EventEmitter<void>();

  // Modern Signal-based state
  searchQuery = signal('');
  showSearchSuggestions = signal(false);
  searchSuggestions = signal<SearchSuggestion[]>([]);
  notificationCount = signal(5);
  taskCount = signal(3);
  isLoading = signal(false);
  notifications = signal<Notification[]>([
    {
      id: '1',
      message: 'New lead assigned: John Smith',
      timestamp: new Date(Date.now() - 5 * 60000),
      read: false,
      icon: 'person_add',
      iconClass: 'text-blue-500',
      type: 'info'
    },
    {
      id: '2',
      message: 'Meeting in 30 minutes with TechCorp',
      timestamp: new Date(Date.now() - 15 * 60000),
      read: false,
      icon: 'event',
      iconClass: 'text-orange-500',
      type: 'warning'
    },
    {
      id: '3',
      message: 'Deal closed: $50,000 opportunity won',
      timestamp: new Date(Date.now() - 60 * 60000),
      read: true,
      icon: 'trending_up',
      iconClass: 'text-green-500',
      type: 'success'
    }
  ]);

  currentUser$: Observable<User | null>;

  constructor(
    private authService: AuthService,
    private router: Router,
    private dialog: MatDialog,
    private recentViewsService: RecentViewsService
  ) {
    this.currentUser$ = this.authService.currentUser$;
  }

  ngOnInit(): void {
    // Listen to router events for breadcrumbs
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        map(() => this.router.url)
      )
      .subscribe(() => {
        // Update breadcrumbs when route changes
      });
  }

  getPageTitle(): string {
    const url = this.router.url;

    if (url.includes('/dashboard')) return 'Dashboard';
    if (url.includes('/leads')) return 'Leads Management';
    if (url.includes('/opportunities')) return 'Opportunities';
    if (url.includes('/accounts')) return 'Account Management';
    if (url.includes('/contacts')) return 'Contacts';
    if (url.includes('/pipeline')) return 'Sales Pipeline';
    if (url.includes('/marketing')) return 'Marketing';
    if (url.includes('/tasks')) return 'Task Management';
    if (url.includes('/calendar')) return 'Calendar';
    if (url.includes('/workflow')) return 'Workflow Automation';
    if (url.includes('/reports')) return 'Reports & Analytics';
    if (url.includes('/insights')) return 'Business Insights';
    if (url.includes('/team')) return 'Team Management';
    if (url.includes('/settings')) return 'Settings';

    return 'Produck CRM';
  }

  getCurrentBreadcrumbs(): Breadcrumb[] {
    const url = this.router.url;
    const breadcrumbs: Breadcrumb[] = [];
    const segments = url.split('/').filter(segment => segment);

    // Dynamic breadcrumb generation
    let currentPath = '';

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      currentPath += '/' + segment;

      // Skip dashboard in breadcrumbs as it's already in home icon
      if (segment === 'dashboard') continue;

      let label = this.formatSegmentLabel(segment, segments, i);

      // Don't add if it's the current page (last segment)
      if (i < segments.length - 1 || segments.length === 1) {
        breadcrumbs.push({ label, url: currentPath });
      }
    }

    return breadcrumbs;
  }

  private formatSegmentLabel(segment: string, segments: string[], index: number): string {
    // Handle special cases for better UX
    const labelMap: { [key: string]: string } = {
      'leads': 'Leads',
      'opportunities': 'Opportunities',
      'accounts': 'Accounts',
      'contacts': 'Contacts',
      'pipeline': 'Pipeline',
      'marketing': 'Marketing',
      'tasks': 'Tasks',
      'calendar': 'Calendar',
      'reports': 'Reports',
      'insights': 'Insights',
      'team': 'Team',
      'settings': 'Settings',
      'new': 'New',
      'edit': 'Edit'
    };

    // If it's a known segment, return mapped label
    if (labelMap[segment]) {
      return labelMap[segment];
    }

    // If it looks like an ID (number or uuid), try to get a meaningful name
    if (this.isId(segment)) {
      const parentSegment = segments[index - 1];
      if (parentSegment) {
        return this.getRecordDisplayName(segment, parentSegment);
      }
    }

    // Default: capitalize first letter
    return segment.charAt(0).toUpperCase() + segment.slice(1);
  }

  private isId(segment: string): boolean {
    // Check if segment looks like an ID (number or uuid pattern)
    return /^\d+$/.test(segment) || /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(segment);
  }

  private getRecordDisplayName(id: string, type: string): string {
    // In a real app, this would fetch the actual record name
    // For now, return a placeholder that shows the type
    const typeMap: { [key: string]: string } = {
      'leads': 'Lead',
      'opportunities': 'Opportunity',
      'accounts': 'Account',
      'contacts': 'Contact'
    };

    return typeMap[type] || 'Record';
  }

  onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    const query = target.value;
    this.searchQuery.set(query);

    if (query.length > 2) {
      this.showSearchSuggestions.set(true);
      // Simulate API call for search suggestions
      setTimeout(() => {
        this.searchSuggestions.set([
          {
            id: '1',
            text: 'John Smith',
            type: 'Lead',
            icon: 'person',
            url: '/leads/1'
          },
          {
            id: '2',
            text: 'TechCorp Account',
            type: 'Account',
            icon: 'business',
            url: '/accounts/2'
          },
          {
            id: '3',
            text: 'Sales Pipeline Report',
            type: 'Report',
            icon: 'assessment',
            url: '/reports/pipeline'
          }
        ]);
      }, 200);
    } else {
      this.showSearchSuggestions.set(false);
      this.searchSuggestions.set([]);
    }
  }

  performSearch(): void {
    if (this.searchQuery()) {
      console.log('Performing search for:', this.searchQuery());
      this.router.navigate(['/search'], { queryParams: { q: this.searchQuery() } });
      this.showSearchSuggestions.set(false);
    }
  }

  clearSearch(): void {
    this.searchQuery.set('');
    this.showSearchSuggestions.set(false);
    this.searchSuggestions.set([]);
  }

  selectSuggestion(suggestion: SearchSuggestion): void {
    this.router.navigate([suggestion.url]);
    this.searchQuery.set(suggestion.text);
    this.showSearchSuggestions.set(false);
  }

  quickCreate(type: string): void {
    switch (type) {
      case 'lead':
        this.router.navigate(['/leads/new']);
        break;
      case 'opportunity':
        this.router.navigate(['/opportunities/new']);
        break;
      case 'account':
        this.router.navigate(['/accounts/new']);
        break;
      case 'contact':
        this.router.navigate(['/contacts/new']);
        break;
      case 'task':
        this.router.navigate(['/tasks/new']);
        break;
      case 'meeting':
        this.router.navigate(['/calendar/new']);
        break;
    }
  }

  markNotificationRead(notification: Notification): void {
    const notifications = this.notifications();
    const index = notifications.findIndex(n => n.id === notification.id);
    if (index !== -1 && !notifications[index].read) {
      notifications[index].read = true;
      this.notifications.set([...notifications]);
      this.updateNotificationCount();
    }
  }

  markAllNotificationsRead(): void {
    const notifications = this.notifications().map(n => ({ ...n, read: true }));
    this.notifications.set(notifications);
    this.notificationCount.set(0);
  }

  private updateNotificationCount(): void {
    const unreadCount = this.notifications().filter(n => !n.read).length;
    this.notificationCount.set(unreadCount);
  }

  getUserInitials(user: User): string {
    const firstName = user.firstName || user.username?.charAt(0) || 'U';
    const lastName = user.lastName || user.username?.charAt(1) || 'N';
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
  }

  navigateToProfile(): void {
    this.router.navigate(['/profile']);
  }

  navigateToSettings(): void {
    this.router.navigate(['/settings']);
  }

  logout(): void {
    this.authService.logout();
  }
}