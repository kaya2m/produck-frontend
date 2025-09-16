import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

interface PipelineStage {
  name: string;
  count: number;
  value: number;
  color: string;
  percentage: number;
}

@Component({
  selector: 'app-leads-pipeline',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="pipeline-container">
      <div class="pipeline-stages">
        <div *ngFor="let stage of stages" class="pipeline-stage">
          <div class="stage-header">
            <h4 class="stage-name">{{ stage.name }}</h4>
            <span class="stage-count">{{ stage.count }}</span>
          </div>
          <div class="stage-progress">
            <div class="progress-bar">
              <div class="progress-fill"
                   [style.width.%]="stage.percentage"
                   [style.background-color]="stage.color"></div>
            </div>
            <span class="stage-value">{{ stage.value | currency }}</span>
          </div>
        </div>
      </div>

      <div class="pipeline-summary">
        <div class="summary-card">
          <div class="summary-title">Total Pipeline Value</div>
          <div class="summary-amount">{{ getTotalValue() | currency }}</div>
        </div>
        <div class="summary-card">
          <div class="summary-title">Conversion Rate</div>
          <div class="summary-percentage">{{ getConversionRate() }}%</div>
        </div>
      </div>

      <div class="pipeline-actions">
        <button mat-stroked-button class="action-btn">
          <mat-icon>visibility</mat-icon>
          View Pipeline
        </button>
        <button mat-raised-button color="primary" class="action-btn">
          <mat-icon>add</mat-icon>
          Add Lead
        </button>
      </div>
    </div>
  `,
  styles: [`
    .pipeline-container {
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .pipeline-stages {
      flex: 1;
      space-y: 16px;
    }

    .pipeline-stage {
      padding: 12px 0;
      border-bottom: 1px solid #f3f4f6;
    }

    .pipeline-stage:last-child {
      border-bottom: none;
    }

    .stage-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .stage-name {
      font-size: 14px;
      font-weight: 500;
      color: #374151;
      margin: 0;
    }

    .stage-count {
      background: #f3f4f6;
      color: #6b7280;
      font-size: 12px;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: 12px;
      min-width: 24px;
      text-align: center;
    }

    .stage-progress {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .progress-bar {
      flex: 1;
      height: 6px;
      background: #f3f4f6;
      border-radius: 3px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      border-radius: 3px;
      transition: width 0.3s ease;
    }

    .stage-value {
      font-size: 12px;
      font-weight: 600;
      color: #374151;
      min-width: 60px;
      text-align: right;
    }

    .pipeline-summary {
      display: flex;
      gap: 16px;
      margin: 20px 0;
      padding: 16px 0;
      border-top: 1px solid #f3f4f6;
      border-bottom: 1px solid #f3f4f6;
    }

    .summary-card {
      flex: 1;
      text-align: center;
    }

    .summary-title {
      font-size: 12px;
      color: #6b7280;
      margin-bottom: 4px;
    }

    .summary-amount {
      font-size: 18px;
      font-weight: 700;
      color: #059669;
    }

    .summary-percentage {
      font-size: 18px;
      font-weight: 700;
      color: #3b82f6;
    }

    .pipeline-actions {
      display: flex;
      gap: 8px;
    }

    .action-btn {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    @media (max-width: 768px) {
      .pipeline-summary {
        flex-direction: column;
        gap: 12px;
      }

      .pipeline-actions {
        flex-direction: column;
      }

      .stage-progress {
        gap: 8px;
      }

      .stage-value {
        min-width: 50px;
        font-size: 11px;
      }
    }
  `]
})
export class LeadsPipelineComponent implements OnInit {
  stages: PipelineStage[] = [
    {
      name: 'New Leads',
      count: 45,
      value: 125000,
      color: '#3b82f6',
      percentage: 90
    },
    {
      name: 'Qualified',
      count: 32,
      value: 89000,
      color: '#10b981',
      percentage: 70
    },
    {
      name: 'Proposal',
      count: 18,
      value: 67000,
      color: '#f59e0b',
      percentage: 55
    },
    {
      name: 'Negotiation',
      count: 12,
      value: 45000,
      color: '#ef4444',
      percentage: 40
    },
    {
      name: 'Closed Won',
      count: 8,
      value: 28000,
      color: '#059669',
      percentage: 25
    }
  ];

  constructor() { }

  ngOnInit(): void { }

  getTotalValue(): number {
    return this.stages.reduce((total, stage) => total + stage.value, 0);
  }

  getConversionRate(): number {
    const totalLeads = this.stages[0].count;
    const closedWon = this.stages[this.stages.length - 1].count;
    return Math.round((closedWon / totalLeads) * 100);
  }
}