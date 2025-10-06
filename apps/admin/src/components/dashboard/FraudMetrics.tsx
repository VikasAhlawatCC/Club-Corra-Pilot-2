'use client'

import { useState, useEffect } from 'react'
import { 
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChartBarIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import { AlertTriangleIcon, RefreshCwIcon, TrendingUpIcon, TrendingDownIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Badge } from '@/components/ui'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui'
import { DonutChart, TimeSeriesChart, BarChart } from '@/components/charts'
import { dashboardApi } from '@/lib/dashboardApi'
import { useErrorHandler } from '@/components/common'

interface FraudMetricsData {
  detectionMetrics: {
    totalTransactions: number
    flaggedTransactions: number
    confirmedFraud: number
    falsePositives: number
    detectionRate: number
    falsePositiveRate: number
    accuracy: number
  }
  fraudTrends: Array<{
    date: string
    totalTransactions: number
    flaggedTransactions: number
    confirmedFraud: number
    falsePositives: number
  }>
  fraudByType: Array<{
    type: string
    count: number
    percentage: number
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  }>
  fraudByAmount: Array<{
    range: string
    count: number
    percentage: number
    averageAmount: number
  }>
  preventionMetrics: {
    totalPrevented: number
    amountPrevented: number
    averagePreventionTime: string
    preventionSuccessRate: number
  }
  summary: {
    overallRiskScore: number
    riskTrend: 'INCREASING' | 'DECREASING' | 'STABLE'
    lastFraudAttempt: string
    activeInvestigations: number
  }
}

export function FraudMetrics() {
  const [data, setData] = useState<FraudMetricsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30d')
  const { error, handleError, clearError } = useErrorHandler()

  const fetchFraudData = async () => {
    try {
      setIsLoading(true)
      // Mock data for now - replace with actual API call when endpoint is available
      const mockData: FraudMetricsData = {
        detectionMetrics: {
          totalTransactions: 15420,
          flaggedTransactions: 234,
          confirmedFraud: 45,
          falsePositives: 23,
          detectionRate: 98.5,
          falsePositiveRate: 8.7,
          accuracy: 91.3
        },
        fraudTrends: [
          { date: '2024-01-01', totalTransactions: 512, flaggedTransactions: 8, confirmedFraud: 2, falsePositives: 1 },
          { date: '2024-01-02', totalTransactions: 498, flaggedTransactions: 6, confirmedFraud: 1, falsePositives: 1 },
          { date: '2024-01-03', totalTransactions: 523, flaggedTransactions: 12, confirmedFraud: 3, falsePositives: 2 },
          { date: '2024-01-04', totalTransactions: 489, flaggedTransactions: 7, confirmedFraud: 1, falsePositives: 1 },
          { date: '2024-01-05', totalTransactions: 534, flaggedTransactions: 15, confirmedFraud: 4, falsePositives: 2 },
          { date: '2024-01-06', totalTransactions: 476, flaggedTransactions: 5, confirmedFraud: 1, falsePositives: 0 },
          { date: '2024-01-07', totalTransactions: 521, flaggedTransactions: 9, confirmedFraud: 2, falsePositives: 1 },
        ],
        fraudByType: [
          { type: 'Duplicate Receipts', count: 18, percentage: 40.0, riskLevel: 'HIGH' },
          { type: 'Suspicious Amounts', count: 12, percentage: 26.7, riskLevel: 'MEDIUM' },
          { type: 'Multiple Accounts', count: 8, percentage: 17.8, riskLevel: 'CRITICAL' },
          { type: 'Geographic Mismatch', count: 4, percentage: 8.9, riskLevel: 'LOW' },
          { type: 'Device Anomalies', count: 3, percentage: 6.7, riskLevel: 'MEDIUM' }
        ],
        fraudByAmount: [
          { range: '₹0 - ₹100', count: 8, percentage: 17.8, averageAmount: 75 },
          { range: '₹101 - ₹500', count: 15, percentage: 33.3, averageAmount: 325 },
          { range: '₹501 - ₹1000', count: 12, percentage: 26.7, averageAmount: 750 },
          { range: '₹1001 - ₹5000', count: 7, percentage: 15.6, averageAmount: 2500 },
          { range: '₹5000+', count: 3, percentage: 6.7, averageAmount: 7500 }
        ],
        preventionMetrics: {
          totalPrevented: 189,
          amountPrevented: 125000,
          averagePreventionTime: '2.3 hours',
          preventionSuccessRate: 80.8
        },
        summary: {
          overallRiskScore: 72,
          riskTrend: 'INCREASING',
          lastFraudAttempt: '2024-01-07T14:30:00Z',
          activeInvestigations: 12
        }
      }
      
      setData(mockData)
    } catch (err) {
      handleError(err instanceof Error ? err : new Error('Failed to fetch fraud metrics'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchFraudData()
    // Refresh every 15 minutes
    const interval = setInterval(fetchFraudData, 15 * 60 * 1000)
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

  const getRiskScoreColor = (score: number) => {
    if (score >= 80) return 'text-red-600'
    if (score >= 60) return 'text-orange-600'
    if (score >= 40) return 'text-yellow-600'
    return 'text-green-600'
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'INCREASING':
        return <TrendingUpIcon className="w-5 h-5 text-red-500" />
      case 'DECREASING':
        return <TrendingDownIcon className="w-5 h-5 text-green-500" />
      default:
        return <div className="w-5 h-5" />
    }
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-red-600">
            <AlertTriangleIcon className="w-5 h-5 mr-2" />
            Fraud Metrics Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">Failed to load fraud metrics</p>
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
            <ShieldCheckIcon className="w-5 h-5 mr-2 text-green-600" />
            Fraud Metrics
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

  const fraudTrendsChartData = data.fraudTrends.map(item => ({
    date: item.date,
    value: item.flaggedTransactions
  }))

  const fraudTypeChartData = data.fraudByType.map(item => ({
    name: item.type,
    value: item.count,
    color: item.riskLevel === 'CRITICAL' ? '#dc2626' : 
           item.riskLevel === 'HIGH' ? '#ea580c' : 
           item.riskLevel === 'MEDIUM' ? '#d97706' : '#16a34a'
  }))

  const fraudAmountChartData = data.fraudByAmount.map(item => ({
    name: item.range,
    value: item.count,
    average: item.averageAmount
  }))

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
          <CardTitle className="flex items-center">
            <ShieldCheckIcon className="w-5 h-5 mr-2 text-green-600" />
            Fraud Metrics
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">7 Days</SelectItem>
                <SelectItem value="30d">30 Days</SelectItem>
                <SelectItem value="90d">90 Days</SelectItem>
                <SelectItem value="1y">1 Year</SelectItem>
              </SelectContent>
            </Select>
            <button
              onClick={fetchFraudData}
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
              Real fraud metrics will be integrated when the backend endpoints are fully implemented.
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Detection Rate */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Detection Rate</p>
                <p className="text-2xl font-bold text-green-800">
                  {data.detectionMetrics.detectionRate}%
                </p>
              </div>
              <ShieldCheckIcon className="w-8 h-8 text-green-600" />
            </div>
          </div>

          {/* False Positive Rate */}
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg border border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-700">False Positive</p>
                <p className="text-2xl font-bold text-yellow-800">
                  {data.detectionMetrics.falsePositiveRate}%
                </p>
              </div>
              <XCircleIcon className="w-8 h-8 text-yellow-600" />
            </div>
          </div>

          {/* Prevention Success */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Prevention Rate</p>
                <p className="text-2xl font-bold text-blue-800">
                  {data.preventionMetrics.preventionSuccessRate}%
                </p>
              </div>
              <CheckCircleIcon className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          {/* Overall Risk Score */}
          <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg border border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-700">Risk Score</p>
                <p className={`text-2xl font-bold ${getRiskScoreColor(data.summary.overallRiskScore)}`}>
                  {data.summary.overallRiskScore}
                </p>
              </div>
              <div className="flex items-center space-x-1">
                {getTrendIcon(data.summary.riskTrend)}
                <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Fraud Trends */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Fraud Detection Trends</h4>
            <TimeSeriesChart
              data={fraudTrendsChartData}
              title=""
              subtitle="Daily fraud detection metrics"
              height={200}
              color="#dc2626"
            />
          </div>

          {/* Fraud by Type */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Fraud by Type</h4>
            <DonutChart
              data={fraudTypeChartData}
              title=""
              subtitle="Distribution of fraud types"
              height={200}
            />
          </div>
        </div>

        {/* Fraud by Amount */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Fraud by Amount Range</h4>
          <BarChart
            data={fraudAmountChartData}
            title=""
            subtitle="Fraud incidents by transaction amount"
            height={200}
            horizontal={true}
          />
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {data.fraudByAmount.map((item) => (
              <div
                key={item.range}
                className="border border-gray-200 rounded-lg p-3 bg-gray-50 text-center"
              >
                <div className="text-sm font-medium text-gray-900 mb-1">{item.range}</div>
                <div className="text-lg font-bold text-blue-600">{item.count}</div>
                <div className="text-xs text-gray-500">{item.percentage}%</div>
                <div className="text-xs text-gray-600">Avg: {formatCurrency(item.averageAmount)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Prevention Metrics */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Fraud Prevention Summary</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{data.preventionMetrics.totalPrevented}</div>
              <div className="text-sm text-gray-600">Attempts Prevented</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{formatCurrency(data.preventionMetrics.amountPrevented)}</div>
              <div className="text-sm text-gray-600">Amount Prevented</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{data.preventionMetrics.averagePreventionTime}</div>
              <div className="text-sm text-gray-600">Avg Prevention Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{data.summary.activeInvestigations}</div>
              <div className="text-sm text-gray-600">Active Investigations</div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-700">Recent Activity</h4>
            <span className="text-xs text-gray-500">
              Last fraud attempt: {formatTimeAgo(data.summary.lastFraudAttempt)}
            </span>
          </div>
          <div className="text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Total Transactions Analyzed:</span>
              <span className="font-medium">{data.detectionMetrics.totalTransactions.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Transactions Flagged:</span>
              <span className="font-medium">{data.detectionMetrics.flaggedTransactions}</span>
            </div>
            <div className="flex justify-between">
              <span>Confirmed Fraud:</span>
              <span className="font-medium text-red-600">{data.detectionMetrics.confirmedFraud}</span>
            </div>
            <div className="flex justify-between">
              <span>False Positives:</span>
              <span className="font-medium text-yellow-600">{data.detectionMetrics.falsePositives}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
