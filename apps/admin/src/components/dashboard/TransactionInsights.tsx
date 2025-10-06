'use client'

import { useState, useEffect } from 'react'
import { 
  ChartBarIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  BuildingStorefrontIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { DonutChart, BarChart } from '@/components/charts'
import { transactionApi } from '@/lib/api'
import { useAdminWebSocket } from '@/hooks/useWebSocket'
import { dashboardApi } from '@/lib/dashboardApi'

interface TransactionInsightsData {
  statusDistribution: Array<{
    name: string
    value: number
    color: string
  }>
  typeDistribution: Array<{
    name: string
    value: number
    color: string
  }>
  brandPerformance: Array<{
    name: string
    value: number
    secondaryValue: number
    color: string
  }>
  hourlyActivity: Array<{
    hour: string
    value: number
  }>
  slaMetrics: {
    avgProcessingTime: number
    slaBreaches: number
    totalProcessed: number
    successRate: number
  }
}

export function TransactionInsights() {
  const [insightsData, setInsightsData] = useState<TransactionInsightsData>({
    statusDistribution: [
      { name: 'Approved', value: 65, color: '#10b981' },
      { name: 'Pending', value: 20, color: '#f59e0b' },
      { name: 'Rejected', value: 10, color: '#ef4444' },
      { name: 'Processing', value: 5, color: '#3b82f6' }
    ],
    typeDistribution: [
      { name: 'Earn', value: 70, color: '#fbbf24' },
      { name: 'Redeem', value: 25, color: '#9ca3af' },
      { name: 'Welcome Bonus', value: 3, color: '#10b981' },
      { name: 'Adjustment', value: 2, color: '#f59e0b' }
    ],
    brandPerformance: [
      { name: 'Starbucks', value: 450, secondaryValue: 95, color: '#3b82f6' },
      { name: 'McDonald\'s', value: 380, secondaryValue: 92, color: '#10b981' },
      { name: 'Domino\'s', value: 320, secondaryValue: 88, color: '#f59e0b' },
      { name: 'KFC', value: 280, secondaryValue: 85, color: '#ef4444' },
      { name: 'Subway', value: 220, secondaryValue: 90, color: '#8b5cf6' }
    ],
    hourlyActivity: [
      { hour: '00:00', value: 12 },
      { hour: '06:00', value: 8 },
      { hour: '12:00', value: 45 },
      { hour: '18:00', value: 38 },
      { hour: '24:00', value: 15 }
    ],
    slaMetrics: {
      avgProcessingTime: 2.3,
      slaBreaches: 3,
      totalProcessed: 1247,
      successRate: 94.2
    }
  })

  const [isLoading, setIsLoading] = useState(true)
  const { pendingRequestCounts, recentActivity } = useAdminWebSocket()

  useEffect(() => {
    const fetchTransactionInsights = async () => {
      try {
        setIsLoading(true)
        
        // Fetch transaction statistics
        const transactionStats = await transactionApi.getTransactionStats()
        if (transactionStats.success) {
          const data = transactionStats.data
          
          // Update status distribution with real data if available
          if (data.statusBreakdown) {
            setInsightsData(prev => ({
              ...prev,
              statusDistribution: [
                { name: 'Approved', value: data.statusBreakdown.approved || 65, color: '#10b981' },
                { name: 'Pending', value: data.statusBreakdown.pending || 20, color: '#f59e0b' },
                { name: 'Rejected', value: data.statusBreakdown.rejected || 10, color: '#ef4444' },
                { name: 'Processing', value: data.statusBreakdown.processing || 5, color: '#3b82f6' }
              ]
            }))
          }

          // Update SLA metrics with real data if available
          if (data.slaMetrics) {
            setInsightsData(prev => ({
              ...prev,
              slaMetrics: {
                avgProcessingTime: data.slaMetrics.avgProcessingTime || 2.3,
                slaBreaches: data.slaMetrics.slaBreaches || 3,
                totalProcessed: data.slaMetrics.totalProcessed || 1247,
                successRate: data.slaMetrics.successRate || 94.2
              }
            }))
          }
          
          // Update pending counts with real data
          if (data.pendingEarn !== undefined || data.pendingRedeem !== undefined) {
            setInsightsData(prev => ({
              ...prev,
              pendingCounts: {
                earn: data.pendingEarn || 0,
                redeem: data.pendingRedeem || 0,
                total: (data.pendingEarn || 0) + (data.pendingRedeem || 0)
              }
            }))
          }
        }

        // Enrich brand performance with dashboard metrics if available
        try {
          const metricsResp = await dashboardApi.getDashboardMetrics()
          const brands = (metricsResp as any)?.data?.brandMetrics?.topPerformingBrands
          if (Array.isArray(brands) && brands.length > 0) {
            setInsightsData(prev => ({
              ...prev,
              brandPerformance: brands.slice(0, 5).map((b: any) => ({
                name: b.brandName,
                value: Number(b.transactionVolume) || 0,
                secondaryValue: Number(b.successRate) || 0,
                color: '#3b82f6'
              }))
            }))
          }
        } catch (e) {
          console.warn('Failed to fetch dashboard metrics for brand performance:', e)
        }

        // Simulate API delay for demo
        await new Promise(resolve => setTimeout(resolve, 1000))
        
      } catch (error) {
        console.error('Failed to fetch transaction insights:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTransactionInsights()
  }, [])

  const getGrowthIcon = (value: number) => {
    if (value > 0) {
      return <ArrowUpIcon className="w-4 h-4 text-green-500" />
    } else if (value < 0) {
      return <ArrowDownIcon className="w-4 h-4 text-red-500" />
    }
    return null
  }

  const formatTime = (hours: number) => {
    if (hours < 1) return `${Math.round(hours * 60)}m`
    return `${hours.toFixed(1)}h`
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="animate-pulse space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-48 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* SLA Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <ClockIcon className="h-8 w-8 text-green-theme-primary mr-3" />
              <div>
                <p className="text-sm text-gray-600">Avg Processing Time</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatTime(insightsData.slaMetrics.avgProcessingTime)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <XCircleIcon className="h-8 w-8 text-status-error mr-3" />
              <div>
                <p className="text-sm text-gray-600">SLA Breaches</p>
                <p className="text-2xl font-bold text-gray-900">
                  {insightsData.slaMetrics.slaBreaches}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <CheckCircleIcon className="h-8 w-8 text-green-theme-primary mr-3" />
              <div>
                <p className="text-sm text-gray-600">Total Processed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {insightsData.slaMetrics.totalProcessed.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <ChartBarIcon className="h-8 w-8 text-gold-theme-primary mr-3" />
              <div>
                <p className="text-sm text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {insightsData.slaMetrics.successRate}%
                </p>
                <div className="flex items-center mt-1">
                  {getGrowthIcon(2.1)}
                  <span className="text-sm text-green-600 ml-1">+2.1%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircleIcon className="w-5 h-5 mr-2 text-green-theme-primary" />
              Transaction Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DonutChart
              data={insightsData.statusDistribution}
              title=""
              subtitle="Current transaction status breakdown"
              height={250}
              showLegend={true}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CurrencyDollarIcon className="w-5 h-5 mr-2 text-gold-theme-primary" />
              Transaction Type Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DonutChart
              data={insightsData.typeDistribution}
              title=""
              subtitle="Transaction types breakdown"
              height={250}
              showLegend={true}
            />
          </CardContent>
        </Card>
      </div>

      {/* Brand Performance with Success Rates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BuildingStorefrontIcon className="w-5 h-5 mr-2 text-green-theme-primary" />
            Brand Performance & Success Rates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <BarChart
            data={insightsData.brandPerformance}
            title=""
            subtitle="Transaction volume vs. success rate by brand"
            height={300}
            horizontal={true}
            showLegend={true}
          />
        </CardContent>
      </Card>

      {/* Real-time Activity Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <UserGroupIcon className="w-5 h-5 mr-2 text-gold-theme-primary" />
            Real-time Activity Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-soft-gold-muted rounded-lg">
              <p className="text-2xl font-bold text-soft-gold-foreground">
                {pendingRequestCounts.earn}
              </p>
              <p className="text-sm text-gray-600">Pending Earn</p>
            </div>
            <div className="text-center p-4 bg-silver-muted rounded-lg">
              <p className="text-2xl font-bold text-silver-theme-primary">
                {pendingRequestCounts.redeem}
              </p>
              <p className="text-sm text-gray-600">Pending Redeem</p>
            </div>
            <div className="text-center p-4 bg-green-theme-muted rounded-lg">
              <p className="text-2xl font-bold text-green-theme-primary">
                {recentActivity.length}
              </p>
              <p className="text-sm text-gray-600">Recent Activities</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
