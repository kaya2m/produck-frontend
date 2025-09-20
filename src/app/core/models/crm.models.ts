// Base Entity Model (matching API AuditableEntity)
export interface BaseEntity {
  id: string;
  createdByUserId?: string;
  createdDate: Date;
  lastModifiedByUserId?: string;
  lastModifiedDate?: Date;
  isDeleted: boolean;
  deletedDate?: Date;
}

// Account Management Models (matching API AccountCreateDto)
export interface Account extends BaseEntity {
  name: string;
  legalName?: string;
  customerCode?: string;
  taxId?: string;
  taxOffice?: string;
  industry?: string;
  customerType?: string;
  status: AccountStatus;
  mainPhone?: string;
  mainEmail?: string;
  website?: string;
  currency: string; // default: TRY
  paymentTerms?: string;
  description?: string;
  parentAccountId?: string;
  parentAccount?: Account;
  childAccounts?: Account[];
  ownerUserId?: string;
  owner?: User;
  addresses?: Address[];
  contacts?: Contact[];
  opportunities?: Opportunity[];
  orders?: Order[];
  activities?: Activity[];
}

export enum AccountStatus {
  Active = 'Active',
  Inactive = 'Inactive',
  Potential = 'Potential'
}

export interface AccountType {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
}

export interface Territory {
  id: string;
  name: string;
  description?: string;
  parentTerritoryId?: string;
  ownerId: string;
  isActive: boolean;
}

// Contact Management Models
export interface Contact extends BaseEntity {
  firstName: string;
  lastName: string;
  fullName: string;
  title?: string;
  department?: string;
  accountId?: string;
  account?: Account;
  reportsToId?: string;
  reportsTo?: Contact;
  directReports?: Contact[];
  primaryEmail?: string;
  secondaryEmail?: string;
  primaryPhone?: string;
  mobilePhone?: string;
  homePhone?: string;
  fax?: string;
  linkedin?: string;
  twitter?: string;
  dateOfBirth?: Date;
  preferredContactMethod: ContactMethod;
  doNotCall: boolean;
  doNotEmail: boolean;
  doNotFax: boolean;
  emailOptOut: boolean;
  ownerId: string;
  owner?: User;
  addresses?: Address[];
  activities?: Activity[];
  opportunities?: Opportunity[];
  customFields?: Record<string, any>;
}

export enum ContactMethod {
  Email = 'Email',
  Phone = 'Phone',
  Mobile = 'Mobile',
  Fax = 'Fax',
  LinkedIn = 'LinkedIn'
}

// Address Management Models
export interface Address extends BaseEntity {
  type: AddressType;
  street1: string;
  street2?: string;
  city: string;
  state?: string;
  postalCode?: string;
  country: string;
  latitude?: number;
  longitude?: number;
  isPrimary: boolean;
  accountId?: string;
  contactId?: string;
}

export enum AddressType {
  Billing = 'Billing',
  Shipping = 'Shipping',
  Business = 'Business',
  Home = 'Home',
  Other = 'Other'
}

// Lead Management Models (matching API LeadCreateDto + scoring system)
export interface Lead extends BaseEntity {
  firstName: string;
  lastName: string;
  fullName?: string;
  companyName?: string;
  email: string; // required, unique
  phone?: string;
  jobTitle?: string;
  industryId?: string;
  leadSourceId?: string;
  companySizeId?: string;
  leadSource?: string;
  companySize?: string;
  budget?: number;
  timeline?: string;
  decisionMakerLevel?: string;
  painPoints?: string;
  notes?: string;
  assignedUserId?: string;
  assignedUser?: User;
  statusId?: string;

  // Scoring system
  leadScore: number; // 0-1000 (algorithmic)
  qualificationScore: number; // 0-100 (BANT criteria)
  leadCategory: LeadCategory; // Hot, Warm, Cold

  // Status and tracking
  status: LeadStatus;
  lastActivityDate?: Date;
  daysWithoutActivity?: number;

  // Conversion tracking
  isConverted: boolean;
  convertedDate?: Date;
  convertedAccountId?: string;
  convertedContactId?: string;
  convertedOpportunityId?: string;

  activities?: Activity[];
}

export enum LeadCategory {
  Hot = 'Hot',     // >= 800 score
  Warm = 'Warm',   // 500-799 score
  Cold = 'Cold'    // < 500 score
}

export enum LeadStatus {
  New = 'New',
  Contacted = 'Contacted',
  Qualified = 'Qualified',
  Unqualified = 'Unqualified',
  Converted = 'Converted'
}

export interface LeadSource {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
}

export interface LeadStatusEntity {
  id: string;
  name: string;
  category: LeadStatusCategory;
  isDefault: boolean;
  sortOrder: number;
  isActive: boolean;
}

export enum LeadStatusCategory {
  New = 'New',
  Working = 'Working',
  Nurturing = 'Nurturing',
  Qualified = 'Qualified',
  Converted = 'Converted',
  Unqualified = 'Unqualified'
}

export enum LeadRating {
  Hot = 'Hot',
  Warm = 'Warm',
  Cold = 'Cold'
}

// Opportunity Management Models
export interface Opportunity extends BaseEntity {
  name: string;
  accountId?: string;
  account?: Account;
  primaryContactId?: string;
  primaryContact?: Contact;
  amount?: number;
  stage: OpportunityStage;
  probability: number;
  expectedCloseDate?: Date;
  actualCloseDate?: Date;
  leadSource?: LeadSource;
  nextStep?: string;
  description?: string;
  competitors?: string;
  ownerId: string;
  owner?: User;
  products?: OpportunityProduct[];
  activities?: Activity[];
  quotes?: Quote[];
  customFields?: Record<string, any>;
}

export interface OpportunityStage {
  id: string;
  name: string;
  category: OpportunityStageCategory;
  probability: number;
  sortOrder: number;
  isDefault: boolean;
  isActive: boolean;
}

export enum OpportunityStageCategory {
  Open = 'Open',
  ClosedWon = 'ClosedWon',
  ClosedLost = 'ClosedLost'
}

export interface OpportunityProduct {
  id: string;
  opportunityId: string;
  productId: string;
  product?: Product;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  discount?: number;
  description?: string;
}

export interface Product {
  id: string;
  name: string;
  code: string;
  description?: string;
  category?: ProductCategory;
  unitPrice: number;
  isActive: boolean;
}

export interface ProductCategory {
  id: string;
  name: string;
  description?: string;
  parentCategoryId?: string;
  isActive: boolean;
}

// Activity Management Models
export interface Activity extends BaseEntity {
  subject: string;
  type: ActivityType;
  status: ActivityStatus;
  priority: ActivityPriority;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  dueDate?: Date;
  duration?: number; // in minutes
  location?: string;
  isAllDay: boolean;
  isCompleted: boolean;
  completedDate?: Date;
  ownerId: string;
  owner?: User;
  assignedToId?: string;
  assignedTo?: User;
  accountId?: string;
  account?: Account;
  contactId?: string;
  contact?: Contact;
  leadId?: string;
  lead?: Lead;
  opportunityId?: string;
  opportunity?: Opportunity;
  customFields?: Record<string, any>;
}

export interface ActivityType {
  id: string;
  name: string;
  category: ActivityCategory;
  defaultDuration?: number;
  isActive: boolean;
}

export enum ActivityCategory {
  Task = 'Task',
  Call = 'Call',
  Meeting = 'Meeting',
  Email = 'Email',
  Note = 'Note',
  Other = 'Other'
}

export interface ActivityStatus {
  id: string;
  name: string;
  category: ActivityStatusCategory;
  isDefault: boolean;
  isActive: boolean;
}

export enum ActivityStatusCategory {
  NotStarted = 'NotStarted',
  InProgress = 'InProgress',
  Completed = 'Completed',
  Cancelled = 'Cancelled',
  Deferred = 'Deferred'
}

export enum ActivityPriority {
  Low = 'Low',
  Normal = 'Normal',
  High = 'High',
  Urgent = 'Urgent'
}

// Quote Management Models
export interface Quote extends BaseEntity {
  quoteNumber: string;
  name: string;
  opportunityId?: string;
  opportunity?: Opportunity;
  accountId?: string;
  account?: Account;
  contactId?: string;
  contact?: Contact;
  status: QuoteStatus;
  validUntil?: Date;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  discount?: number;
  description?: string;
  terms?: string;
  ownerId: string;
  owner?: User;
  lineItems?: QuoteLineItem[];
  customFields?: Record<string, any>;
}

export interface QuoteLineItem {
  id: string;
  quoteId: string;
  productId?: string;
  product?: Product;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  discount?: number;
  taxRate?: number;
  sortOrder: number;
}

export enum QuoteStatus {
  Draft = 'Draft',
  Pending = 'Pending',
  Approved = 'Approved',
  Rejected = 'Rejected',
  Expired = 'Expired',
  Converted = 'Converted'
}

// Order Management Models
export interface Order extends BaseEntity {
  orderNumber: string;
  accountId?: string;
  account?: Account;
  contactId?: string;
  contact?: Contact;
  quoteId?: string;
  quote?: Quote;
  status: OrderStatus;
  orderDate: Date;
  requestedDeliveryDate?: Date;
  actualDeliveryDate?: Date;
  subtotal: number;
  taxAmount: number;
  shippingAmount: number;
  totalAmount: number;
  description?: string;
  ownerId: string;
  owner?: User;
  shippingAddress?: Address;
  billingAddress?: Address;
  lineItems?: OrderLineItem[];
  productionStages?: ProductionStage[];
  customFields?: Record<string, any>;
}

export interface OrderLineItem {
  id: string;
  orderId: string;
  productId?: string;
  product?: Product;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  discount?: number;
  taxRate?: number;
  sortOrder: number;
}

export enum OrderStatus {
  Pending = 'Pending',
  Confirmed = 'Confirmed',
  InProduction = 'InProduction',
  Shipped = 'Shipped',
  Delivered = 'Delivered',
  Cancelled = 'Cancelled',
  Returned = 'Returned'
}

// Production Management Models
export interface ProductionStage {
  id: string;
  orderId: string;
  order?: Order;
  stage: ProductionStageType;
  status: ProductionStageStatus;
  startDate?: Date;
  endDate?: Date;
  plannedDuration?: number; // in hours
  actualDuration?: number; // in hours
  assignedToId?: string;
  assignedTo?: User;
  notes?: string;
  completedBy?: string;
  completedDate?: Date;
}

export interface ProductionStageType {
  id: string;
  name: string;
  description?: string;
  estimatedDuration?: number; // in hours
  sortOrder: number;
  isActive: boolean;
}

export enum ProductionStageStatus {
  NotStarted = 'NotStarted',
  InProgress = 'InProgress',
  Completed = 'Completed',
  OnHold = 'OnHold',
  Cancelled = 'Cancelled'
}

// Case Management Models
export interface Case extends BaseEntity {
  caseNumber: string;
  subject: string;
  description?: string;
  status: CaseStatus;
  priority: CasePriority;
  type: CaseType;
  origin: CaseOrigin;
  accountId?: string;
  account?: Account;
  contactId?: string;
  contact?: Contact;
  ownerId: string;
  owner?: User;
  assignedToId?: string;
  assignedTo?: User;
  parentCaseId?: string;
  parentCase?: Case;
  childCases?: Case[];
  resolution?: string;
  resolutionDate?: Date;
  escalatedDate?: Date;
  escalatedToId?: string;
  escalatedTo?: User;
  interactions?: CaseInteraction[];
  customFields?: Record<string, any>;
}

export interface CaseStatus {
  id: string;
  name: string;
  category: CaseStatusCategory;
  isDefault: boolean;
  isActive: boolean;
}

export enum CaseStatusCategory {
  New = 'New',
  Working = 'Working',
  Escalated = 'Escalated',
  Resolved = 'Resolved',
  Closed = 'Closed'
}

export enum CasePriority {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
  Critical = 'Critical'
}

export interface CaseType {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
}

export enum CaseOrigin {
  Phone = 'Phone',
  Email = 'Email',
  Web = 'Web',
  Chat = 'Chat',
  Social = 'Social',
  InPerson = 'InPerson'
}

export interface CaseInteraction {
  id: string;
  caseId: string;
  type: InteractionType;
  subject: string;
  description?: string;
  direction: InteractionDirection;
  channel: CaseOrigin;
  startTime: Date;
  endTime?: Date;
  duration?: number; // in minutes
  ownerId: string;
  owner?: User;
  customFields?: Record<string, any>;
}

export enum InteractionType {
  Call = 'Call',
  Email = 'Email',
  Meeting = 'Meeting',
  Chat = 'Chat',
  Note = 'Note'
}

export enum InteractionDirection {
  Inbound = 'Inbound',
  Outbound = 'Outbound',
  Internal = 'Internal'
}

// User Management Models (extending existing)
export interface User extends BaseEntity {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  title?: string;
  department?: string;
  phoneNumber?: string;
  mobilePhone?: string;
  emailConfirmed: boolean;
  phoneNumberConfirmed: boolean;
  twoFactorEnabled: boolean;
  lastLoginAt?: Date;
  timeZone?: string;
  locale?: string;
  roles: Role[];
  territories?: Territory[];
  customFields?: Record<string, any>;
}

// Role Management Models
export interface Role extends BaseEntity {
  name: string;
  description?: string;
  permissions: Permission[];
  isSystemRole: boolean;
}

export interface Permission {
  id: string;
  name: string;
  description?: string;
  resource: string;
  action: string;
}

// Lookup Models
export interface Industry {
  id: string;
  name: string;
  description?: string;
  parentIndustryId?: string;
  isActive: boolean;
}

export interface CompanySize {
  id: string;
  name: string;
  minEmployees?: number;
  maxEmployees?: number;
  minRevenue?: number;
  maxRevenue?: number;
  isActive: boolean;
}

// Common Response Models
export interface PaginatedResponse<T> {
  data: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
  timestamp: Date;
}

// Filter and Search Models
export interface BaseFilter {
  pageNumber?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
  searchTerm?: string;
  isActive?: boolean;
  createdDateFrom?: Date;
  createdDateTo?: Date;
}

export interface AccountFilter extends BaseFilter {
  type?: string;
  industry?: string;
  ownerId?: string;
  territoryId?: string;
  revenueMin?: number;
  revenueMax?: number;
  employeeCountMin?: number;
  employeeCountMax?: number;
}

export interface ContactFilter extends BaseFilter {
  accountId?: string;
  ownerId?: string;
  department?: string;
  title?: string;
}

export interface LeadFilter extends BaseFilter {
  status?: string;
  rating?: LeadRating;
  leadSource?: string;
  ownerId?: string;
  scoreMin?: number;
  scoreMax?: number;
}

export interface OpportunityFilter extends BaseFilter {
  accountId?: string;
  stage?: string;
  ownerId?: string;
  amountMin?: number;
  amountMax?: number;
  probabilityMin?: number;
  probabilityMax?: number;
  expectedCloseDateFrom?: Date;
  expectedCloseDateTo?: Date;
}

export interface ActivityFilter extends BaseFilter {
  type?: string;
  status?: string;
  priority?: ActivityPriority;
  ownerId?: string;
  assignedToId?: string;
  entityType?: string;
  entityId?: string;
  dueDateFrom?: Date;
  dueDateTo?: Date;
  isCompleted?: boolean;
}

// Analytics Models
export interface SalesMetrics {
  totalRevenue: number;
  totalOpportunities: number;
  winRate: number;
  averageDealSize: number;
  salesCycleLength: number; // in days
  pipelineValue: number;
  forecastRevenue: number;
  period: DateRange;
}

export interface ActivityMetrics {
  totalActivities: number;
  completedActivities: number;
  completionRate: number;
  averageResponseTime: number; // in hours
  overdueActivities: number;
  period: DateRange;
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

// Dashboard Models
export interface DashboardWidget {
  id: string;
  title: string;
  type: WidgetType;
  size: WidgetSize;
  position: WidgetPosition;
  configuration: Record<string, any>;
  isVisible: boolean;
}

export enum WidgetType {
  Chart = 'Chart',
  Table = 'Table',
  Metric = 'Metric',
  List = 'List',
  Calendar = 'Calendar'
}

export interface WidgetSize {
  width: number;
  height: number;
}

export interface WidgetPosition {
  x: number;
  y: number;
}
