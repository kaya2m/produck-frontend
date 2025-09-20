export interface Opportunity {
  id: string;
  name: string;
  accountId: string;
  accountName: string;
  primaryContactId?: string;
  primaryContactName?: string;
  amount: number;
  currency: string;
  weightedAmount: number; // amount * (probability/100)
  expectedCloseDate?: Date;
  closeDate?: Date;
  opportunityTypeId: number;
  opportunityTypeName: string;
  salesStageId: number;
  salesStageName: string;
  probability: number;
  stageType: OpportunityStageType; // 'Open', 'Won', 'Lost'
  status: OpportunityStatus;
  healthStatus: HealthStatus; // 'Excellent', 'Good', 'Fair', 'Poor', 'Critical'
  priorityLevel: PriorityLevel; // 'Critical', 'High', 'Medium', 'Low'
  dealHealthScore: number; // 0-100
  isOverdue: boolean;
  isClosingSoon: boolean;
  daysOverdue: number;
  daysToClose: number;
  daysInCurrentStage: number;
  daysInPipeline: number;
  reasonWonLost?: string;
  lastActivityDate?: Date;
  competitorName?: string;
  competitivePosition?: string;
  nextStepDescription?: string;
  nextStepDate?: Date;
  ownerUserId: string;
  ownerUserName: string;
  leadSource?: string;
  description?: string;
  createdDate: Date;
  lastModifiedDate?: Date;
  activityCount: number;
  openActivityCount: number;
  completedActivityCount: number;
}

export interface OpportunityCreateDto {
  name: string;
  accountId: string;
  primaryContactId?: string;
  amount: number;
  currency?: string; // default: "TRY"
  expectedCloseDate?: Date;
  opportunityTypeId: number;
  salesStageId: number;
  description?: string;
  ownerUserId?: string; // defaults to current user
}

export interface OpportunityUpdateDto {
  id: string;
  name: string;
  accountId: string;
  primaryContactId?: string;
  amount: number;
  currency: string;
  expectedCloseDate?: Date;
  opportunityTypeId: number;
  salesStageId: number;
  description?: string;
  ownerUserId: string;
  reasonWonLost?: string;
}

export interface OpportunityStageUpdateDto {
  id: string;
  salesStageId: number;
  probability?: number; // optional override
  reasonWonLost?: string; // required for Won/Lost stages
}

export interface OpportunityListDto {
  id: string;
  name: string;
  accountName: string;
  amount: number;
  currency: string;
  weightedAmount: number;
  expectedCloseDate?: Date;
  salesStageName: string;
  probability: number;
  stageType: OpportunityStageType;
  status: OpportunityStatus;
  healthStatus: HealthStatus;
  priorityLevel: PriorityLevel;
  isOverdue: boolean;
  isClosingSoon: boolean;
  daysToClose: number;
  ownerUserName: string;
  lastActivityDate?: Date;
}

export interface SalesStage {
  id: number;
  name: string;
  description?: string;
  order: number;
  probability: number;
  isActive: boolean;
  stageType: OpportunityStageType; // 'Open', 'Won', 'Lost'
}

export interface OpportunityType {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
}

export interface SalesPipelineStageDto {
  stageId: number;
  stageName: string;
  order: number;
  probability: number;
  stageType: OpportunityStageType;
  opportunityCount: number;
  totalAmount: number;
  weightedAmount: number;
  opportunities: OpportunityListDto[];
}

export interface OpportunityForecast {
  startDate: Date;
  endDate: Date;
  ownerId?: string;
  totalForecastAmount: number;
  currency: string;
  forecastByStage: { [stageName: string]: number };
  probabilityWeightedForecast: number;
}

export interface OpportunityAnalytics {
  revenueByStage: { [stageName: string]: number };
  countByStage: { [stageName: string]: number };
  conversionRatesBySource: { [source: string]: number };
  averageDealSizeByStage: { [stageId: string]: number };
  totalRevenue: number;
  totalOpportunities: number;
  averageDealSize: number;
  averageSalesCycle: number;
  winRate: number;
  lossRate: number;
}

export interface OpportunityFilter {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
  salesStageId?: number;
  opportunityTypeId?: number;
  ownerId?: string;
  accountId?: string;
  minAmount?: number;
  maxAmount?: number;
  expectedCloseDateFrom?: Date;
  expectedCloseDateTo?: Date;
  status?: OpportunityStatus;
  isOverdue?: boolean;
  stageType?: OpportunityStageType;
  healthStatus?: HealthStatus;
  priorityLevel?: PriorityLevel;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
}

// Enums
export enum OpportunityStatus {
  Open = 'Open',
  Won = 'Won',
  Lost = 'Lost'
}

export enum OpportunityStageType {
  Open = 'Open',
  Won = 'Won',
  Lost = 'Lost'
}

export enum HealthStatus {
  Excellent = 'Excellent',
  Good = 'Good',
  Fair = 'Fair',
  Poor = 'Poor',
  Critical = 'Critical'
}

export enum PriorityLevel {
  Critical = 'Critical',
  High = 'High',
  Medium = 'Medium',
  Low = 'Low'
}

// Pipeline view specific interfaces
export interface PipelineColumn {
  stage: SalesStage;
  opportunities: OpportunityListDto[];
  totalAmount: number;
  weightedAmount: number;
  count: number;
}

export interface PipelineMetrics {
  totalPipelineValue: number;
  weightedPipelineValue: number;
  totalOpportunities: number;
  averageDealSize: number;
  conversionRate: number;
  averageSalesCycle: number;
}

// Dashboard specific interfaces
export interface OpportunityDashboardMetrics {
  totalRevenue: number;
  totalOpportunities: number;
  openOpportunities: number;
  closingThisMonth: number;
  wonThisMonth: number;
  lostThisMonth: number;
  averageDealSize: number;
  winRate: number;
  pipelineValue: number;
  weightedPipelineValue: number;
  overdueOpportunities: number;
  hotOpportunities: number;
  revenueTarget: number;
  targetAchievement: number;
}

// Activity related interfaces
export interface OpportunityActivity {
  id: string;
  opportunityId: string;
  type: 'Call' | 'Meeting' | 'Email' | 'Task' | 'Note';
  subject: string;
  description?: string;
  dueDate?: Date;
  completedDate?: Date;
  status: 'Open' | 'Completed' | 'Cancelled';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  assignedUserId: string;
  assignedUserName: string;
  createdDate: Date;
}