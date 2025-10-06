'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { BarChart, DonutChart } from '@/components/charts'
import { dashboardDataService } from '@/lib/dashboardDataService'
import { useState, useEffect } from 'react'

interface DashboardAnalyticsProps {
  className?: string
}

export function DashboardAnalytics({ className = '' }: DashboardAnalyticsProps) {
  const [brandPerformanceData, setBrandPerformanceData] = useState<Array<{ name: string; value: number; color: string }>>([])
  const [transactionStatusData, setTransactionStatusData] = useState<Array<{ name: string; value: number; color: string }>>([])

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        const [brandData, statusData] = await Promise.all([
          dashboardDataService.getBrandPerformanceData('30d'),
          dashboardDataService.getTransactionStatusData()
        ])
        
        setBrandPerformanceData(brandData)
        setTransactionStatusData(statusData)
      } catch (error) {
        console.error('Failed to fetch analytics data:', error)
      }
    }

    fetchAnalyticsData()
  }, [])

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Analytics Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BarChart
            data={brandPerformanceData}
            title=""
            subtitle="Transaction volume by brand"
            height={250}
            horizontal={true}
          />
          <DonutChart
            data={transactionStatusData}
            title=""
            subtitle="Transaction status distribution"
            height={250}
          />
        </div>
      </CardContent>
    </Card>
  )
}
