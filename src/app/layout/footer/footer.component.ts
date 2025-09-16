import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-footer',
  template: `
    <footer class="footer" [class.sidebar-collapsed]="sidebarCollapsed">
      <div class="footer-content">
        <div class="footer-left">
          <p style="margin: 0; font-size: 12px; color: #6b7280;">
            &copy; 2024 Produck CRM.
          </p>
        </div>

        <div class="footer-center">
          <div class="footer-links">
            <a href="#" class="footer-link">Privacy</a>
            <a href="#" class="footer-link">Terms</a>
            <a href="#" class="footer-link">Support</a>
          </div>
        </div>

        <div class="footer-right">
          <p style="margin: 0; font-size: 12px; color: #9ca3af;">
            v1.0.0
          </p>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      background: white;
      border-top: 1px solid #e5e7eb;
      margin-top: auto;
      height: 40px;
      display: flex;
      align-items: center;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .footer.sidebar-collapsed {
      /* Sidebar collapsed durumda footer için ekstra padding */
      padding-left: 8px;
    }

    .footer-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      padding: 0 24px;
      transition: padding 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      font-size: 12px;
    }

    .footer.sidebar-collapsed .footer-content {
      padding-left: 32px;
    }

    .footer-links {
      display: flex;
      gap: 16px;
    }

    .footer-link {
      color: #6b7280;
      text-decoration: none;
      font-size: 12px;
      transition: color 0.2s ease;
    }

    .footer-link:hover {
      color: #1d4ed8;
    }

    @media (max-width: 768px) {
      .footer {
        height: 50px;
      }

      .footer-content {
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        gap: 8px;
        padding: 0 16px;
        font-size: 11px;
      }

      .footer.sidebar-collapsed .footer-content {
        padding-left: 16px;
      }

      .footer-center {
        display: none;
      }

      .footer-left p {
        font-size: 11px !important;
      }

      .footer-right p {
        font-size: 11px !important;
      }
    }

    @media (max-width: 480px) {
      .footer {
        height: 45px;
      }

      .footer-content {
        padding: 0 12px;
        font-size: 10px;
      }

      .footer-left p {
        font-size: 10px !important;
      }

      .footer-right {
        display: none;
      }
    }
  `]
})
export class FooterComponent {
  @Input() sidebarCollapsed = false;
}