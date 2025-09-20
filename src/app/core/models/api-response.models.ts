// API Response Models matching Produck API structure

// Pagination Response (matching API pagination pattern)
export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

// Standard API Response
export interface ApiResponse<T> {
  data?: T;
  success?: boolean;
  message?: string;
  errors?: string[];
}

// Error Response
export interface ErrorResponse {
  statusCode: number;
  message: string;
  details?: string;
  errors?: { [key: string]: string[] };
}

// Authentication Response
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  user: UserInfo;
}

export interface UserInfo {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  roles: string[];
}

// Login/Register Request Models
export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  phoneNumber?: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

// Filter Models for API endpoints
export interface BaseFilter {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
}

export interface AccountFilter extends BaseFilter {
  status?: string;
  ownerId?: string;
  industry?: string;
  customerType?: string;
}

export interface ContactFilter extends BaseFilter {
  accountId?: string;
  ownerId?: string;
  jobTitle?: string;
  department?: string;
  title?: string;
  preferredContactMethod?: string;
}

export interface LeadFilter extends BaseFilter {
  status?: string;
  assignedUserId?: string;
  leadSourceId?: string;
  industryId?: string;
  companySizeId?: string;
  minScore?: number;
  maxScore?: number;
  minQualificationScore?: number;
  maxQualificationScore?: number;
  category?: string; // Hot, Warm, Cold
  daysWithoutActivity?: number;
}

export interface OpportunityFilter extends BaseFilter {
  accountId?: string;
  contactId?: string;
  ownerId?: string;
  stage?: string;
  minAmount?: number;
  maxAmount?: number;
  expectedCloseDateFrom?: Date;
  expectedCloseDateTo?: Date;
}

export interface ActivityFilter extends BaseFilter {
  type?: string;
  status?: string;
  priority?: string;
  ownerId?: string;
  assignedToId?: string;
  accountId?: string;
  contactId?: string;
  leadId?: string;
  opportunityId?: string;
  dueDateFrom?: Date;
  dueDateTo?: Date;
  isCompleted?: boolean;
}

export interface CaseFilter extends BaseFilter {
  status?: string;
  priority?: string;
  type?: string;
  accountId?: string;
  contactId?: string;
  ownerId?: string;
  assignedToId?: string;
  orderId?: string;
  productId?: string;
  isOverdue?: boolean;
  isApproachingSla?: boolean;
  isUnassigned?: boolean;
  isEscalated?: boolean;
}

// DTO Models for Create/Update operations

// Account DTOs
export interface AccountCreateDto {
  name: string;
  legalName?: string;
  customerCode?: string;
  taxId?: string;
  taxOffice?: string;
  industry?: string;
  customerType?: string;
  status?: string; // default: Active
  mainPhone?: string;
  mainEmail?: string;
  website?: string;
  currency?: string; // default: TRY
  paymentTerms?: string;
  description?: string;
  parentAccountId?: string;
  ownerUserId?: string;
}

export interface AccountUpdateDto extends Partial<AccountCreateDto> {}

export interface AccountStatusUpdateDto {
  status: string;
}

// Lead DTOs
export interface LeadCreateDto {
  firstName: string;
  lastName: string;
  companyName?: string;
  email: string;
  phone?: string;
  jobTitle?: string;
  industryId?: string;
  leadSourceId?: string;
  companySizeId?: string;
  leadSource: string;
  companySize?: string;
  budget?: number;
  timeline?: string;
  decisionMakerLevel?: string;
  painPoints?: string;
  notes?: string;
  assignedUserId?: string;
}

export interface LeadUpdateDto extends Partial<Omit<LeadCreateDto, 'leadSource'>> {
  id: string;
  leadSource: string;
  leadStatus: string;
  statusId: string;
  assignedUserId: string;
}

export interface LeadStatusUpdateDto {
  status: string;
  notes?: string;
}

export interface LeadConversionDto {
  createAccount: boolean;
  accountName?: string;
  createContact: boolean;
  createOpportunity: boolean;
  opportunityName?: string;
  opportunityAmount?: number;
  opportunityCloseDate?: Date;
}

export interface LeadConversionResult {
  accountId?: string;
  contactId?: string;
  opportunityId?: string;
}

export interface LeadScoreBreakdown {
  score: number;
  factors: ScoreFactor[];
}

export interface ScoreFactor {
  name: string;
  value: number;
  weight: number;
  contribution: number;
}

// Contact DTOs
export interface ContactCreateDto {
  firstName: string;
  lastName: string;
  accountId?: string;
  jobTitle?: string;
  department?: string;
  reportsToId?: string;
  businessEmail?: string;
  personalEmail?: string;
  businessPhone?: string;
  personalPhone?: string;
  mobilePhone?: string;
  dateOfBirth?: Date;
  decisionMakerInfluence?: number; // 1-10
  engagementScore?: number; // 1-100
  priority?: number; // 1-10
  notes?: string;
  ownerUserId?: string;
}

export interface ContactUpdateDto extends Partial<ContactCreateDto> {}

// Activity DTOs
export interface ActivityCreateDto {
  subject: string;
  type: string;
  status?: string;
  priority?: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  dueDate?: Date;
  duration?: number; // in minutes
  isCompleted?: boolean;
  ownerId?: string;
  assignedToId?: string;
  accountId?: string;
  contactId?: string;
  leadId?: string;
  opportunityId?: string;
}

export interface ActivityUpdateDto extends Partial<ActivityCreateDto> {}

// Case DTOs
export interface CaseCreateDto {
  subject: string;
  description?: string;
  status?: string;
  priority?: string;
  type?: string;
  accountId?: string;
  contactId?: string;
  orderId?: string;
  productId?: string;
  ownerId?: string;
  assignedToId?: string;
}

export interface CaseUpdateDto extends Partial<CaseCreateDto> {}

export interface CaseStatusUpdateDto {
  status: string;
  notes?: string;
}

export interface CaseAssignmentDto {
  assignedToId: string;
  notes?: string;
}

export interface CaseEscalationDto {
  escalatedToId: string;
  reason: string;
  notes?: string;
}

export interface CaseInteractionDto {
  type: string;
  subject: string;
  description?: string;
  direction?: string; // Inbound, Outbound, Internal
  duration?: number; // in minutes
}

// Bulk operation DTOs
export interface BulkUpdateDto<T> {
  ids: string[];
  updates: Partial<T>;
}

export interface BulkAssignmentDto {
  ids: string[];
  userId: string;
}

export interface BulkDeleteDto {
  ids: string[];
  reason?: string;
}

// Analytics DTOs
export interface LeadAnalyticsDto {
  period: 'Week' | 'Month' | 'Quarter' | 'Year';
  dateFrom?: Date;
  dateTo?: Date;
}

export interface LeadSourceAnalytics {
  sourceId: string;
  sourceName: string;
  totalLeads: number;
  qualifiedLeads: number;
  convertedLeads: number;
  conversionRate: number;
  averageScore: number;
}

export interface ConversionRateAnalytics {
  period: string;
  totalLeads: number;
  convertedLeads: number;
  conversionRate: number;
  averageTimeToConversion: number; // in days
}
