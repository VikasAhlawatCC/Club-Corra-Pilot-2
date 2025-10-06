// Admin-specific dashboard types that extend local entity types
import type {
  DashboardMetrics,
  UserMetrics,
  TransactionMetrics,
  BrandMetrics,
  FinancialMetrics,
  SystemMetrics,
  SavedView,
  RiskSignal,
  FilterState,
  DashboardWidget,
  DashboardLayout,
  AuditLog,
  ExperimentConfig
} from './entities';

// Extended admin dashboard types
export interface AdminDashboardMetrics extends DashboardMetrics {
  // Additional admin-specific metrics
  adminActions: AdminActionMetrics;
  systemAlerts: SystemAlert[];
  quickActions: QuickAction[];
}

export interface AdminActionMetrics {
  totalActions: number;
  actionsToday: number;
  pendingApprovals: number;
  recentActivity: AdminActivity[];
}

export interface AdminActivity {
  id: string;
  adminName: string;
  action: string;
  resource: string;
  timestamp: Date;
  details: Record<string, any>;
}

export interface SystemAlert {
  id: string;
  type: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
  title: string;
  message: string;
  timestamp: Date;
  isAcknowledged: boolean;
  requiresAction: boolean;
}

export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  action: string;
  isEnabled: boolean;
  requiresConfirmation: boolean;
}

// Dashboard widget configuration for admin
export interface AdminDashboardWidget extends DashboardWidget {
  adminPermissions: string[];
  refreshInterval: number;
  isCollapsible: boolean;
  showInMobile: boolean;
}

// Admin dashboard layout with role-based access
export interface AdminDashboardLayout extends DashboardLayout {
  role: 'ADMIN' | 'SUPER_ADMIN' | 'SUPPORT';
  permissions: string[];
  isCustomizable: boolean;
}

// Enhanced filter state for admin dashboard
export interface AdminFilterState extends FilterState {
  adminId: string;
  role: string;
  permissions: string[];
  savedViewId?: string;
  isGlobal: boolean;
}

// Dashboard performance metrics
export interface DashboardPerformanceMetrics {
  loadTime: number;
  renderTime: number;
  dataFetchTime: number;
  cacheHitRate: number;
  errorRate: number;
  lastUpdated: Date;
}

// Real-time dashboard updates
export interface DashboardUpdate {
  type: 'METRICS' | 'ALERT' | 'ACTIVITY' | 'SYSTEM_STATUS';
  data: any;
  timestamp: Date;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

// Dashboard export options
export interface DashboardExportOptions {
  format: 'PDF' | 'CSV' | 'EXCEL' | 'JSON';
  includeCharts: boolean;
  includeData: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
  filters?: Record<string, any>;
}

// Dashboard sharing and collaboration
export interface DashboardShare {
  id: string;
  dashboardId: string;
  sharedWith: string[];
  permissions: 'VIEW' | 'EDIT' | 'ADMIN';
  expiresAt?: Date;
  createdAt: Date;
  createdBy: string;
}

// Dashboard notification preferences
export interface DashboardNotificationPreferences {
  userId: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  alertThresholds: {
    criticalAlerts: boolean;
    systemDown: boolean;
    highRiskSignals: boolean;
    pendingApprovals: boolean;
  };
  frequency: 'IMMEDIATE' | 'HOURLY' | 'DAILY' | 'WEEKLY';
}

// Dashboard audit trail
export interface DashboardAuditTrail {
  id: string;
  dashboardId: string;
  userId: string;
  action: 'VIEW' | 'EDIT' | 'EXPORT' | 'SHARE' | 'DELETE';
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
  details: Record<string, any>;
}

// Dashboard backup and restore
export interface DashboardBackup {
  id: string;
  dashboardId: string;
  version: string;
  data: any;
  createdAt: Date;
  createdBy: string;
  description?: string;
  isAutoBackup: boolean;
}

// Dashboard template
export interface DashboardTemplate {
  id: string;
  name: string;
  description: string;
  category: 'GENERAL' | 'FINANCIAL' | 'OPERATIONS' | 'SECURITY' | 'CUSTOM';
  widgets: AdminDashboardWidget[];
  layout: AdminDashboardLayout;
  isPublic: boolean;
  createdBy: string;
  createdAt: Date;
  usageCount: number;
  rating: number;
}

// Dashboard insights and recommendations
export interface DashboardInsight {
  id: string;
  type: 'PERFORMANCE' | 'SECURITY' | 'EFFICIENCY' | 'REVENUE' | 'USER_EXPERIENCE';
  title: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  impact: string;
  recommendation: string;
  estimatedEffort: string;
  priority: number;
  isImplemented: boolean;
  createdAt: Date;
  expiresAt?: Date;
}

// Dashboard health check
export interface DashboardHealthCheck {
  status: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY';
  checks: {
    database: boolean;
    cache: boolean;
    externalApis: boolean;
    websocket: boolean;
    fileStorage: boolean;
  };
  lastCheck: Date;
  nextCheck: Date;
  issues: string[];
  recommendations: string[];
}
