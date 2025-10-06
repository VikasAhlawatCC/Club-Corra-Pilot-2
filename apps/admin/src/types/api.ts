// Common types used across the monorepo
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

// Password and email verification types
export interface PasswordSetupRequest {
  mobileNumber: string;
  password: string;
  confirmPassword: string;
}

export interface EmailVerificationRequest {
  token: string;
}

export interface EmailVerificationResponse {
  success: boolean;
  message: string;
  user?: User;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetResponse {
  success: boolean;
  message: string;
}

export interface PasswordResetConfirmRequest {
  token: string;
  password: string;
  confirmPassword: string;
}

// Authentication Types
export enum AuthProvider {
  SMS = 'SMS',
  EMAIL = 'EMAIL',
  GOOGLE = 'GOOGLE',
  FACEBOOK = 'FACEBOOK'
}

export enum UserStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  DELETED = 'DELETED'
}

export enum VerificationStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  FAILED = 'FAILED'
}

export interface User extends BaseEntity {
  mobileNumber: string;
  email?: string;
  status: UserStatus;
  isMobileVerified: boolean;
  isEmailVerified: boolean;
  hasWelcomeBonusProcessed?: boolean;
  profile?: UserProfile;
  paymentDetails?: PaymentDetails;
  authProviders: AuthProviderLink[];
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  dateOfBirth?: Date;
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';
  profilePicture?: string;
  address?: Address;
  onboardingCompleted?: boolean;
}

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

export interface PaymentDetails {
  upiId?: string;
  mobileNumber?: string;
}

export interface AuthProviderLink {
  provider: AuthProvider;
  providerId: string;
  email?: string;
  linkedAt: Date;
}

export interface OTPVerification {
  id: string;
  userId?: string;
  mobileNumber?: string;
  email?: string;
  otpHash: string;
  expiresAt: Date;
  attempts: number;
  maxAttempts: number;
  isUsed: boolean;
  createdAt: Date;
}

export interface AuthToken {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
}

export interface JwtPayload {
  sub: string; // user ID
  mobileNumber: string;
  email?: string;
  roles?: string[]; // For regular users
  role?: 'ADMIN' | 'SUPER_ADMIN'; // For admin users
  iat: number;
  exp?: number; // Optional since we can use expiresIn option in JWT service
}

// Note: Brand, Coin, Transaction, and Notification types are now defined in their respective schema files
// to avoid conflicts and provide better validation

// Re-export notification types for convenience
export type {
  NotificationType,
  NotificationData,
  CreateNotificationRequest,
  PaymentProcessedNotificationData,
  TransactionRejectedNotificationData,
  Notification,
  GetNotificationsQuery,
  NotificationsResponse,
  MarkAsReadRequest,
  WebSocketNotificationEvent,
} from '../schemas/notification.schema';

// Dashboard Types for Admin Portal Enhancement
export interface DashboardMetrics {
  userMetrics: UserMetrics
  transactionMetrics: TransactionMetrics
  brandMetrics: BrandMetrics
  financialMetrics: FinancialMetrics
  systemMetrics: SystemMetrics
}

export interface UserMetrics {
  totalUsers: number
  activeUsers: number
  newUsersThisMonth: number
  newUsersThisWeek: number
  userGrowthRate: number
  averageUserRetention: number
  topUserSegments: UserSegment[]
}

export interface TransactionMetrics {
  totalTransactions: number
  pendingTransactions: number
  approvedTransactions: number
  rejectedTransactions: number
  totalCoinsEarned: number
  totalCoinsRedeemed: number
  averageTransactionValue: number
  transactionSuccessRate: number
  pendingEarnRequests: number
  pendingRedeemRequests: number
}

export interface BrandMetrics {
  totalBrands: number
  activeBrands: number
  topPerformingBrands: BrandPerformance[]
  brandEngagementRate: number
  averageBrandTransactionVolume: number
}

export interface FinancialMetrics {
  totalCoinsInCirculation: number
  totalLiability: number
  monthlyRevenue: number
  averageRevenuePerUser: number
  coinBreakageRate: number
  settlementStatus: SettlementStatus[]
}

export interface SystemMetrics {
  systemHealth: 'healthy' | 'warning' | 'critical'
  uptime: number
  activeConnections: number
  averageResponseTime: number
  errorRate: number
}

export interface UserSegment {
  segment: string
  count: number
  percentage: number
  growthRate: number
}

export interface BrandPerformance {
  brandId: string
  brandName: string
  transactionVolume: number
  successRate: number
  userEngagement: number
  revenueContribution: number
}

export interface SettlementStatus {
  brandId: string
  brandName: string
  pendingAmount: number
  lastSettlementDate?: Date
  nextSettlementDate: Date
  status: 'pending' | 'processing' | 'completed' | 'failed'
}

// Advanced filtering and saved views
export interface SavedView {
  id: string
  name: string
  filters: Record<string, any>
  userId: string
  isGlobal: boolean
  createdAt: Date
  updatedAt: Date
}

export interface FilterState {
  dateRange: {
    start: Date
    end: Date
  }
  brands: string[]
  categories: string[]
  statuses: string[]
  userSegments: string[]
  search: string
  page: number
  limit: number
}

// Fraud and risk monitoring
export interface RiskSignal {
  id: string
  type: 'ANOMALY' | 'SUSPICIOUS' | 'BLOCKLIST'
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  userId?: string
  transactionId?: string
  brandId?: string
  description: string
  metadata: Record<string, any>
  status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'FALSE_POSITIVE'
  createdAt: Date
  resolvedAt?: Date
  resolvedBy?: string
}

export interface RiskFactor {
  factor: string
  weight: number
  description: string
}

// Dashboard widget configuration
export interface DashboardWidget {
  id: string
  type: 'KPI' | 'CHART' | 'TABLE' | 'ALERT'
  title: string
  position: {
    x: number
    y: number
    width: number
    height: number
  }
  config: Record<string, any>
  isVisible: boolean
  refreshInterval?: number
}

export interface DashboardLayout {
  id: string
  name: string
  userId: string
  isDefault: boolean
  widgets: DashboardWidget[]
  createdAt: Date
  updatedAt: Date
}

// Audit and compliance
export interface AuditLog {
  id: string
  userId: string
  action: string
  resource: string
  resourceId?: string
  details: Record<string, any>
  ipAddress?: string
  userAgent?: string
  createdAt: Date
}

export interface ExperimentConfig {
  id: string
  name: string
  description: string
  isActive: boolean
  variants: ExperimentVariant[]
  startDate: Date
  endDate?: Date
  metrics: string[]
  createdAt: Date
  updatedAt: Date
}

export interface ExperimentVariant {
  id: string
  name: string
  weight: number
  config: Record<string, any>
}

// Dashboard API response types
export interface DashboardMetricsResponse {
  success: boolean
  message: string
  data: DashboardMetrics
  timestamp: Date
  cacheExpiry: Date
}

export interface SavedViewsResponse {
  success: boolean
  message: string
  data: SavedView[]
  total: number
}

export interface RiskSignalsResponse {
  success: boolean
  message: string
  data: RiskSignal[]
  total: number
  page: number
  limit: number
  totalPages: number
}
