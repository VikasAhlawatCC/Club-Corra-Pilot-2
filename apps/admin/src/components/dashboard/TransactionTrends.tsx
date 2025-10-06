'use client'

import { useState, useEffect } from 'react'
import { 
  ChartBarIcon,
  CalendarIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline'
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/ui'
import { TimeSeriesChart, BarChart } from '@/components/charts'
import { transactionApi } from '@/lib/api'

interface TransactionTrendsData {
  dailyVolume: Array<{
    date: string
    value: number
  }>
  weeklyVolume: Array<{
    date: string
    value: number
  }>
  monthlyVolume: Array<{
    date: string
    value: number
  }>
  typeTrends: Array<{
    period: string
    earn: number
    redeem: number
    welcomeBonus: number
  }>
  statusTrends: Array<{
    period: string
    approved: number
    rejected: number
    pending: number
  }>
  brandTrends: Array<{
    brand: string
    currentMonth: number
    previousMonth: number
    growth: number
  }>
  summaryMetrics: {
    totalThisMonth: number
    totalLastMonth: number
    monthlyGrowth: number
    avgDailyVolume: number
    peakDay: string
    peakVolume: number
  }
}

type TimePeriod = '7d' | '30d' | '90d' | '1y'

export function TransactionTrends() {
  const [trendsData, setTrendsData] = useState<TransactionTrendsData>({
    dailyVolume: [
      { date: '2024-01-01', value: 120 },
      { date: '2024-01-02', value: 135 },
      { date: '2024-01-03', value: 110 },
      { date: '2024-01-04', value: 150 },
      { date: '2024-01-05', value: 140 },
      { date: '2024-01-06', value: 160 },
      { date: '2024-01-07', value: 180 }
    ],
    weeklyVolume: [
      { date: '2024-01-01', value: 850 },
      { date: '2024-01-08', value: 920 },
      { date: '2024-01-15', value: 780 },
      { date: '2024-01-22', value: 1100 }
    ],
    monthlyVolume: [
      { date: '2024-01-01', value: 3200 },
      { date: '2024-02-01', value: 3500 },
      { date: '2024-03-01', value: 3800 },
      { date: '2024-04-01', value: 4200 },
      { date: '2024-05-01', value: 4100 },
      { date: '2024-06-01', value: 4500 }
    ],
    typeTrends: [
      { period: 'Jan', earn: 2800, redeem: 800, welcomeBonus: 400 },
      { period: 'Feb', earn: 3100, redeem: 900, welcomeBonus: 450 },
      { period: 'Mar', earn: 3400, redeem: 1000, welcomeBonus: 500 },
      { period: 'Apr', earn: 3800, redeem: 1100, welcomeBonus: 550 },
      { period: 'May', earn: 3700, redeem: 1050, welcomeBonus: 520 },
      { period: 'Jun', earn: 4100, redeem: 1200, welcomeBonus: 600 }
    ],
    statusTrends: [
      { period: 'Jan', approved: 2900, rejected: 200, pending: 100 },
      { period: 'Feb', approved: 3200, rejected: 220, pending: 80 },
      { period: 'Mar', approved: 3500, rejected: 240, pending: 60 },
      { period: 'Apr', approved: 3900, rejected: 260, pending: 40 },
      { period: 'May', approved: 3800, rejected: 250, pending: 50 },
      { period: 'Jun', approved: 4200, rejected: 280, pending: 20 }
    ],
    brandTrends: [
      { brand: 'Starbucks', currentMonth: 450, previousMonth: 420, growth: 7.1 },
      { brand: 'McDonald\'s', currentMonth: 380, previousMonth: 350, growth: 8.6 },
      { brand: 'Domino\'s', currentMonth: 320, previousMonth: 300, growth: 6.7 },
      { brand: 'KFC', currentMonth: 280, previousMonth: 260, growth: 7.7 },
      { brand: 'Subway', currentMonth: 220, previousMonth: 200, growth: 10.0 }
    ],
    summaryMetrics: {
      totalThisMonth: 4500,
      totalLastMonth: 4200,
      monthlyGrowth: 7.1,
      avgDailyVolume: 150,
      peakDay: '2024-01-07',
      peakVolume: 180
    }
  })

  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('30d')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchTransactionTrends = async () => {
      try {
        setIsLoading(true)
        
        // Fetch transaction statistics
        const transactionStats = await transactionApi.getTransactionStats()
        if (transactionStats.success) {
          const data = transactionStats.data
          
          // Update trends data with real data if available
          if (data.monthlyStats) {
            setTrendsData(prev => ({
              ...prev,
              summaryMetrics: {
                ...prev.summaryMetrics,
                totalThisMonth: data.monthlyStats.currentMonth || prev.summaryMetrics.totalThisMonth,
                totalLastMonth: data.monthlyStats.previousMonth || prev.summaryMetrics.totalLastMonth,
                monthlyGrowth: data.monthlyStats.growth || prev.summaryMetrics.monthlyGrowth
              }
            }))
          }
        }

        // Simulate API delay for demo
        await new Promise(resolve => setTimeout(resolve, 1000))
        
      } catch (error) {
        console.error('Failed to fetch transaction trends:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTransactionTrends()
  }, [selectedPeriod])

  const getGrowthIcon = (value: number) => {
    if (value > 0) {
      return <ArrowUpIcon className="w-4 h-4 text-green-500" />
    } else if (value < 0) {
      return <ArrowDownIcon className="w-4 h-4 text-red-500" />
    }
    return null
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      timeZone: 'Asia/Kolkata'
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="animate-pulse space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-48 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  // Prepare data for charts based on selected period
  const getChartData = () => {
    switch (selectedPeriod) {
      case '7d':
        return trendsData.dailyVolume
      case '30d':
        return trendsData.weeklyVolume
      case '90d':
        return trendsData.monthlyVolume.slice(-3)
      case '1y':
        return trendsData.monthlyVolume
      default:
        return trendsData.dailyVolume
    }
  }

  const getTypeTrendsData = () => {
    return trendsData.typeTrends.map(item => ({
      name: item.period,
      earn: item.earn,
      redeem: item.redeem,
      welcomeBonus: item.welcomeBonus
    }))
  }

  const getBrandTrendsData = () => {
    return trendsData.brandTrends.map(item => ({
      name: item.brand,
      value: item.currentMonth,
      secondaryValue: item.previousMonth,
      color: item.growth > 0 ? '#10b981' : '#ef4444'
    }))
  }

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Transaction Trends</h2>
          <p className="text-sm text-gray-600">Analyze transaction patterns and growth</p>
        </div>
        <div className="flex space-x-2">
          {(['7d', '30d', '90d', '1y'] as TimePeriod[]).map((period) => (
            <Button
              key={period}
              variant={selectedPeriod === period ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedPeriod(period)}
            >
              {period}
            </Button>
          ))}
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <ChartBarIcon className="h-8 w-8 text-green-theme-primary mr-3" />
              <div>
                <p className="text-sm text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-gray-900">
                  {trendsData.summaryMetrics.totalThisMonth.toLocaleString()}
                </p>
                <div className="flex items-center mt-1">
                  {getGrowthIcon(trendsData.summaryMetrics.monthlyGrowth)}
                  <span className="text-sm text-green-600 ml-1">
                    +{trendsData.summaryMetrics.monthlyGrowth}%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <ChartBarIcon className="h-8 w-8 text-gold-theme-primary mr-3" />
              <div>
                <p className="text-sm text-gray-600">Avg Daily Volume</p>
                <p className="text-2xl font-bold text-gray-900">
                  {trendsData.summaryMetrics.avgDailyVolume.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500 mt-1">Transactions per day</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <CalendarIcon className="h-8 w-8 text-silver-theme-primary mr-3" />
              <div>
                <p className="text-sm text-gray-600">Peak Day</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatDate(trendsData.summaryMetrics.peakDay)}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {trendsData.summaryMetrics.peakVolume} transactions
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <ChartBarIcon className="h-8 w-8 text-gold-theme-primary mr-3" />
              <div>
                <p className="text-sm text-gray-600">Last Month</p>
                <p className="text-2xl font-bold text-gray-900">
                  {trendsData.summaryMetrics.totalLastMonth.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500 mt-1">Previous period</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction Volume Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ChartBarIcon className="w-5 h-5 mr-2 text-green-theme-primary" />
              Transaction Volume Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TimeSeriesChart
              data={getChartData()}
              title=""
              subtitle={`Transaction volume over ${selectedPeriod}`}
              height={250}
              showArea={true}
              color="#3b82f6"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ChartBarIcon className="w-5 h-5 mr-2 text-gold-theme-primary" />
              Transaction Types by Period
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart
              data={getTypeTrendsData().map(item => ({
                name: item.name,
                value: item.earn,
                color: '#10b981'
              }))}
              title=""
              subtitle="Earn transactions by period"
              height={250}
              horizontal={false}
            />
          </CardContent>
        </Card>
      </div>

      {/* Brand Performance Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ChartBarIcon className="w-5 h-5 mr-2 text-green-theme-primary" />
            Brand Performance Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <BarChart
            data={getBrandTrendsData()}
            title=""
            subtitle="Current month vs. previous month performance"
            height={300}
            horizontal={true}
            showLegend={true}
          />
        </CardContent>
      </Card>

      {/* Status Distribution Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ChartBarIcon className="w-5 h-5 mr-2 text-gold-theme-primary" />
            Transaction Status Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-theme-muted rounded-lg">
              <p className="text-lg font-semibold text-green-theme-primary">
                {trendsData.statusTrends[trendsData.statusTrends.length - 1]?.approved || 0}
              </p>
              <p className="text-sm text-gray-600">Approved This Month</p>
            </div>
            <div className="text-center p-4 bg-status-error/10 rounded-lg">
              <p className="text-lg font-semibold text-status-error">
                {trendsData.statusTrends[trendsData.statusTrends.length - 1]?.rejected || 0}
              </p>
              <p className="text-sm text-gray-600">Rejected This Month</p>
            </div>
            <div className="text-center p-4 bg-gold-theme-muted rounded-lg">
              <p className="text-lg font-semibold text-gold-theme-primary">
                {trendsData.statusTrends[trendsData.statusTrends.length - 1]?.pending || 0}
              </p>
              <p className="text-sm text-gray-600">Pending This Month</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
