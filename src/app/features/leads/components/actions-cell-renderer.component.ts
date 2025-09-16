import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

interface ActionsCellParams extends ICellRendererParams {
  onEdit: (data: any) => void;
  onDelete: (data: any) => void;
}

@Component({
  selector: 'app-actions-cell-renderer',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule,
    MatDividerModule
  ],
  template: `
    <div class="actions-container">
      <button mat-icon-button
              matTooltip="Edit Lead"
              (click)="onEdit()"
              class="edit-btn">
        <mat-icon>edit</mat-icon>
      </button>

      <button mat-icon-button
              matTooltip="More Actions"
              [matMenuTriggerFor]="actionsMenu"
              class="more-btn">
        <mat-icon>more_vert</mat-icon>
      </button>
    </div>

    <mat-menu #actionsMenu="matMenu">
      <button mat-menu-item (click)="onEdit()">
        <mat-icon>edit</mat-icon>
        <span>Edit</span>
      </button>
      <button mat-menu-item (click)="onView()">
        <mat-icon>visibility</mat-icon>
        <span>View Details</span>
      </button>
      <button mat-menu-item (click)="onConvert()">
        <mat-icon>trending_up</mat-icon>
        <span>Convert to Opportunity</span>
      </button>
      <mat-divider></mat-divider>
      <button mat-menu-item (click)="onDelete()" class="danger-action">
        <mat-icon>delete</mat-icon>
        <span>Delete</span>
      </button>
    </mat-menu>
  `,
  styles: [`
    .actions-container {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 4px;
    }

    .edit-btn {
      color: #3b82f6;
    }

    .edit-btn:hover {
      background-color: rgba(59, 130, 246, 0.1);
    }

    .more-btn {
      color: #6b7280;
    }

    .more-btn:hover {
      background-color: rgba(107, 114, 128, 0.1);
    }

    .danger-action {
      color: #ef4444 !important;
    }

    mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }
  `]
})
export class ActionsCellRenderer implements ICellRendererAngularComp {
  private params!: ActionsCellParams;
  private data: any;

  agInit(params: ActionsCellParams): void {
    this.params = params;
    this.data = params.data;
  }

  refresh(): boolean {
    return false;
  }

  onEdit(): void {
    this.params.onEdit(this.data);
  }

  onView(): void {
    console.log('View lead:', this.data);
    // Implement view functionality
  }

  onConvert(): void {
    console.log('Convert lead to opportunity:', this.data);
    // Implement convert functionality
  }

  onDelete(): void {
    if (confirm(`Are you sure you want to delete ${this.data.firstName} ${this.data.lastName}?`)) {
      this.params.onDelete(this.data);
    }
  }
}