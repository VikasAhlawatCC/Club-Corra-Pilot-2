// Local type definitions (duplicated from API entities and shared package)
// These are intentionally duplicated to keep Admin and API deployable independently
// NO SHARED PACKAGES - All types inlined here for independent deployment

// ============================================================================
// BASE TYPES
// ============================================================================

export interface BaseEntity {
  id: string
  createdAt: Date
  updatedAt: Date
}

export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

// ============================================================================
// AUTH TYPES
// ============================================================================

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

export interface AuthToken {
  accessToken: string
  refreshToken: string
  expiresIn: number
  tokenType: 'Bearer'
}

export interface JwtPayload {
  sub: string // user ID
  mobileNumber: string
  email?: string
  roles?: string[]
  role?: 'ADMIN' | 'SUPER_ADMIN'
  iat: number
  exp?: number
}

export interface OTPVerification {
  id: string
  userId?: string
  mobileNumber?: string
  email?: string
  otpHash: string
  expiresAt: Date
  attempts: number
  maxAttempts: number
  isUsed: boolean
  createdAt: Date
}

// ============================================================================
// USER TYPES
// ============================================================================

export interface Address {
  street?: string
  city?: string
  state?: string
  country?: string
  postalCode?: string
}

export interface PaymentDetails {
  upiId?: string
  mobileNumber?: string
}

export interface AuthProviderLink {
  provider: AuthProvider
  providerId: string
  email?: string
  linkedAt: Date
}

export interface UserProfile {
  firstName: string
  lastName: string
  dateOfBirth?: Date
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY'
  profilePicture?: string
  address?: Address
  onboardingCompleted?: boolean
}

export interface User extends BaseEntity {
  mobileNumber: string
  email?: string
  status: UserStatus
  isMobileVerified: boolean
  isEmailVerified: boolean
  hasWelcomeBonusProcessed?: boolean
  profile?: UserProfile
  paymentDetails?: PaymentDetails
  authProviders: AuthProviderLink[]
}

// ============================================================================
// BRAND TYPES
// ============================================================================

export interface Brand {
  id: string
  name: string
  description: string
  logoUrl?: string
  websiteUrl?: string
  categoryId?: string
  category?: BrandCategory
  isActive: boolean
  earningPercentage: number
  redemptionPercentage: number
  minRedemptionAmount?: number
  maxRedemptionAmount?: number
  brandwiseMaxCap: number
  createdAt: Date
  updatedAt: Date
}

export interface BrandCategory {
  id: string
  name: string
  description?: string
  icon?: string
  color?: string
  iconUrl?: string
  sortOrder: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface CreateBrandRequest {
  name: string
  description: string
  logoUrl?: string
  websiteUrl?: string
  categoryId?: string
  // Percentage-based configuration
  earningPercentage: number
  redemptionPercentage: number
  // Optional redemption bounds
  minRedemptionAmount?: number
  maxRedemptionAmount?: number
  // Absolute per-transaction cap
  brandwiseMaxCap: number
  isActive?: boolean
}

export interface UpdateBrandRequest {
  name?: string
  description?: string
  logoUrl?: string
  websiteUrl?: string
  categoryId?: string
  // Percentage-based configuration
  earningPercentage?: number
  redemptionPercentage?: number
  // Optional redemption bounds
  minRedemptionAmount?: number
  maxRedemptionAmount?: number
  // Absolute per-transaction cap
  brandwiseMaxCap?: number
  isActive?: boolean
}

export interface CreateBrandCategoryRequest {
  name: string
  description?: string
  iconUrl?: string
  sortOrder?: number
  isActive?: boolean
}

export interface UpdateBrandCategoryRequest {
  name?: string
  description?: string
  iconUrl?: string
  sortOrder?: number
  isActive?: boolean
}

// ============================================================================
// COIN & TRANSACTION TYPES
// ============================================================================

export interface CoinBalance {
  id: string
  userId: string
  balance: number
  totalEarned: number
  totalRedeemed: number
  lastUpdated: Date
  createdAt: Date
  updatedAt: Date
}

export type CoinTransactionStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'PROCESSED' | 'PAID'

export interface CoinTransaction {
  id: string
  userId: string
  brandId?: string
  brand?: {
    id: string
    name: string
    logoUrl?: string
  }
  amount: number
  billAmount?: number
  coinsEarned?: number
  coinsRedeemed?: number
  status: CoinTransactionStatus
  type?: 'earned' | 'redeemed' | 'bonus' | 'adjustment'
  description?: string
  metadata?: {
    billAmount?: number
    location?: string
    notes?: string
    billUrl?: string
  }
  receiptUrl?: string
  adminNotes?: string
  processedAt?: Date
  transactionId?: string
  billDate?: Date
  paymentProcessedAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface CreateRewardRequest {
  userId: string
  brandId: string
  billAmount: number
  billDate: Date
  receiptUrl: string
  coinsToRedeem?: number
}

export interface CreateWelcomeBonusRequest {
  userId: string
  mobileNumber: string
}

export interface CreateAdjustmentRequest {
  userId: string
  amount: number
  reason: string
  adminNotes?: string
}

export interface UpdateTransactionStatusRequest {
  status: 'APPROVED' | 'REJECTED' | 'PROCESSED' | 'PAID'
  adminNotes?: string
}

export interface ProcessPaymentRequest {
  transactionId: string
  adminNotes?: string
}

export interface RejectTransactionRequest {
  reason: string
  adminNotes?: string
}

export interface BalanceResponse {
  balance: number
  totalEarned: number
  totalRedeemed: number
  lastUpdated: Date
  id?: string
  userId?: string
  createdAt?: Date
  updatedAt?: Date
}

export interface UserBalanceSummary {
  balance: number
  totalEarned: number
  totalRedeemed: number
  lastUpdated: Date
  pendingEarnRequests: number
  pendingRedeemRequests: number
}

export interface VerificationFormData {
  observedAmount: number
  receiptDate: string
  verificationConfirmed: boolean
  rejectionNote?: string
  adminNotes?: string
}

export interface UserVerificationData {
  id: string
  mobileNumber: string
  email?: string
  profile?: {
    firstName: string
    lastName: string
  }
  paymentDetails?: {
    mobileNumber?: string
    upiId?: string
  }
}

// ============================================================================
// DASHBOARD TYPES
// ============================================================================

export interface DashboardMetrics {
  userMetrics: UserMetrics
  transactionMetrics: TransactionMetrics
  brandMetrics: BrandMetrics
  financialMetrics: FinancialMetrics
  systemMetrics: SystemMetrics
}

export interface UserSegment {
  segment: string
  count: number
  percentage: number
  growthRate: number
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

export interface BrandPerformance {
  brandId: string
  brandName: string
  transactionVolume: number
  successRate: number
  userEngagement: number
  revenueContribution: number
}

export interface BrandMetrics {
  totalBrands: number
  activeBrands: number
  topPerformingBrands: BrandPerformance[]
  brandEngagementRate: number
  averageBrandTransactionVolume: number
}

export interface SettlementStatus {
  brandId: string
  brandName: string
  pendingAmount: number
  lastSettlementDate?: Date
  nextSettlementDate: Date
  status: 'pending' | 'processing' | 'completed' | 'failed'
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

export interface DashboardMetricsResponse {
  success: boolean
  message: string
  data: DashboardMetrics
  timestamp: Date
  cacheExpiry: Date
}

// ============================================================================
// SAVED VIEWS & FILTERS
// ============================================================================

export interface SavedView {
  id: string
  name: string
  filters: Record<string, any>
  userId: string
  isGlobal: boolean
  createdAt: Date
  updatedAt: Date
}

export interface CreateSavedViewRequest {
  name: string
  filters: Record<string, any>
  isGlobal?: boolean
}

export interface UpdateSavedViewRequest {
  name?: string
  filters?: Record<string, any>
  isGlobal?: boolean
}

export interface SavedViewsResponse {
  success: boolean
  message: string
  data: SavedView[]
  total: number
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

// ============================================================================
// RISK & SECURITY
// ============================================================================

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

export interface CreateRiskSignalRequest {
  type: 'ANOMALY' | 'SUSPICIOUS' | 'BLOCKLIST'
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  userId?: string
  transactionId?: string
  brandId?: string
  description: string
  metadata?: Record<string, any>
}

export interface UpdateRiskSignalRequest {
  status?: 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'FALSE_POSITIVE'
  description?: string
  metadata?: Record<string, any>
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

export interface RiskFactor {
  factor: string
  weight: number
  description: string
}

// ============================================================================
// AUDIT & COMPLIANCE
// ============================================================================

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

// ============================================================================
// EXPERIMENTS & A/B TESTING
// ============================================================================

export interface ExperimentVariant {
  id: string
  name: string
  weight: number
  config: Record<string, any>
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

// ============================================================================
// DASHBOARD WIDGETS
// ============================================================================

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

// ============================================================================
// NOTIFICATION TYPES
// ============================================================================

export type NotificationType = 
  | 'TRANSACTION_APPROVED'
  | 'TRANSACTION_REJECTED'
  | 'PAYMENT_PROCESSED'
  | 'REWARD_EARNED'
  | 'SYSTEM'
  | 'PROMOTIONAL'

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  data?: Record<string, any>
  isRead: boolean
  readAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface CreateNotificationRequest {
  userId: string
  type: NotificationType
  title: string
  message: string
  data?: Record<string, any>
}

export interface NotificationsResponse {
  success: boolean
  message: string
  data: Notification[]
  total: number
  page: number
  limit: number
}

// ============================================================================
// PARTNER & WAITLIST
// ============================================================================

export interface PartnerApplication {
  id: string
  companyName: string
  contactName: string
  contactEmail: string
  contactPhone?: string
  websiteUrl?: string
  description?: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  submittedAt: Date
  reviewedAt?: Date
  reviewedBy?: string
  reviewNotes?: string
  createdAt: Date
  updatedAt: Date
}

export interface WaitlistEntry {
  id: string
  email: string
  name?: string
  phoneNumber?: string
  referralCode?: string
  source?: string
  metadata?: Record<string, any>
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  createdAt: Date
  updatedAt: Date
}

// ============================================================================
// PASSWORD & EMAIL VERIFICATION
// ============================================================================

export interface PasswordSetupRequest {
  mobileNumber: string
  password: string
  confirmPassword: string
}

export interface EmailVerificationRequest {
  token: string
}

export interface EmailVerificationResponse {
  success: boolean
  message: string
  user?: User
}

export interface PasswordResetRequest {
  email: string
}

export interface PasswordResetResponse {
  success: boolean
  message: string
}

export interface PasswordResetConfirmRequest {
  token: string
  password: string
  confirmPassword: string
}

// ============================================================================
// LOCATION & OFFERS (for future use)
// ============================================================================

export interface Location {
  id: string
  brandId: string
  name: string
  address?: string
  city?: string
  state?: string
  postalCode?: string
  latitude?: number
  longitude?: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Offer {
  id: string
  brandId: string
  title: string
  description: string
  termsAndConditions?: string
  startDate: Date
  endDate?: Date
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// ============================================================================
// FIREBASE AUTH TYPES (for reference, not actively used in admin)
// ============================================================================

export enum FirebaseAuthProvider {
  PHONE = 'phone',
  EMAIL = 'email',
  GOOGLE = 'google.com',
  FACEBOOK = 'facebook.com'
}

export interface FirebaseUser {
  uid: string
  email?: string
  phoneNumber?: string
  displayName?: string
  photoURL?: string
  emailVerified: boolean
}

// ============================================================================
// ADMIN-SPECIFIC TYPES
// ============================================================================

export interface AdminUser {
  id: string
  email: string
  firstName?: string
  lastName?: string
  role: 'ADMIN' | 'SUPER_ADMIN'
  permissions: string[]
  status: 'ACTIVE' | 'INACTIVE'
  lastLoginAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface AdminLoginRequest {
  email: string
  password: string
}

export interface AdminLoginResponse {
  accessToken: string
  user: AdminUser
}

// ============================================================================
// VALIDATION SCHEMAS (for form validation)
// ============================================================================

import { z } from 'zod'

export const verificationFormSchema = z.object({
  observedAmount: z.number().min(0.01, 'Observed amount must be greater than 0'),
  receiptDate: z.string().min(1, 'Receipt date is required'),
  verificationConfirmed: z.boolean(),
  rejectionNote: z.string().max(1000, 'Rejection note too long').optional(),
  adminNotes: z.string().max(1000, 'Admin notes too long').optional(),
})

