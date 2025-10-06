'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { DonutChart, BarChart } from '@/components/charts'
import { dashboardDataService } from '@/lib/dashboardDataService'
import { dashboardUtils } from '@/lib/dashboardApi'
import { useState, useEffect } from 'react'
import { Users, Target, TrendingUp, Activity } from 'lucide-react'

interface UserSegmentsProps {
  className?: string
}

export function UserSegments({ className = '' }: UserSegmentsProps) {
  const [segmentsData, setSegmentsData] = useState<Array<{ name: string; value: number; color: string }>>([])
  const [segmentMetrics, setSegmentMetrics] = useState<Array<{ name: string; value: number; color: string }>>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUserSegmentsData = async () => {
      try {
        setIsLoading(true)
        
        // Generate realistic user segments data (this would come from API in real implementation)
        const segmentsData = generateSegmentsData()
        setSegmentsData(segmentsData)
        
        // Generate segment performance metrics
        const segmentMetrics = generateSegmentMetrics()
        setSegmentMetrics(segmentMetrics)
      } catch (error) {
        console.error('Failed to fetch user segments data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserSegmentsData()
  }, [])

  const generateSegmentsData = (): Array<{ name: string; value: number; color: string }> => {
    const segments = [
      { name: 'Active Users', value: 1250, color: '#10b981' },
      { name: 'New Users', value: 450, color: '#3b82f6' },
      { name: 'Returning Users', value: 800, color: '#f59e0b' },
      { name: 'Dormant Users', value: 300, color: '#6b7280' },
      { name: 'Power Users', value: 200, color: '#8b5cf6' }
    ]
    return segments
  }

  const generateSegmentMetrics = (): Array<{ name: string; value: number; color: string }> => {
    const metrics = [
      { name: 'Engagement Rate', value: 78, color: '#10b981' },
      { name: 'Retention Rate', value: 65, color: '#3b82f6' },
      { name: 'Conversion Rate', value: 42, color: '#f59e0b' },
      { name: 'Churn Rate', value: 15, color: '#ef4444' },
      { name: 'Lifetime Value', value: 89, color: '#8b5cf6' }
    ]
    return metrics
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>User Segments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const totalUsers = segmentsData.reduce((sum, segment) => sum + segment.value, 0)
  const activeUsers = segmentsData.find(s => s.name === 'Active Users')?.value || 0
  const activePercentage = totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          User Segments
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Segment Distribution */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-600">User Distribution</h3>
              <Target className="h-4 w-4 text-blue-600" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DonutChart
                data={segmentsData}
                title=""
                subtitle="User distribution by segment"
                height={200}
              />
              <div className="space-y-3">
                {segmentsData.map((segment) => (
                  <div key={segment.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: segment.color }}
                      />
                      <span className="text-sm text-gray-600">{segment.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{segment.value.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">
                        {totalUsers > 0 ? ((segment.value / totalUsers) * 100).toFixed(1) : 0}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Segment Performance Metrics */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-600">Segment Performance</h3>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
            <BarChart
              data={segmentMetrics}
              title=""
              subtitle="Key metrics by segment"
              height={200}
              horizontal={true}
            />
          </div>

          {/* Key Insights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">Active Users</span>
              </div>
              <p className="text-2xl font-bold text-green-900 mt-2">
                {activePercentage.toFixed(1)}%
              </p>
              <p className="text-xs text-green-700 mt-1">Of total user base</p>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Total Users</span>
              </div>
              <p className="text-2xl font-bold text-blue-900 mt-2">
                {totalUsers.toLocaleString()}
              </p>
              <p className="text-xs text-blue-700 mt-1">Across all segments</p>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-800">Top Segment</span>
              </div>
              <p className="text-2xl font-bold text-purple-900 mt-2">
                {segmentsData[0]?.name || 'N/A'}
              </p>
              <p className="text-xs text-purple-700 mt-1">
                {segmentsData[0]?.value.toLocaleString() || 0} users
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
