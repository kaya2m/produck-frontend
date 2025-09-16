import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

@Component({
  selector: 'app-status-cell-renderer',
  standalone: true,
  imports: [CommonModule, MatChipsModule, MatIconModule],
  template: `
    <mat-chip-set>
      <mat-chip [class]="getStatusClass()" [highlighted]="true">
        <mat-icon matChipAvatar>{{ getStatusIcon() }}</mat-icon>
        {{ getStatusLabel() }}
      </mat-chip>
    </mat-chip-set>
  `,
  styles: [`
    .status-new {
      --mdc-chip-elevated-container-color: #dbeafe;
      --mdc-chip-label-text-color: #1e40af;
    }

    .status-contacted {
      --mdc-chip-elevated-container-color: #fef3c7;
      --mdc-chip-label-text-color: #92400e;
    }

    .status-qualified {
      --mdc-chip-elevated-container-color: #d1fae5;
      --mdc-chip-label-text-color: #065f46;
    }

    .status-lost {
      --mdc-chip-elevated-container-color: #fee2e2;
      --mdc-chip-label-text-color: #991b1b;
    }

    mat-chip {
      font-size: 12px;
      font-weight: 500;
    }
  `]
})
export class StatusCellRenderer implements ICellRendererAngularComp {
  private status: string = '';

  agInit(params: ICellRendererParams): void {
    this.status = params.value;
  }

  refresh(): boolean {
    return false;
  }

  getStatusClass(): string {
    return `status-${this.status}`;
  }

  getStatusIcon(): string {
    switch (this.status) {
      case 'new': return 'fiber_new';
      case 'contacted': return 'contact_phone';
      case 'qualified': return 'verified';
      case 'lost': return 'cancel';
      default: return 'help';
    }
  }

  getStatusLabel(): string {
    switch (this.status) {
      case 'new': return 'New';
      case 'contacted': return 'Contacted';
      case 'qualified': return 'Qualified';
      case 'lost': return 'Lost';
      default: return 'Unknown';
    }
  }
}