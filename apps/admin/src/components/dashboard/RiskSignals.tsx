'use client'

import { useState, useEffect } from 'react'
import { 
  ExclamationTriangleIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  ShieldExclamationIcon
} from '@heroicons/react/24/outline'
import { AlertTriangleIcon, RefreshCwIcon, FilterIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Badge } from '@/components/ui'
import { Button } from '@/components/ui'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui'
import { dashboardApi } from '@/lib/dashboardApi'
import { useErrorHandler } from '@/components/common'
import { useDashboardFilters, useChartData } from '@/hooks'
import type { RiskSignal } from '@/types'

interface RiskSignalsData {
  signals: RiskSignal[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export function RiskSignals() {
  const [data, setData] = useState<RiskSignalsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const { filters, updateFilter } = useDashboardFilters({
    type: 'all',
    severity: 'all',
    status: 'all'
  })
  const { getRiskLevelColor, getStatusColor, formatTimeAgo } = useChartData()
  const { error, handleError, clearError } = useErrorHandler()

  const fetchSignals = async (page = 1, newFilters = filters) => {
    try {
      setIsLoading(true)
      // Filter out "all" values before sending to API
      const apiFilters = Object.fromEntries(
        Object.entries(newFilters).filter(([_, value]) => value !== 'all')
      )
      const response = await dashboardApi.getRiskSignals(page, 10, apiFilters)
      if (response.success) {
        setData({
          signals: response.data,
          total: response.total,
          page: response.page,
          limit: response.limit,
          totalPages: response.totalPages
        })
        setCurrentPage(page)
      } else {
        throw new Error(response.message || 'Failed to fetch risk signals')
      }
    } catch (err) {
      handleError(err instanceof Error ? err : new Error('Failed to fetch risk signals'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSignals()
  }, [])

  const handleFilterChange = (key: string, value: string) => {
    updateFilter(key, value)
    fetchSignals(1, { ...filters, [key]: value })
  }

  const handleStatusUpdate = async (signalId: string, newStatus: string) => {
    try {
      const response = await dashboardApi.resolveRiskSignal(signalId, {
        status: newStatus as any,
        description: `Status updated to ${newStatus}`
      })
      if (response.success) {
        // Refresh the data
        fetchSignals(currentPage, filters)
      }
    } catch (err) {
      handleError(err instanceof Error ? err : new Error('Failed to update signal status'))
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ANOMALY':
        return <ExclamationTriangleIcon className="w-5 h-5 text-orange-600" />
      case 'SUSPICIOUS':
        return <AlertTriangleIcon className="w-5 h-5 text-red-600" />
      case 'BLOCKLIST':
        return <ShieldExclamationIcon className="w-5 h-5 text-purple-600" />
      default:
        return <ExclamationTriangleIcon className="w-5 h-5 text-gray-600" />
    }
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-red-600">
            <AlertTriangleIcon className="w-5 h-5 mr-2" />
            Risk Signals Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">Failed to load risk signals</p>
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
            <ExclamationTriangleIcon className="w-5 h-5 mr-2 text-red-600" />
            Risk Signals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-gray-200 rounded" />
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
          <CardTitle className="flex items-center">
            <ExclamationTriangleIcon className="w-5 h-5 mr-2 text-red-600" />
            Risk Signals
          </CardTitle>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => fetchSignals(currentPage, filters)}
              className="p-2 hover:bg-gray-100 rounded"
              title="Refresh signals"
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
              Real risk signals will be integrated when the backend endpoints are fully implemented.
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Select value={filters.type} onValueChange={(value) => handleFilterChange('type', value)}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Signal Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="ANOMALY">Anomaly</SelectItem>
              <SelectItem value="SUSPICIOUS">Suspicious</SelectItem>
              <SelectItem value="BLOCKLIST">Blocklist</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.severity} onValueChange={(value) => handleFilterChange('severity', value)}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severities</SelectItem>
              <SelectItem value="LOW">Low</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
              <SelectItem value="CRITICAL">Critical</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
            <SelectTrigger className="w-full sm:w-40">
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

        {/* Signals List */}
        <div className="space-y-3">
          {data.signals.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <ExclamationTriangleIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No risk signals found</p>
            </div>
          ) : (
            data.signals.map((signal) => (
              <div
                key={signal.id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="mt-1">
                      {getTypeIcon(signal.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        {(() => {
                          const severity = (signal as any).severity || (signal as any).level || 'LOW'
                          const status = signal.status || (signal.resolvedAt ? 'RESOLVED' : 'OPEN')
                          return (
                            <>
                              <Badge variant="secondary" className={getRiskLevelColor(severity)}>
                                {severity}
                              </Badge>
                              <Badge variant="secondary" className={getStatusColor(status)}>
                                {status}
                              </Badge>
                            </>
                          )
                        })()}
                        <span className="text-sm text-gray-500">
                          {signal.createdAt ? formatTimeAgo(new Date(signal.createdAt)) : ''}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-gray-900 mb-1">
                        {signal.description}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        {signal.userId && (
                          <span>User: {signal.userId.slice(0, 8)}...</span>
                        )}
                        {signal.transactionId && (
                          <span>Transaction: {signal.transactionId.slice(0, 8)}...</span>
                        )}
                        {((signal as any).brandId) && (
                          <span>Brand: {(signal as any).brandId.slice(0, 8)}...</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    {((signal.status || (signal.resolvedAt ? 'RESOLVED' : 'OPEN')) === 'OPEN') && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusUpdate(signal.id, 'INVESTIGATING')}
                          className="text-xs"
                        >
                          <EyeIcon className="w-3 h-3 mr-1" />
                          Investigate
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusUpdate(signal.id, 'FALSE_POSITIVE')}
                          className="text-xs"
                        >
                          <XCircleIcon className="w-3 h-3 mr-1" />
                          False Positive
                        </Button>
                      </>
                    )}
                    {((signal.status || (signal.resolvedAt ? 'RESOLVED' : 'OPEN')) === 'INVESTIGATING') && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusUpdate(signal.id, 'RESOLVED')}
                        className="text-xs"
                      >
                        <CheckCircleIcon className="w-3 h-3 mr-1" />
                        Resolve
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {data.totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-700">
              Showing {((currentPage - 1) * data.limit) + 1} to {Math.min(currentPage * data.limit, data.total)} of {data.total} signals
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchSignals(currentPage - 1, filters)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchSignals(currentPage + 1, filters)}
                disabled={currentPage === data.totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
