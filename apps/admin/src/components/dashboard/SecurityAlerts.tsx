'use client'

import { useState, useEffect } from 'react'
import { 
  ShieldExclamationIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  UserIcon,
  ServerIcon
} from '@heroicons/react/24/outline'
import { AlertTriangleIcon, RefreshCwIcon, ActivityIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Badge } from '@/components/ui'
import { Button } from '@/components/ui'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui'
import { TimeSeriesChart, BarChart } from '@/components/charts'
import { dashboardApi } from '@/lib/dashboardApi'
import { useErrorHandler } from '@/components/common'

interface SecurityAlert {
  id: string
  type: 'AUTHENTICATION' | 'DATA_BREACH' | 'NETWORK' | 'MALWARE' | 'AUTHORIZATION' | 'SYSTEM' | 'PHYSICAL'
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  title: string
  description: string
  status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'FALSE_POSITIVE'
  source: 'SYSTEM' | 'USER' | 'EXTERNAL' | 'MONITORING'
  affectedResources: string[]
  ipAddress?: string
  location?: string
  createdAt: Date
  updatedAt: Date
  resolvedAt?: Date
  resolvedBy?: string
}

interface SecurityAlertsData {
  summary: {
    totalAlerts: number
    openAlerts: number
    criticalAlerts: number
    resolvedToday: number
    averageResolutionTime: string
  }
  alerts: SecurityAlert[]
  alertsByType: Array<{
    type: string
    count: number
    percentage: number
    trend: 'INCREASING' | 'DECREASING' | 'STABLE'
  }>
  alertsOverTime: Array<{
    date: string
    total: number
    critical: number
    high: number
    medium: number
    low: number
  }>
  securityMetrics: {
    threatLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
    lastIncident: string
    daysSinceLastIncident: number
    securityScore: number
    complianceStatus: 'COMPLIANT' | 'NON_COMPLIANT' | 'PENDING_REVIEW'
  }
}

export function SecurityAlerts() {
  const [data, setData] = useState<SecurityAlertsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [filterType, setFilterType] = useState('all')
  const [filterSeverity, setFilterSeverity] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const { error, handleError, clearError } = useErrorHandler()

  const fetchSecurityData = async () => {
    try {
      setIsLoading(true)
      // Mock data for now - replace with actual API call when endpoint is available
      const mockData: SecurityAlertsData = {
        summary: {
          totalAlerts: 89,
          openAlerts: 23,
          criticalAlerts: 5,
          resolvedToday: 12,
          averageResolutionTime: '4.2 hours'
        },
        alerts: [
          {
            id: '1',
            type: 'AUTHENTICATION',
            severity: 'CRITICAL',
            title: 'Multiple Failed Login Attempts',
            description: 'Detected 15 failed login attempts from IP 192.168.1.100 within 5 minutes',
            status: 'INVESTIGATING',
            source: 'SYSTEM',
            affectedResources: ['User Authentication', 'Admin Portal'],
            ipAddress: '192.168.1.100',
            location: 'Unknown',
            createdAt: new Date('2024-01-07T14:30:00Z'),
            updatedAt: new Date('2024-01-07T14:35:00Z')
          },
          {
            id: '2',
            type: 'DATA_BREACH',
            severity: 'HIGH',
            title: 'Suspicious Data Access Pattern',
            description: 'Unusual access pattern detected for sensitive user data',
            status: 'OPEN',
            source: 'MONITORING',
            affectedResources: ['User Database', 'API Endpoints'],
            ipAddress: '10.0.0.50',
            location: 'Internal Network',
            createdAt: new Date('2024-01-07T13:45:00Z'),
            updatedAt: new Date('2024-01-07T13:45:00Z')
          }
        ],
        alertsByType: [
          { type: 'AUTHENTICATION', count: 25, percentage: 28.1, trend: 'INCREASING' },
          { type: 'DATA_BREACH', count: 18, percentage: 20.2, trend: 'STABLE' },
          { type: 'NETWORK', count: 15, percentage: 16.9, trend: 'DECREASING' },
          { type: 'MALWARE', count: 12, percentage: 13.5, trend: 'STABLE' }
        ],
        alertsOverTime: [
          { date: '2024-01-01', total: 8, critical: 1, high: 2, medium: 3, low: 2 },
          { date: '2024-01-02', total: 12, critical: 2, high: 3, medium: 4, low: 3 },
          { date: '2024-01-03', total: 6, critical: 0, high: 1, medium: 2, low: 3 },
          { date: '2024-01-04', total: 15, critical: 3, high: 4, medium: 5, low: 3 },
          { date: '2024-01-05', total: 9, critical: 1, high: 2, medium: 3, low: 3 },
          { date: '2024-01-06', total: 11, critical: 2, high: 3, medium: 4, low: 2 },
          { date: '2024-01-07', total: 23, critical: 5, high: 6, medium: 8, low: 4 }
        ],
        securityMetrics: {
          threatLevel: 'HIGH',
          lastIncident: '2024-01-07T14:30:00Z',
          daysSinceLastIncident: 0,
          securityScore: 78,
          complianceStatus: 'COMPLIANT'
        }
      }
      
      setData(mockData)
    } catch (err) {
      handleError(err instanceof Error ? err : new Error('Failed to fetch security alerts'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSecurityData()
    const interval = setInterval(fetchSecurityData, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-100 text-red-800 border-red-200'
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'LOW': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'bg-red-100 text-red-800 border-red-200'
      case 'INVESTIGATING': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'RESOLVED': return 'bg-green-100 text-green-800 border-green-200'
      case 'FALSE_POSITIVE': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'AUTHENTICATION': return <UserIcon className="w-5 h-5 text-red-600" />
      case 'DATA_BREACH': return <ServerIcon className="w-5 h-5 text-orange-600" />
      case 'NETWORK': return <ServerIcon className="w-5 h-5 text-blue-600" />
      case 'MALWARE': return <ExclamationTriangleIcon className="w-5 h-5 text-purple-600" />
      default: return <ExclamationTriangleIcon className="w-5 h-5 text-gray-600" />
    }
  }

  const getThreatLevelColor = (level: string) => {
    switch (level) {
      case 'CRITICAL': return 'bg-red-100 text-red-800 border-red-200'
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'LOW': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getComplianceColor = (status: string) => {
    switch (status) {
      case 'COMPLIANT': return 'bg-green-100 text-green-800 border-green-200'
      case 'NON_COMPLIANT': return 'bg-red-100 text-red-800 border-red-200'
      case 'PENDING_REVIEW': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
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

  const filteredAlerts = data?.alerts.filter(alert => {
    if (filterType !== 'all' && alert.type !== filterType) return false
    if (filterSeverity !== 'all' && alert.severity !== filterSeverity) return false
    if (filterStatus !== 'all' && alert.status !== filterStatus) return false
    return true
  }) || []

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-red-600">
            <AlertTriangleIcon className="w-5 h-5 mr-2" />
            Security Alerts Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">Failed to load security alerts</p>
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
            <ShieldExclamationIcon className="w-5 h-5 mr-2 text-red-600" />
            Security Alerts
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
          </div>
        </CardContent>
      </Card>
    )
  }

  const alertsChartData = data.alertsOverTime.map(item => ({
    date: item.date,
    value: item.total
  }))

  const typeChartData = data.alertsByType.map(item => ({
    name: item.type,
    value: item.count
  }))

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
          <CardTitle className="flex items-center">
            <ShieldExclamationIcon className="w-5 h-5 mr-2 text-red-600" />
            Security Alerts
          </CardTitle>
          <div className="flex items-center space-x-2">
            <button
              onClick={fetchSecurityData}
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
              Real security alerts will be integrated when the backend endpoints are fully implemented.
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
                <p className="text-sm font-medium text-red-700">Total Alerts</p>
                <p className="text-2xl font-bold text-red-800">{data.summary.totalAlerts}</p>
              </div>
              <ShieldExclamationIcon className="w-8 h-8 text-red-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700">Open Alerts</p>
                <p className="text-2xl font-bold text-orange-800">{data.summary.openAlerts}</p>
              </div>
              <ExclamationTriangleIcon className="w-8 h-8 text-orange-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg border border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-700">Critical</p>
                <p className="text-2xl font-bold text-red-800">{data.summary.criticalAlerts}</p>
              </div>
              <AlertTriangleIcon className="w-8 h-8 text-red-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Resolved Today</p>
                <p className="text-2xl font-bold text-green-800">{data.summary.resolvedToday}</p>
              </div>
              <CheckCircleIcon className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* Security Metrics */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Security Overview</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="text-center">
              <Badge variant="secondary" className={getThreatLevelColor(data.securityMetrics.threatLevel)}>
                {data.securityMetrics.threatLevel}
              </Badge>
              <div className="text-sm text-gray-600 mt-1">Threat Level</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">{data.securityMetrics.securityScore}</div>
              <div className="text-sm text-gray-600">Security Score</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-purple-600">{data.securityMetrics.daysSinceLastIncident}</div>
              <div className="text-sm text-gray-600">Days Since Incident</div>
            </div>
            <div className="text-center">
              <Badge variant="secondary" className={getComplianceColor(data.securityMetrics.complianceStatus)}>
                {data.securityMetrics.complianceStatus}
              </Badge>
              <div className="text-sm text-gray-600 mt-1">Compliance</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-orange-600">{data.summary.averageResolutionTime}</div>
              <div className="text-sm text-gray-600">Avg Resolution</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Alert Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="AUTHENTICATION">Authentication</SelectItem>
              <SelectItem value="DATA_BREACH">Data Breach</SelectItem>
              <SelectItem value="NETWORK">Network</SelectItem>
              <SelectItem value="MALWARE">Malware</SelectItem>
              <SelectItem value="AUTHORIZATION">Authorization</SelectItem>
              <SelectItem value="SYSTEM">System</SelectItem>
              <SelectItem value="PHYSICAL">Physical</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterSeverity} onValueChange={setFilterSeverity}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severities</SelectItem>
              <SelectItem value="CRITICAL">Critical</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="LOW">Low</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="OPEN">Open</SelectItem>
              <SelectItem value="INVESTIGATING">Investigating</SelectItem>
              <SelectItem value="RESOLVED">Resolved</SelectItem>
              <SelectItem value="FALSE_POSITIVE">False Positive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Security Alerts Over Time</h4>
            <TimeSeriesChart
              data={alertsChartData}
              title=""
              subtitle="Daily security alert trends"
              height={200}
              color="#dc2626"
            />
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Alerts by Type</h4>
            <BarChart
              data={typeChartData}
              title=""
              subtitle="Distribution of security alerts"
              height={200}
              horizontal={true}
            />
          </div>
        </div>

        {/* Alerts List */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Security Alerts</h4>
          <div className="space-y-3">
            {filteredAlerts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <ShieldExclamationIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No alerts found with current filters</p>
              </div>
            ) : (
              filteredAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="mt-1">
                        {getTypeIcon(alert.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge variant="secondary" className={getSeverityColor(alert.severity)}>
                            {alert.severity}
                          </Badge>
                          <Badge variant="secondary" className={getStatusColor(alert.status)}>
                            {alert.status}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {formatTimeAgo(alert.createdAt)}
                          </span>
                        </div>
                        <h5 className="text-sm font-medium text-gray-900 mb-1">
                          {alert.title}
                        </h5>
                        <p className="text-sm text-gray-600 mb-2">
                          {alert.description}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>Source: {alert.source}</span>
                          {alert.ipAddress && <span>IP: {alert.ipAddress}</span>}
                          {alert.location && <span>Location: {alert.location}</span>}
                        </div>
                        {alert.affectedResources.length > 0 && (
                          <div className="mt-2">
                            <span className="text-xs text-gray-500">Affected: </span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {alert.affectedResources.map((resource, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {resource}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs"
                      >
                        <ActivityIcon className="w-3 h-3 mr-1" />
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
