'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { CohortChart, BarChart } from '@/components/charts'
import { dashboardDataService } from '@/lib/dashboardDataService'
import { dashboardUtils } from '@/lib/dashboardApi'
import { useState, useEffect } from 'react'
import { Users, TrendingUp, Clock, Target } from 'lucide-react'

interface CohortAnalysisProps {
  className?: string
}

export function CohortAnalysis({ className = '' }: CohortAnalysisProps) {
  const [cohortData, setCohortData] = useState<Array<{ month: string; users: number; retention: number[] }>>([])
  const [retentionData, setRetentionData] = useState<Array<{ name: string; value: number; color: string }>>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchCohortData = async () => {
      try {
        setIsLoading(true)
        
        // Generate realistic cohort data (this would come from API in real implementation)
        const cohortData = generateCohortData()
        setCohortData(cohortData)
        
        // Generate retention data for the bar chart
        const retentionData = generateRetentionData()
        setRetentionData(retentionData)
      } catch (error) {
        console.error('Failed to fetch cohort data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCohortData()
  }, [])

  const generateCohortData = (): Array<{ month: string; users: number; retention: number[] }> => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
    return months.map((month, index) => ({
      month,
      users: Math.floor(Math.random() * 200) + 100,
      retention: Array.from({ length: 6 }, (_, i) => {
        // Simulate realistic retention patterns
        const baseRetention = 100 - (i * 12) // Base decline
        const variation = (Math.random() - 0.5) * 8 // ±4% variation
        return Math.max(0, Math.min(100, baseRetention + variation))
      })
    }))
  }

  const generateRetentionData = (): Array<{ name: string; value: number; color: string }> => {
    const periods = ['1 Month', '2 Months', '3 Months', '6 Months', '12 Months']
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
    
    return periods.map((period, index) => ({
      name: period,
      value: Math.floor(Math.random() * 40) + 30, // 30-70% range
      color: colors[index]
    }))
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Cohort Analysis</CardTitle>
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
          Cohort Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Cohort Retention Matrix */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-600">Cohort Retention Matrix</h3>
              <Clock className="h-4 w-4 text-blue-600" />
            </div>
            <CohortChart
              data={cohortData}
              title=""
              subtitle="User retention by signup month"
              height={300}
            />
          </div>

          {/* Retention by Period */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-600">Retention by Period</h3>
              <Target className="h-4 w-4 text-green-600" />
            </div>
            <BarChart
              data={retentionData}
              title=""
              subtitle="Average retention rates by time period"
              height={200}
              horizontal={true}
            />
          </div>

          {/* Key Insights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Best Cohort</span>
              </div>
              <p className="text-2xl font-bold text-blue-900 mt-2">Mar 2024</p>
              <p className="text-xs text-blue-700 mt-1">85% retention at 3 months</p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">Total Users</span>
              </div>
              <p className="text-2xl font-bold text-green-900 mt-2">
                {cohortData.reduce((sum, cohort) => sum + cohort.users, 0).toLocaleString()}
              </p>
              <p className="text-xs text-green-700 mt-1">Across all cohorts</p>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-800">Avg Retention</span>
              </div>
              <p className="text-2xl font-bold text-purple-900 mt-2">67%</p>
              <p className="text-xs text-purple-700 mt-1">At 6 months</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
