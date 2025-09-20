import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';

export type ButtonVariant = 'basic' | 'raised' | 'stroked' | 'flat' | 'icon' | 'fab' | 'mini-fab';
export type ButtonColor = 'primary' | 'accent' | 'warn' | 'success' | 'info' | 'default';
export type ButtonSize = 'small' | 'medium' | 'large';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Basic Button -->
    <button *ngIf="variant === 'basic'"
            mat-button
            [color]="matColor"
            [disabled]="disabled || loading"
            [class]="buttonClasses"
            [type]="type"
            [matTooltip]="tooltip"
            (click)="onClick($event)">
      <ng-container *ngTemplateOutlet="buttonContent"></ng-container>
    </button>

    <!-- Raised Button -->
    <button *ngIf="variant === 'raised'"
            mat-raised-button
            [color]="matColor"
            [disabled]="disabled || loading"
            [class]="buttonClasses"
            [type]="type"
            [matTooltip]="tooltip"
            (click)="onClick($event)">
      <ng-container *ngTemplateOutlet="buttonContent"></ng-container>
    </button>

    <!-- Stroked Button -->
    <button *ngIf="variant === 'stroked'"
            mat-stroked-button
            [color]="matColor"
            [disabled]="disabled || loading"
            [class]="buttonClasses"
            [type]="type"
            [matTooltip]="tooltip"
            (click)="onClick($event)">
      <ng-container *ngTemplateOutlet="buttonContent"></ng-container>
    </button>

    <!-- Flat Button -->
    <button *ngIf="variant === 'flat'"
            mat-flat-button
            [color]="matColor"
            [disabled]="disabled || loading"
            [class]="buttonClasses"
            [type]="type"
            [matTooltip]="tooltip"
            (click)="onClick($event)">
      <ng-container *ngTemplateOutlet="buttonContent"></ng-container>
    </button>

    <!-- Icon Button -->
    <button *ngIf="variant === 'icon'"
            mat-icon-button
            [color]="matColor"
            [disabled]="disabled || loading"
            [class]="buttonClasses"
            [type]="type"
            [matTooltip]="tooltip"
            (click)="onClick($event)">
      <mat-icon *ngIf="!loading">{{ icon || 'help' }}</mat-icon>
      <mat-spinner *ngIf="loading" diameter="20"></mat-spinner>
    </button>

    <!-- FAB Button -->
    <button *ngIf="variant === 'fab'"
            mat-fab
            [color]="matColor"
            [disabled]="disabled || loading"
            [class]="buttonClasses"
            [type]="type"
            [matTooltip]="tooltip"
            (click)="onClick($event)">
      <mat-icon *ngIf="!loading">{{ icon || 'add' }}</mat-icon>
      <mat-spinner *ngIf="loading" diameter="24"></mat-spinner>
    </button>

    <!-- Mini FAB Button -->
    <button *ngIf="variant === 'mini-fab'"
            mat-mini-fab
            [color]="matColor"
            [disabled]="disabled || loading"
            [class]="buttonClasses"
            [type]="type"
            [matTooltip]="tooltip"
            (click)="onClick($event)">
      <mat-icon *ngIf="!loading">{{ icon || 'add' }}</mat-icon>
      <mat-spinner *ngIf="loading" diameter="20"></mat-spinner>
    </button>

    <!-- Button Content Template -->
    <ng-template #buttonContent>
      <div class="button-content" [class.loading]="loading">
        <!-- Loading Spinner -->
        <mat-spinner *ngIf="loading && (variant === 'basic' || variant === 'raised' || variant === 'stroked' || variant === 'flat')"
                     diameter="16"
                     class="button-spinner">
        </mat-spinner>

        <!-- Leading Icon -->
        <mat-icon *ngIf="leadingIcon && !loading" class="leading-icon">{{ leadingIcon }}</mat-icon>

        <!-- Button Text -->
        <span *ngIf="!loading || (loading && loadingText)" class="button-text">
          {{ loading && loadingText ? loadingText : text }}
        </span>

        <!-- Content Projection -->
        <ng-content></ng-content>

        <!-- Trailing Icon -->
        <mat-icon *ngIf="trailingIcon && !loading" class="trailing-icon">{{ trailingIcon }}</mat-icon>
      </div>
    </ng-template>
  `,
  styles: [`
    :host {
      display: inline-block;
    }

    .button-content {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: all 0.2s ease;
    }

    .button-content.loading {
      opacity: 0.8;
    }

    .button-spinner {
      margin: 0;
    }

    .leading-icon,
    .trailing-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .button-text {
      line-height: 1;
      font-weight: inherit;
    }

    /* Size Variants */
    .btn-small {
      font-size: 0.875rem;
      padding: 6px 16px;
      min-height: 32px;
    }

    .btn-medium {
      font-size: 1rem;
      padding: 8px 20px;
      min-height: 40px;
    }

    .btn-large {
      font-size: 1.125rem;
      padding: 12px 24px;
      min-height: 48px;
    }

    /* Custom Colors */
    .btn-success {
      --mdc-theme-primary: #16a34a;
      background-color: #16a34a;
      color: white;
    }

    .btn-success:hover {
      background-color: #15803d;
    }

    .btn-info {
      --mdc-theme-primary: #0ea5e9;
      background-color: #0ea5e9;
      color: white;
    }

    .btn-info:hover {
      background-color: #0284c7;
    }

    .btn-default {
      --mdc-theme-primary: #6b7280;
      background-color: #f9fafb;
      color: #374151;
      border: 1px solid #d1d5db;
    }

    .btn-default:hover {
      background-color: #f3f4f6;
    }

    /* Full Width */
    .btn-full-width {
      width: 100%;
    }

    /* Disabled State */
    button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    /* Loading State */
    .loading .button-text {
      visibility: hidden;
    }

    .loading .leading-icon,
    .loading .trailing-icon {
      visibility: hidden;
    }
  `]
})
export class ButtonComponent {
  @Input() variant: ButtonVariant = 'basic';
  @Input() color: ButtonColor = 'default';
  @Input() size: ButtonSize = 'medium';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() disabled = false;
  @Input() loading = false;
  @Input() fullWidth = false;
  @Input() text?: string;
  @Input() loadingText?: string;
  @Input() icon?: string;
  @Input() leadingIcon?: string;
  @Input() trailingIcon?: string;
  @Input() tooltip?: string;

  @Output() buttonClick = new EventEmitter<Event>();

  get matColor(): 'primary' | 'accent' | 'warn' | undefined {
    switch (this.color) {
      case 'primary': return 'primary';
      case 'accent': return 'accent';
      case 'warn': return 'warn';
      default: return undefined;
    }
  }

  get buttonClasses(): string {
    const classes = [
      `btn-${this.size}`,
      `btn-${this.color}`,
    ];

    if (this.fullWidth) {
      classes.push('btn-full-width');
    }

    return classes.join(' ');
  }

  onClick(event: Event): void {
    if (!this.disabled && !this.loading) {
      this.buttonClick.emit(event);
    }
  }
}