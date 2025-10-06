import { useState, useEffect, useCallback, useRef } from 'react';
import { dashboardApi } from '@/lib/dashboardApi';
import type { DashboardMetrics } from '@/types';

interface UseDashboardMetricsOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
  enableCache?: boolean;
  onError?: (error: Error) => void;
}

interface UseDashboardMetricsReturn {
  metrics: DashboardMetrics | null;
  isLoading: boolean;
  error: Error | null;
  lastUpdated: Date | null;
  cacheExpiry: Date | null;
  refresh: () => Promise<void>;
  refreshRealTime: () => Promise<void>;
  isRefreshing: boolean;
}

export function useDashboardMetrics(options: UseDashboardMetricsOptions = {}): UseDashboardMetricsReturn {
  const {
    autoRefresh = true,
    refreshInterval = 5 * 60 * 1000, // 5 minutes
    enableCache = true,
    onError,
  } = options;

  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [cacheExpiry, setCacheExpiry] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchMetrics = useCallback(async (useRealTime = false) => {
    try {
      setIsRefreshing(true);
      setError(null);

      // Cancel any ongoing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();

      const response = useRealTime 
        ? await dashboardApi.getRealTimeMetrics()
        : await dashboardApi.getDashboardMetrics();

      if (response.success) {
        setMetrics(response.data);
        setLastUpdated(new Date(response.timestamp));
        setCacheExpiry(new Date(response.cacheExpiry));
      } else {
        throw new Error(response.message || 'Failed to fetch dashboard metrics');
      }
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        const error = err instanceof Error ? err : new Error('Unknown error occurred');
        setError(error);
        onError?.(error);
      }
    } finally {
      setIsRefreshing(false);
      setIsLoading(false);
    }
  }, [onError]);

  const refresh = useCallback(async () => {
    await fetchMetrics(false);
  }, [fetchMetrics]);

  const refreshRealTime = useCallback(async () => {
    await fetchMetrics(true);
  }, [fetchMetrics]);

  // Initial fetch
  useEffect(() => {
    fetchMetrics(false);
  }, [fetchMetrics]);

  // Auto-refresh setup
  useEffect(() => {
    if (!autoRefresh || !enableCache) return;

    const setupInterval = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      intervalRef.current = setInterval(() => {
        // Check if cache has expired
        if (cacheExpiry && new Date() > cacheExpiry) {
          refresh();
        }
      }, refreshInterval);
    };

    setupInterval();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoRefresh, enableCache, refreshInterval, cacheExpiry, refresh]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // WebSocket integration for real-time updates
  useEffect(() => {
    // This would integrate with the existing WebSocket setup
    // For now, we'll rely on the auto-refresh mechanism
  }, []);

  return {
    metrics,
    isLoading,
    error,
    lastUpdated,
    cacheExpiry,
    refresh,
    refreshRealTime,
    isRefreshing,
  };
}

// Specialized hooks for specific metric types
export function useUserMetrics(options?: UseDashboardMetricsOptions) {
  const { metrics, ...rest } = useDashboardMetrics(options);
  return {
    userMetrics: metrics?.userMetrics || null,
    ...rest,
  };
}

export function useTransactionMetrics(options?: UseDashboardMetricsOptions) {
  const { metrics, ...rest } = useDashboardMetrics(options);
  return {
    transactionMetrics: metrics?.transactionMetrics || null,
    ...rest,
  };
}

export function useBrandMetrics(options?: UseDashboardMetricsOptions) {
  const { metrics, ...rest } = useDashboardMetrics(options);
  return {
    brandMetrics: metrics?.brandMetrics || null,
    ...rest,
  };
}

export function useFinancialMetrics(options?: UseDashboardMetricsOptions) {
  const { metrics, ...rest } = useDashboardMetrics(options);
  return {
    financialMetrics: metrics?.financialMetrics || null,
    ...rest,
  };
}

export function useSystemMetrics(options?: UseDashboardMetricsOptions) {
  const { metrics, ...rest } = useDashboardMetrics(options);
  return {
    systemMetrics: metrics?.systemMetrics || null,
    ...rest,
  };
}
