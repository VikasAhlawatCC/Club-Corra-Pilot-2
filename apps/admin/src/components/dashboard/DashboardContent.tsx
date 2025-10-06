'use client'

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
  ArrowDownIcon
} from '@heroicons/react/24/outline'
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
import { useAdminWebSocket } from '@/hooks/useWebSocket'
import { transactionApi } from '@/lib/api'

interface DashboardStats {
  totalUsers: number
  activeBrands: number
  totalCoinsInCirculation: number
  pendingEarnRequests: number
  pendingRedeemRequests: number
  totalPendingRequests: number
  monthlyGrowth: number
  weeklyGrowth: number
}

interface RecentTransaction {
  id: string
  type: 'EARN' | 'REDEEM' | 'WELCOME_BONUS' | 'ADJUSTMENT'
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAID'
  userId: string
  brandName?: string
  amount: number
  createdAt: Date
}

export function DashboardContent() {
  const [stats, setStats] = useState<DashboardStats>({
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

  // WebSocket integration for real-time updates
  const { isConnected, pendingRequestCounts, recentActivity } = useAdminWebSocket()

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch real transaction statistics
        const transactionStats = await transactionApi.getTransactionStats()
        if (transactionStats.success) {
          const data = transactionStats.data
          setStats(prev => ({
            ...prev,
            pendingEarnRequests: data.pendingEarnRequests || prev.pendingEarnRequests,
            pendingRedeemRequests: data.pendingRedeemRequests || prev.pendingRedeemRequests,
            totalPendingRequests: (data.pendingEarnRequests || 0) + (data.pendingRedeemRequests || 0)
          }))
        }
        
        // TODO: Replace other stats with actual API calls
        await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API delay
        
        // Update stats with real-time data if available
        if (pendingRequestCounts.total > 0) {
          setStats(prev => ({
            ...prev,
            pendingEarnRequests: pendingRequestCounts.earn,
            pendingRedeemRequests: pendingRequestCounts.redeem,
            totalPendingRequests: pendingRequestCounts.total
          }))
        }

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
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
        // Show error message to user
        if (error instanceof Error && error.message.includes('Unauthorized')) {
          console.error('Authentication error - user may need to re-login')
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const getTransactionTypeColor = (type: RecentTransaction['type']) => {
    switch (type) {
      case 'EARN':
        return 'text-green-600 bg-green-100'
      case 'REDEEM':
        return 'text-orange-600 bg-orange-100'
      case 'WELCOME_BONUS':
        return 'text-blue-600 bg-blue-100'
      case 'ADJUSTMENT':
        return 'text-purple-600 bg-purple-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusColor = (status: RecentTransaction['status'] | 'PROCESSED') => {
    switch (status) {
      case 'APPROVED':
        return 'text-green-600 bg-green-100'
      case 'REJECTED':
        return 'text-red-600 bg-red-100'
      case 'PENDING':
        return 'text-yellow-600 bg-yellow-100'
      // Legacy PROCESSED mapped to Approved style
      case 'PROCESSED':
        return 'text-green-600 bg-green-100'
      case 'PAID':
        return 'text-purple-600 bg-purple-100'
      default:
        return 'text-gray-600 bg-gray-100'
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
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserGroupIcon className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              </div>
              <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                <h3 className="text-sm sm:text-lg font-medium text-gray-900 truncate">Total Users</h3>
                <p className="text-2xl sm:text-3xl font-bold text-blue-600">{stats.totalUsers.toLocaleString()}</p>
                <div className="flex items-center mt-1">
                  <ChartBarIcon className="w-4 h-4 text-green-500 mr-1" />
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
                <BuildingStorefrontIcon className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
              </div>
              <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                <h3 className="text-sm sm:text-lg font-medium text-gray-900 truncate">Active Brands</h3>
                <p className="text-2xl sm:text-3xl font-bold text-green-600">{stats.activeBrands}</p>
                <div className="flex items-center mt-1">
                  <ChartBarIcon className="w-4 h-4 text-green-500 mr-1" />
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
                <CurrencyDollarIcon className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600" />
              </div>
              <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                <h3 className="text-sm sm:text-lg font-medium text-gray-900 truncate">Total Coins</h3>
                <p className="text-2xl sm:text-3xl font-bold text-yellow-600">{stats.totalCoinsInCirculation.toLocaleString()}</p>
                <div className="flex items-center mt-1">
                  <ChartBarIcon className="w-4 h-4 text-green-500 mr-1" />
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
                <ExclamationTriangleIcon className="h-6 w-6 sm:h-8 sm:w-8 text-red-600" />
              </div>
              <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                <h3 className="text-sm sm:text-lg font-medium text-gray-900 truncate">Pending Requests</h3>
                <p className="text-2xl sm:text-3xl font-bold text-red-600">{stats.totalPendingRequests}</p>
                <p className="text-sm text-gray-500 mt-1">Requires attention</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Requests - Unified View */}
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Pending Requests</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <ClockIcon className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-500 mr-3" />
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-yellow-600">{stats.pendingEarnRequests}</p>
                  <p className="text-sm text-gray-500">Earn Requests</p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <ClockIcon className="h-6 w-6 sm:h-8 sm:w-8 text-orange-500 mr-3" />
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-orange-600">{stats.pendingRedeemRequests}</p>
                  <p className="text-sm text-gray-500">Redeem Requests</p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 flex justify-center">
            <Button variant="outline" size="sm" asChild>
              <Link href="/transactions?status=pending">
                View All Pending Requests
              </Link>
            </Button>
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
            {recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-gray-100 last:border-b-0 space-y-2 sm:space-y-0">
                <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className={getTransactionTypeColor(transaction.type)}>
                      {transaction.type}
                    </Badge>
                    <Badge variant="secondary" className={getStatusColor(transaction.status)}>
                      {getStatusIcon(transaction.status)}
                      <span className="ml-1">{transaction.status}</span>
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">{transaction.brandName || 'N/A'}</span>
                    <span className="mx-2 hidden sm:inline">•</span>
                    <span className="block sm:inline">{transaction.userId.slice(0, 8)}...</span>
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

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-4 sm:p-6">
            <h3 className="text-lg font-medium mb-2">System Health</h3>
            <p className="text-2xl sm:text-3xl font-bold">Excellent</p>
            <p className="text-blue-100 text-sm mt-1">All services operational</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-4 sm:p-6">
            <h3 className="text-lg font-medium mb-2">Today's Transactions</h3>
            <p className="text-2xl sm:text-3xl font-bold">47</p>
            <div className="flex items-center mt-1">
              {getGrowthIcon(12)}
              <span className="text-green-100 text-sm ml-1">+12% from yesterday</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-4 sm:p-6">
            <h3 className="text-lg font-medium mb-2">Revenue This Month</h3>
            <p className="text-2xl sm:text-3xl font-bold">₹2.4M</p>
            <div className="flex items-center mt-1">
              {getGrowthIcon(8)}
              <span className="text-purple-100 text-sm ml-1">+8% from last month</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
