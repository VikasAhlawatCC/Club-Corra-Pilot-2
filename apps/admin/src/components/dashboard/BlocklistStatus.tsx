'use client'

import { useState, useEffect } from 'react'
import { 
  NoSymbolIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  UserIcon,
  DevicePhoneMobileIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline'
import { AlertTriangleIcon, RefreshCwIcon, PlusIcon, MinusIcon, EyeIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Badge } from '@/components/ui'
import { Button } from '@/components/ui'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui'
import { TimeSeriesChart, BarChart } from '@/components/charts'
import { dashboardApi } from '@/lib/dashboardApi'
import { useErrorHandler } from '@/components/common'

interface BlocklistEntry {
  id: string
  type: 'USER' | 'DEVICE' | 'IP_ADDRESS' | 'EMAIL' | 'PHONE' | 'GEOGRAPHIC'
  value: string
  reason: string
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING_REVIEW'
  addedBy: string
  addedAt: Date
  expiresAt?: Date
  metadata: Record<string, any>
}

interface BlocklistData {
  summary: {
    totalEntries: number
    activeEntries: number
    pendingReview: number
    recentAdditions: number
    averageAge: string
  }
  entries: BlocklistEntry[]
  additionsByType: Array<{
    type: string
    count: number
    percentage: number
  }>
  additionsByRisk: Array<{
    riskLevel: string
    count: number
    percentage: number
  }>
  additionsOverTime: Array<{
    date: string
    additions: number
    removals: number
    netChange: number
  }>
  recentActivity: Array<{
    action: 'ADDED' | 'REMOVED' | 'UPDATED' | 'EXPIRED'
    entry: BlocklistEntry
    timestamp: Date
    admin: string
  }>
}

export function BlocklistStatus() {
  const [data, setData] = useState<BlocklistData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterRisk, setFilterRisk] = useState('all')
  const { error, handleError, clearError } = useErrorHandler()

  const fetchBlocklistData = async () => {
    try {
      setIsLoading(true)
      // Mock data for now - replace with actual API call when endpoint is available
      const mockData: BlocklistData = {
        summary: {
          totalEntries: 156,
          activeEntries: 142,
          pendingReview: 8,
          recentAdditions: 23,
          averageAge: '45 days'
        },
        entries: [
          {
            id: '1',
            type: 'USER',
            value: 'user_12345',
            reason: 'Multiple fraudulent transactions detected',
            riskLevel: 'CRITICAL',
            status: 'ACTIVE',
            addedBy: 'admin_001',
            addedAt: new Date('2024-01-01T10:00:00Z'),
            expiresAt: new Date('2024-12-31T23:59:59Z'),
            metadata: { transactionCount: 15, totalAmount: 25000 }
          },
          {
            id: '2',
            type: 'DEVICE',
            value: 'device_abc123',
            reason: 'Suspicious device fingerprint',
            riskLevel: 'HIGH',
            status: 'ACTIVE',
            addedBy: 'admin_002',
            addedAt: new Date('2024-01-02T14:30:00Z'),
            metadata: { deviceType: 'Mobile', os: 'Android' }
          },
          {
            id: '3',
            type: 'IP_ADDRESS',
            value: '192.168.1.100',
            reason: 'Geographic location mismatch',
            riskLevel: 'MEDIUM',
            status: 'ACTIVE',
            addedBy: 'admin_003',
            addedAt: new Date('2024-01-03T09:15:00Z'),
            metadata: { country: 'Unknown', city: 'Unknown' }
          },
          {
            id: '4',
            type: 'EMAIL',
            value: 'suspicious@example.com',
            reason: 'Phishing attempt detected',
            riskLevel: 'HIGH',
            status: 'PENDING_REVIEW',
            addedBy: 'system',
            addedAt: new Date('2024-01-04T16:45:00Z'),
            metadata: { attemptCount: 3, lastAttempt: '2024-01-04T16:45:00Z' }
          }
        ],
        additionsByType: [
          { type: 'USER', count: 45, percentage: 28.8 },
          { type: 'DEVICE', count: 38, percentage: 24.4 },
          { type: 'IP_ADDRESS', count: 32, percentage: 20.5 },
          { type: 'EMAIL', count: 25, percentage: 16.0 },
          { type: 'PHONE', count: 12, percentage: 7.7 },
          { type: 'GEOGRAPHIC', count: 4, percentage: 2.6 }
        ],
        additionsByRisk: [
          { riskLevel: 'CRITICAL', count: 23, percentage: 14.7 },
          { riskLevel: 'HIGH', count: 45, percentage: 28.8 },
          { riskLevel: 'MEDIUM', count: 56, percentage: 35.9 },
          { riskLevel: 'LOW', count: 32, percentage: 20.5 }
        ],
        additionsOverTime: [
          { date: '2024-01-01', additions: 5, removals: 2, netChange: 3 },
          { date: '2024-01-02', additions: 8, removals: 1, netChange: 7 },
          { date: '2024-01-03', additions: 3, removals: 3, netChange: 0 },
          { date: '2024-01-04', additions: 12, removals: 2, netChange: 10 },
          { date: '2024-01-05', additions: 6, removals: 4, netChange: 2 },
          { date: '2024-01-06', additions: 4, removals: 1, netChange: 3 },
          { date: '2024-01-07', additions: 9, removals: 2, netChange: 7 }
        ],
        recentActivity: [
          {
            action: 'ADDED',
            entry: {
              id: '5',
              type: 'USER',
              value: 'user_67890',
              reason: 'Suspicious activity pattern',
              riskLevel: 'HIGH',
              status: 'ACTIVE',
              addedBy: 'admin_004',
              addedAt: new Date('2024-01-07T11:20:00Z'),
              metadata: {}
            },
            timestamp: new Date('2024-01-07T11:20:00Z'),
            admin: 'admin_004'
          },
          {
            action: 'REMOVED',
            entry: {
              id: '6',
              type: 'DEVICE',
              value: 'device_def456',
              reason: 'False positive confirmed',
              riskLevel: 'LOW',
              status: 'INACTIVE',
              addedBy: 'admin_005',
              addedAt: new Date('2024-01-06T15:30:00Z'),
              metadata: {}
            },
            timestamp: new Date('2024-01-07T10:15:00Z'),
            admin: 'admin_005'
          }
        ]
      }
      
      setData(mockData)
    } catch (err) {
      handleError(err instanceof Error ? err : new Error('Failed to fetch blocklist data'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchBlocklistData()
    // Refresh every 10 minutes
    const interval = setInterval(fetchBlocklistData, 10 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'CRITICAL':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'HIGH':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'LOW':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'PENDING_REVIEW':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'USER':
        return <UserIcon className="w-5 h-5 text-blue-600" />
      case 'DEVICE':
        return <DevicePhoneMobileIcon className="w-5 h-5 text-green-600" />
      case 'IP_ADDRESS':
        return <GlobeAltIcon className="w-5 h-5 text-purple-600" />
      case 'EMAIL':
        return <UserIcon className="w-5 h-5 text-orange-600" />
      case 'PHONE':
        return <DevicePhoneMobileIcon className="w-5 h-5 text-status-info" />
      case 'GEOGRAPHIC':
        return <GlobeAltIcon className="w-5 h-5 text-teal-600" />
      default:
        return <NoSymbolIcon className="w-5 h-5 text-gray-600" />
    }
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'ADDED':
        return <PlusIcon className="w-4 h-4 text-red-600" />
      case 'REMOVED':
        return <MinusIcon className="w-4 h-4 text-green-600" />
      case 'UPDATED':
        return <EyeIcon className="w-4 h-4 text-blue-600" />
      case 'EXPIRED':
        return <ClockIcon className="w-4 h-4 text-gray-600" />
      default:
        return <EyeIcon className="w-4 h-4 text-gray-600" />
    }
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  const filteredEntries = data?.entries.filter(entry => {
    if (filterType !== 'all' && entry.type !== filterType) return false
    if (filterStatus !== 'all' && entry.status !== filterStatus) return false
    if (filterRisk !== 'all' && entry.riskLevel !== filterRisk) return false
    return true
  }) || []

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-red-600">
            <AlertTriangleIcon className="w-5 h-5 mr-2" />
            Blocklist Status Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">Failed to load blocklist data</p>
            <button
              onClick={clearError}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <RefreshCwIcon className="w-4 h-4 mr-2" />
              Try Again
            </button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isLoading || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <NoSymbolIcon className="w-5 h-5 mr-2 text-red-600" />
            Blocklist Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded-lg" />
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-64 bg-gray-200 rounded-lg" />
              <div className="h-64 bg-gray-200 rounded-lg" />
            </div>
            <div className="h-48 bg-gray-200 rounded-lg" />
          </div>
        </CardContent>
      </Card>
    )
  }

  const additionsChartData = data.additionsOverTime.map(item => ({
    date: item.date,
    value: item.additions
  }))

  const typeChartData = data.additionsByType.map(item => ({
    name: item.type,
    value: item.count
  }))

  const riskChartData = data.additionsByRisk.map(item => ({
    name: item.riskLevel,
    value: item.count
  }))

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
          <CardTitle className="flex items-center">
            <NoSymbolIcon className="w-5 h-5 mr-2 text-red-600" />
            Blocklist Status
          </CardTitle>
          <div className="flex items-center space-x-2">
            <button
              onClick={fetchBlocklistData}
              className="p-2 hover:bg-gray-100 rounded"
              title="Refresh data"
            >
              <RefreshCwIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Mock Data Disclaimer */}
        <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="w-4 h-4 text-amber-600 mr-2" />
            <span className="text-sm font-medium text-amber-800">
              Preview Phase: This component is currently displaying mock data for demonstration purposes. 
              Real blocklist data will be integrated when the backend endpoints are fully implemented.
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg border border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-700">Total Entries</p>
                <p className="text-2xl font-bold text-red-800">
                  {data.summary.totalEntries}
                </p>
              </div>
              <NoSymbolIcon className="w-8 h-8 text-red-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700">Active</p>
                <p className="text-2xl font-bold text-orange-800">
                  {data.summary.activeEntries}
                </p>
              </div>
              <ExclamationTriangleIcon className="w-8 h-8 text-orange-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-yellow-200 p-4 rounded-lg border border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-700">Pending Review</p>
                <p className="text-2xl font-bold text-yellow-800">
                  {data.summary.pendingReview}
                </p>
              </div>
              <ClockIcon className="w-8 h-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Recent Additions</p>
                <p className="text-2xl font-bold text-blue-800">
                  {data.summary.recentAdditions}
                </p>
              </div>
              <PlusIcon className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Entry Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="USER">User</SelectItem>
              <SelectItem value="DEVICE">Device</SelectItem>
              <SelectItem value="IP_ADDRESS">IP Address</SelectItem>
              <SelectItem value="EMAIL">Email</SelectItem>
              <SelectItem value="PHONE">Phone</SelectItem>
              <SelectItem value="GEOGRAPHIC">Geographic</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="INACTIVE">Inactive</SelectItem>
              <SelectItem value="PENDING_REVIEW">Pending Review</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterRisk} onValueChange={setFilterRisk}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Risk Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Risk Levels</SelectItem>
              <SelectItem value="CRITICAL">Critical</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="LOW">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Additions Over Time */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Blocklist Changes Over Time</h4>
            <TimeSeriesChart
              data={additionsChartData}
              title=""
              subtitle="Daily additions"
              height={200}
              color="#dc2626"
            />
          </div>

          {/* Entries by Type */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Entries by Type</h4>
            <BarChart
              data={typeChartData}
              title=""
              subtitle="Distribution of blocklist entries"
              height={200}
              horizontal={true}
            />
          </div>
        </div>

        {/* Entries List */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Blocklist Entries</h4>
          <div className="space-y-3">
            {filteredEntries.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <NoSymbolIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No entries found with current filters</p>
              </div>
            ) : (
              filteredEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="mt-1">
                        {getTypeIcon(entry.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge variant="secondary" className={getRiskLevelColor(entry.riskLevel)}>
                            {entry.riskLevel}
                          </Badge>
                          <Badge variant="secondary" className={getStatusColor(entry.status)}>
                            {entry.status}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            Added {formatTimeAgo(entry.addedAt)}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-gray-900 mb-1">
                          {entry.value}
                        </p>
                        <p className="text-sm text-gray-600 mb-2">
                          {entry.reason}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>Added by: {entry.addedBy}</span>
                          {entry.expiresAt && (
                            <span>Expires: {entry.expiresAt.toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs"
                      >
                        <EyeIcon className="w-3 h-3 mr-1" />
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Recent Activity</h4>
          <div className="space-y-2">
            {data.recentActivity.map((activity, index) => (
              <div
                key={index}
                className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-2">
                  {getActionIcon(activity.action)}
                  <span className="text-sm font-medium text-gray-900">
                    {activity.action.charAt(0) + activity.action.slice(1).toLowerCase()}
                  </span>
                </div>
                <span className="text-sm text-gray-600">
                  {activity.entry.type}: {activity.entry.value}
                </span>
                <span className="text-xs text-gray-500">
                  by {activity.admin} • {formatTimeAgo(activity.timestamp)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
