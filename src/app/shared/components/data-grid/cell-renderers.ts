import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams, ICellRenderer } from 'ag-grid-community';

// Status Cell Renderer
export class StatusCellRenderer implements ICellRendererAngularComp {
  agInit(params: ICellRendererParams): void {
    this.params = params;
  }

  private params!: ICellRendererParams;

  refresh(params: ICellRendererParams): boolean {
    this.params = params;
    return true;
  }

  getStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'aktif':
        return 'status-active';
      case 'inactive':
      case 'pasif':
        return 'status-inactive';
      case 'pending':
      case 'beklemede':
        return 'status-pending';
      case 'potential':
      case 'potansiyel':
        return 'status-potential';
      default:
        return '';
    }
  }

  getStatusLabel(status: string): string {
    switch (status?.toLowerCase()) {
      case 'active': return 'Aktif';
      case 'inactive': return 'Pasif';
      case 'pending': return 'Beklemede';
      case 'potential': return 'Potansiyel';
      default: return status || '-';
    }
  }
}

// Customer Type Cell Renderer
export class TypeCellRenderer implements ICellRendererAngularComp {
  agInit(params: ICellRendererParams): void {
    this.params = params;
  }

  private params!: ICellRendererParams;

  refresh(params: ICellRendererParams): boolean {
    this.params = params;
    return true;
  }

  getTypeLabel(type: string): string {
    switch (type) {
      case 'Corporate': return 'Kurumsal';
      case 'SME': return 'KOBİ';
      case 'Individual': return 'Bireysel';
      case 'Branch': return 'Şube';
      case 'Potential': return 'Potansiyel';
      default: return type || '-';
    }
  }
}

// Email Cell Renderer
export class EmailCellRenderer implements ICellRendererAngularComp {
  agInit(params: ICellRendererParams): void {
    this.params = params;
  }

  private params!: ICellRendererParams;

  refresh(params: ICellRendererParams): boolean {
    this.params = params;
    return true;
  }
}

// Date Cell Renderer
export class DateCellRenderer implements ICellRendererAngularComp {
  agInit(params: ICellRendererParams): void {
    this.params = params;
  }

  private params!: ICellRendererParams;

  refresh(params: ICellRendererParams): boolean {
    this.params = params;
    return true;
  }

  formatDate(dateString: string): string {
    if (!dateString) return '-';

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  }
}

// Phone Cell Renderer
export class PhoneCellRenderer implements ICellRendererAngularComp {
  agInit(params: ICellRendererParams): void {
    this.params = params;
  }

  private params!: ICellRendererParams;

  refresh(params: ICellRendererParams): boolean {
    this.params = params;
    return true;
  }

  formatPhone(phone: string): string {
    if (!phone) return '-';

    // Basic Turkish phone formatting
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11 && cleaned.startsWith('0')) {
      return `${cleaned.substring(0, 4)} ${cleaned.substring(4, 7)} ${cleaned.substring(7, 9)} ${cleaned.substring(9)}`;
    }
    return phone;
  }
}

// Helper functions for cell renderers
export const CellRendererHelpers = {
  createStatusRenderer: () => {
    return class implements ICellRenderer {
      eGui!: HTMLElement;

      init(params: ICellRendererParams) {
        this.eGui = document.createElement('div');
        const status = params.value;

        this.eGui.innerHTML = `
          <div style="display: inline-flex; align-items: center; gap: 6px; padding: 4px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; ${this.getStatusStyle(status)}">
            <div style="width: 6px; height: 6px; border-radius: 50%; background: currentColor;"></div>
            ${this.getStatusLabel(status)}
          </div>
        `;
      }

      getGui() {
        return this.eGui;
      }

      refresh(params: ICellRendererParams): boolean {
        const status = params.value;
        this.eGui.innerHTML = `
          <div style="display: inline-flex; align-items: center; gap: 6px; padding: 4px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; ${this.getStatusStyle(status)}">
            <div style="width: 6px; height: 6px; border-radius: 50%; background: currentColor;"></div>
            ${this.getStatusLabel(status)}
          </div>
        `;
        return true;
      }

      getStatusStyle(status: string): string {
        switch (status?.toLowerCase()) {
          case 'active':
          case 'aktif':
            return 'background: #dcfce7; color: #166534; border: 1px solid #bbf7d0;';
          case 'inactive':
          case 'pasif':
            return 'background: #fef2f2; color: #dc2626; border: 1px solid #fecaca;';
          case 'pending':
          case 'beklemede':
            return 'background: #fef3c7; color: #d97706; border: 1px solid #fed7aa;';
          case 'potential':
          case 'potansiyel':
            return 'background: #dbeafe; color: #2563eb; border: 1px solid #bfdbfe;';
          default:
            return 'background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0;';
        }
      }

      getStatusLabel(status: string): string {
        switch (status?.toLowerCase()) {
          case 'active': return 'Aktif';
          case 'inactive': return 'Pasif';
          case 'pending': return 'Beklemede';
          case 'potential': return 'Potansiyel';
          default: return status || 'Bilinmiyor';
        }
      }
    };
  },

  createTypeRenderer: () => {
    return class implements ICellRenderer {
      eGui!: HTMLElement;

      init(params: ICellRendererParams) {
        this.eGui = document.createElement('div');
        const type = params.value;

        this.eGui.innerHTML = `
          <div style="display: inline-flex; align-items: center; padding: 3px 8px; border-radius: 8px; font-size: 12px; font-weight: 500; ${this.getTypeStyle(type)}">
            ${this.getTypeLabel(type)}
          </div>
        `;
      }

      getGui() {
        return this.eGui;
      }

      refresh(params: ICellRendererParams): boolean {
        const type = params.value;
        this.eGui.innerHTML = `
          <div style="display: inline-flex; align-items: center; padding: 3px 8px; border-radius: 8px; font-size: 12px; font-weight: 500; ${this.getTypeStyle(type)}">
            ${this.getTypeLabel(type)}
          </div>
        `;
        return true;
      }

      getTypeStyle(type: string): string {
        switch (type) {
          case 'Corporate': return 'background: #f0f9ff; color: #0369a1; border: 1px solid #bae6fd;';
          case 'SME': return 'background: #f0fdf4; color: #166534; border: 1px solid #bbf7d0;';
          case 'Individual': return 'background: #fef3c7; color: #d97706; border: 1px solid #fed7aa;';
          case 'Branch': return 'background: #f3e8ff; color: #7c3aed; border: 1px solid #ddd6fe;';
          case 'Potential': return 'background: #fff1f2; color: #e11d48; border: 1px solid #fecdd3;';
          default: return 'background: #f8fafc; color: #64748b; border: 1px solid #e2e8f0;';
        }
      }

      getTypeIcon(type: string): string {
        return '';
      }

      getTypeLabel(type: string): string {
        switch (type) {
          case 'Corporate': return 'Kurumsal';
          case 'SME': return 'KOBİ';
          case 'Individual': return 'Bireysel';
          case 'Branch': return 'Şube';
          case 'Potential': return 'Potansiyel';
          default: return type || 'Belirtilmemiş';
        }
      }
    };
  },

  createEmailRenderer: () => {
    return class implements ICellRenderer {
      eGui!: HTMLElement;

      init(params: ICellRendererParams) {
        this.eGui = document.createElement('div');
        const email = params.value;

        if (email) {
          this.eGui.innerHTML = `
            <a href="mailto:${email}"
               style="color: #3b82f6; text-decoration: none; font-weight: 500; transition: all 0.15s ease;"
               onmouseover="this.style.color='#1d4ed8'; this.style.textDecoration='underline';"
               onmouseout="this.style.color='#3b82f6'; this.style.textDecoration='none';">
              ${email}
            </a>
          `;
        } else {
          this.eGui.innerHTML = `<span style="color: #9ca3af; font-style: italic;">E-posta yok</span>`;
        }
      }

      getGui() {
        return this.eGui;
      }

      refresh(params: ICellRendererParams): boolean {
        const email = params.value;
        if (email) {
          this.eGui.innerHTML = `
            <a href="mailto:${email}"
               style="color: #3b82f6; text-decoration: none; font-weight: 500; transition: all 0.15s ease;"
               onmouseover="this.style.color='#1d4ed8'; this.style.textDecoration='underline';"
               onmouseout="this.style.color='#3b82f6'; this.style.textDecoration='none';">
              ${email}
            </a>
          `;
        } else {
          this.eGui.innerHTML = `<span style="color: #9ca3af; font-style: italic;">E-posta yok</span>`;
        }
        return true;
      }
    };
  },

  createDateRenderer: () => {
    return class implements ICellRenderer {
      eGui!: HTMLElement;

      init(params: ICellRendererParams) {
        this.eGui = document.createElement('span');
        const dateString = params.value;

        this.eGui.textContent = this.formatDate(dateString);
      }

      getGui() {
        return this.eGui;
      }

      refresh(params: ICellRendererParams): boolean {
        const dateString = params.value;
        this.eGui.textContent = this.formatDate(dateString);
        return true;
      }

      formatDate(dateString: string): string {
        if (!dateString) return '-';

        try {
          const date = new Date(dateString);
          return date.toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
          });
        } catch {
          return dateString;
        }
      }
    };
  },

  createPhoneRenderer: () => {
    return class implements ICellRenderer {
      eGui!: HTMLElement;

      init(params: ICellRendererParams) {
        this.eGui = document.createElement('div');
        const phone = params.value;

        if (phone) {
          this.eGui.innerHTML = `
            <a href="tel:${phone}"
               style="color: #059669; text-decoration: none; font-weight: 500; transition: all 0.15s ease;"
               onmouseover="this.style.color='#047857'; this.style.textDecoration='underline';"
               onmouseout="this.style.color='#059669'; this.style.textDecoration='none';">
              ${this.formatPhone(phone)}
            </a>
          `;
        } else {
          this.eGui.innerHTML = `<span style="color: #9ca3af; font-style: italic;">Telefon yok</span>`;
        }
      }

      getGui() {
        return this.eGui;
      }

      refresh(params: ICellRendererParams): boolean {
        const phone = params.value;
        if (phone) {
          this.eGui.innerHTML = `
            <a href="tel:${phone}"
               style="color: #059669; text-decoration: none; font-weight: 500; transition: all 0.15s ease;"
               onmouseover="this.style.color='#047857'; this.style.textDecoration='underline';"
               onmouseout="this.style.color='#059669'; this.style.textDecoration='none';">
              ${this.formatPhone(phone)}
            </a>
          `;
        } else {
          this.eGui.innerHTML = `<span style="color: #9ca3af; font-style: italic;">Telefon yok</span>`;
        }
        return true;
      }

      formatPhone(phone: string): string {
        if (!phone) return '-';

        // Basic Turkish phone formatting
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.length === 11 && cleaned.startsWith('0')) {
          return `${cleaned.substring(0, 4)} ${cleaned.substring(4, 7)} ${cleaned.substring(7, 9)} ${cleaned.substring(9)}`;
        }
        if (cleaned.length === 10) {
          return `0${cleaned.substring(0, 3)} ${cleaned.substring(3, 6)} ${cleaned.substring(6, 8)} ${cleaned.substring(8)}`;
        }
        return phone;
      }
    };
  },

  // Unified Info Cell Renderer - combines all account info in one column
  createInfoRenderer: () => {
    return class implements ICellRenderer {
      eGui!: HTMLElement;

      init(params: ICellRendererParams) {
        this.eGui = document.createElement('div');
        const data = params.data;

        this.eGui.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 4px; padding: 8px 4px;">
            <div style="font-weight: 600; color: #333; font-size: 14px;">
              ${data.name || 'Adı Yok'}
            </div>
            <div style="display: flex; flex-wrap: wrap; gap: 8px; align-items: center;">
              ${this.getStatusBadge(data.status)}
              ${this.getTypeBadge(data.customerType)}
            </div>
            <div style="font-size: 12px; color: #666;">
              ${data.customerCode ? `Kod: ${data.customerCode}` : ''}
            </div>
            ${this.getContactInfo(data)}
          </div>
        `;
      }

      getGui() {
        return this.eGui;
      }

      refresh(params: ICellRendererParams): boolean {
        const data = params.data;
        this.eGui.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 4px; padding: 8px 4px;">
            <div style="font-weight: 600; color: #333; font-size: 14px;">
              ${data.name || 'Adı Yok'}
            </div>
            <div style="display: flex; flex-wrap: wrap; gap: 8px; align-items: center;">
              ${this.getStatusBadge(data.status)}
              ${this.getTypeBadge(data.customerType)}
            </div>
            <div style="font-size: 12px; color: #666;">
              ${data.customerCode ? `Kod: ${data.customerCode}` : ''}
            </div>
            ${this.getContactInfo(data)}
          </div>
        `;
        return true;
      }

      getStatusBadge(status: string): string {
        const style = this.getStatusStyle(status);
        const label = this.getStatusLabel(status);
        return `
          <span style="display: inline-flex; align-items: center; gap: 4px; padding: 2px 6px; border-radius: 10px; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; ${style}">
            <div style="width: 4px; height: 4px; border-radius: 50%; background: currentColor;"></div>
            ${label}
          </span>
        `;
      }

      getTypeBadge(type: string): string {
        const style = this.getTypeStyle(type);
        const label = this.getTypeLabel(type);
        return `
          <span style="padding: 2px 6px; border-radius: 6px; font-size: 10px; font-weight: 500; ${style}">
            ${label}
          </span>
        `;
      }

      getContactInfo(data: any): string {
        const contacts = [];
        if (data.mainEmail) {
          contacts.push(`<a href="mailto:${data.mainEmail}" style="color: #3b82f6; text-decoration: none; font-size: 11px;">${data.mainEmail}</a>`);
        }
        if (data.mainPhone) {
          contacts.push(`<a href="tel:${data.mainPhone}" style="color: #059669; text-decoration: none; font-size: 11px;">${this.formatPhone(data.mainPhone)}</a>`);
        }

        return contacts.length > 0 ?
          `<div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 2px;">${contacts.join('')}</div>` :
          '';
      }

      getStatusStyle(status: string): string {
        switch (status?.toLowerCase()) {
          case 'active':
          case 'aktif':
            return 'background: #dcfce7; color: #166534; border: 1px solid #bbf7d0;';
          case 'inactive':
          case 'pasif':
            return 'background: #fef2f2; color: #dc2626; border: 1px solid #fecaca;';
          case 'pending':
          case 'beklemede':
            return 'background: #fef3c7; color: #d97706; border: 1px solid #fed7aa;';
          case 'potential':
          case 'potansiyel':
            return 'background: #dbeafe; color: #2563eb; border: 1px solid #bfdbfe;';
          default:
            return 'background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0;';
        }
      }

      getStatusLabel(status: string): string {
        switch (status?.toLowerCase()) {
          case 'active': return 'Aktif';
          case 'inactive': return 'Pasif';
          case 'pending': return 'Beklemede';
          case 'potential': return 'Potansiyel';
          default: return status || 'Bilinmiyor';
        }
      }

      getTypeStyle(type: string): string {
        switch (type) {
          case 'Corporate': return 'background: #f0f9ff; color: #0369a1; border: 1px solid #bae6fd;';
          case 'SME': return 'background: #f0fdf4; color: #166534; border: 1px solid #bbf7d0;';
          case 'Individual': return 'background: #fef3c7; color: #d97706; border: 1px solid #fed7aa;';
          case 'Branch': return 'background: #f3e8ff; color: #7c3aed; border: 1px solid #ddd6fe;';
          case 'Potential': return 'background: #fff1f2; color: #e11d48; border: 1px solid #fecdd3;';
          default: return 'background: #f8fafc; color: #64748b; border: 1px solid #e2e8f0;';
        }
      }

      getTypeLabel(type: string): string {
        switch (type) {
          case 'Corporate': return 'Kurumsal';
          case 'SME': return 'KOBİ';
          case 'Individual': return 'Bireysel';
          case 'Branch': return 'Şube';
          case 'Potential': return 'Potansiyel';
          default: return type || 'Belirtilmemiş';
        }
      }

      formatPhone(phone: string): string {
        if (!phone) return '-';

        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.length === 11 && cleaned.startsWith('0')) {
          return `${cleaned.substring(0, 4)} ${cleaned.substring(4, 7)} ${cleaned.substring(7, 9)} ${cleaned.substring(9)}`;
        }
        if (cleaned.length === 10) {
          return `0${cleaned.substring(0, 3)} ${cleaned.substring(3, 6)} ${cleaned.substring(6, 8)} ${cleaned.substring(8)}`;
        }
        return phone;
      }
    };
  },

  /* Lead Info Renderer */
  createLeadInfoRenderer: () => {
    return class implements ICellRenderer {
      eGui!: HTMLElement;

      init(params: ICellRendererParams): void {
        this.eGui = document.createElement('div');
        this.render(params.data);
      }

      refresh(params: ICellRendererParams): boolean {
        this.render(params.data);
        return true;
      }

      getGui(): HTMLElement {
        return this.eGui;
      }

      private render(data: any): void {
        const fullName = this.getFullName(data);
        const company = data?.companyName ? `<span style="color:#475569; font-size:12px;">${data.companyName}</span>` : '';
        const badges = [this.getStatusBadge(data?.status), this.getCategoryBadge(data?.leadCategory)].filter(Boolean).join('');
        const contact = [
          data?.email ? `<a href="mailto:${data.email}" style="color:#2563eb; text-decoration:none; font-size:12px;">${data.email}</a>` : '',
          data?.phone ? `<a href="tel:${data.phone}" style="color:#059669; text-decoration:none; font-size:12px;">${this.formatPhone(data.phone)}</a>` : ''
        ].filter(Boolean).join(' · ');

        this.eGui.innerHTML = `
          <div style="display:flex; flex-direction:column; gap:6px; padding:8px 4px;">
            <div style="font-weight:600; color:#0f172a; font-size:14px;">${fullName}</div>
            ${company}
            ${badges ? `<div style=\"display:flex; gap:8px; flex-wrap:wrap;\">${badges}</div>` : ''}
            ${contact ? `<div style=\"display:flex; gap:8px; flex-wrap:wrap; align-items:center;\">${contact}</div>` : ''}
          </div>
        `;
      }

      private getFullName(data: any): string {
        if (!data) return 'İsimsiz Lead';
        if (data.fullName) return data.fullName;
        const parts = [data.firstName, data.lastName].filter(Boolean);
        return parts.length ? parts.join(' ') : 'İsimsiz Lead';
      }

      private getStatusBadge(status?: string): string {
        if (!status) return '';
        const styles: Record<string, string> = {
          New: 'background:#dbeafe; color:#1d4ed8;',
          Contacted: 'background:#fef3c7; color:#b45309;',
          Qualified: 'background:#dcfce7; color:#15803d;',
          Unqualified: 'background:#fee2e2; color:#b91c1c;',
          Converted: 'background:#ede9fe; color:#6d28d9;'
        };
        const style = styles[status] || 'background:#e2e8f0; color:#475569;';
        return `<span style="padding:2px 8px; border-radius:9999px; font-size:11px; font-weight:600; ${style}">${status}</span>`;
      }

      private getCategoryBadge(category?: string): string {
        if (!category) return '';
        const styles: Record<string, string> = {
          Hot: 'background:#fee2e2; color:#b91c1c;',
          Warm: 'background:#fef3c7; color:#b45309;',
          Cold: 'background:#e0f2fe; color:#0369a1;'
        };
        const style = styles[category] || 'background:#e2e8f0; color:#475569;';
        return `<span style="padding:2px 8px; border-radius:8px; font-size:11px; font-weight:500; ${style}">${category}</span>`;
      }

      private formatPhone(phone: string): string {
        if (!phone) return '';
        const digits = phone.replace(/\D/g, '');
        if (digits.length === 10) {
          return `(${digits.substring(0,3)}) ${digits.substring(3,6)} ${digits.substring(6)}`;
        }
        if (digits.length === 11 && digits.startsWith('0')) {
          return `0 (${digits.substring(1,4)}) ${digits.substring(4,7)} ${digits.substring(7)}`;
        }
        return phone;
      }
    };
  }
};
