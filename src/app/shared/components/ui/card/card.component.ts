import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';

export type CardVariant = 'default' | 'outlined' | 'elevated' | 'flat';
export type CardSize = 'small' | 'medium' | 'large';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-card [class]="cardClasses">
      <!-- Header Section -->
      <mat-card-header *ngIf="title || subtitle || headerIcon || hasHeaderContent">
        <div mat-card-avatar *ngIf="headerIcon || avatarUrl" class="card-avatar">
          <mat-icon *ngIf="headerIcon && !avatarUrl">{{ headerIcon }}</mat-icon>
          <img *ngIf="avatarUrl" [src]="avatarUrl" [alt]="title || 'Avatar'">
        </div>

        <mat-card-title *ngIf="title">{{ title }}</mat-card-title>
        <mat-card-subtitle *ngIf="subtitle">{{ subtitle }}</mat-card-subtitle>

        <!-- Header Actions -->
        <div class="card-header-actions" *ngIf="hasHeaderActions">
          <ng-content select="[slot=header-actions]"></ng-content>
        </div>
      </mat-card-header>

      <!-- Image Section -->
      <div *ngIf="imageUrl" class="card-image">
        <img mat-card-image [src]="imageUrl" [alt]="imageAlt || title || 'Card image'">
      </div>

      <!-- Content Section -->
      <mat-card-content *ngIf="hasContent" [class.no-padding]="noPadding">
        <ng-content></ng-content>
      </mat-card-content>

      <!-- Footer Actions -->
      <mat-card-actions *ngIf="hasActions" [align]="actionsAlign" class="card-actions">
        <ng-content select="[slot=actions]"></ng-content>
      </mat-card-actions>
    </mat-card>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }

    .mat-mdc-card {
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    /* Variants */
    .card-default {
      box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
    }

    .card-outlined {
      border: 1px solid #e5e7eb;
      box-shadow: none;
    }

    .card-elevated {
      box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
    }

    .card-flat {
      box-shadow: none;
      border: none;
    }

    /* Sizes */
    .card-small {
      padding: 12px;
    }

    .card-small .mat-mdc-card-header {
      padding: 0 0 12px 0;
    }

    .card-small .mat-mdc-card-content {
      padding: 0;
    }

    .card-small .mat-mdc-card-actions {
      padding: 12px 0 0 0;
    }

    .card-medium {
      padding: 16px;
    }

    .card-medium .mat-mdc-card-header {
      padding: 0 0 16px 0;
    }

    .card-medium .mat-mdc-card-content {
      padding: 0;
    }

    .card-medium .mat-mdc-card-actions {
      padding: 16px 0 0 0;
    }

    .card-large {
      padding: 24px;
    }

    .card-large .mat-mdc-card-header {
      padding: 0 0 24px 0;
    }

    .card-large .mat-mdc-card-content {
      padding: 0;
    }

    .card-large .mat-mdc-card-actions {
      padding: 24px 0 0 0;
    }

    /* Hover Effects */
    .card-hover:hover {
      transform: translateY(-2px);
      box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
    }

    .card-clickable {
      cursor: pointer;
    }

    .card-clickable:hover {
      transform: translateY(-1px);
      box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
    }

    /* Header */
    .mat-mdc-card-header {
      display: flex;
      flex-direction: row;
      align-items: flex-start;
      position: relative;
    }

    .card-header-actions {
      position: absolute;
      right: 0;
      top: 0;
    }

    .card-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #f3f4f6;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 16px;
      flex-shrink: 0;
    }

    .card-avatar img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      object-fit: cover;
    }

    .card-avatar mat-icon {
      color: #6b7280;
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    /* Image */
    .card-image {
      margin: -16px -16px 16px -16px;
      overflow: hidden;
      border-radius: 4px 4px 0 0;
    }

    .card-image img {
      width: 100%;
      height: auto;
      display: block;
    }

    /* Content */
    .mat-mdc-card-content.no-padding {
      padding: 0 !important;
    }

    /* Actions */
    .card-actions {
      margin: 0;
    }

    /* Loading State */
    .card-loading {
      opacity: 0.6;
      pointer-events: none;
    }

    /* Error State */
    .card-error {
      border-color: #fca5a5;
      background-color: #fef2f2;
    }

    /* Success State */
    .card-success {
      border-color: #86efac;
      background-color: #f0fdf4;
    }

    /* Warning State */
    .card-warning {
      border-color: #fcd34d;
      background-color: #fffbeb;
    }
  `]
})
export class CardComponent {
  @Input() title?: string;
  @Input() subtitle?: string;
  @Input() headerIcon?: string;
  @Input() avatarUrl?: string;
  @Input() imageUrl?: string;
  @Input() imageAlt?: string;
  @Input() variant: CardVariant = 'default';
  @Input() size: CardSize = 'medium';
  @Input() hover = false;
  @Input() clickable = false;
  @Input() loading = false;
  @Input() noPadding = false;
  @Input() actionsAlign: 'start' | 'end' = 'start';
  @Input() state?: 'error' | 'success' | 'warning';

  get cardClasses(): string {
    const classes = [
      `card-${this.variant}`,
      `card-${this.size}`
    ];

    if (this.hover) {
      classes.push('card-hover');
    }

    if (this.clickable) {
      classes.push('card-clickable');
    }

    if (this.loading) {
      classes.push('card-loading');
    }

    if (this.state) {
      classes.push(`card-${this.state}`);
    }

    return classes.join(' ');
  }

  get hasHeaderContent(): boolean {
    // Bu method template'de slot kontrolü için kullanılabilir
    return false;
  }

  get hasHeaderActions(): boolean {
    // Bu method template'de slot kontrolü için kullanılabilir
    return false;
  }

  get hasContent(): boolean {
    // Bu method template'de ng-content kontrolü için kullanılabilir
    return true;
  }

  get hasActions(): boolean {
    // Bu method template'de slot kontrolü için kullanılabilir
    return false;
  }
}