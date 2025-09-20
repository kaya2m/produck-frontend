import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, Inject, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';

export type ModalSize = 'small' | 'medium' | 'large' | 'extra-large' | 'full';
export type ModalType = 'info' | 'success' | 'warning' | 'error' | 'confirm';

export interface ModalData {
  title?: string;
  message?: string;
  type?: ModalType;
  size?: ModalSize;
  showCloseButton?: boolean;
  disableClose?: boolean;
  confirmText?: string;
  cancelText?: string;
  showActions?: boolean;
  loading?: boolean;
  customActions?: Array<{
    text: string;
    color?: 'primary' | 'accent' | 'warn';
    action: string;
    disabled?: boolean;
  }>;
}

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="modal-container" [class]="modalClasses">
      <!-- Header -->
      <div class="modal-header" *ngIf="title || showCloseButton">
        <div class="modal-title-section">
          <mat-icon *ngIf="typeIcon" [class]="'modal-icon modal-icon-' + type">
            {{ typeIcon }}
          </mat-icon>
          <h2 class="modal-title" *ngIf="title">{{ title }}</h2>
        </div>

        <button *ngIf="showCloseButton && !disableClose"
                mat-icon-button
                class="modal-close-button"
                (click)="onClose()"
                [disabled]="loading">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-divider *ngIf="title || showCloseButton"></mat-divider>

      <!-- Content -->
      <div class="modal-content" [class.loading]="loading">
        <!-- Loading Overlay -->
        <div *ngIf="loading" class="modal-loading-overlay">
          <mat-spinner diameter="40"></mat-spinner>
          <span class="loading-text">Loading...</span>
        </div>

        <!-- Message (for simple modals) -->
        <p *ngIf="message && !hasCustomContent" class="modal-message">
          {{ message }}
        </p>

        <!-- Custom Content -->
        <ng-content></ng-content>
      </div>

      <!-- Actions -->
      <div class="modal-actions" *ngIf="showActions && !loading">
        <mat-divider></mat-divider>

        <div class="modal-buttons">
          <!-- Custom Actions -->
          <ng-container *ngIf="customActions && customActions.length > 0">
            <button *ngFor="let action of customActions"
                    mat-button
                    [color]="action.color || 'primary'"
                    [disabled]="action.disabled"
                    (click)="onActionClick(action.action)">
              {{ action.text }}
            </button>
          </ng-container>

          <!-- Default Actions -->
          <ng-container *ngIf="!customActions || customActions.length === 0">
            <!-- Cancel Button -->
            <button *ngIf="type === 'confirm' || cancelText"
                    mat-button
                    (click)="onCancel()">
              {{ cancelText || 'Cancel' }}
            </button>

            <!-- Confirm Button -->
            <button mat-raised-button
                    [color]="confirmButtonColor"
                    (click)="onConfirm()">
              {{ confirmText || defaultConfirmText }}
            </button>
          </ng-container>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-container {
      display: flex;
      flex-direction: column;
      max-height: 90vh;
      min-width: 300px;
    }

    /* Sizes */
    .modal-small {
      width: 400px;
      max-width: 90vw;
    }

    .modal-medium {
      width: 600px;
      max-width: 90vw;
    }

    .modal-large {
      width: 800px;
      max-width: 90vw;
    }

    .modal-extra-large {
      width: 1200px;
      max-width: 95vw;
    }

    .modal-full {
      width: 100vw;
      height: 100vh;
      max-width: 100vw;
      max-height: 100vh;
    }

    /* Header */
    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 24px;
      min-height: 64px;
    }

    .modal-title-section {
      display: flex;
      align-items: center;
      gap: 12px;
      flex: 1;
    }

    .modal-title {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: #1f2937;
      line-height: 1.4;
    }

    .modal-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    .modal-icon-info {
      color: #3b82f6;
    }

    .modal-icon-success {
      color: #10b981;
    }

    .modal-icon-warning {
      color: #f59e0b;
    }

    .modal-icon-error {
      color: #ef4444;
    }

    .modal-icon-confirm {
      color: #6b7280;
    }

    .modal-close-button {
      color: #6b7280;
    }

    .modal-close-button:hover {
      color: #374151;
      background-color: #f3f4f6;
    }

    /* Content */
    .modal-content {
      flex: 1;
      padding: 0 24px 24px;
      overflow-y: auto;
      position: relative;
    }

    .modal-content.loading {
      min-height: 200px;
    }

    .modal-message {
      margin: 0;
      font-size: 1rem;
      line-height: 1.6;
      color: #374151;
    }

    /* Loading */
    .modal-loading-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.8);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 16px;
      z-index: 10;
    }

    .loading-text {
      font-size: 0.875rem;
      color: #6b7280;
    }

    /* Actions */
    .modal-actions {
      margin-top: auto;
    }

    .modal-buttons {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 16px 24px;
    }

    /* Type-specific styles */
    .modal-info .modal-header {
      border-left: 4px solid #3b82f6;
    }

    .modal-success .modal-header {
      border-left: 4px solid #10b981;
    }

    .modal-warning .modal-header {
      border-left: 4px solid #f59e0b;
    }

    .modal-error .modal-header {
      border-left: 4px solid #ef4444;
    }

    .modal-confirm .modal-header {
      border-left: 4px solid #6b7280;
    }

    /* Responsive */
    @media (max-width: 640px) {
      .modal-container {
        width: 100vw !important;
        height: 100vh !important;
        max-width: 100vw !important;
        max-height: 100vh !important;
        border-radius: 0 !important;
      }

      .modal-header {
        padding: 16px;
      }

      .modal-content {
        padding: 0 16px 16px;
      }

      .modal-buttons {
        padding: 12px 16px;
      }
    }
  `]
})
export class ModalComponent {
  @Input() title?: string;
  @Input() message?: string;
  @Input() type: ModalType = 'info';
  @Input() size: ModalSize = 'medium';
  @Input() showCloseButton = true;
  @Input() disableClose = false;
  @Input() confirmText?: string;
  @Input() cancelText?: string;
  @Input() showActions = true;
  @Input() loading = false;
  @Input() customActions?: Array<{
    text: string;
    color?: 'primary' | 'accent' | 'warn';
    action: string;
    disabled?: boolean;
  }>;

  @Output() modalClose = new EventEmitter<void>();
  @Output() modalConfirm = new EventEmitter<void>();
  @Output() modalCancel = new EventEmitter<void>();
  @Output() actionClick = new EventEmitter<string>();

  constructor(
    @Optional() private dialogRef: MatDialogRef<ModalComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) private data: ModalData
  ) {
    // Data'dan property'leri yükle
    if (this.data) {
      this.title = this.data.title ?? this.title;
      this.message = this.data.message ?? this.message;
      this.type = this.data.type ?? this.type;
      this.size = this.data.size ?? this.size;
      this.showCloseButton = this.data.showCloseButton ?? this.showCloseButton;
      this.disableClose = this.data.disableClose ?? this.disableClose;
      this.confirmText = this.data.confirmText ?? this.confirmText;
      this.cancelText = this.data.cancelText ?? this.cancelText;
      this.showActions = this.data.showActions ?? this.showActions;
      this.loading = this.data.loading ?? this.loading;
      this.customActions = this.data.customActions ?? this.customActions;
    }
  }

  get modalClasses(): string {
    const classes = [
      `modal-${this.size}`,
      `modal-${this.type}`
    ];
    return classes.join(' ');
  }

  get typeIcon(): string | null {
    switch (this.type) {
      case 'info': return 'info';
      case 'success': return 'check_circle';
      case 'warning': return 'warning';
      case 'error': return 'error';
      case 'confirm': return 'help';
      default: return null;
    }
  }

  get confirmButtonColor(): 'primary' | 'accent' | 'warn' {
    switch (this.type) {
      case 'error': return 'warn';
      case 'warning': return 'warn';
      default: return 'primary';
    }
  }

  get defaultConfirmText(): string {
    switch (this.type) {
      case 'confirm': return 'Confirm';
      case 'error': return 'OK';
      case 'warning': return 'OK';
      default: return 'OK';
    }
  }

  get hasCustomContent(): boolean {
    // Bu method ng-content varlığını kontrol etmek için kullanılabilir
    return !this.message;
  }

  onClose(): void {
    this.modalClose.emit();
    if (this.dialogRef) {
      this.dialogRef.close(false);
    }
  }

  onConfirm(): void {
    this.modalConfirm.emit();
    if (this.dialogRef) {
      this.dialogRef.close(true);
    }
  }

  onCancel(): void {
    this.modalCancel.emit();
    if (this.dialogRef) {
      this.dialogRef.close(false);
    }
  }

  onActionClick(action: string): void {
    this.actionClick.emit(action);
    if (this.dialogRef) {
      this.dialogRef.close(action);
    }
  }
}