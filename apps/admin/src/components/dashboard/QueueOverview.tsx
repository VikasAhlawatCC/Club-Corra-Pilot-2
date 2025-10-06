'use client'

import { useState, useEffect } from 'react'
import { 
  ClockIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from '@/components/ui'
import { DonutChart } from '@/components/charts'
import { transactionApi } from '@/lib/api'
import { useAdminWebSocket } from '@/hooks/useWebSocket'

interface QueueData {
  earnQueue: {
    total: number
    urgent: number
    normal: number
    slaBreaches: number
    avgWaitTime: number
  }
  redeemQueue: {
    total: number
    urgent: number
    normal: number
    slaBreaches: number
    avgWaitTime: number
  }
  overallMetrics: {
    totalPending: number
    totalSlaBreaches: number
    avgProcessingTime: number
    successRate: number
  }
}

interface QueueItem {
  id: string
  type: 'EARN' | 'REDEEM'
  priority: 'URGENT' | 'NORMAL'
  userId: string
  brandName: string
  amount: number
  waitTime: number
  slaStatus: 'WITHIN_SLA' | 'APPROACHING_SLA' | 'BREACHED'
  createdAt: Date
}

export function QueueOverview() {
  const [queueData, setQueueData] = useState<QueueData>({
    earnQueue: {
      total: 15,
      urgent: 3,
      normal: 12,
      slaBreaches: 1,
      avgWaitTime: 2.5
    },
    redeemQueue: {
      total: 8,
      urgent: 2,
      normal: 6,
      slaBreaches: 0,
      avgWaitTime: 1.8
    },
    overallMetrics: {
      totalPending: 23,
      totalSlaBreaches: 1,
      avgProcessingTime: 2.2,
      successRate: 94.2
    }
  })

  const [recentQueueItems, setRecentQueueItems] = useState<QueueItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { pendingRequestCounts } = useAdminWebSocket()

  useEffect(() => {
    const fetchQueueData = async () => {
      try {
        setIsLoading(true)
        
        // Fetch transaction statistics
        const transactionStats = await transactionApi.getTransactionStats()
        if (transactionStats.success) {
          const data = transactionStats.data
          
          // Update queue data with real data if available
          if (data.pendingEarn !== undefined || data.pendingRedeem !== undefined) {
            setQueueData(prev => ({
              ...prev,
              earnQueue: {
                ...prev.earnQueue,
                total: data.pendingEarn || prev.earnQueue.total
              },
              redeemQueue: {
                ...prev.redeemQueue,
                total: data.pendingRedeem || prev.redeemQueue.total
              },
              overallMetrics: {
                ...prev.overallMetrics,
                totalPending: (data.pendingEarn || 0) + (data.pendingRedeem || 0)
              }
            }))
          }
        }

        // Fetch recent pending transactions (earn + redeem) for queue items
        try {
          const [earnPending, redeemPending] = await Promise.all([
            transactionApi.getPendingTransactions(1, 5, 'EARN'),
            transactionApi.getPendingTransactions(1, 5, 'REDEEM')
          ])

          const now = Date.now()
          const mapToQueueItem = (tx: any): QueueItem => {
            const createdAt = new Date(tx.createdAt)
            const waitHours = Math.max(0, (now - createdAt.getTime()) / (1000 * 60 * 60))
            const slaStatus: QueueItem['slaStatus'] = waitHours >= 4 ? 'BREACHED' : waitHours >= 2 ? 'APPROACHING_SLA' : 'WITHIN_SLA'
            const priority: QueueItem['priority'] = slaStatus === 'BREACHED' || slaStatus === 'APPROACHING_SLA' ? 'URGENT' : 'NORMAL'
            return {
              id: tx.id,
              type: tx.type,
              priority,
              userId: tx.userId,
              brandName: tx.brandName || 'Unknown Brand',
              amount: tx.amount || tx.coinsEarned || tx.coinsRedeemed || 0,
              waitTime: Number(waitHours.toFixed(1)),
              slaStatus,
              createdAt
            }
          }

          const earnItems = (earnPending?.data?.data || []).map(mapToQueueItem)
          const redeemItems = (redeemPending?.data?.data || []).map(mapToQueueItem)
          const combined = [...earnItems, ...redeemItems]
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
            .slice(0, 5)

          setRecentQueueItems(combined)

          // Update queue breakdown metrics based on priorities
          const earnUrgent = earnItems.filter(i => i.priority === 'URGENT').length
          const redeemUrgent = redeemItems.filter(i => i.priority === 'URGENT').length

          setQueueData(prev => ({
            ...prev,
            earnQueue: {
              ...prev.earnQueue,
              total: earnPending?.data?.total ?? prev.earnQueue.total,
              urgent: earnUrgent,
              normal: Math.max(0, (earnPending?.data?.total ?? prev.earnQueue.total) - earnUrgent)
            },
            redeemQueue: {
              ...prev.redeemQueue,
              total: redeemPending?.data?.total ?? prev.redeemQueue.total,
              urgent: redeemUrgent,
              normal: Math.max(0, (redeemPending?.data?.total ?? prev.redeemQueue.total) - redeemUrgent)
            },
            overallMetrics: {
              ...prev.overallMetrics,
              totalPending: (earnPending?.data?.total ?? 0) + (redeemPending?.data?.total ?? 0)
            }
          }))
        } catch (e) {
          console.warn('Failed to fetch pending transactions for queue items:', e)
        }

        // Simulate API delay for demo
        await new Promise(resolve => setTimeout(resolve, 1000))
        
      } catch (error) {
        console.error('Failed to fetch queue data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchQueueData()
  }, [])

  // Update queue data when WebSocket data changes
  useEffect(() => {
    if (pendingRequestCounts.total > 0) {
      setQueueData(prev => ({
        ...prev,
        earnQueue: {
          ...prev.earnQueue,
          total: pendingRequestCounts.earn
        },
        redeemQueue: {
          ...prev.redeemQueue,
          total: pendingRequestCounts.redeem
        },
        overallMetrics: {
          ...prev.overallMetrics,
          totalPending: pendingRequestCounts.total
        }
      }))
    }
  }, [pendingRequestCounts])

  const getSlaStatusColor = (status: QueueItem['slaStatus']) => {
    switch (status) {
      case 'WITHIN_SLA':
        return 'text-green-600 bg-green-100'
      case 'APPROACHING_SLA':
        return 'text-yellow-600 bg-yellow-100'
      case 'BREACHED':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getPriorityColor = (priority: QueueItem['priority']) => {
    switch (priority) {
      case 'URGENT':
        return 'text-red-600 bg-red-100'
      case 'NORMAL':
        return 'text-blue-600 bg-blue-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const formatTime = (hours: number) => {
    if (hours < 1) return `${Math.round(hours * 60)}m`
    return `${hours.toFixed(1)}h`
  }

  const getGrowthIcon = (value: number) => {
    if (value > 0) {
      return <ArrowUpIcon className="w-4 h-4 text-green-500" />
    } else if (value < 0) {
      return <ArrowDownIcon className="w-4 h-4 text-red-500" />
    }
    return null
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

  const earnQueueData = [
    { name: 'Urgent', value: queueData.earnQueue.urgent, color: '#ef4444' },
    { name: 'Normal', value: queueData.earnQueue.normal, color: '#3b82f6' }
  ]

  const redeemQueueData = [
    { name: 'Urgent', value: queueData.redeemQueue.urgent, color: '#ef4444' },
    { name: 'Normal', value: queueData.redeemQueue.normal, color: '#f59e0b' }
  ]

  return (
    <div className="space-y-6">
      {/* Queue Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <ClockIcon className="h-8 w-8 text-green-theme-primary mr-3" />
              <div>
                <p className="text-sm text-gray-600">Total Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {queueData.overallMetrics.totalPending}
                </p>
                <div className="flex items-center mt-1">
                  {getGrowthIcon(5)}
                  <span className="text-sm text-green-600 ml-1">+5 from yesterday</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-8 w-8 text-status-error mr-3" />
              <div>
                <p className="text-sm text-gray-600">SLA Breaches</p>
                <p className="text-2xl font-bold text-gray-900">
                  {queueData.overallMetrics.totalSlaBreaches}
                </p>
                <p className="text-sm text-gray-500 mt-1">Requires immediate attention</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <CheckCircleIcon className="h-8 w-8 text-green-theme-primary mr-3" />
              <div>
                <p className="text-sm text-gray-600">Avg Processing Time</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatTime(queueData.overallMetrics.avgProcessingTime)}
                </p>
                <div className="flex items-center mt-1">
                  {getGrowthIcon(-0.3)}
                  <span className="text-sm text-green-600 ml-1">-0.3h improvement</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <XCircleIcon className="h-8 w-8 text-gold-theme-primary mr-3" />
              <div>
                <p className="text-sm text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {queueData.overallMetrics.successRate}%
                </p>
                <div className="flex items-center mt-1">
                  {getGrowthIcon(1.2)}
                  <span className="text-sm text-green-600 ml-1">+1.2% this week</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Queue Breakdown Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ClockIcon className="w-5 h-5 mr-2 text-soft-gold-foreground" />
              Earn Queue Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <DonutChart
                data={earnQueueData}
                title=""
                subtitle="Priority distribution in earn queue"
                height={200}
                showLegend={true}
              />
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-3 bg-status-error/10 rounded-lg">
                  <p className="text-lg font-bold text-status-error">
                    {queueData.earnQueue.urgent}
                  </p>
                  <p className="text-sm text-gray-600">Urgent</p>
                </div>
                <div className="p-3 bg-soft-gold-muted rounded-lg">
                  <p className="text-lg font-bold text-soft-gold-foreground">
                    {queueData.earnQueue.normal}
                  </p>
                  <p className="text-sm text-gray-600">Normal</p>
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Avg Wait Time</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatTime(queueData.earnQueue.avgWaitTime)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ClockIcon className="w-5 h-5 mr-2 text-silver-theme-primary" />
              Redeem Queue Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <DonutChart
                data={redeemQueueData}
                title=""
                subtitle="Priority distribution in redeem queue"
                height={200}
                showLegend={true}
              />
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-3 bg-status-error/10 rounded-lg">
                  <p className="text-lg font-bold text-status-error">
                    {queueData.redeemQueue.urgent}
                  </p>
                  <p className="text-sm text-gray-600">Urgent</p>
                </div>
                <div className="p-3 bg-silver-muted rounded-lg">
                  <p className="text-lg font-bold text-silver-theme-primary">
                    {queueData.redeemQueue.normal}
                  </p>
                  <p className="text-sm text-gray-600">Normal</p>
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Avg Wait Time</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatTime(queueData.redeemQueue.avgWaitTime)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Queue Items */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
            <CardTitle>Recent Queue Items</CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link href="/transactions?status=pending">
                <EyeIcon className="w-4 h-4 mr-2" />
                View All Pending
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentQueueItems.map((item) => (
              <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-gray-100 last:border-b-0 space-y-2 sm:space-y-0">
                <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className={getPriorityColor(item.priority)}>
                      {item.priority}
                    </Badge>
                    <Badge variant="secondary" className={getSlaStatusColor(item.slaStatus)}>
                      {item.slaStatus.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">{item.brandName}</span>
                    <span className="mx-2 hidden sm:inline">•</span>
                    <span className="block sm:inline">{item.userId.slice(0, 8)}...</span>
                    <span className="mx-2 hidden sm:inline">•</span>
                    <span className="font-medium block sm:inline">₹{item.amount}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-500">
                    Wait: {formatTime(item.waitTime)}
                  </span>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/transactions/${item.id}`}>
                      <EyeIcon className="w-4 h-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
