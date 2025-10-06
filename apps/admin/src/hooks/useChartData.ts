import { useMemo } from 'react'

export interface ChartDataPoint {
  name: string
  value: number
  color?: string
}

export interface TimeSeriesDataPoint {
  date: string
  value: number
}

export function useChartData() {
  const transformTimeSeriesData = useMemo(() => {
    return (data: Array<{ timestamp: string; value: number }>): TimeSeriesDataPoint[] => {
      return data.map(item => ({
        date: item.timestamp,
        value: item.value
      }))
    }
  }, [])

  const transformBarChartData = useMemo(() => {
    return (data: Array<{ name: string; value: number; color?: string }>): ChartDataPoint[] => {
      return data.map(item => ({
        name: item.name,
        value: item.value,
        color: item.color
      }))
    }
  }, [])

  const transformDonutChartData = useMemo(() => {
    return (data: Array<{ name: string; value: number; color?: string }>): ChartDataPoint[] => {
      return data.map(item => ({
        name: item.name,
        value: item.value,
        color: item.color
      }))
    }
  }, [])

  const getRiskLevelColor = useMemo(() => {
    return (riskLevel: string): string => {
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
  }, [])

  const getStatusColor = useMemo(() => {
    return (status: string): string => {
      switch (status) {
        case 'OPEN':
          return 'bg-red-100 text-red-800 border-red-200'
        case 'INVESTIGATING':
          return 'bg-yellow-100 text-yellow-800 border-yellow-200'
        case 'RESOLVED':
          return 'bg-green-100 text-green-800 border-green-200'
        case 'FALSE_POSITIVE':
          return 'bg-blue-100 text-blue-800 border-blue-200'
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
  }, [])

  const formatTimeAgo = useMemo(() => {
    return (date: Date | string): string => {
      const now = new Date()
      const targetDate = typeof date === 'string' ? new Date(date) : date
      const diffInMinutes = Math.floor((now.getTime() - targetDate.getTime()) / (1000 * 60))
      
      if (diffInMinutes < 1) return 'Just now'
      if (diffInMinutes < 60) return `${diffInMinutes}m ago`
      if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
      return `${Math.floor(diffInMinutes / 1440)}d ago`
    }
  }, [])

  return {
    transformTimeSeriesData,
    transformBarChartData,
    transformDonutChartData,
    getRiskLevelColor,
    getStatusColor,
    formatTimeAgo
  }
}
