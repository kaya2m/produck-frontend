import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sales-chart',
  standalone: true,
  imports: [
    CommonModule
  ],
  template: `
    <div class="chart-container">
      <!-- Placeholder for chart - will implement with Chart.js later -->
      <div class="chart-placeholder">
        <div class="chart-data">
          <div class="chart-legend">
            <div class="legend-item">
              <div class="legend-color revenue"></div>
              <span>Revenue</span>
            </div>
            <div class="legend-item">
              <div class="legend-color target"></div>
              <span>Target</span>
            </div>
          </div>

          <div class="chart-visual">
            <div class="chart-bars">
              <div class="chart-bar" *ngFor="let data of chartData">
                <div class="bar revenue-bar" [style.height.%]="data.revenue"></div>
                <div class="bar target-bar" [style.height.%]="data.target"></div>
                <div class="bar-label">{{ data.month }}</div>
              </div>
            </div>
          </div>

          <div class="chart-summary">
            <div class="summary-item">
              <span class="summary-label">Total Revenue</span>
              <span class="summary-value">$142,350</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Target Achievement</span>
              <span class="summary-value">94.2%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .chart-container {
      height: 300px;
      padding: 16px 0;
    }

    .chart-placeholder {
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .chart-legend {
      display: flex;
      gap: 24px;
      margin-bottom: 20px;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      color: #6b7280;
    }

    .legend-color {
      width: 12px;
      height: 12px;
      border-radius: 2px;
    }

    .legend-color.revenue {
      background: #3b82f6;
    }

    .legend-color.target {
      background: #e5e7eb;
    }

    .chart-visual {
      flex: 1;
      display: flex;
      align-items: end;
      justify-content: center;
      margin-bottom: 20px;
    }

    .chart-bars {
      display: flex;
      gap: 16px;
      height: 180px;
      align-items: end;
    }

    .chart-bar {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      min-width: 40px;
    }

    .bar {
      width: 20px;
      border-radius: 3px 3px 0 0;
      min-height: 4px;
      position: relative;
    }

    .revenue-bar {
      background: #3b82f6;
      margin-right: 4px;
    }

    .target-bar {
      background: #e5e7eb;
    }

    .bar-label {
      font-size: 12px;
      color: #6b7280;
      margin-top: 8px;
    }

    .chart-summary {
      display: flex;
      justify-content: space-around;
      padding-top: 16px;
      border-top: 1px solid #e5e7eb;
    }

    .summary-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
    }

    .summary-label {
      font-size: 12px;
      color: #6b7280;
    }

    .summary-value {
      font-size: 18px;
      font-weight: 600;
      color: #111827;
    }

    @media (max-width: 768px) {
      .chart-bars {
        gap: 8px;
      }

      .chart-bar {
        min-width: 30px;
      }

      .bar {
        width: 16px;
      }

      .chart-summary {
        flex-direction: column;
        gap: 16px;
      }
    }
  `]
})
export class SalesChartComponent implements OnInit {
  chartData = [
    { month: 'Jan', revenue: 65, target: 80 },
    { month: 'Feb', revenue: 78, target: 80 },
    { month: 'Mar', revenue: 90, target: 85 },
    { month: 'Apr', revenue: 85, target: 85 },
    { month: 'May', revenue: 95, target: 90 },
    { month: 'Jun', revenue: 88, target: 90 }
  ];

  constructor() { }

  ngOnInit(): void { }
}