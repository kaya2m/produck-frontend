import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-simple-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule
  ],
  template: `
    <div class="layout-container">
      <!-- Simple Header -->
      <mat-toolbar color="primary" class="header">
        <mat-icon>business</mat-icon>
        <span class="ml-2">Produck CRM</span>
        <span class="spacer"></span>
        <button mat-icon-button>
          <mat-icon>account_circle</mat-icon>
        </button>
      </mat-toolbar>

      <!-- Main Content -->
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .layout-container {
      height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .header {
      height: 64px;
      padding: 0 24px;
    }

    .spacer {
      flex: 1;
    }

    .main-content {
      flex: 1;
      padding: 24px;
      background-color: #f5f5f5;
      overflow-y: auto;
    }
  `]
})
export class SimpleLayoutComponent { }