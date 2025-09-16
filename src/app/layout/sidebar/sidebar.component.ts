import { Component, EventEmitter, OnInit, Output, inject, Input, signal } from '@angular/core';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { AuthService } from '../../core/services/auth.service';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
  badge?: number;
  children?: MenuItem[];
  permissions?: string[];
  group?: string;
  isNew?: boolean;
  description?: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatBadgeModule,
    MatDividerModule,
    MatMenuModule
  ],
  animations: [
    trigger('expandCollapse', [
      state('collapsed', style({
        height: '0px',
        opacity: 0,
        overflow: 'hidden'
      })),
      state('expanded', style({
        height: '*',
        opacity: 1,
        overflow: 'visible'
      })),
      transition('collapsed <=> expanded', [
        animate('200ms cubic-bezier(0.4, 0, 0.2, 1)')
      ])
    ]),
    trigger('fadeInOut', [
      state('in', style({ opacity: 1 })),
      state('out', style({ opacity: 0 })),
      transition('in <=> out', [
        animate('150ms ease-in-out')
      ])
    ])
  ],
  template: `
    <div class="sidebar-content" [class.collapsed]="isCollapsed()">
      <!-- Header Section -->
      <div class="sidebar-header">
        <div class="logo-section" [class.collapsed]="isCollapsed()">
          @if (!isCollapsed()) {
            <div class="logo-container">
              <img src="/logo/favicon.svg" alt="Produck Logo" class="brand-logo">
              <div class="brand-info">
                <h1 class="brand-name">Produck</h1>
                <span class="brand-subtitle">CRM Platform</span>
              </div>
            </div>
          } @else {
            <div class="logo-collapsed">
              <img src="/logo/favicon.svg" alt="Produck Logo" class="brand-logo-small">
            </div>
          }
        </div>

        <button mat-icon-button
                class="collapse-button"
                (click)="toggleSidebar()"
                [matTooltip]="isCollapsed() ? 'Expand sidebar' : 'Collapse sidebar'"
                matTooltipPosition="right">
          <mat-icon>{{ isCollapsed() ? 'chevron_right' : 'chevron_left' }}</mat-icon>
        </button>
      </div>

      <!-- Navigation -->
      <nav class="navigation" [class.collapsed]="isCollapsed()">
        <div class="nav-sections">
          @for (group of getGroupedMenuItems(); track group.name) {
            <div class="nav-group">
              @if (!isCollapsed() && group.name !== 'main') {
                <div class="group-header">
                  <span class="group-title">{{ group.name }}</span>
                </div>
              }

              <div class="nav-items">
                @for (item of group.items; track item.route) {
                  @if (hasPermission(item.permissions)) {
                    <div class="nav-item-container">
                      <!-- Main menu item -->
                      <a class="nav-item"
                         [routerLink]="!item.children ? item.route : null"
                         [routerLinkActive]="!item.children ? 'active' : ''"
                         [routerLinkActiveOptions]="{exact: false}"
                         (click)="item.children ? toggleMenuItem(item.route) : onMenuClick()"
                         [class.has-children]="item.children"
                         [class.expanded]="isExpanded(item.route)"
                         [matTooltip]="isCollapsed() ? item.label : ''"
                         matTooltipPosition="right">

                        <div class="nav-item-content">
                          <mat-icon class="nav-icon">{{ item.icon }}</mat-icon>

                          @if (!isCollapsed()) {
                            <span class="nav-label" [@fadeInOut]="'in'">{{ item.label }}</span>

                            <div class="nav-item-meta" [@fadeInOut]="'in'">
                              @if (item.isNew) {
                                <span class="new-badge">NEW</span>
                              }
                              @if (item.badge && item.badge > 0) {
                                <span class="nav-badge" [matBadge]="item.badge" matBadgeSize="small" matBadgeColor="primary"></span>
                              }
                              @if (item.children) {
                                <mat-icon class="expand-icon"
                                         [class.expanded]="isExpanded(item.route)"
                                         [style.transform]="isExpanded(item.route) ? 'rotate(180deg)' : 'rotate(0deg)'">
                                  expand_more
                                </mat-icon>
                              }
                            </div>
                          }
                        </div>
                      </a>

                      <!-- Submenu items -->
                      @if (item.children && !isCollapsed()) {
                        <div class="submenu"
                             [@expandCollapse]="isExpanded(item.route) ? 'expanded' : 'collapsed'">
                          @if (isExpanded(item.route)) {
                            @for (child of item.children; track child.route) {
                              <a class="submenu-item"
                                 [routerLink]="child.route"
                                 routerLinkActive="active"
                                 (click)="onMenuClick()">
                                <mat-icon class="submenu-icon">{{ child.icon }}</mat-icon>
                                <span class="submenu-label">{{ child.label }}</span>
                                @if (child.badge && child.badge > 0) {
                                  <span class="submenu-badge">{{ child.badge }}</span>
                                }
                              </a>
                            }
                          }
                        </div>
                      }
                    </div>
                  }
                }
              </div>
            </div>
          }
        </div>
      </nav>

      <!-- Quick Create Button -->
      @if (!isCollapsed()) {
        <div class="quick-create-section">
          <button mat-raised-button
                  color="primary"
                  class="quick-create-btn"
                  [matMenuTriggerFor]="quickCreateMenu">
            <mat-icon>add</mat-icon>
            Quick Create
          </button>
        </div>
      } @else {
        <div class="quick-create-section">
          <button mat-fab
                  color="primary"
                  class="quick-create-fab"
                  [matMenuTriggerFor]="quickCreateMenu"
                  matTooltip="Quick Create"
                  matTooltipPosition="right">
            <mat-icon>add</mat-icon>
          </button>
        </div>
      }

      <!-- User Profile Section -->
      @if (currentUser$ | async; as user) {
        <div class="user-section" [class.collapsed]="isCollapsed()">
          @if (!isCollapsed()) {
            <div class="user-info">
              <div class="user-avatar-section">
                <div class="user-avatar">
                  {{ getUserInitials(user) }}
                </div>
                <div class="user-details">
                  <div class="user-name">{{ user.firstName }} {{ user.lastName }}</div>
                  <div class="user-email">{{ user.email }}</div>
                  <div class="user-role">Administrator</div>
                </div>
              </div>
              <button mat-icon-button
                      [matMenuTriggerFor]="userMenu"
                      class="user-menu-trigger">
                <mat-icon>more_vert</mat-icon>
              </button>
            </div>
          } @else {
            <div class="user-info-collapsed">
              <button mat-icon-button
                      [matMenuTriggerFor]="userMenu"
                      class="user-avatar-collapsed"
                      [matTooltip]="user.firstName + ' ' + user.lastName"
                      matTooltipPosition="right">
                {{ getUserInitials(user) }}
              </button>
            </div>
          }
        </div>
      }
    </div>

    <!-- Quick Create Menu -->
    <mat-menu #quickCreateMenu="matMenu" class="quick-create-menu">
      <button mat-menu-item (click)="quickAction('lead')">
        <mat-icon>person_add</mat-icon>
        <span>New Lead</span>
      </button>
      <button mat-menu-item (click)="quickAction('opportunity')">
        <mat-icon>trending_up</mat-icon>
        <span>New Opportunity</span>
      </button>
      <button mat-menu-item (click)="quickAction('account')">
        <mat-icon>business</mat-icon>
        <span>New Account</span>
      </button>
      <button mat-menu-item (click)="quickAction('contact')">
        <mat-icon>contacts</mat-icon>
        <span>New Contact</span>
      </button>
      <mat-divider></mat-divider>
      <button mat-menu-item (click)="quickAction('task')">
        <mat-icon>task</mat-icon>
        <span>New Task</span>
      </button>
      <button mat-menu-item (click)="quickAction('meeting')">
        <mat-icon>event</mat-icon>
        <span>Schedule Meeting</span>
      </button>
    </mat-menu>

    <!-- User Menu -->
    <mat-menu #userMenu="matMenu" class="user-menu">
      @if (currentUser$ | async; as user) {
        <div class="user-menu-header">
          <div class="user-menu-info">
            <div class="user-menu-name">{{ user.firstName }} {{ user.lastName }}</div>
            <div class="user-menu-email">{{ user.email }}</div>
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
        <span>Settings</span>
      </button>
      <button mat-menu-item>
        <mat-icon>help</mat-icon>
        <span>Help & Support</span>
      </button>
      <mat-divider></mat-divider>
      <button mat-menu-item (click)="logout()" class="logout-item">
        <mat-icon>logout</mat-icon>
        <span>Sign Out</span>
      </button>
    </mat-menu>
  `,
  styles: [`
    /* Base Sidebar */
    .sidebar-content {
      height: 100vh;
      display: flex;
      flex-direction: column;
      background: #ffffff;
      width: 100%;
      overflow: hidden;
      box-sizing: border-box;
    }

    .sidebar-content.collapsed {
      /* Width kontrolü parent tarafından yapılıyor */
    }

    /* Header Section */
    .sidebar-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px;
      border-bottom: 1px solid #e2e8f0;
      height: 72px;
      min-height: 72px;
      max-height: 72px;
      flex-shrink: 0;
      box-sizing: border-box;
    }

    .logo-section {
      display: flex;
      align-items: center;
      flex: 1;
      transition: all 0.3s ease;
    }

    .logo-container {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .logo-collapsed {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .brand-logo {
      width: 32px;
      height: 32px;
      border-radius: 8px;
    }

    .brand-logo-small {
      width: 28px;
      height: 28px;
      border-radius: 6px;
    }

    .brand-info {
      display: flex;
      flex-direction: column;
    }

    .brand-name {
      font-size: 18px;
      font-weight: 700;
      color: #1a202c;
      margin: 0;
      line-height: 1.2;
    }

    .brand-subtitle {
      font-size: 12px;
      color: #718096;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .collapse-button {
      width: 32px;
      height: 32px;
      color: #64748b;
      transition: all 0.2s ease;
    }

    .collapse-button:hover {
      background: #f1f5f9;
      color: #334155;
    }

    /* Navigation */
    .navigation {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      padding: 8px 8px 0 8px;
      scrollbar-width: thin;
      scrollbar-color: #cbd5e1 transparent;
      box-sizing: border-box;
      min-height: 0; /* Flex item çok büyürse overflow çalışsın */
    }

    .navigation::-webkit-scrollbar {
      width: 4px;
    }

    .navigation::-webkit-scrollbar-track {
      background: transparent;
    }

    .navigation::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 2px;
    }

    .navigation::-webkit-scrollbar-thumb:hover {
      background: #94a3b8;
    }

    .nav-sections {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .nav-group {
      display: flex;
      flex-direction: column;
    }

    .group-header {
      padding: 12px 12px 8px 12px;
      margin-top: 16px;
    }

    .group-header:first-child {
      margin-top: 0;
    }

    .group-title {
      font-size: 11px;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .nav-items {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .nav-item-container {
      display: flex;
      flex-direction: column;
    }

    .nav-item {
      display: flex;
      align-items: center;
      padding: 10px 12px;
      border-radius: 8px;
      text-decoration: none;
      color: #475569;
      font-weight: 500;
      font-size: 14px;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      cursor: pointer;
      min-height: 44px;
      max-height: 44px;
      overflow: hidden;
      white-space: nowrap;
      box-sizing: border-box;
    }

    .nav-item:hover {
      background: #f8fafc;
      color: #334155;
    }

    .nav-item.active {
      background: #eff6ff;
      color: #2563eb;
      border-left: 3px solid #2563eb;
      padding-left: 9px;
    }

    .nav-item.active .nav-icon {
      color: #2563eb;
    }

    .nav-item.has-children {
      cursor: pointer;
    }

    .nav-item-content {
      display: flex;
      align-items: center;
      width: 100%;
      gap: 12px;
    }

    .nav-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      color: #64748b;
      flex-shrink: 0;
      transition: color 0.2s ease;
    }

    .nav-label {
      flex: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .nav-item-meta {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .new-badge {
      background: #10b981;
      color: white;
      font-size: 9px;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 10px;
      letter-spacing: 0.5px;
    }

    .nav-badge {
      background: #dc2626;
      color: white;
      font-size: 10px;
      font-weight: 600;
      padding: 2px 6px;
      border-radius: 10px;
      min-width: 18px;
      text-align: center;
    }

    .expand-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: #94a3b8;
      transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }

    /* Submenu */
    .submenu {
      display: flex;
      flex-direction: column;
      margin-left: 32px;
      margin-top: 4px;
      gap: 2px;
      border-left: 2px solid #f1f5f9;
      padding-left: 12px;
    }

    .submenu-item {
      display: flex;
      align-items: center;
      padding: 8px 12px;
      border-radius: 6px;
      text-decoration: none;
      color: #64748b;
      font-size: 13px;
      font-weight: 500;
      transition: all 0.2s ease;
      gap: 10px;
      min-height: 36px;
    }

    .submenu-item:hover {
      background: #f8fafc;
      color: #475569;
    }

    .submenu-item.active {
      background: #eff6ff;
      color: #2563eb;
    }

    .submenu-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      color: inherit;
    }

    .submenu-label {
      flex: 1;
    }

    .submenu-badge {
      background: #dc2626;
      color: white;
      font-size: 9px;
      font-weight: 600;
      padding: 2px 5px;
      border-radius: 8px;
      min-width: 14px;
      text-align: center;
    }

    /* Quick Create Section */
    .quick-create-section {
      padding: 16px 20px;
      border-top: 1px solid #e2e8f0;
      flex-shrink: 0;
      box-sizing: border-box;
    }

    .quick-create-btn {
      width: 100%;
      height: 44px;
      font-weight: 600;
      gap: 8px;
      border-radius: 8px;
      text-transform: none;
      font-size: 14px;
    }

    .quick-create-fab {
      width: 48px;
      height: 48px;
      margin: 0 auto;
      display: block;
    }

    /* User Section */
    .user-section {
      padding: 16px 20px;
      border-top: 1px solid #e2e8f0;
      background: #f8fafc;
      flex-shrink: 0;
      box-sizing: border-box;
      margin-top: auto; /* Alt kısımda sabit kalması için */
    }

    .user-section.collapsed {
      padding: 16px 12px;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 12px;
      background: white;
      padding: 12px;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
    }

    .user-avatar-section {
      display: flex;
      align-items: center;
      gap: 12px;
      flex: 1;
    }

    .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 14px;
      font-weight: 600;
    }

    .user-details {
      display: flex;
      flex-direction: column;
      gap: 2px;
      flex: 1;
      min-width: 0;
    }

    .user-name {
      font-size: 14px;
      font-weight: 600;
      color: #1a202c;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .user-email {
      font-size: 12px;
      color: #64748b;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .user-role {
      font-size: 11px;
      color: #10b981;
      font-weight: 600;
      background: #dcfce7;
      padding: 2px 6px;
      border-radius: 4px;
      width: fit-content;
    }

    .user-menu-trigger {
      width: 32px;
      height: 32px;
      color: #94a3b8;
    }

    .user-info-collapsed {
      display: flex;
      justify-content: center;
    }

    .user-avatar-collapsed {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      font-size: 16px;
      font-weight: 600;
    }

    /* Menu Styles */
    .quick-create-menu {
      margin-top: 8px;
    }

    .user-menu {
      margin-top: 8px;
      min-width: 240px;
    }

    .user-menu-header {
      padding: 16px;
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
    }

    .user-menu-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .user-menu-name {
      font-size: 14px;
      font-weight: 600;
      color: #1a202c;
    }

    .user-menu-email {
      font-size: 12px;
      color: #64748b;
    }

    .logout-item {
      color: #dc2626 !important;
    }

    /* Collapsed State */
    .sidebar-content.collapsed .nav-label,
    .sidebar-content.collapsed .nav-item-meta,
    .sidebar-content.collapsed .submenu {
      display: none;
    }

    .sidebar-content.collapsed .nav-item {
      padding: 12px;
      justify-content: center;
    }

    .sidebar-content.collapsed .nav-item.active {
      border-left: none;
      padding-left: 12px;
    }

    .sidebar-content.collapsed .group-header {
      display: none;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .sidebar-content {
        width: 100%;
        height: 100vh;
      }

      .sidebar-header {
        padding: 12px 16px;
        height: 64px;
        min-height: 64px;
        max-height: 64px;
      }

      .navigation {
        padding: 4px 4px 0 4px;
      }

      .nav-item {
        padding: 12px 16px;
        min-height: 48px;
        max-height: 48px;
      }

      .quick-create-section,
      .user-section {
        padding: 12px 16px;
      }

      /* Collapsed mode mobile'da disable */
      .sidebar-content.collapsed {
        width: 100%;
      }

      .collapse-button {
        display: none;
      }
    }

    /* Küçük ekranlar için ekstra optimizasyon */
    @media (max-width: 480px) {
      .sidebar-header {
        padding: 8px 12px;
      }

      .navigation {
        padding: 2px 2px 0 2px;
      }

      .nav-item {
        padding: 10px 12px;
        font-size: 13px;
      }

      .quick-create-section,
      .user-section {
        padding: 8px 12px;
      }
    }
  `]
})
export class SidebarComponent implements OnInit {
  @Input() isHandset = false;
  @Output() menuClick = new EventEmitter<void>();
  @Output() sidebarToggle = new EventEmitter<boolean>();

  private router = inject(Router);
  private authService = inject(AuthService);

  // Modern Signal-based state
  isCollapsed = signal(false);
  expandedMenuItems = signal<string[]>([]);

  currentUser$ = this.authService.currentUser$;
  currentRoute$: Observable<string>;

  menuItems: MenuItem[] = [
    // Main Navigation
    {
      label: 'Dashboard',
      icon: 'dashboard',
      route: '/dashboard',
      group: 'main',
      description: 'Overview and key metrics'
    },

    // CRM Core
    {
      label: 'Leads',
      icon: 'person_search',
      route: '/leads',
      badge: 12,
      group: 'crm',
      description: 'Potential customers and prospects'
    },
    {
      label: 'Opportunities',
      icon: 'trending_up',
      route: '/opportunities',
      badge: 5,
      group: 'crm',
      description: 'Sales deals in progress'
    },
    {
      label: 'Accounts',
      icon: 'business',
      route: '/accounts',
      group: 'crm',
      description: 'Company and organization records'
    },
    {
      label: 'Contacts',
      icon: 'contacts',
      route: '/contacts',
      group: 'crm',
      description: 'Individual person records'
    },

    // Sales & Marketing
    {
      label: 'Sales Pipeline',
      icon: 'timeline',
      route: '/pipeline',
      group: 'sales',
      description: 'Visual sales process tracking',
      children: [
        {
          label: 'Deal Pipeline',
          icon: 'timeline',
          route: '/pipeline/deals'
        },
        {
          label: 'Forecast',
          icon: 'trending_up',
          route: '/pipeline/forecast'
        }
      ]
    },
    {
      label: 'Marketing',
      icon: 'campaign',
      route: '/marketing',
      group: 'sales',
      description: 'Marketing campaigns and activities',
      isNew: true,
      children: [
        {
          label: 'Campaigns',
          icon: 'campaign',
          route: '/marketing/campaigns'
        },
        {
          label: 'Email Templates',
          icon: 'email',
          route: '/marketing/templates'
        }
      ]
    },

    // Productivity
    {
      label: 'Tasks',
      icon: 'task',
      route: '/tasks',
      badge: 3,
      group: 'productivity',
      description: 'Personal and team task management'
    },
    {
      label: 'Calendar',
      icon: 'event',
      route: '/calendar',
      group: 'productivity',
      description: 'Schedule and meeting management'
    },

    // Automation
    {
      label: 'Workflow',
      icon: 'account_tree',
      route: '/workflow',
      permissions: ['workflow.read'],
      group: 'automation',
      description: 'Automated business processes',
      children: [
        {
          label: 'Active Workflows',
          icon: 'play_arrow',
          route: '/workflow/active',
          badge: 2
        },
        {
          label: 'Templates',
          icon: 'library_books',
          route: '/workflow/templates'
        },
        {
          label: 'Builder',
          icon: 'build',
          route: '/workflow/builder'
        }
      ]
    },

    // Analytics
    {
      label: 'Reports',
      icon: 'assessment',
      route: '/reports',
      group: 'analytics',
      description: 'Business intelligence and reporting',
      children: [
        {
          label: 'Sales Reports',
          icon: 'bar_chart',
          route: '/reports/sales'
        },
        {
          label: 'Performance',
          icon: 'speed',
          route: '/reports/performance'
        },
        {
          label: 'Custom Reports',
          icon: 'analytics',
          route: '/reports/custom'
        }
      ]
    },
    {
      label: 'Insights',
      icon: 'insights',
      route: '/insights',
      group: 'analytics',
      description: 'AI-powered business insights',
      isNew: true
    },

    // Administration
    {
      label: 'Administration',
      icon: 'admin_panel_settings',
      route: '/admin',
      permissions: ['admin.read'],
      group: 'admin',
      description: 'System administration and user management',
      children: [
        {
          label: 'Users',
          icon: 'person',
          route: '/admin/users'
        },
        {
          label: 'Roles',
          icon: 'admin_panel_settings',
          route: '/admin/roles'
        }
      ]
    },
    {
      label: 'Team Management',
      icon: 'groups',
      route: '/team',
      permissions: ['team.read'],
      group: 'admin',
      description: 'User and team administration',
      children: [
        {
          label: 'Activity Log',
          icon: 'history',
          route: '/team/activity'
        }
      ]
    },
    {
      label: 'Settings',
      icon: 'settings',
      route: '/settings',
      group: 'admin',
      description: 'System and personal preferences',
      children: [
        {
          label: 'General',
          icon: 'tune',
          route: '/settings/general'
        },
        {
          label: 'Integrations',
          icon: 'extension',
          route: '/settings/integrations'
        },
        {
          label: 'Security',
          icon: 'security',
          route: '/settings/security'
        }
      ]
    }
  ];

  constructor() {
    this.currentRoute$ = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => this.router.url)
    );
  }

  ngOnInit(): void {
    // Auto-expand active menu items on init
    const currentUrl = this.router.url;
    this.menuItems.forEach(item => {
      if (item.children && currentUrl.startsWith(item.route)) {
        this.expandMenuItem(item.route);
      }
    });
  }

  toggleSidebar(): void {
    const willCollapse = !this.isCollapsed();

    if (willCollapse) {
      // Önce menüleri kapat, sonra sidebar'ı collapse et
      this.expandedMenuItems.set([]);
      setTimeout(() => {
        this.isCollapsed.set(true);
        this.sidebarToggle.emit(true);
      }, 100);
    } else {
      // Hemen expand et
      this.isCollapsed.set(false);
      this.sidebarToggle.emit(false);
    }
  }

  onMenuClick(): void {
    // Auto-expand parent menu if clicking on child
    const currentUrl = this.router.url;
    this.menuItems.forEach(item => {
      if (item.children?.some(child => child.route === currentUrl)) {
        this.expandMenuItem(item.route);
      }
    });

    this.menuClick.emit();
  }

  expandMenuItem(route: string): void {
    const expanded = this.expandedMenuItems();
    if (!expanded.includes(route)) {
      this.expandedMenuItems.set([...expanded, route]);
    }
  }

  collapseMenuItem(route: string): void {
    const expanded = this.expandedMenuItems();
    this.expandedMenuItems.set(expanded.filter(r => r !== route));
  }

  isExpanded(route: string): boolean {
    return this.expandedMenuItems().includes(route);
  }

  toggleMenuItem(route: string): void {
    const expanded = this.expandedMenuItems();

    if (expanded.includes(route)) {
      // Collapse
      this.expandedMenuItems.set(expanded.filter(r => r !== route));
    } else {
      // Expand (sadece bir menü aynı anda açık olsun)
      const newExpanded = expanded.filter(r => {
        // Aynı seviyedeki diğer menüleri kapat
        const currentMenuItem = this.menuItems.find(item => item.route === r);
        const newMenuItem = this.menuItems.find(item => item.route === route);
        return currentMenuItem?.group === newMenuItem?.group ? false : true;
      });
      newExpanded.push(route);
      this.expandedMenuItems.set(newExpanded);
    }
  }

  getGroupedMenuItems(): { name: string; items: MenuItem[] }[] {
    const groups = new Map<string, MenuItem[]>();

    // Group menu items
    this.menuItems.forEach(item => {
      const groupName = item.group || 'main';
      if (!groups.has(groupName)) {
        groups.set(groupName, []);
      }
      groups.get(groupName)!.push(item);
    });

    // Convert to array with proper ordering
    const groupOrder = ['main', 'crm', 'sales', 'productivity', 'automation', 'analytics', 'admin'];
    const groupNames = ['Main', 'CRM', 'Sales & Marketing', 'Productivity', 'Automation', 'Analytics', 'Administration'];

    return groupOrder.map((groupKey, index) => ({
      name: groups.has(groupKey) ? groupNames[index] : groupKey,
      items: groups.get(groupKey) || []
    })).filter(group => group.items.length > 0);
  }

  hasPermission(permissions?: string[]): boolean {
    if (!permissions || permissions.length === 0) {
      return true;
    }

    return permissions.some(permission =>
      this.authService.hasPermission(permission)
    );
  }

  getUserInitials(user: any): string {
    return (user.firstName.charAt(0) + user.lastName.charAt(0)).toUpperCase();
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

  quickAction(type: string): void {
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
      default:
        console.warn('Unknown quick action:', type);
    }
    this.onMenuClick();
  }
}