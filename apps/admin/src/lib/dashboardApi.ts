import type { 
  DashboardMetrics,
  SavedView,
  RiskSignal,
  CreateSavedViewRequest,
  UpdateSavedViewRequest,
  CreateRiskSignalRequest,
  UpdateRiskSignalRequest
} from '@/types';
import { getApiBaseUrl } from './env'

// API Response Interfaces
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface RiskAnalyticsResponse {
  totalSignals: number;
  openSignals: number;
  criticalSignals: number;
  averageResolutionTime: string;
  falsePositiveRate: number;
  riskScore: number;
  riskScoreTrend: 'INCREASING' | 'DECREASING' | 'STABLE';
  severityDistribution: Array<{
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    count: number;
    percentage: number;
  }>;
  riskScoreHistory: Array<{
    timestamp: string;
    score: number;
  }>;
}

interface FraudMetricsResponse {
  detectionMetrics: {
    totalTransactions: number;
    flaggedTransactions: number;
    confirmedFraud: number;
    falsePositives: number;
    detectionRate: number;
    falsePositiveRate: number;
    accuracy: number;
  };
  fraudTrends: Array<{
    date: string;
    totalTransactions: number;
    flaggedTransactions: number;
    confirmedFraud: number;
    falsePositives: number;
  }>;
  fraudByType: Array<{
    type: string;
    count: number;
    percentage: number;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  }>;
  fraudByAmount: Array<{
    range: string;
    count: number;
    percentage: number;
    averageAmount: number;
  }>;
  preventionMetrics: {
    totalPrevented: number;
    amountPrevented: number;
    averagePreventionTime: string;
    preventionSuccessRate: number;
  };
  summary: {
    overallRiskScore: number;
    riskTrend: 'INCREASING' | 'DECREASING' | 'STABLE';
    lastFraudAttempt: string;
    activeInvestigations: number;
  };
}

interface BlocklistStatusResponse {
  summary: {
    totalEntries: number;
    activeEntries: number;
    pendingReview: number;
    recentAdditions: number;
    averageAge: string;
  };
  entries: Array<{
    id: string;
    type: 'USER' | 'DEVICE' | 'IP_ADDRESS' | 'EMAIL' | 'PHONE' | 'GEOGRAPHIC';
    value: string;
    reason: string;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    status: 'ACTIVE' | 'INACTIVE' | 'PENDING_REVIEW';
    addedBy: string;
    addedAt: Date;
    expiresAt?: Date;
    metadata: Record<string, any>;
  }>;
  additionsByType: Array<{
    type: string;
    count: number;
    percentage: number;
  }>;
  additionsByRisk: Array<{
    riskLevel: string;
    count: number;
    percentage: number;
  }>;
  additionsOverTime: Array<{
    date: string;
    additions: number;
    removals: number;
    netChange: number;
  }>;
  recentActivity: Array<{
    action: 'ADDED' | 'REMOVED' | 'UPDATED' | 'EXPIRED';
    entry: any;
    timestamp: Date;
    admin: string;
  }>;
}

interface SecurityAlertsResponse {
  summary: {
    totalAlerts: number;
    openAlerts: number;
    criticalAlerts: number;
    resolvedToday: number;
    averageResolutionTime: string;
    lastAlertTime: string;
  };
  alerts: Array<{
    id: string;
    type: 'AUTHENTICATION' | 'DATA_BREACH' | 'NETWORK' | 'MALWARE' | 'AUTHORIZATION' | 'SYSTEM' | 'PHYSICAL';
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    title: string;
    description: string;
    status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'FALSE_POSITIVE';
    source: 'SYSTEM' | 'USER' | 'EXTERNAL' | 'MONITORING';
    affectedResources: string[];
    ipAddress?: string;
    location?: string;
    createdAt: Date;
    updatedAt: Date;
    resolvedAt?: Date;
    resolvedBy?: string;
  }>;
  alertsByType: Array<{
    type: string;
    count: number;
    percentage: number;
    trend: 'INCREASING' | 'DECREASING' | 'STABLE';
  }>;
  alertsOverTime: Array<{
    date: string;
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  }>;
  securityMetrics: {
    threatLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    complianceStatus: 'COMPLIANT' | 'NON_COMPLIANT' | 'PENDING_REVIEW';
    vulnerabilityScore: number;
    incidentResponseTime: string;
  };
}

const API_BASE_URL = getApiBaseUrl()

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('admin_token');
  }
  return null;
}

async function apiRequest<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Add authentication token
  const token = getAuthToken();
  if (token) {
    config.headers = { ...config.headers, Authorization: `Bearer ${token}` };
  }

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const backendMessage = (errorData?.error?.message || errorData?.message);
      const composed = backendMessage || `HTTP ${response.status}`;
      throw new ApiError(response.status, composed);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(0, error instanceof Error ? error.message : 'Network error');
  }
}

// Dashboard API client
export const dashboardApi = {
  // Dashboard Metrics
  getDashboardMetrics: () =>
    apiRequest<{ success: boolean; message: string; data: DashboardMetrics; timestamp: Date; cacheExpiry: Date }>(
      '/admin/dashboard/metrics'
    ),

  getRealTimeMetrics: () =>
    apiRequest<{ success: boolean; message: string; data: DashboardMetrics; timestamp: Date; cacheExpiry: Date }>(
      '/admin/dashboard/metrics/realtime'
    ),

  // Analytics
  getTransactionTrends: (period = '30d') =>
    apiRequest<{ success: boolean; message: string; data: any }>(
      `/admin/dashboard/analytics/transactions/trends?period=${period}`
    ),

  getUserGrowthTrends: (period = '30d') =>
    apiRequest<{ success: boolean; message: string; data: any }>(
      `/admin/dashboard/analytics/users/growth-trends?period=${period}`
    ),

  getUserCohorts: (period = '12m') =>
    apiRequest<{ success: boolean; message: string; data: any }>(
      `/admin/dashboard/analytics/users/cohorts?period=${period}`
    ),

  getBrandPerformance: (period = '30d') =>
    apiRequest<{ success: boolean; message: string; data: any }>(
      `/admin/dashboard/analytics/brands/performance?period=${period}`
    ),

  getFinancialSettlement: () =>
    apiRequest<{ success: boolean; message: string; data: any }>(
      '/admin/dashboard/analytics/financial/settlement'
    ),

  // Saved Views
  getSavedViews: () =>
    apiRequest<{ success: boolean; message: string; data: SavedView[]; total: number }>(
      '/admin/dashboard/saved-views'
    ),

  createSavedView: (data: CreateSavedViewRequest) =>
    apiRequest<{ success: boolean; message: string; data: SavedView }>(
      '/admin/dashboard/saved-views',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    ),

  updateSavedView: (id: string, data: UpdateSavedViewRequest) =>
    apiRequest<{ success: boolean; message: string; data: SavedView }>(
      `/admin/dashboard/saved-views/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    ),

  deleteSavedView: (id: string) =>
    apiRequest<void>(
      `/admin/dashboard/saved-views/${id}`,
      {
        method: 'DELETE',
      }
    ),

  // Risk Signals
  getRiskSignals: (page = 1, limit = 20, filters?: any) => {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters,
    });
    
    return apiRequest<PaginatedResponse<RiskSignal>>(
      `/admin/dashboard/risk/signals?${queryParams}`
    );
  },

  createRiskSignal: (data: CreateRiskSignalRequest) =>
    apiRequest<ApiResponse<RiskSignal>>(
      '/admin/dashboard/risk/signals',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    ),

  resolveRiskSignal: (id: string, data: UpdateRiskSignalRequest) =>
    apiRequest<ApiResponse<RiskSignal>>(
      `/admin/dashboard/risk/signals/${id}/resolve`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    ),

  getRiskAnalytics: () =>
    apiRequest<ApiResponse<RiskAnalyticsResponse>>(
      '/admin/dashboard/risk/analytics'
    ),

  // Phase 4: Fraud & Security placeholder endpoints
  getFraudMetrics: (params?: { period?: string }) =>
    apiRequest<ApiResponse<FraudMetricsResponse>>(
      `/admin/dashboard/fraud/metrics${params?.period ? `?period=${params.period}` : ''}`
    ),

  getBlocklistStatus: (filters?: any) => {
    const query = new URLSearchParams(filters || {})
    return apiRequest<ApiResponse<BlocklistStatusResponse>>(
      `/admin/dashboard/security/blocklist${query.toString() ? `?${query.toString()}` : ''}`
    )
  },

  getSecurityAlerts: (filters?: any) => {
    const query = new URLSearchParams(filters || {})
    return apiRequest<ApiResponse<SecurityAlertsResponse>>(
      `/admin/dashboard/security/alerts${query.toString() ? `?${query.toString()}` : ''}`
    )
  },

  // System Health
  getSystemHealth: () =>
    apiRequest<{ success: boolean; message: string; data: any }>(
      '/admin/dashboard/system/health'
    ),

  getSystemPerformance: () =>
    apiRequest<{ success: boolean; message: string; data: any }>(
      '/admin/dashboard/system/performance'
    ),

  // Experiments
  getActiveExperiments: () =>
    apiRequest<{ success: boolean; message: string; data: any[] }>(
      '/admin/dashboard/experiments'
    ),
};

// Dashboard utilities
export const dashboardUtils = {
  // Format large numbers for display
  formatNumber: (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  },

  // Format currency
  formatCurrency: (amount: number, currency = 'INR'): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  },

  // Format percentage
  formatPercentage: (value: number, decimals = 1): string => {
    return `${value.toFixed(decimals)}%`;
  },

  // Get color based on status
  getStatusColor: (status: string): string => {
    switch (status.toLowerCase()) {
      case 'healthy':
      case 'approved':
      case 'completed':
        return 'text-green-600';
      case 'warning':
      case 'pending':
        return 'text-yellow-600';
      case 'critical':
      case 'rejected':
      case 'failed':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  },

  // Get background color based on status
  getStatusBgColor: (status: string): string => {
    switch (status.toLowerCase()) {
      case 'healthy':
      case 'approved':
      case 'completed':
        return 'bg-green-100';
      case 'warning':
      case 'pending':
        return 'bg-yellow-100';
      case 'critical':
      case 'rejected':
      case 'failed':
        return 'bg-red-100';
      default:
        return 'bg-gray-100';
    }
  },

  // Calculate time ago
  getTimeAgo: (date: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return `${diffInSeconds}s ago`;
    }
    if (diffInSeconds < 3600) {
      return `${Math.floor(diffInSeconds / 60)}m ago`;
    }
    if (diffInSeconds < 86400) {
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    }
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  },

  // Debounce function for API calls
  debounce: <T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  },

  // Throttle function for API calls
  throttle: <T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): ((...args: Parameters<T>) => void) => {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  },
};
