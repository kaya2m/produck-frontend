import { Injectable, inject, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ApiService } from './api.service';

export interface LookupOption {
  value: string;
  label: string;
}

@Injectable({
  providedIn: 'root'
})
export class ConfigurationService {
  private apiService = inject(ApiService);

  // Signals for dropdown options
  customerTypes = signal<LookupOption[]>([]);
  accountStatuses = signal<LookupOption[]>([]);
  currencies = signal<LookupOption[]>([]);
  paymentTerms = signal<LookupOption[]>([]);
  industries = signal<LookupOption[]>([]);

  // Static data (will be replaced with API calls)
  private static readonly CUSTOMER_TYPES: LookupOption[] = [
    { value: 'Corporate', label: 'Kurumsal' },
    { value: 'SME', label: 'KOBİ' },
    { value: 'Individual', label: 'Bireysel' },
    { value: 'Branch', label: 'Şube' },
    { value: 'Potential', label: 'Potansiyel' }
  ];

  private static readonly ACCOUNT_STATUSES: LookupOption[] = [
    { value: 'Active', label: 'Aktif' },
    { value: 'Inactive', label: 'Pasif' },
    { value: 'Potential', label: 'Potansiyel' }
  ];

  private static readonly CURRENCIES: LookupOption[] = [
    { value: 'TRY', label: 'Türk Lirası (₺)' },
    { value: 'USD', label: 'US Dollar ($)' },
    { value: 'EUR', label: 'Euro (€)' },
    { value: 'GBP', label: 'British Pound (£)' }
  ];

  private static readonly PAYMENT_TERMS: LookupOption[] = [
    { value: 'Cash', label: 'Peşin' },
    { value: 'Net 15', label: '15 Gün Vade' },
    { value: 'Net 30', label: '30 Gün Vade' },
    { value: 'Net 45', label: '45 Gün Vade' },
    { value: 'Net 60', label: '60 Gün Vade' }
  ];

  private static readonly INDUSTRIES: LookupOption[] = [
    { value: 'Technology', label: 'Teknoloji' },
    { value: 'Finance', label: 'Finans' },
    { value: 'Healthcare', label: 'Sağlık' },
    { value: 'Manufacturing', label: 'İmalat' },
    { value: 'Retail', label: 'Perakende' },
    { value: 'Education', label: 'Eğitim' },
    { value: 'Construction', label: 'İnşaat' },
    { value: 'Transportation', label: 'Ulaştırma' },
    { value: 'Energy', label: 'Enerji' },
    { value: 'Other', label: 'Diğer' }
  ];

  constructor() {
    this.loadAllConfigurations();
  }

  loadAllConfigurations(): void {
    this.loadCustomerTypes();
    this.loadAccountStatuses();
    this.loadCurrencies();
    this.loadPaymentTerms();
    this.loadIndustries();
  }

  // Customer Types
  loadCustomerTypes(): void {
    // TODO: Replace with API call when backend is ready
    // this.apiService.get<LookupOption[]>('configuration/customer-types').subscribe(...)
    this.customerTypes.set(ConfigurationService.CUSTOMER_TYPES);
  }

  getCustomerTypes(): Observable<LookupOption[]> {
    // TODO: Replace with API call
    // return this.apiService.get<LookupOption[]>('configuration/customer-types');
    return of(ConfigurationService.CUSTOMER_TYPES);
  }

  // Account Statuses
  loadAccountStatuses(): void {
    // TODO: Replace with API call when backend is ready
    // this.apiService.get<LookupOption[]>('configuration/account-statuses').subscribe(...)
    this.accountStatuses.set(ConfigurationService.ACCOUNT_STATUSES);
  }

  getAccountStatuses(): Observable<LookupOption[]> {
    // TODO: Replace with API call
    // return this.apiService.get<LookupOption[]>('configuration/account-statuses');
    return of(ConfigurationService.ACCOUNT_STATUSES);
  }

  // Currencies
  loadCurrencies(): void {
    // TODO: Replace with API call when backend is ready
    // this.apiService.get<LookupOption[]>('configuration/currencies').subscribe(...)
    this.currencies.set(ConfigurationService.CURRENCIES);
  }

  getCurrencies(): Observable<LookupOption[]> {
    // TODO: Replace with API call
    // return this.apiService.get<LookupOption[]>('configuration/currencies');
    return of(ConfigurationService.CURRENCIES);
  }

  // Payment Terms
  loadPaymentTerms(): void {
    // TODO: Replace with API call when backend is ready
    // this.apiService.get<LookupOption[]>('configuration/payment-terms').subscribe(...)
    this.paymentTerms.set(ConfigurationService.PAYMENT_TERMS);
  }

  getPaymentTerms(): Observable<LookupOption[]> {
    // TODO: Replace with API call
    // return this.apiService.get<LookupOption[]>('configuration/payment-terms');
    return of(ConfigurationService.PAYMENT_TERMS);
  }

  // Industries
  loadIndustries(): void {
    // TODO: Replace with API call when backend is ready
    // this.apiService.get<LookupOption[]>('configuration/industries').subscribe(...)
    this.industries.set(ConfigurationService.INDUSTRIES);
  }

  getIndustries(): Observable<LookupOption[]> {
    // TODO: Replace with API call
    // return this.apiService.get<LookupOption[]>('configuration/industries');
    return of(ConfigurationService.INDUSTRIES);
  }

  // Future API methods (ready for backend integration)
  /*
  loadCustomerTypesFromApi(): void {
    this.apiService.get<LookupOption[]>('lookup/customer-types').subscribe({
      next: (data) => this.customerTypes.set(data),
      error: (error) => {
        console.error('Failed to load customer types:', error);
        // Fallback to static data
        this.customerTypes.set(ConfigurationService.CUSTOMER_TYPES);
      }
    });
  }

  loadAccountStatusesFromApi(): void {
    this.apiService.get<LookupOption[]>('lookup/account-statuses').subscribe({
      next: (data) => this.accountStatuses.set(data),
      error: (error) => {
        console.error('Failed to load account statuses:', error);
        this.accountStatuses.set(ConfigurationService.ACCOUNT_STATUSES);
      }
    });
  }

  loadCurrenciesFromApi(): void {
    this.apiService.get<LookupOption[]>('lookup/currencies').subscribe({
      next: (data) => this.currencies.set(data),
      error: (error) => {
        console.error('Failed to load currencies:', error);
        this.currencies.set(ConfigurationService.CURRENCIES);
      }
    });
  }

  loadPaymentTermsFromApi(): void {
    this.apiService.get<LookupOption[]>('lookup/payment-terms').subscribe({
      next: (data) => this.paymentTerms.set(data),
      error: (error) => {
        console.error('Failed to load payment terms:', error);
        this.paymentTerms.set(ConfigurationService.PAYMENT_TERMS);
      }
    });
  }

  loadIndustriesFromApi(): void {
    this.apiService.get<LookupOption[]>('lookup/industries').subscribe({
      next: (data) => this.industries.set(data),
      error: (error) => {
        console.error('Failed to load industries:', error);
        this.industries.set(ConfigurationService.INDUSTRIES);
      }
    });
  }
  */
}