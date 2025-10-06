'use client'

import { useState, useEffect } from 'react'
import { 
  ShieldExclamationIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline'
import { AlertTriangleIcon, RefreshCwIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { DonutChart, TimeSeriesChart } from '@/components/charts'
import { Badge } from '@/components/ui'
import { dashboardApi } from '@/lib/dashboardApi'
import { useErrorHandler } from '@/components/common'

interface RiskOverviewData {
  totalSignals: number
  openSignals: number
  criticalSignals: number
  averageResolutionTime: string
  falsePositiveRate: number
  riskScore: number
  riskScoreTrend: 'INCREASING' | 'DECREASING' | 'STABLE'
  severityDistribution: Array<{
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
    count: number
    percentage: number
  }>
  riskScoreHistory: Array<{
    timestamp: string
    score: number
  }>
}

export function RiskOverview() {
  const [data, setData] = useState<RiskOverviewData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const { error, handleError, clearError } = useErrorHandler()

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const response = await dashboardApi.getRiskAnalytics()
      if (response.success) {
        setData(response.data)
        setLastUpdated(new Date())
      } else {
        throw new Error(response.message || 'Failed to fetch risk analytics')
      }
    } catch (err) {
      handleError(err instanceof Error ? err : new Error('Failed to fetch risk data'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    // Refresh every 5 minutes
    const interval = setInterval(fetchData, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const getRiskScoreColor = (score: number) => {
    if (score >= 80) return 'text-red-600'
    if (score >= 60) return 'text-orange-600'
    if (score >= 40) return 'text-yellow-600'
    return 'text-green-600'
  }

  const getRiskScoreStatus = (score: number) => {
    if (score >= 80) return 'CRITICAL'
    if (score >= 60) return 'HIGH'
    if (score >= 40) return 'MEDIUM'
    return 'LOW'
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'INCREASING':
        return <ArrowTrendingUpIcon className="w-5 h-5 text-red-500" />
      case 'DECREASING':
        return <ArrowTrendingDownIcon className="w-5 h-5 text-green-500" />
      default:
        return <div className="w-5 h-5" />
    }
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-red-600">
            <AlertTriangleIcon className="w-5 h-5 mr-2" />
            Risk Overview Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">Failed to load risk overview data</p>
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
            <ShieldExclamationIcon className="w-5 h-5 mr-2 text-orange-600" />
            Risk Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded-lg" />
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

  const severityChartData = data.severityDistribution.map(item => ({
    name: item.severity,
    value: item.count,
    color: item.severity === 'CRITICAL' ? '#dc2626' : 
           item.severity === 'HIGH' ? '#ea580c' : 
           item.severity === 'MEDIUM' ? '#d97706' : '#16a34a'
  }))

  const riskScoreChartData = data.riskScoreHistory.map(item => ({
    date: item.timestamp,
    value: item.score
  }))

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
          <CardTitle className="flex items-center">
            <ShieldExclamationIcon className="w-5 h-5 mr-2 text-orange-600" />
            Risk Overview
          </CardTitle>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            {lastUpdated && (
              <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
            )}
            <button
              onClick={fetchData}
              className="p-1 hover:bg-gray-100 rounded"
              title="Refresh data"
            >
              <RefreshCwIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Risk Score and Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Overall Risk Score */}
          <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg border border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-700">Risk Score</p>
                <p className={`text-2xl font-bold ${getRiskScoreColor(data.riskScore)}`}>
                  {data.riskScore}
                </p>
              </div>
              <div className="flex items-center space-x-1">
                {getTrendIcon(data.riskScoreTrend)}
                <Badge variant="secondary" className="bg-red-100 text-red-800">
                  {getRiskScoreStatus(data.riskScore)}
                </Badge>
              </div>
            </div>
          </div>

          {/* Open Signals */}
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700">Open Signals</p>
                <p className="text-2xl font-bold text-orange-800">
                  {data.openSignals}
                </p>
              </div>
              <ExclamationTriangleIcon className="w-8 h-8 text-orange-600" />
            </div>
          </div>

          {/* Critical Signals */}
          <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg border border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-700">Critical</p>
                <p className="text-2xl font-bold text-red-800">
                  {data.criticalSignals}
                </p>
              </div>
              <AlertTriangleIcon className="w-8 h-8 text-red-600" />
            </div>
          </div>

          {/* Resolution Time */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Avg Resolution</p>
                <p className="text-2xl font-bold text-blue-800">
                  {data.averageResolutionTime}
                </p>
              </div>
              <ClockIcon className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Risk Score Trend */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Risk Score Trend</h4>
            <TimeSeriesChart
              data={riskScoreChartData}
              title=""
              subtitle="Risk score over time"
              height={200}
              color="#dc2626"
            />
          </div>

          {/* Severity Distribution */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Signal Severity Distribution</h4>
            <DonutChart
              data={severityChartData}
              title=""
              subtitle="Active signals by severity"
              height={200}
            />
          </div>
        </div>

        {/* False Positive Rate */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">False Positive Rate</p>
              <p className="text-lg font-semibold text-gray-900">
                {data.falsePositiveRate}%
              </p>
              <p className="text-xs text-gray-500">
                Signals incorrectly flagged as risks
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {data.falsePositiveRate > 10 ? (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  High
                </Badge>
              ) : data.falsePositiveRate > 5 ? (
                <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                  Medium
                </Badge>
              ) : (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Low
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
