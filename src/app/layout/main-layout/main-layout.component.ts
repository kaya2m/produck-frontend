import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/auth.models';

// Material Components (artık MatSidenavModule'e ihtiyaç yok)

import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    HeaderComponent,
    SidebarComponent,
    FooterComponent
  ],
  template: `
    <div class="layout-container">
      <!-- Sidebar -->
      <div class="sidebar-container"
           [class.collapsed]="sidebarCollapsed"
           [class.mobile-open]="mobileSidebarOpen">
        <app-sidebar (menuClick)="closeSidenavOnMobile()"
                     (sidebarToggle)="onSidebarToggle($event)"
                     [isHandset]="(isHandset$ | async) || false"></app-sidebar>
      </div>

      <!-- Main Content Area -->
      <div class="content-container" [class.sidebar-collapsed]="sidebarCollapsed">
        <app-header (menuClick)="toggleMobileSidebar()"
                    [isHandset]="isHandset$ | async"
                    [sidebarCollapsed]="sidebarCollapsed"></app-header>

        <main class="main-content" [class.sidebar-collapsed]="sidebarCollapsed">
          <router-outlet></router-outlet>
        </main>

        <app-footer [class.sidebar-collapsed]="sidebarCollapsed"></app-footer>
      </div>

      <!-- Mobile Backdrop -->
      @if ((isHandset$ | async) && mobileSidebarOpen) {
        <div class="mobile-backdrop" (click)="closeMobileSidebar()"></div>
      }
    </div>
  `,
  styles: [`
    .layout-container {
      display: flex;
      height: 100vh;
      width: 100vw;
      overflow: hidden;
      position: relative;
    }

    .sidebar-container {
      width: 280px;
      height: 100vh;
      background: #ffffff;
      border-right: 1px solid #e2e8f0;
      transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      flex-shrink: 0;
      overflow: hidden;
      z-index: 100;
      position: relative;
    }

    .sidebar-container.collapsed {
      width: 72px;
    }

    .content-container {
      flex: 1;
      display: flex;
      flex-direction: column;
      width: calc(100vw - 280px);
      transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      overflow: hidden;
      min-width: 0;
    }

    .content-container.sidebar-collapsed {
      width: calc(100vw - 72px);
    }

    .main-content {
      flex: 1;
      padding: 24px;
      background-color: #f8fafc;
      overflow-y: auto;
      overflow-x: hidden;
      box-sizing: border-box;
    }

    .mobile-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 99;
    }

    /* Mobile Responsive */
    @media (max-width: 768px) {
      .sidebar-container {
        position: fixed;
        left: 0;
        top: 0;
        width: 280px;
        transform: translateX(-100%);
        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        z-index: 101;
      }

      .sidebar-container.mobile-open {
        transform: translateX(0);
      }

      .sidebar-container.collapsed {
        width: 280px; /* Mobile'da collapse disable */
      }

      .content-container {
        width: 100vw;
      }

      .content-container.sidebar-collapsed {
        width: 100vw;
      }

      .main-content {
        padding: 16px;
      }
    }
  `]
})
export class MainLayoutComponent implements OnInit {
  currentUser$: Observable<User | null>;
  isHandset$: Observable<boolean>;
  sidebarCollapsed = false;
  mobileSidebarOpen = false;

  constructor(
    private breakpointObserver: BreakpointObserver,
    private authService: AuthService
  ) {
    this.currentUser$ = this.authService.currentUser$;
    this.isHandset$ = this.breakpointObserver.observe(Breakpoints.Handset)
      .pipe(
        map(result => result.matches),
        shareReplay()
      );
  }

  ngOnInit(): void {}

  onSidebarToggle(collapsed: boolean): void {
    this.sidebarCollapsed = collapsed;
  }

  toggleMobileSidebar(): void {
    this.isHandset$.subscribe(isHandset => {
      if (isHandset) {
        this.mobileSidebarOpen = !this.mobileSidebarOpen;
      }
    }).unsubscribe();
  }

  closeMobileSidebar(): void {
    this.mobileSidebarOpen = false;
  }

  closeSidenavOnMobile(): void {
    this.isHandset$.subscribe(isHandset => {
      if (isHandset) {
        this.mobileSidebarOpen = false;
      }
    }).unsubscribe();
  }
}