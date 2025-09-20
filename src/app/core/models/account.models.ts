export interface Account {
  id: string;
  name: string;
  legalName?: string;
  customerCode: string;
  taxId?: string;
  taxOffice?: string;
  industry?: string;
  customerType: CustomerType;
  status: AccountStatus;
  mainPhone?: string;
  mainEmail?: string;
  website?: string;
  currency?: string;
  paymentTerms?: string;
  description?: string;
  parentAccountId?: string;
  parentAccountName?: string;
  ownerUserId: string;
  ownerUserName?: string;
  createdDate: string;
  lastModifiedDate?: string;
  contacts?: ContactSummary[];
  addresses?: AddressSummary[];
  childAccounts?: AccountSummary[];
  contactCount?: number;
  addressCount?: number;
}

export interface AccountSummary {
  id: string;
  name: string;
  customerCode: string;
  customerType: CustomerType;
  status: AccountStatus;
  industry?: string;
  mainEmail?: string;
  mainPhone?: string;
  ownerUserId: string;
  ownerUserName?: string;
  createdDate: string;
  contactCount: number;
  addressCount: number;
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
  ownerUserName?: string;
  createdDate: string;
}

export interface AddressSummary {
  id: string;
  accountId: string;
  accountName: string;
  addressType: string;
  street: string;
  city: string;
  state?: string;
  zipCode?: string;
  country: string;
  fullAddress: string;
  description?: string;
  createdDate: string;
  lastModifiedDate?: string;
}

export interface CreateAccountRequest {
  name: string;
  legalName?: string;
  customerCode: string;
  taxId?: string;
  taxOffice?: string;
  industry?: string;
  customerType: CustomerType;
  status: AccountStatus;
  mainPhone?: string;
  mainEmail?: string;
  website?: string;
  currency?: string;
  paymentTerms?: string;
  description?: string;
  parentAccountId?: string;
  ownerUserId: string;
}

export interface UpdateAccountRequest {
  id: string;
  name: string;
  legalName?: string;
  customerCode: string;
  taxId?: string;
  taxOffice?: string;
  industry?: string;
  customerType: CustomerType;
  status: AccountStatus;
  mainPhone?: string;
  mainEmail?: string;
  website?: string;
  currency?: string;
  paymentTerms?: string;
  description?: string;
  parentAccountId?: string;
  ownerUserId: string;
}

export interface UpdateAccountStatusRequest {
  status: AccountStatus;
}

export interface AccountsListParams {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
  status?: AccountStatus;
  ownerId?: string;
  industry?: string;
  [key: string]: string | number | boolean | string[] | undefined;
}

export type CustomerType = 'Corporate' | 'SME' | 'Individual' | 'Branch' | 'Potential';

export type AccountStatus = 'Active' | 'Inactive' | 'Potential';

export type ContactStatus = 'Active' | 'Inactive';

// Note: Constants moved to ConfigurationService for API integration