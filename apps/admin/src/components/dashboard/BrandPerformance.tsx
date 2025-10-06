'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { BarChart, DonutChart, TimeSeriesChart } from '@/components/charts'
import { dashboardDataService } from '@/lib/dashboardDataService'
import { dashboardUtils, dashboardApi } from '@/lib/dashboardApi'
import { useState, useEffect } from 'react'
import { Building2, TrendingUp, Users, Target, Activity } from 'lucide-react'

interface BrandPerformanceProps {
  className?: string
}

export function BrandPerformance({ className = '' }: BrandPerformanceProps) {
  const [performanceData, setPerformanceData] = useState<Array<{ name: string; value: number; color: string }>>([])
  const [engagementData, setEngagementData] = useState<Array<{ date: string; value: number }>>([])
  const [brandMetrics, setBrandMetrics] = useState<Array<{ brandName: string; volume: number; successRate: number; engagement: number }>>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchBrandPerformanceData = async () => {
      try {
        setIsLoading(true)
        
        // Load top performing brands from dashboard metrics if available
        try {
          const metricsResp = await dashboardApi.getDashboardMetrics()
          const brands = (metricsResp as any)?.data?.brandMetrics?.topPerformingBrands
          if (Array.isArray(brands) && brands.length > 0) {
            setBrandMetrics(brands.map((b: any) => ({
              brandName: b.brandName,
              volume: Number(b.transactionVolume) || 0,
              successRate: Number(b.successRate) || 0,
              engagement: Number(b.userEngagement) || 0
            })))
          } else {
            setBrandMetrics(generateBrandMetrics())
          }
        } catch (e) {
          console.warn('Failed to fetch dashboard metrics for brands:', e)
          setBrandMetrics(generateBrandMetrics())
        }

        // Keep synthetic performance tiers and engagement line until dedicated endpoint exists
        setPerformanceData(generatePerformanceData())
        setEngagementData(generateEngagementData())
      } catch (error) {
        console.error('Failed to fetch brand performance data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchBrandPerformanceData()
  }, [])

  const generatePerformanceData = (): Array<{ name: string; value: number; color: string }> => {
    return [
      { name: 'High Performers', value: 35, color: '#10b981' },
      { name: 'Medium Performers', value: 45, color: '#f59e0b' },
      { name: 'Low Performers', value: 20, color: '#ef4444' }
    ]
  }

  const generateEngagementData = (): Array<{ date: string; value: number }> => {
    const days = 30
    const baseEngagement = 75
    const variance = 0.15
    
    return Array.from({ length: days }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (days - i - 1))
      
      // Simulate realistic engagement patterns
      const randomFactor = 1 + (Math.random() - 0.5) * variance
      
      return {
        date: date.toISOString().split('T')[0],
        value: Math.max(0, Math.min(100, baseEngagement * randomFactor))
      }
    })
  }

  const generateBrandMetrics = (): Array<{ brandName: string; volume: number; successRate: number; engagement: number }> => {
    return [
      { brandName: 'Starbucks', volume: 1250, successRate: 95.2, engagement: 87.5 },
      { brandName: 'McDonald\'s', volume: 980, successRate: 92.1, engagement: 82.3 },
      { brandName: 'Domino\'s', volume: 750, successRate: 88.7, engagement: 78.9 },
      { brandName: 'KFC', volume: 620, successRate: 91.4, engagement: 85.2 },
      { brandName: 'Subway', volume: 480, successRate: 89.6, engagement: 76.8 }
    ]
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Brand Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const totalBrands = performanceData.reduce((sum, category) => sum + category.value, 0)
  const highPerformers = performanceData.find(d => d.name === 'High Performers')?.value || 0
  const highPerformerPercentage = totalBrands > 0 ? (highPerformers / totalBrands) * 100 : 0
  const avgSuccessRate = brandMetrics.reduce((sum, brand) => sum + brand.successRate, 0) / brandMetrics.length
  const avgEngagement = brandMetrics.reduce((sum, brand) => sum + brand.engagement, 0) / brandMetrics.length

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Brand Performance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Brand Performance KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">High Performers</span>
              </div>
              <p className="text-2xl font-bold text-green-900 mt-2">
                {highPerformerPercentage.toFixed(1)}%
              </p>
              <p className="text-xs text-green-700 mt-1">Of total brands</p>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Avg Success Rate</span>
              </div>
              <p className="text-2xl font-bold text-blue-900 mt-2">
                {avgSuccessRate.toFixed(1)}%
              </p>
              <p className="text-xs text-blue-700 mt-1">Transaction success</p>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-800">Avg Engagement</span>
              </div>
              <p className="text-2xl font-bold text-purple-900 mt-2">
                {avgEngagement.toFixed(1)}%
              </p>
              <p className="text-xs text-purple-700 mt-1">User engagement rate</p>
            </div>
            
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-800">Total Brands</span>
              </div>
              <p className="text-2xl font-bold text-orange-900 mt-2">
                {totalBrands}
              </p>
              <p className="text-xs text-orange-700 mt-1">Active partnerships</p>
            </div>
          </div>

          {/* Performance Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-600">Performance Distribution</h3>
                <Target className="h-4 w-4 text-blue-600" />
              </div>
              <DonutChart
                data={performanceData}
                title=""
                subtitle="Brands by performance tier"
                height={200}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-600">Engagement Trends</h3>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
                          <TimeSeriesChart
              data={engagementData}
              title=""
              subtitle="Average brand engagement over time"
              height={200}
            />
            </div>
          </div>

          {/* Top Performing Brands */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-600">Top Performing Brands</h3>
              <Building2 className="h-4 w-4 text-blue-600" />
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="space-y-3">
                {brandMetrics.slice(0, 5).map((brand, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-blue-600">{index + 1}</span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{brand.brandName}</div>
                        <div className="text-sm text-gray-500">
                          Volume: {brand.volume.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {brand.successRate.toFixed(1)}% success
                      </div>
                      <div className="text-xs text-gray-500">
                        {brand.engagement.toFixed(1)}% engagement
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Performance Insights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-green-800">Best Performer</div>
              <div className="text-xl font-bold text-green-900 mt-1">
                {brandMetrics[0]?.brandName || 'N/A'}
              </div>
              <div className="text-xs text-green-700 mt-1">
                {brandMetrics[0]?.successRate.toFixed(1)}% success rate
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-blue-800">Highest Volume</div>
              <div className="text-xl font-bold text-blue-900 mt-1">
                {brandMetrics[0]?.volume.toLocaleString() || 0}
              </div>
              <div className="text-xs text-blue-700 mt-1">Transactions</div>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-purple-800">Most Engaged</div>
              <div className="text-xl font-bold text-purple-900 mt-1">
                {brandMetrics[0]?.engagement.toFixed(1) || 0}%
              </div>
              <div className="text-xs text-purple-700 mt-1">Engagement rate</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
