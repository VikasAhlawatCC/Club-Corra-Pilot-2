'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { TimeSeriesChart, CohortChart, DonutChart } from '@/components/charts'
import { dashboardDataService } from '@/lib/dashboardDataService'
import { dashboardUtils } from '@/lib/dashboardApi'
import { useState, useEffect } from 'react'
import { TrendingUp, Users, UserPlus, Activity } from 'lucide-react'

interface UserAnalyticsProps {
  className?: string
}

export function UserAnalytics({ className = '' }: UserAnalyticsProps) {
  const [userGrowthData, setUserGrowthData] = useState<Array<{ date: string; value: number }>>([])
  const [cohortData, setCohortData] = useState<Array<{ month: string; users: number; retention: number[] }>>([])
  const [userSegmentsData, setUserSegmentsData] = useState<Array<{ name: string; value: number; color: string }>>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUserAnalyticsData = async () => {
      try {
        setIsLoading(true)
        const [growthData, segmentsData] = await Promise.all([
          dashboardDataService.getTimeSeriesData('30d'),
          dashboardDataService.getUserSegmentsData()
        ])
        
        setUserGrowthData(growthData)
        setUserSegmentsData(segmentsData)
        
        // Generate cohort data (this would come from API in real implementation)
        const cohortData = generateCohortData()
        setCohortData(cohortData)
      } catch (error) {
        console.error('Failed to fetch user analytics data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserAnalyticsData()
  }, [])

  const generateCohortData = (): Array<{ month: string; users: number; retention: number[] }> => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
    return months.map((month, index) => ({
      month,
      users: Math.floor(Math.random() * 200) + 100,
      retention: Array.from({ length: 6 }, (_, i) => 
        Math.max(0, 100 - (i * 15) + (Math.random() * 10 - 5))
      )
    }))
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>User Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          User Analytics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Growth Trends */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-600">User Growth Trends</h3>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
            <TimeSeriesChart
              data={userGrowthData}
              title=""
              subtitle="New users over time"
              height={200}
            />
          </div>

          {/* User Segments */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-600">User Segments</h3>
              <Activity className="h-4 w-4 text-blue-600" />
            </div>
            <DonutChart
              data={userSegmentsData}
              title=""
              subtitle="User distribution by segment"
              height={200}
            />
          </div>

          {/* Cohort Analysis */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-600">Cohort Retention Analysis</h3>
              <UserPlus className="h-4 w-4 text-purple-600" />
            </div>
            <CohortChart
              data={cohortData}
              title=""
              subtitle="User retention by signup month"
              height={250}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
