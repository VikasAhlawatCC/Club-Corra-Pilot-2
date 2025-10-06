'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { TimeSeriesChart, BarChart } from '@/components/charts'
import { dashboardDataService } from '@/lib/dashboardDataService'
import { dashboardUtils } from '@/lib/dashboardApi'
import { useState, useEffect } from 'react'
import { DollarSign, TrendingUp, TrendingDown, Target, Activity } from 'lucide-react'

interface FinancialMetricsProps {
  className?: string
}

export function FinancialMetrics({ className = '' }: FinancialMetricsProps) {
  const [revenueData, setRevenueData] = useState<Array<{ date: string; value: number }>>([])
  const [costData, setCostData] = useState<Array<{ name: string; value: number; color: string }>>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchFinancialData = async () => {
      try {
        setIsLoading(true)
        
        // Generate realistic financial data (this would come from API in real implementation)
        const revenueData = generateRevenueData()
        setRevenueData(revenueData)
        
        const costData = generateCostData()
        setCostData(costData)
      } catch (error) {
        console.error('Failed to fetch financial data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchFinancialData()
  }, [])

  const generateRevenueData = (): Array<{ date: string; value: number }> => {
    const days = 30
    const baseRevenue = 50000
    const variance = 0.2
    
    return Array.from({ length: days }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (days - i - 1))
      
      // Add some realistic variation (weekends lower, weekdays higher)
      const dayOfWeek = date.getDay()
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
      const multiplier = isWeekend ? 0.8 : 1.0
      
      // Add some random variation
      const randomFactor = 1 + (Math.random() - 0.5) * variance
      
      return {
        date: date.toISOString().split('T')[0],
        value: Math.round(baseRevenue * multiplier * randomFactor)
      }
    })
  }

  const generateCostData = (): Array<{ name: string; value: number; color: string }> => {
    const costs = [
      { name: 'Operational Costs', value: 25000, color: '#ef4444' },
      { name: 'Marketing', value: 15000, color: '#f59e0b' },
      { name: 'Technology', value: 12000, color: '#3b82f6' },
      { name: 'Customer Support', value: 8000, color: '#10b981' },
      { name: 'Administrative', value: 5000, color: '#8b5cf6' }
    ]
    return costs
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Financial Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const totalRevenue = revenueData.reduce((sum, day) => sum + day.value, 0)
  const avgDailyRevenue = totalRevenue / revenueData.length
  const totalCosts = costData.reduce((sum, cost) => sum + cost.value, 0)
  const netProfit = totalRevenue - totalCosts
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Financial Metrics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Key Financial KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">Total Revenue</span>
              </div>
              <p className="text-2xl font-bold text-green-900 mt-2">
                {dashboardUtils.formatCurrency(totalRevenue)}
              </p>
              <p className="text-xs text-green-700 mt-1">Last 30 days</p>
            </div>
            
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium text-red-800">Total Costs</span>
              </div>
              <p className="text-2xl font-bold text-red-900 mt-2">
                {dashboardUtils.formatCurrency(totalCosts)}
              </p>
              <p className="text-xs text-red-700 mt-1">Last 30 days</p>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Net Profit</span>
              </div>
              <p className="text-2xl font-bold text-blue-900 mt-2">
                {dashboardUtils.formatCurrency(netProfit)}
              </p>
              <p className="text-xs text-blue-700 mt-1">Last 30 days</p>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-800">Profit Margin</span>
              </div>
              <p className="text-2xl font-bold text-purple-900 mt-2">
                {profitMargin.toFixed(1)}%
              </p>
              <p className="text-xs text-purple-700 mt-1">Revenue to profit ratio</p>
            </div>
          </div>

          {/* Revenue Trends */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-600">Revenue Trends</h3>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
            <TimeSeriesChart
              data={revenueData}
              title=""
              subtitle="Daily revenue over time"
              height={250}
            />
          </div>

          {/* Cost Breakdown */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-600">Cost Breakdown</h3>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </div>
            <BarChart
              data={costData}
              title=""
              subtitle="Cost distribution by category"
              height={200}
              horizontal={true}
            />
          </div>

          {/* Additional Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-gray-600">Avg Daily Revenue</div>
              <div className="text-xl font-bold text-gray-900 mt-1">
                {dashboardUtils.formatCurrency(avgDailyRevenue)}
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-gray-600">Revenue Growth</div>
              <div className="text-xl font-bold text-green-600 mt-1">+12.5%</div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-gray-600">Cost Efficiency</div>
              <div className="text-xl font-bold text-blue-600 mt-1">85.2%</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
