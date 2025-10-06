import { z } from 'zod';

// Dashboard Metrics Schemas
export const userMetricsSchema = z.object({
  totalUsers: z.number().min(0, 'Total users must be non-negative'),
  activeUsers: z.number().min(0, 'Active users must be non-negative'),
  newUsersThisMonth: z.number().min(0, 'New users this month must be non-negative'),
  newUsersThisWeek: z.number().min(0, 'New users this week must be non-negative'),
  userGrowthRate: z.number().min(-100, 'User growth rate must be at least -100%').max(1000, 'User growth rate cannot exceed 1000%'),
  averageUserRetention: z.number().min(0, 'Average user retention must be non-negative').max(100, 'Average user retention cannot exceed 100%'),
  topUserSegments: z.array(z.object({
    segment: z.string().min(1, 'Segment name is required'),
    count: z.number().min(0, 'Segment count must be non-negative'),
    percentage: z.number().min(0, 'Segment percentage must be non-negative').max(100, 'Segment percentage cannot exceed 100%'),
    growthRate: z.number().min(-100, 'Growth rate must be at least -100%').max(1000, 'Growth rate cannot exceed 1000%'),
  })),
});

export const transactionMetricsSchema = z.object({
  totalTransactions: z.number().min(0, 'Total transactions must be non-negative'),
  pendingTransactions: z.number().min(0, 'Pending transactions must be non-negative'),
  approvedTransactions: z.number().min(0, 'Approved transactions must be non-negative'),
  rejectedTransactions: z.number().min(0, 'Rejected transactions must be non-negative'),
  totalCoinsEarned: z.number().min(0, 'Total coins earned must be non-negative'),
  totalCoinsRedeemed: z.number().min(0, 'Total coins redeemed must be non-negative'),
  averageTransactionValue: z.number().min(0, 'Average transaction value must be non-negative'),
  transactionSuccessRate: z.number().min(0, 'Transaction success rate must be non-negative').max(100, 'Transaction success rate cannot exceed 100%'),
  pendingEarnRequests: z.number().min(0, 'Pending earn requests must be non-negative'),
  pendingRedeemRequests: z.number().min(0, 'Pending redeem requests must be non-negative'),
});

export const brandMetricsSchema = z.object({
  totalBrands: z.number().min(0, 'Total brands must be non-negative'),
  activeBrands: z.number().min(0, 'Active brands must be non-negative'),
  topPerformingBrands: z.array(z.object({
    brandId: z.string().uuid('Invalid brand ID format'),
    brandName: z.string().min(1, 'Brand name is required'),
    transactionVolume: z.number().min(0, 'Transaction volume must be non-negative'),
    successRate: z.number().min(0, 'Success rate must be non-negative').max(100, 'Success rate cannot exceed 100%'),
    userEngagement: z.number().min(0, 'User engagement must be non-negative'),
    revenueContribution: z.number().min(0, 'Revenue contribution must be non-negative'),
  })),
  brandEngagementRate: z.number().min(0, 'Brand engagement rate must be non-negative').max(100, 'Brand engagement rate cannot exceed 100%'),
  averageBrandTransactionVolume: z.number().min(0, 'Average brand transaction volume must be non-negative'),
});

export const financialMetricsSchema = z.object({
  totalCoinsInCirculation: z.number().min(0, 'Total coins in circulation must be non-negative'),
  totalLiability: z.number().min(0, 'Total liability must be non-negative'),
  monthlyRevenue: z.number().min(0, 'Monthly revenue must be non-negative'),
  averageRevenuePerUser: z.number().min(0, 'Average revenue per user must be non-negative'),
  coinBreakageRate: z.number().min(0, 'Coin breakage rate must be non-negative').max(100, 'Coin breakage rate cannot exceed 100%'),
  settlementStatus: z.array(z.object({
    brandId: z.string().uuid('Invalid brand ID format'),
    brandName: z.string().min(1, 'Brand name is required'),
    pendingAmount: z.number().min(0, 'Pending amount must be non-negative'),
    lastSettlementDate: z.date().optional(),
    nextSettlementDate: z.date(),
    status: z.enum(['pending', 'processing', 'completed', 'failed']),
  })),
});

export const systemMetricsSchema = z.object({
  systemHealth: z.enum(['healthy', 'warning', 'critical']),
  uptime: z.number().min(0, 'Uptime must be non-negative').max(100, 'Uptime cannot exceed 100%'),
  activeConnections: z.number().min(0, 'Active connections must be non-negative'),
  averageResponseTime: z.number().min(0, 'Average response time must be non-negative'),
  errorRate: z.number().min(0, 'Error rate must be non-negative').max(100, 'Error rate cannot exceed 100%'),
});

export const dashboardMetricsSchema = z.object({
  userMetrics: userMetricsSchema,
  transactionMetrics: transactionMetricsSchema,
  brandMetrics: brandMetricsSchema,
  financialMetrics: financialMetricsSchema,
  systemMetrics: systemMetricsSchema,
});

// Saved Views Schemas
export const savedViewSchema = z.object({
  id: z.string().uuid('Invalid saved view ID format'),
  name: z.string().min(1, 'Saved view name is required').max(100, 'Saved view name too long'),
  filters: z.record(z.any()),
  userId: z.string().uuid('Invalid user ID format'),
  isGlobal: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const createSavedViewSchema = z.object({
  name: z.string().min(1, 'Saved view name is required').max(100, 'Saved view name too long'),
  filters: z.record(z.any()),
  isGlobal: z.boolean().default(false),
});

export const updateSavedViewSchema = z.object({
  name: z.string().min(1, 'Saved view name is required').max(100, 'Saved view name too long').optional(),
  filters: z.record(z.any()).optional(),
  isGlobal: z.boolean().optional(),
});

// Risk Signals Schemas
export const riskSignalSchema = z.object({
  id: z.string().uuid('Invalid risk signal ID format'),
  type: z.enum(['ANOMALY', 'SUSPICIOUS', 'BLOCKLIST']),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  userId: z.string().uuid('Invalid user ID format').optional(),
  transactionId: z.string().uuid('Invalid transaction ID format').optional(),
  brandId: z.string().uuid('Invalid brand ID format').optional(),
  description: z.string().min(1, 'Description is required').max(1000, 'Description too long'),
  metadata: z.record(z.any()),
  status: z.enum(['OPEN', 'INVESTIGATING', 'RESOLVED', 'FALSE_POSITIVE']),
  createdAt: z.date(),
  resolvedAt: z.date().optional(),
  resolvedBy: z.string().uuid('Invalid admin ID format').optional(),
});

export const createRiskSignalSchema = z.object({
  type: z.enum(['ANOMALY', 'SUSPICIOUS', 'BLOCKLIST']),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  userId: z.string().uuid('Invalid user ID format').optional(),
  transactionId: z.string().uuid('Invalid transaction ID format').optional(),
  brandId: z.string().uuid('Invalid brand ID format').optional(),
  description: z.string().min(1, 'Description is required').max(1000, 'Description too long'),
  metadata: z.record(z.any()).optional(),
});

export const updateRiskSignalSchema = z.object({
  status: z.enum(['OPEN', 'INVESTIGATING', 'RESOLVED', 'FALSE_POSITIVE']).optional(),
  description: z.string().min(1, 'Description is required').max(1000, 'Description too long').optional(),
  metadata: z.record(z.any()).optional(),
});

// Dashboard Widget Schemas
export const dashboardWidgetSchema = z.object({
  id: z.string().uuid('Invalid widget ID format'),
  type: z.enum(['KPI', 'CHART', 'TABLE', 'ALERT']),
  title: z.string().min(1, 'Widget title is required').max(100, 'Widget title too long'),
  position: z.object({
    x: z.number().min(0, 'X position must be non-negative'),
    y: z.number().min(0, 'Y position must be non-negative'),
    width: z.number().min(1, 'Width must be at least 1').max(12, 'Width cannot exceed 12'),
    height: z.number().min(1, 'Height must be at least 1').max(12, 'Height cannot exceed 12'),
  }),
  config: z.record(z.any()),
  isVisible: z.boolean(),
  refreshInterval: z.number().min(0, 'Refresh interval must be non-negative').optional(),
});

export const dashboardLayoutSchema = z.object({
  id: z.string().uuid('Invalid layout ID format'),
  name: z.string().min(1, 'Layout name is required').max(100, 'Layout name too long'),
  userId: z.string().uuid('Invalid user ID format'),
  isDefault: z.boolean(),
  widgets: z.array(dashboardWidgetSchema),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Audit Log Schemas
export const auditLogSchema = z.object({
  id: z.string().uuid('Invalid audit log ID format'),
  userId: z.string().uuid('Invalid user ID format'),
  action: z.string().min(1, 'Action is required').max(100, 'Action too long'),
  resource: z.string().min(1, 'Resource is required').max(100, 'Resource too long'),
  resourceId: z.string().uuid('Invalid resource ID format').optional(),
  details: z.record(z.any()),
  ipAddress: z.string().ip('Invalid IP address format').optional(),
  userAgent: z.string().max(500, 'User agent too long').optional(),
  createdAt: z.date(),
});

// Experiment Config Schemas
export const experimentVariantSchema = z.object({
  id: z.string().uuid('Invalid variant ID format'),
  name: z.string().min(1, 'Variant name is required').max(100, 'Variant name too long'),
  weight: z.number().min(0, 'Weight must be non-negative').max(100, 'Weight cannot exceed 100'),
  config: z.record(z.any()),
});

export const experimentConfigSchema = z.object({
  id: z.string().uuid('Invalid experiment ID format'),
  name: z.string().min(1, 'Experiment name is required').max(200, 'Experiment name too long'),
  description: z.string().max(1000, 'Description too long').optional(),
  isActive: z.boolean(),
  variants: z.array(experimentVariantSchema),
  startDate: z.date(),
  endDate: z.date().optional(),
  metrics: z.array(z.string()),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// API Response Schemas
export const dashboardMetricsResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: dashboardMetricsSchema,
  timestamp: z.date(),
  cacheExpiry: z.date(),
});

export const savedViewsResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.array(savedViewSchema),
  total: z.number().min(0, 'Total must be non-negative'),
});

export const riskSignalsResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.array(riskSignalSchema),
  total: z.number().min(0, 'Total must be non-negative'),
  page: z.number().min(1, 'Page must be at least 1'),
  limit: z.number().min(1, 'Limit must be at least 1'),
  totalPages: z.number().min(0, 'Total pages must be non-negative'),
});

// Type exports
export type UserMetrics = z.infer<typeof userMetricsSchema>;
export type TransactionMetrics = z.infer<typeof transactionMetricsSchema>;
export type BrandMetrics = z.infer<typeof brandMetricsSchema>;
export type FinancialMetrics = z.infer<typeof financialMetricsSchema>;
export type SystemMetrics = z.infer<typeof systemMetricsSchema>;
export type DashboardMetrics = z.infer<typeof dashboardMetricsSchema>;
export type SavedView = z.infer<typeof savedViewSchema>;
export type CreateSavedViewRequest = z.infer<typeof createSavedViewSchema>;
export type UpdateSavedViewRequest = z.infer<typeof updateSavedViewSchema>;
export type RiskSignal = z.infer<typeof riskSignalSchema>;
export type CreateRiskSignalRequest = z.infer<typeof createRiskSignalSchema>;
export type UpdateRiskSignalRequest = z.infer<typeof updateRiskSignalSchema>;
export type DashboardWidget = z.infer<typeof dashboardWidgetSchema>;
export type DashboardLayout = z.infer<typeof dashboardLayoutSchema>;
export type AuditLog = z.infer<typeof auditLogSchema>;
export type ExperimentConfig = z.infer<typeof experimentConfigSchema>;
export type ExperimentVariant = z.infer<typeof experimentVariantSchema>;
export type DashboardMetricsResponse = z.infer<typeof dashboardMetricsResponseSchema>;
export type SavedViewsResponse = z.infer<typeof savedViewsResponseSchema>;
export type RiskSignalsResponse = z.infer<typeof riskSignalsResponseSchema>;
