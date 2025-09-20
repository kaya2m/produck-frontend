// Contact interfaces based on backend API DTOs

export interface Contact {
  id: string;
  accountId: string;
  accountName: string;
  firstName: string;
  lastName: string;
  fullName: string;
  displayName: string;
  salutation?: string;
  title?: string;
  department?: string;
  businessEmail?: string;
  personalEmail?: string;
  businessPhone?: string;
  mobilePhone?: string;
  status: ContactStatus;
  description?: string;
  reportsToContactId?: string;
  reportsToContactName?: string;
  ownerUserId: string;
  ownerUserName: string;
  createdDate: string;
  lastModifiedDate?: string;
  directReports: ContactSummary[];
}

export interface ContactSummary {
  id: string;
  accountId: string;
  accountName: string;
  firstName: string;
  lastName: string;
  fullName: string;
  title?: string;
  businessEmail?: string;
  businessPhone?: string;
  status: ContactStatus;
  ownerUserId: string;
  ownerUserName: string;
  createdDate: string;
}

export interface CreateContactRequest {
  accountId: string;
  firstName: string;
  lastName: string;
  salutation?: string;
  title?: string;
  department?: string;
  businessEmail?: string;
  personalEmail?: string;
  businessPhone?: string;
  mobilePhone?: string;
  status: ContactStatus;
  description?: string;
  reportsToContactId?: string;
  ownerUserId?: string;
}

export interface UpdateContactRequest {
  id: string;
  accountId: string;
  firstName: string;
  lastName: string;
  salutation?: string;
  title?: string;
  department?: string;
  businessEmail?: string;
  personalEmail?: string;
  businessPhone?: string;
  mobilePhone?: string;
  status: ContactStatus;
  description?: string;
  reportsToContactId?: string;
  ownerUserId: string;
}

export interface UpdateContactStatusRequest {
  status: ContactStatus;
}

export interface ContactsListParams {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
  accountId?: string;
  status?: ContactStatus;
  ownerId?: string;
  [key: string]: string | number | boolean | string[] | undefined;
}

// Contact Status enum based on backend validation
export type ContactStatus = 'Active' | 'Inactive' | 'LeftCompany';

// Salutation options commonly used in CRM systems
export const SALUTATIONS: { value: string; label: string }[] = [
  { value: 'Mr.', label: 'Bay' },
  { value: 'Ms.', label: 'Bayan' },
  { value: 'Mrs.', label: 'Hanım' },
  { value: 'Dr.', label: 'Dr.' },
  { value: 'Prof.', label: 'Prof.' }
];

// Contact statuses with Turkish labels
export const CONTACT_STATUSES: { value: ContactStatus; label: string }[] = [
  { value: 'Active', label: 'Aktif' },
  { value: 'Inactive', label: 'Pasif' },
  { value: 'LeftCompany', label: 'Şirketten Ayrıldı' }
];

// Common departments
export const DEPARTMENTS: { value: string; label: string }[] = [
  { value: 'Management', label: 'Yönetim' },
  { value: 'Sales', label: 'Satış' },
  { value: 'Marketing', label: 'Pazarlama' },
  { value: 'Finance', label: 'Finans' },
  { value: 'HR', label: 'İnsan Kaynakları' },
  { value: 'IT', label: 'Bilgi İşlem' },
  { value: 'Operations', label: 'Operasyon' },
  { value: 'Legal', label: 'Hukuk' },
  { value: 'Support', label: 'Destek' },
  { value: 'Other', label: 'Diğer' }
];