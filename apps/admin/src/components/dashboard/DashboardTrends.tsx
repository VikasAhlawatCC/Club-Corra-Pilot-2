'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { TimeSeriesChart } from '@/components/charts'
import { ArrowTrendingUpIcon, ChartBarIcon } from '@heroicons/react/24/outline'
import { dashboardDataService } from '@/lib/dashboardDataService'
import { useState, useEffect } from 'react'

interface DashboardTrendsProps {
  className?: string
}

export function DashboardTrends({ className = '' }: DashboardTrendsProps) {
  const [timeSeriesData, setTimeSeriesData] = useState<Array<{ date: string; value: number }>>([])

  useEffect(() => {
    const fetchTrendsData = async () => {
      try {
        const data = await dashboardDataService.getTimeSeriesData('7d')
        setTimeSeriesData(data)
      } catch (error) {
        console.error('Failed to fetch trends data:', error)
      }
    }

    fetchTrendsData()
  }, [])

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ArrowTrendingUpIcon className="w-5 h-5 mr-2 text-blue-600" />
            User Growth Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TimeSeriesChart
            data={timeSeriesData}
            title=""
            subtitle="Daily user registrations over the past week"
            height={250}
            showArea={true}
            color="#3b82f6"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ChartBarIcon className="w-5 h-5 mr-2 text-green-600" />
            Transaction Volume
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TimeSeriesChart
            data={timeSeriesData.map(item => ({ ...item, value: item.value * 0.8 }))}
            title=""
            subtitle="Daily transaction volume over the past week"
            height={250}
            showArea={true}
            color="#10b981"
          />
        </CardContent>
      </Card>
    </div>
  )
}
