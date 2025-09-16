import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

export interface RecentView {
  id: string;
  title: string;
  url: string;
  icon: string;
  timestamp: Date;
  type: 'lead' | 'opportunity' | 'account' | 'contact' | 'task' | 'report' | 'other';
}

@Injectable({
  providedIn: 'root'
})
export class RecentViewsService {
  private readonly maxRecentViews = 10;
  private readonly storageKey = 'produck_recent_views';

  // Signal-based state for reactive UI updates
  recentViews = signal<RecentView[]>([]);

  constructor(private router: Router) {
    this.loadFromStorage();
    this.initRouterListener();
  }

  private initRouterListener(): void {
    // Listen to successful route navigations
    this.router.events.subscribe(event => {
      if (event.constructor.name === 'NavigationEnd') {
        this.addRecentView(this.router.url);
      }
    });
  }

  addRecentView(url: string, customTitle?: string): void {
    // Skip certain routes
    if (this.shouldSkipUrl(url)) {
      return;
    }

    const viewInfo = this.parseUrlToViewInfo(url, customTitle);
    if (!viewInfo) return;

    const currentViews = this.recentViews();

    // Remove existing entry if same URL
    const filteredViews = currentViews.filter(view => view.url !== url);

    // Add new entry at the beginning
    const newViews = [viewInfo, ...filteredViews].slice(0, this.maxRecentViews);

    this.recentViews.set(newViews);
    this.saveToStorage();
  }

  removeRecentView(id: string): void {
    const currentViews = this.recentViews();
    const updatedViews = currentViews.filter(view => view.id !== id);
    this.recentViews.set(updatedViews);
    this.saveToStorage();
  }

  clearRecentViews(): void {
    this.recentViews.set([]);
    this.saveToStorage();
  }

  navigateToRecentView(view: RecentView): void {
    this.router.navigate([view.url]);
  }

  private shouldSkipUrl(url: string): boolean {
    const skipPatterns = [
      '/dashboard',
      '/login',
      '/404',
      '/error',
      '/',
      ''
    ];

    return skipPatterns.some(pattern => url === pattern || url.startsWith(pattern + '?'));
  }

  private parseUrlToViewInfo(url: string, customTitle?: string): RecentView | null {
    const segments = url.split('/').filter(s => s);
    if (segments.length === 0) return null;

    const id = this.generateViewId(url);
    const timestamp = new Date();

    // Custom title takes precedence
    if (customTitle) {
      return {
        id,
        title: customTitle,
        url,
        icon: this.getIconForUrl(url),
        timestamp,
        type: this.getTypeForUrl(url)
      };
    }

    // Parse based on URL structure
    if (segments.includes('leads')) {
      return this.createLeadView(id, url, segments, timestamp);
    }

    if (segments.includes('opportunities')) {
      return this.createOpportunityView(id, url, segments, timestamp);
    }

    if (segments.includes('accounts')) {
      return this.createAccountView(id, url, segments, timestamp);
    }

    if (segments.includes('contacts')) {
      return this.createContactView(id, url, segments, timestamp);
    }

    if (segments.includes('reports')) {
      return this.createReportView(id, url, segments, timestamp);
    }

    if (segments.includes('tasks')) {
      return this.createTaskView(id, url, segments, timestamp);
    }

    // Generic fallback
    return {
      id,
      title: this.formatGenericTitle(segments),
      url,
      icon: 'description',
      timestamp,
      type: 'other'
    };
  }

  private createLeadView(id: string, url: string, segments: string[], timestamp: Date): RecentView {
    const isNew = segments.includes('new');
    const isEdit = segments.includes('edit');

    if (isNew) {
      return { id, title: 'New Lead', url, icon: 'person_add', timestamp, type: 'lead' };
    }

    if (isEdit) {
      return { id, title: 'Edit Lead', url, icon: 'edit', timestamp, type: 'lead' };
    }

    // If there's an ID, try to show it meaningfully
    const leadId = this.extractRecordId(segments);
    const title = leadId ? `Lead ${leadId.slice(0, 8)}` : 'Lead Details';

    return { id, title, url, icon: 'person', timestamp, type: 'lead' };
  }

  private createOpportunityView(id: string, url: string, segments: string[], timestamp: Date): RecentView {
    const isNew = segments.includes('new');
    const isEdit = segments.includes('edit');

    if (isNew) {
      return { id, title: 'New Opportunity', url, icon: 'trending_up', timestamp, type: 'opportunity' };
    }

    if (isEdit) {
      return { id, title: 'Edit Opportunity', url, icon: 'edit', timestamp, type: 'opportunity' };
    }

    const oppId = this.extractRecordId(segments);
    const title = oppId ? `Opportunity ${oppId.slice(0, 8)}` : 'Opportunity Details';

    return { id, title, url, icon: 'trending_up', timestamp, type: 'opportunity' };
  }

  private createAccountView(id: string, url: string, segments: string[], timestamp: Date): RecentView {
    const isNew = segments.includes('new');
    const isEdit = segments.includes('edit');

    if (isNew) {
      return { id, title: 'New Account', url, icon: 'business', timestamp, type: 'account' };
    }

    if (isEdit) {
      return { id, title: 'Edit Account', url, icon: 'edit', timestamp, type: 'account' };
    }

    const accountId = this.extractRecordId(segments);
    const title = accountId ? `Account ${accountId.slice(0, 8)}` : 'Account Details';

    return { id, title, url, icon: 'business', timestamp, type: 'account' };
  }

  private createContactView(id: string, url: string, segments: string[], timestamp: Date): RecentView {
    const isNew = segments.includes('new');
    const isEdit = segments.includes('edit');

    if (isNew) {
      return { id, title: 'New Contact', url, icon: 'contacts', timestamp, type: 'contact' };
    }

    if (isEdit) {
      return { id, title: 'Edit Contact', url, icon: 'edit', timestamp, type: 'contact' };
    }

    const contactId = this.extractRecordId(segments);
    const title = contactId ? `Contact ${contactId.slice(0, 8)}` : 'Contact Details';

    return { id, title, url, icon: 'contacts', timestamp, type: 'contact' };
  }

  private createReportView(id: string, url: string, segments: string[], timestamp: Date): RecentView {
    const reportName = segments[segments.length - 1];
    const title = `Report: ${this.formatSegmentName(reportName)}`;

    return { id, title, url, icon: 'assessment', timestamp, type: 'report' };
  }

  private createTaskView(id: string, url: string, segments: string[], timestamp: Date): RecentView {
    const isNew = segments.includes('new');
    const isEdit = segments.includes('edit');

    if (isNew) {
      return { id, title: 'New Task', url, icon: 'task_alt', timestamp, type: 'task' };
    }

    if (isEdit) {
      return { id, title: 'Edit Task', url, icon: 'edit', timestamp, type: 'task' };
    }

    const taskId = this.extractRecordId(segments);
    const title = taskId ? `Task ${taskId.slice(0, 8)}` : 'Task Details';

    return { id, title, url, icon: 'task', timestamp, type: 'task' };
  }

  private extractRecordId(segments: string[]): string | null {
    // Look for segments that look like IDs
    for (const segment of segments) {
      if (/^[a-f0-9]{8,}$/i.test(segment) || /^\d+$/.test(segment)) {
        return segment;
      }
    }
    return null;
  }

  private formatSegmentName(segment: string): string {
    return segment.split('-').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }

  private formatGenericTitle(segments: string[]): string {
    return segments.map(segment => this.formatSegmentName(segment)).join(' > ');
  }

  private getIconForUrl(url: string): string {
    if (url.includes('leads')) return 'person';
    if (url.includes('opportunities')) return 'trending_up';
    if (url.includes('accounts')) return 'business';
    if (url.includes('contacts')) return 'contacts';
    if (url.includes('tasks')) return 'task';
    if (url.includes('reports')) return 'assessment';
    if (url.includes('calendar')) return 'event';
    return 'description';
  }

  private getTypeForUrl(url: string): RecentView['type'] {
    if (url.includes('leads')) return 'lead';
    if (url.includes('opportunities')) return 'opportunity';
    if (url.includes('accounts')) return 'account';
    if (url.includes('contacts')) return 'contact';
    if (url.includes('tasks')) return 'task';
    if (url.includes('reports')) return 'report';
    return 'other';
  }

  private generateViewId(url: string): string {
    return `view_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const views = JSON.parse(stored).map((view: any) => ({
          ...view,
          timestamp: new Date(view.timestamp)
        }));
        this.recentViews.set(views);
      }
    } catch (error) {
      console.warn('Failed to load recent views from storage:', error);
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.recentViews()));
    } catch (error) {
      console.warn('Failed to save recent views to storage:', error);
    }
  }
}