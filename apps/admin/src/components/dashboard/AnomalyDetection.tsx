'use client'

import { useState, useEffect } from 'react'
import { 
  ExclamationTriangleIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import { AlertTriangleIcon, RefreshCwIcon, ActivityIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Badge } from '@/components/ui'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui'
import { TimeSeriesChart, BarChart } from '@/components/charts'
import { dashboardApi } from '@/lib/dashboardApi'
import { useErrorHandler } from '@/components/common'

interface AnomalyData {
  transactionVolume: Array<{
    timestamp: string
    volume: number
    isAnomaly: boolean
    anomalyScore: number
  }>
  userActivity: Array<{
    timestamp: string
    activeUsers: number
    isAnomaly: boolean
    anomalyScore: number
  }>
  geographicAnomalies: Array<{
    location: string
    normalVolume: number
    currentVolume: number
    anomalyScore: number
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  }>
  deviceAnomalies: Array<{
    deviceType: string
    normalVolume: number
    currentVolume: number
    anomalyScore: number
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  }>
  summary: {
    totalAnomalies: number
    highRiskAnomalies: number
    averageAnomalyScore: number
    lastAnomalyTime: string
  }
}

export function AnomalyDetection() {
  const [data, setData] = useState<AnomalyData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('24h')
  const [anomalyType, setAnomalyType] = useState('all')
  const { error, handleError, clearError } = useErrorHandler()

  const fetchAnomalyData = async () => {
    try {
      setIsLoading(true)
      // Mock data for now - replace with actual API call when endpoint is available
      const mockData: AnomalyData = {
        transactionVolume: [
          { timestamp: '2024-01-01T00:00:00Z', volume: 150, isAnomaly: false, anomalyScore: 0.1 },
          { timestamp: '2024-01-01T01:00:00Z', volume: 145, isAnomaly: false, anomalyScore: 0.2 },
          { timestamp: '2024-01-01T02:00:00Z', volume: 160, isAnomaly: false, anomalyScore: 0.3 },
          { timestamp: '2024-01-01T03:00:00Z', volume: 155, isAnomaly: false, anomalyScore: 0.1 },
          { timestamp: '2024-01-01T04:00:00Z', volume: 300, isAnomaly: true, anomalyScore: 0.9 },
          { timestamp: '2024-01-01T05:00:00Z', volume: 320, isAnomaly: true, anomalyScore: 0.95 },
          { timestamp: '2024-01-01T06:00:00Z', volume: 165, isAnomaly: false, anomalyScore: 0.2 },
          { timestamp: '2024-01-01T07:00:00Z', volume: 170, isAnomaly: false, anomalyScore: 0.1 },
        ],
        userActivity: [
          { timestamp: '2024-01-01T00:00:00Z', activeUsers: 45, isAnomaly: false, anomalyScore: 0.1 },
          { timestamp: '2024-01-01T01:00:00Z', activeUsers: 42, isAnomaly: false, anomalyScore: 0.2 },
          { timestamp: '2024-01-01T02:00:00Z', activeUsers: 38, isAnomaly: false, anomalyScore: 0.3 },
          { timestamp: '2024-01-01T03:00:00Z', activeUsers: 35, isAnomaly: false, anomalyScore: 0.1 },
          { timestamp: '2024-01-01T04:00:00Z', activeUsers: 85, isAnomaly: true, anomalyScore: 0.8 },
          { timestamp: '2024-01-01T05:00:00Z', activeUsers: 90, isAnomaly: true, anomalyScore: 0.9 },
          { timestamp: '2024-01-01T06:00:00Z', activeUsers: 40, isAnomaly: false, anomalyScore: 0.2 },
          { timestamp: '2024-01-01T07:00:00Z', activeUsers: 48, isAnomaly: false, anomalyScore: 0.1 },
        ],
        geographicAnomalies: [
          { location: 'Mumbai', normalVolume: 25, currentVolume: 80, anomalyScore: 0.9, riskLevel: 'CRITICAL' },
          { location: 'Delhi', normalVolume: 30, currentVolume: 45, anomalyScore: 0.6, riskLevel: 'MEDIUM' },
          { location: 'Bangalore', normalVolume: 20, currentVolume: 22, anomalyScore: 0.1, riskLevel: 'LOW' },
          { location: 'Chennai', normalVolume: 15, currentVolume: 35, anomalyScore: 0.7, riskLevel: 'HIGH' },
        ],
        deviceAnomalies: [
          { deviceType: 'Mobile', normalVolume: 60, currentVolume: 120, anomalyScore: 0.8, riskLevel: 'HIGH' },
          { deviceType: 'Desktop', normalVolume: 25, currentVolume: 30, anomalyScore: 0.2, riskLevel: 'LOW' },
          { deviceType: 'Tablet', normalVolume: 15, currentVolume: 45, anomalyScore: 0.9, riskLevel: 'CRITICAL' },
        ],
        summary: {
          totalAnomalies: 8,
          highRiskAnomalies: 3,
          averageAnomalyScore: 0.65,
          lastAnomalyTime: '2024-01-01T05:00:00Z'
        }
      }
      
      setData(mockData)
    } catch (err) {
      handleError(err instanceof Error ? err : new Error('Failed to fetch anomaly data'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAnomalyData()
    // Refresh every 10 minutes
    const interval = setInterval(fetchAnomalyData, 10 * 60 * 1000)
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

  const getAnomalyScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-red-600'
    if (score >= 0.6) return 'text-orange-600'
    if (score >= 0.4) return 'text-yellow-600'
    return 'text-green-600'
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

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-red-600">
            <AlertTriangleIcon className="w-5 h-5 mr-2" />
            Anomaly Detection Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">Failed to load anomaly detection data</p>
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
            <ExclamationTriangleIcon className="w-5 h-5 mr-2 text-orange-600" />
            Anomaly Detection
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

  const transactionChartData = data.transactionVolume.map(item => ({
    date: item.timestamp,
    value: item.volume
  }))

  const userActivityChartData = data.userActivity.map(item => ({
    date: item.timestamp,
    value: item.activeUsers
  }))

  const geographicChartData = data.geographicAnomalies.map(item => ({
    name: item.location,
    value: item.currentVolume,
    normal: item.normalVolume,
    anomaly: item.anomalyScore
  }))

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
          <CardTitle className="flex items-center">
            <ExclamationTriangleIcon className="w-5 h-5 mr-2 text-orange-600" />
            Anomaly Detection
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">1 Hour</SelectItem>
                <SelectItem value="6h">6 Hours</SelectItem>
                <SelectItem value="24h">24 Hours</SelectItem>
                <SelectItem value="7d">7 Days</SelectItem>
              </SelectContent>
            </Select>
            <button
              onClick={fetchAnomalyData}
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
              Real anomaly detection data will be integrated when the backend endpoints are fully implemented.
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700">Total Anomalies</p>
                <p className="text-2xl font-bold text-orange-800">
                  {data.summary.totalAnomalies}
                </p>
              </div>
              <ExclamationTriangleIcon className="w-8 h-8 text-orange-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg border border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-700">High Risk</p>
                <p className="text-2xl font-bold text-red-800">
                  {data.summary.highRiskAnomalies}
                </p>
              </div>
              <AlertTriangleIcon className="w-8 h-8 text-red-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Avg Score</p>
                <p className="text-2xl font-bold text-blue-800">
                  {(data.summary.averageAnomalyScore * 100).toFixed(1)}%
                </p>
              </div>
              <ChartBarIcon className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">Last Anomaly</p>
                <p className="text-lg font-bold text-purple-800">
                  {formatTimeAgo(data.summary.lastAnomalyTime)}
                </p>
              </div>
              <ClockIcon className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Transaction Volume Anomalies */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Transaction Volume Anomalies</h4>
            <TimeSeriesChart
              data={transactionChartData}
              title=""
              subtitle="Volume with anomaly detection"
              height={200}
              color="#dc2626"
            />
            <div className="mt-2 text-xs text-gray-500">
              Red dots indicate detected anomalies
            </div>
          </div>

          {/* User Activity Anomalies */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">User Activity Anomalies</h4>
            <TimeSeriesChart
              data={userActivityChartData}
              title=""
              subtitle="Active users with anomaly detection"
              height={200}
              color="#ea580c"
            />
            <div className="mt-2 text-xs text-gray-500">
              Red dots indicate detected anomalies
            </div>
          </div>
        </div>

        {/* Geographic Anomalies */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Geographic Anomalies</h4>
          <BarChart
            data={geographicChartData}
            title=""
            subtitle="Transaction volume by location"
            height={200}
            horizontal={true}
          />
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {data.geographicAnomalies.map((anomaly) => (
              <div
                key={anomaly.location}
                className="border border-gray-200 rounded-lg p-3 bg-gray-50"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900">{anomaly.location}</span>
                  <Badge variant="secondary" className={getRiskLevelColor(anomaly.riskLevel)}>
                    {anomaly.riskLevel}
                  </Badge>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Normal:</span>
                    <span className="font-medium">{anomaly.normalVolume}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Current:</span>
                    <span className="font-medium">{anomaly.currentVolume}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Score:</span>
                    <span className={`font-medium ${getAnomalyScoreColor(anomaly.anomalyScore)}`}>
                      {(anomaly.anomalyScore * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Device Anomalies */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Device Type Anomalies</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {data.deviceAnomalies.map((anomaly) => (
              <div
                key={anomaly.deviceType}
                className="border border-gray-200 rounded-lg p-4 bg-gray-50"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-900">{anomaly.deviceType}</span>
                  <Badge variant="secondary" className={getRiskLevelColor(anomaly.riskLevel)}>
                    {anomaly.riskLevel}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Normal Volume:</span>
                    <span className="font-medium">{anomaly.normalVolume}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Current Volume:</span>
                    <span className="font-medium">{anomaly.currentVolume}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Anomaly Score:</span>
                    <span className={`font-medium ${getAnomalyScoreColor(anomaly.anomalyScore)}`}>
                      {(anomaly.anomalyScore * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
