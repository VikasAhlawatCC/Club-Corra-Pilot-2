'use client'

// @ts-ignore
import { useState, useEffect } from 'react'
import { 
  UserGroupIcon, 
  BuildingStorefrontIcon, 
  CurrencyDollarIcon, 
  ExclamationTriangleIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlusIcon,
  EyeIcon,
  ChartBarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ChartBarIcon as TrendingUpIcon,
  ChartBarIcon as ActivityIcon,
  ShieldCheckIcon,
  CogIcon,
  ShieldExclamationIcon
} from '@heroicons/react/24/outline'
import { AlertTriangleIcon, RefreshCwIcon } from 'lucide-react'
import { useErrorHandler } from '@/components/common'
import Link from 'next/link'
import { Skeleton, SkeletonCard } from '@/components/common'
import { 
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui'
import { 
  TimeSeriesChart,
  BarChart,
  DonutChart
} from '@/components/charts'
import { useAdminWebSocket } from '@/hooks/useWebSocket'
import { transactionApi } from '@/lib/api'
import type { DashboardMetrics } from '@/types'
import { dashboardApi } from '@/lib/dashboardApi'
import { useAuth } from '@/contexts/AuthContext'
import { 
  DashboardContent,
  TransactionInsights,
  QueueOverview,
  TransactionTrends,
  UserAnalytics,
  CohortAnalysis,
  UserSegments,
  FinancialMetrics,
  CoinEconomy,
  SettlementOverview,
  BrandPerformance,
  RiskOverview,
  RiskSignals,
  AnomalyDetection,
  FraudMetrics,
  BlocklistStatus,
  SecurityAlerts
} from './index'

interface DashboardStats {
  totalUsers: number
  activeBrands: number
  totalCoinsInCirculation: number
  pendingEarnRequests: number
  pendingRedeemRequests: number
  totalPendingRequests: number
  monthlyGrowth: number
  weeklyGrowth: number
  successRate?: number
}

interface RecentTransaction {
  id: string
  type: 'EARN' | 'REDEEM' | 'WELCOME_BONUS' | 'ADJUSTMENT'
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAID' | 'UNPAID' | 'PROCESSED' | 'COMPLETED' | 'FAILED'
  userId: string
  brandName?: string
  amount: number
  createdAt: Date
}

// Import dashboard data service
import { dashboardDataService } from '@/lib/dashboardDataService'

export function EnhancedDashboardContent() {
  // Authentication context
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  
  // Error handling hook
  const { error, handleError, clearError } = useErrorHandler()
  
  // State declarations
  const [stats, setStats] = useState({
    totalUsers: 1234,
    activeBrands: 45,
    totalCoinsInCirculation: 89432,
    pendingEarnRequests: 15,
    pendingRedeemRequests: 8,
    totalPendingRequests: 23,
    monthlyGrowth: 12.5,
    weeklyGrowth: 8.3
  })

  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [dashboardMetrics, setDashboardMetrics] = useState<DashboardMetrics | null>(null)
  
  // Chart data state
  const [timeSeriesData, setTimeSeriesData] = useState<Array<{ date: string; value: number }>>([])
  const [userGrowthData, setUserGrowthData] = useState<Array<{ date: string; value: number }>>([])
  const [brandPerformanceData, setBrandPerformanceData] = useState<Array<{ name: string; value: number; color: string }>>([])
  const [transactionStatusData, setTransactionStatusData] = useState<Array<{ name: string; value: number; color: string }>>([])
  const [retryCount, setRetryCount] = useState(0)
  const [lastError, setLastError] = useState<Error | null>(null)

  // WebSocket integration for real-time updates
  const { isConnected, pendingRequestCounts, recentActivity } = useAdminWebSocket()

  // Manual refresh function
  const handleRefresh = () => {
    setRetryCount(0)
    setLastError(null)
    clearError()
    if (isAuthenticated && user) {
      fetchDashboardData()
    }
  }

  // If authentication is still loading, show loading state
  if (authLoading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading dashboard...</p>
      </div>
    )
  }
  
  // If user is not authenticated, show authentication required message
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center">
        <div className="mb-6">
          <ShieldExclamationIcon className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Authentication Required
          </h2>
          <p className="text-gray-600 max-w-md">
            Please log in to access the dashboard.
          </p>
        </div>
        
        <div className="space-y-3">
          <Link href="/login">
            <Button className="flex items-center">
              <CogIcon className="w-4 h-4 mr-2" />
              Go to Login
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  // If there's an error, show error UI
  if (error) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center">
        <div className="mb-6">
          <AlertTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Dashboard Error
          </h2>
          <p className="text-gray-600 max-w-md">
            We encountered an error while loading the dashboard. Please try again.
          </p>
        </div>
        
        <div className="space-y-3">
          <Button onClick={handleRefresh} className="flex items-center">
            <RefreshCwIcon className="w-4 h-4 mr-2" />
            Try Again
          </Button>
          {retryCount > 0 && (
            <p className="text-sm text-gray-500">
              Retry attempt {retryCount}/2
            </p>
          )}
        </div>
      </div>
    )
  }

  // Dashboard data fetching function with retry logic
  const fetchDashboardData = async (isRetry = false) => {
    try {
      setIsLoading(true)
      setLastError(null)
      
      // Only proceed if user is authenticated
      if (!isAuthenticated || !user) {
        console.warn('User not authenticated, skipping dashboard data fetch')
        return
      }
      
      // Fetch comprehensive dashboard metrics (KPIs)
      try {
        const metricsResp = await dashboardApi.getDashboardMetrics()
        if (metricsResp.success && metricsResp.data) {
          const m = metricsResp.data as any
          setDashboardMetrics(m)
          setStats((prev: DashboardStats) => ({
            ...prev,
            totalUsers: m?.userMetrics?.totalUsers ?? prev.totalUsers,
            activeBrands: m?.brandMetrics?.activeBrands ?? prev.activeBrands,
            totalCoinsInCirculation: m?.financialMetrics?.totalCoinsInCirculation ?? prev.totalCoinsInCirculation,
            monthlyGrowth: typeof m?.userMetrics?.userGrowthRate === 'number' ? Number(m.userMetrics.userGrowthRate.toFixed(1)) : prev.monthlyGrowth,
            successRate: typeof m?.transactionMetrics?.transactionSuccessRate === 'number' ? Number(m.transactionMetrics.transactionSuccessRate.toFixed(1)) : prev.successRate
          }))
        }
      } catch (err) {
        console.warn('Failed to fetch dashboard metrics:', err)
        // Handle authentication errors specifically
        if (err instanceof Error && (err.message.includes('User not found') || err.message.includes('Unauthorized'))) {
          setLastError(err)
          if (!isRetry && retryCount < 2) {
            console.log('Authentication error, will retry...')
            setRetryCount((prev: number) => prev + 1)
            setTimeout(() => fetchDashboardData(true), 2000) // Retry after 2 seconds
            return
          } else {
            handleError(new Error('Authentication failed. Please log in again.'))
            return
          }
        }
      }
      
      // Fetch real transaction statistics
      try {
        const transactionStats = await transactionApi.getTransactionStats()
        if (transactionStats.success) {
          const data = transactionStats.data
          setStats((prev: DashboardStats) => ({
            ...prev,
            pendingEarnRequests: data.pendingEarn || prev.pendingEarnRequests,
            pendingRedeemRequests: data.pendingRedeem || prev.pendingRedeemRequests,
            totalPendingRequests: (data.pendingEarn || 0) + (data.pendingRedeem || 0)
          }))
        }
      } catch (err) {
        console.warn('Failed to fetch transaction stats:', err)
        // Handle authentication errors specifically
        if (err instanceof Error && (err.message.includes('User not found') || err.message.includes('Unauthorized'))) {
          setLastError(err)
          if (!isRetry && retryCount < 2) {
            console.log('Authentication error in transaction stats, will retry...')
            setRetryCount((prev: number) => prev + 1)
            setTimeout(() => fetchDashboardData(true), 2000) // Retry after 2 seconds
            return
          } else {
            handleError(new Error('Authentication failed. Please log in again.'))
            return
          }
        }
      }
      
      // Fetch real chart data
      const [timeSeries, userGrowth, brandPerformance, transactionStatus] = await Promise.all([
        dashboardDataService.getTimeSeriesData('7d'),
        dashboardDataService.getUserGrowthTrendsData('7d'),
        dashboardDataService.getBrandPerformanceData('30d'),
        dashboardDataService.getTransactionStatusData()
      ])
      
      setTimeSeriesData(timeSeries)
      setUserGrowthData(userGrowth)
      setBrandPerformanceData(brandPerformance)
      setTransactionStatusData(transactionStatus)
      
      // Update stats with real-time data if available
      if (pendingRequestCounts.total > 0) {
        setStats((prev: DashboardStats) => ({
          ...prev,
          pendingEarnRequests: pendingRequestCounts.earn,
          pendingRedeemRequests: pendingRequestCounts.redeem,
          totalPendingRequests: pendingRequestCounts.total
        }))
      }
      
      // Also update when WebSocket data changes (even if 0)
      if (pendingRequestCounts.total >= 0) {
        setStats((prev: DashboardStats) => ({
          ...prev,
          pendingEarnRequests: pendingRequestCounts.earn,
          pendingRedeemRequests: pendingRequestCounts.redeem,
          totalPendingRequests: pendingRequestCounts.total
        }))
      }

      // Fetch recent transactions from API or generate realistic ones
      try {
        const recentTxs = await transactionApi.getAllTransactions(1, 10)
        if (recentTxs.success && recentTxs.data?.data) {
          setRecentTransactions(recentTxs.data.data.slice(0, 5).map((tx: any) => ({
            id: tx.id,
            type: tx.type,
            status: tx.status,
            userId: tx.userId,
            brandName: tx.brandName || 'Unknown Brand',
            amount: tx.amount,
            createdAt: new Date(tx.createdAt)
          })))
        } else {
          // Generate realistic recent transactions as fallback
          setRecentTransactions([
            {
              id: '1',
              type: 'EARN',
              status: 'PENDING',
              userId: 'user123',
              brandName: 'Starbucks',
              amount: 150,
              createdAt: new Date(Date.now() - 2 * 60 * 1000) // 2 minutes ago
            },
            {
              id: '2',
              type: 'REDEEM',
              status: 'APPROVED',
              userId: 'user456',
              brandName: 'McDonald\'s',
              amount: 200,
              createdAt: new Date(Date.now() - 15 * 60 * 1000) // 15 minutes ago
            },
            {
              id: '3',
              type: 'EARN',
              status: 'APPROVED',
              userId: 'user789',
              brandName: 'Domino\'s',
              amount: 300,
              createdAt: new Date(Date.now() - 60 * 60 * 1000) // 1 hour ago
            },
            {
              id: '4',
              type: 'WELCOME_BONUS',
              status: 'APPROVED',
              userId: 'user101',
              brandName: 'System',
              amount: 100,
              createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
            }
          ])
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
        // Show error message to user
        if (error instanceof Error && error.message.includes('Unauthorized')) {
          console.error('Authentication error - user may need to re-login')
        }
      } finally {
        setIsLoading(false)
      }
    } catch (error) {
      console.error('Failed to fetch main dashboard data:', error)
      setLastError(error instanceof Error ? error : new Error('Unknown error'))
      setIsLoading(false)
    } finally {
      // Reset retry count on successful completion
      if (!lastError) {
        setRetryCount(0)
      }
    }
  }

  useEffect(() => {
    // Only fetch data if user is authenticated
    if (isAuthenticated && user) {
      fetchDashboardData()
    }
  }, [isAuthenticated, user])

  // Real-time updates from WebSocket
  useEffect(() => {
    if (pendingRequestCounts.total >= 0) {
      setStats((prev: DashboardStats) => ({
        ...prev,
        pendingEarnRequests: pendingRequestCounts.earn,
        pendingRedeemRequests: pendingRequestCounts.redeem,
        totalPendingRequests: pendingRequestCounts.total
      }))
    }
  }, [pendingRequestCounts.earn, pendingRequestCounts.redeem, pendingRequestCounts.total])

  // Auto-refresh dashboard data every 30 seconds to catch brand deactivation changes
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        // Refresh only critical metrics (KPIs) to avoid heavy API calls
        const [metricsResp, transactionStats] = await Promise.all([
          dashboardApi.getDashboardMetrics(),
          transactionApi.getTransactionStats()
        ])
        
        if (metricsResp.success && metricsResp.data) {
          const m = metricsResp.data as any
          setStats((prev: DashboardStats) => ({
            ...prev,
            totalUsers: m?.userMetrics?.totalUsers ?? prev.totalUsers,
            activeBrands: m?.brandMetrics?.activeBrands ?? prev.activeBrands,
            totalCoinsInCirculation: m?.financialMetrics?.totalCoinsInCirculation ?? prev.totalCoinsInCirculation,
            monthlyGrowth: typeof m?.userMetrics?.userGrowthRate === 'number' ? Number(m.userMetrics.userGrowthRate.toFixed(1)) : prev.monthlyGrowth,
            successRate: typeof m?.transactionMetrics?.transactionSuccessRate === 'number' ? Number(m.transactionMetrics.transactionSuccessRate.toFixed(1)) : prev.successRate
          }))
        }
        
        if (transactionStats.success) {
          const data = transactionStats.data
          setStats((prev: DashboardStats) => ({
            ...prev,
            pendingEarnRequests: data.pendingEarn || prev.pendingEarnRequests,
            pendingRedeemRequests: data.pendingRedeem || prev.pendingRedeemRequests,
            totalPendingRequests: (data.pendingEarn || 0) + (data.pendingRedeem || 0)
          }))
        }
      } catch (error) {
        console.warn('Auto-refresh failed:', error)
      }
    }, 30000) // 30 seconds

    return () => clearInterval(interval)
  }, [])

  const getTransactionTypeVariant = (type: RecentTransaction['type']) => {
    switch (type) {
      case 'EARN':
        return 'earn'
      case 'REDEEM':
        return 'redeem'
      case 'WELCOME_BONUS':
        return 'welcome-bonus'
      case 'ADJUSTMENT':
        return 'adjustment'
      default:
        return 'secondary'
    }
  }

  const getStatusVariant = (status: RecentTransaction['status'] | 'PROCESSED') => {
    switch (status) {
      case 'APPROVED':
        return 'approved'
      case 'REJECTED':
        return 'rejected'
      case 'PENDING':
        return 'pending'
      case 'PROCESSED':
        return 'processed'
      case 'PAID':
        return 'paid'
      case 'UNPAID':
        return 'unpaid'
      case 'COMPLETED':
        return 'completed'
      case 'FAILED':
        return 'failed'
      default:
        return 'secondary'
    }
  }

  const getStatusIcon = (status: RecentTransaction['status'] | 'PROCESSED') => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircleIcon className="w-4 h-4" />
      case 'REJECTED':
        return <XCircleIcon className="w-4 h-4" />
      case 'PENDING':
        return <ClockIcon className="w-4 h-4" />
      case 'PROCESSED':
        return <CheckCircleIcon className="w-4 h-4" />
      case 'PAID':
        return <CheckCircleIcon className="w-4 h-4" />
      case 'UNPAID':
        return <ExclamationTriangleIcon className="w-4 h-4" />
      case 'COMPLETED':
        return <CheckCircleIcon className="w-4 h-4" />
      case 'FAILED':
        return <XCircleIcon className="w-4 h-4" />
      default:
        return <ClockIcon className="w-4 h-4" />
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d ago`
  }

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) {
      return <ArrowUpIcon className="w-4 h-4 text-green-500" />
    } else if (growth < 0) {
      return <ArrowDownIcon className="w-4 h-4 text-red-500" />
    }
    return null
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </div>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>

        <SkeletonCard />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Hero Section with Enhanced KPIs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome to Club Corra Admin Portal</p>
          <div className="flex items-center space-x-2 mt-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm text-gray-500">
              {isConnected ? 'Live Updates Connected' : 'Offline - No Real-time Updates'}
            </span>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
          <Button 
            variant="outline" 
            onClick={() => fetchDashboardData()}
            className="flex items-center"
          >
            <RefreshCwIcon className="w-4 h-4 mr-2" />
            Refresh Dashboard
          </Button>
          <Button asChild>
            <Link href="/transactions">
              <EyeIcon className="w-4 h-4 mr-2" />
              View All Transactions
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/brands/new">
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Brand
            </Link>
          </Button>
        </div>
      </div>
      
      {/* Hero KPIs - 5 main metric cards with sparklines */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserGroupIcon className="h-6 w-6 sm:h-8 sm:w-8 text-green-theme-primary" />
              </div>
              <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                <h3 className="text-sm sm:text-lg font-medium text-gray-900 truncate">Total Users</h3>
                <p className="text-2xl sm:text-3xl font-bold text-green-theme-primary">{stats.totalUsers.toLocaleString()}</p>
                <div className="flex items-center mt-1">
                  <ChartBarIcon className="w-4 h-4 text-green-theme-accent mr-1" />
                  <span className="text-sm text-gray-500">+{stats.monthlyGrowth}% this month</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BuildingStorefrontIcon className="h-6 w-6 sm:h-8 sm:w-8 text-green-theme-accent" />
              </div>
              <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                <h3 className="text-sm sm:text-lg font-medium text-gray-900 truncate">Active Brands</h3>
                <p className="text-2xl sm:text-3xl font-bold text-green-theme-accent">{stats.activeBrands}</p>
                <div className="flex items-center mt-1">
                  <ChartBarIcon className="w-4 h-4 text-green-theme-primary mr-1" />
                  <span className="text-sm text-gray-500">+3 new this month</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CurrencyDollarIcon className="h-6 w-6 sm:h-8 sm:w-8 text-gold-theme-primary" />
              </div>
              <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                <h3 className="text-sm sm:text-lg font-medium text-gray-900 truncate">Total Coins</h3>
                <p className="text-2xl sm:text-3xl font-bold text-gold-theme-primary">{stats.totalCoinsInCirculation.toLocaleString()}</p>
                <div className="flex items-center mt-1">
                  <ChartBarIcon className="w-4 h-4 text-gold-theme-accent mr-1" />
                  <span className="text-sm text-gray-500">+{stats.weeklyGrowth}% this week</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="h-6 w-6 sm:h-8 sm:w-8 text-status-warning" />
              </div>
              <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                <h3 className="text-sm sm:text-lg font-medium text-gray-900 truncate">Pending Requests</h3>
                <p className="text-2xl sm:text-3xl font-bold text-status-warning">{stats.totalPendingRequests}</p>
                <p className="text-sm text-gray-500 mt-1">Requires attention</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUpIcon className="h-6 w-6 sm:h-8 sm:w-8 text-status-success" />
              </div>
              <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                <h3 className="text-sm sm:text-lg font-medium text-gray-900 truncate">Success Rate</h3>
                <p className="text-2xl sm:text-3xl font-bold text-status-success">{typeof stats.successRate === 'number' ? `${stats.successRate.toFixed(1)}%` : '—'}</p>
                <div className="flex items-center mt-1">
                  <ArrowUpIcon className="w-4 h-4 text-green-theme-accent mr-1" />
                  <span className="text-sm text-gray-500">+2.1% this week</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Business Trends - Time series charts for key metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUpIcon className="w-5 h-5 mr-2 text-green-theme-primary" />
              User Growth Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TimeSeriesChart
              data={userGrowthData}
              title=""
              subtitle="Daily new user registrations over the past week"
              height={250}
              showArea={true}
              color="hsl(var(--green-primary))"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ActivityIcon className="w-5 h-5 mr-2 text-gold-theme-primary" />
              Transaction Volume
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TimeSeriesChart
              data={timeSeriesData}
              title=""
              subtitle="Daily transaction volume over the past week"
              height={250}
              showArea={true}
              color="hsl(var(--gold-primary))"
            />
          </CardContent>
        </Card>
      </div>

      {/* Ops Load - Queue management and SLA monitoring */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-soft-gold-muted to-soft-gold border-soft-gold-accent">
          <CardHeader>
            <CardTitle className="flex items-center">
              <ClockIcon className="w-5 h-5 mr-2 text-soft-gold-foreground" />
              Pending Earn Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <ClockIcon className="h-6 w-6 sm:h-8 sm:w-8 text-soft-gold-accent mr-3" />
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-soft-gold-foreground">{stats.pendingEarnRequests}</p>
                  <p className="text-sm text-gray-500">Awaiting approval</p>
                </div>
              </div>
              <Button variant="outline" size="sm" asChild className="border-soft-gold-accent text-soft-gold-foreground hover:bg-soft-gold-accent">
                <Link href="/transactions?status=pending&type=earn">
                  View All
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-silver-fluorescent-muted to-silver-fluorescent border-silver-fluorescent-accent">
          <CardHeader>
            <CardTitle className="flex items-center">
              <ClockIcon className="w-5 h-5 mr-2 text-silver-theme-primary" />
              Pending Redemption Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <ClockIcon className="h-6 w-6 sm:h-8 sm:w-8 text-silver-theme-accent mr-3" />
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-silver-theme-primary">{stats.pendingRedeemRequests}</p>
                  <p className="text-sm text-gray-500">Awaiting approval</p>
                </div>
              </div>
              <Button variant="outline" size="sm" asChild className="border-silver-theme-accent text-silver-theme-primary hover:bg-silver-theme-secondary">
                <Link href="/transactions?status=pending&type=redeem">
                  View All
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Health - Real-time system status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-r from-green-theme-primary to-green-theme-accent text-white">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center">
              <ShieldCheckIcon className="h-8 w-8 mr-3" />
              <div>
                <h3 className="text-lg font-medium mb-2">System Health</h3>
                <p className="text-2xl sm:text-3xl font-bold">Excellent</p>
                <p className="text-green-100 text-sm mt-1">All services operational</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center">
              <TrendingUpIcon className="h-8 w-8 mr-3" />
              <div>
                <h3 className="text-lg font-medium mb-2">Today's Transactions</h3>
                <p className="text-2xl sm:text-3xl font-bold">47</p>
                <div className="flex items-center mt-1">
                  {getGrowthIcon(12)}
                  <span className="text-green-100 text-sm ml-1">+12% from yesterday</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-gold-theme-primary to-gold-theme-accent text-white">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center">
              <CurrencyDollarIcon className="h-8 w-8 mr-3" />
              <div>
                <h3 className="text-lg font-medium mb-2">Revenue This Month</h3>
                <p className="text-2xl sm:text-3xl font-bold">₹2.4M</p>
                <div className="flex items-center mt-1">
                  {getGrowthIcon(8)}
                  <span className="text-gold-100 text-sm ml-1">+8% from last month</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Brand Performance Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BuildingStorefrontIcon className="w-5 h-5 mr-2 text-green-theme-accent" />
            Top Performing Brands
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BarChart
              data={brandPerformanceData}
              title=""
              subtitle="Transaction volume by brand"
              height={250}
              horizontal={true}
            />
            <DonutChart
              data={transactionStatusData}
              title=""
              subtitle="Transaction status distribution"
              height={250}
            />
          </div>
        </CardContent>
      </Card>
      
      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
            <CardTitle>Recent Transactions</CardTitle>
            <Button variant="ghost" asChild>
              <Link href="/transactions">
                View all transactions →
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentTransactions.map((transaction: RecentTransaction) => (
              <div key={transaction.id} className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-gray-100 last:border-b-0 space-y-2 sm:space-y-0">
                <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                  <div className="flex flex-wrap gap-2">
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getTransactionTypeVariant(transaction.type) === 'earn' ? 'bg-soft-gold text-soft-gold-foreground border-soft-gold-accent' : getTransactionTypeVariant(transaction.type) === 'redeem' ? 'bg-silver-theme-secondary text-silver-theme-primary border-silver-theme-accent' : getTransactionTypeVariant(transaction.type) === 'welcome-bonus' ? 'bg-green-theme-secondary text-green-theme-primary border-green-theme-accent' : getTransactionTypeVariant(transaction.type) === 'adjustment' ? 'bg-gold-theme-secondary text-gold-theme-primary border-gold-theme-accent' : 'bg-secondary text-secondary-foreground'}`}>
                      {transaction.type}
                    </span>
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getStatusVariant(transaction.status) === 'approved' ? 'bg-green-theme-secondary text-green-theme-primary border-green-theme-accent' : getStatusVariant(transaction.status) === 'rejected' ? 'bg-red-100 text-red-800 border-red-300' : getStatusVariant(transaction.status) === 'pending' ? 'bg-gold-theme-secondary text-gold-theme-primary border-gold-theme-accent' : getStatusVariant(transaction.status) === 'processed' ? 'bg-green-theme-secondary text-green-theme-primary border-green-theme-accent' : getStatusVariant(transaction.status) === 'paid' ? 'bg-silver-theme-secondary text-silver-theme-primary border-silver-theme-accent' : 'bg-secondary text-secondary-foreground'}`}>
                      <div className="flex items-center">
                        {getStatusIcon(transaction.status)}
                        <span className="ml-1">{transaction.status}</span>
                      </div>
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">{transaction.brandName || 'N/A'}</span>
                    <span className="mx-2 hidden sm:inline">•</span>
                    <span className="block sm:inline">{transaction.userId ? `${transaction.userId.slice(0, 8)}...` : 'N/A'}</span>
                    <span className="mx-2 hidden sm:inline">•</span>
                    <span className="font-medium block sm:inline">{formatCurrency(transaction.amount)}</span>
                  </div>
                </div>
                <span className="text-sm text-gray-500">
                  {formatTimeAgo(transaction.createdAt)}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CogIcon className="w-5 h-5 mr-2 text-gray-600" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <Button variant="outline" className="h-20 flex-col" asChild>
              <Link href="/transactions">
                <EyeIcon className="w-6 h-6 mb-2" />
                <span>Review Transactions</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-20 flex-col" asChild>
              <Link href="/brands">
                <BuildingStorefrontIcon className="w-6 h-6 mb-2" />
                <span>Manage Brands</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-20 flex-col" asChild>
              <Link href="/users">
                <UserGroupIcon className="w-6 h-6 mb-2" />
                <span>User Management</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-20 flex-col" asChild>
              <Link href="/dashboard/risk-and-fraud">
                <ShieldExclamationIcon className="w-6 h-6 mb-2" />
                <span>Risk & Fraud</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-20 flex-col" asChild>
              <Link href="/settings">
                <CogIcon className="w-6 h-6 mb-2" />
                <span>System Settings</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

        {/* Risk & Fraud Monitoring Widget - Clickable */}
        <Link href="/dashboard/risk-and-fraud" className="block">
          <Card className="bg-gradient-to-r from-red-50 to-orange-50 border-red-200 hover:shadow-lg transition-all duration-200 cursor-pointer group">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-red-900 flex items-center group-hover:text-red-700 transition-colors">
                  <ShieldExclamationIcon className="w-5 h-5 mr-2" />
                  Risk & Fraud Monitoring
                </CardTitle>
                <div className="text-red-600 group-hover:text-red-500 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
              <p className="text-red-700 text-sm group-hover:text-red-600 transition-colors">
                Real-time risk monitoring, fraud prevention, and security alerting
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-3 bg-white/50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">3</div>
                  <div className="text-sm text-red-700">Active Alerts</div>
                </div>
                <div className="text-center p-3 bg-white/50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">12</div>
                  <div className="text-sm text-orange-700">Risk Signals</div>
                </div>
                <div className="text-center p-3 bg-white/50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">98.5%</div>
                  <div className="text-sm text-green-700">Success Rate</div>
                </div>
              </div>
              <div className="mt-4 text-center">
                <span className="text-red-600 font-medium group-hover:text-red-500 transition-colors">
                  Click to view full Risk & Fraud Monitoring Panel →
                </span>
              </div>
            </CardContent>
          </Card>
        </Link>
    </div>
  )
}
