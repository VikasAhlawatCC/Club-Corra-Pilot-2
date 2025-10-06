'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { BarChart, DonutChart } from '@/components/charts'
import { dashboardDataService } from '@/lib/dashboardDataService'
import { dashboardUtils } from '@/lib/dashboardApi'
import { useState, useEffect } from 'react'
import { CreditCard, AlertTriangle, CheckCircle, Clock, TrendingUp } from 'lucide-react'

interface SettlementOverviewProps {
  className?: string
}

export function SettlementOverview({ className = '' }: SettlementOverviewProps) {
  const [settlementData, setSettlementData] = useState<Array<{ name: string; value: number; color: string }>>([])
  const [brandSettlements, setBrandSettlements] = useState<Array<{ brandName: string; pendingAmount: number; status: string; lastSettlement: string }>>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchSettlementData = async () => {
      try {
        setIsLoading(true)
        
        // Generate realistic settlement data (this would come from API in real implementation)
        const settlementData = generateSettlementData()
        setSettlementData(settlementData)
        
        const brandSettlements = generateBrandSettlements()
        setBrandSettlements(brandSettlements)
      } catch (error) {
        console.error('Failed to fetch settlement data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSettlementData()
  }, [])

  const generateSettlementData = (): Array<{ name: string; value: number; color: string }> => {
    return [
      { name: 'Pending', value: 125000, color: '#f59e0b' },
      { name: 'Processing', value: 75000, color: '#3b82f6' },
      { name: 'Completed', value: 450000, color: '#10b981' },
      { name: 'Failed', value: 15000, color: '#ef4444' }
    ]
  }

  const generateBrandSettlements = (): Array<{ brandName: string; pendingAmount: number; status: string; lastSettlement: string }> => {
    return [
      { brandName: 'Starbucks', pendingAmount: 45000, status: 'pending', lastSettlement: '2024-01-15' },
      { brandName: 'McDonald\'s', pendingAmount: 32000, status: 'processing', lastSettlement: '2024-01-20' },
      { brandName: 'Domino\'s', pendingAmount: 28000, status: 'pending', lastSettlement: '2024-01-10' },
      { brandName: 'KFC', pendingAmount: 15000, status: 'completed', lastSettlement: '2024-01-25' },
      { brandName: 'Subway', pendingAmount: 5000, status: 'pending', lastSettlement: '2024-01-18' }
    ]
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Settlement Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const totalPending = settlementData.find(d => d.name === 'Pending')?.value || 0
  const totalProcessing = settlementData.find(d => d.name === 'Processing')?.value || 0
  const totalCompleted = settlementData.find(d => d.name === 'Completed')?.value || 0
  const totalFailed = settlementData.find(d => d.name === 'Failed')?.value || 0
  const totalSettlements = totalPending + totalProcessing + totalCompleted + totalFailed
  const completionRate = totalSettlements > 0 ? (totalCompleted / totalSettlements) * 100 : 0

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'processing':
        return <Clock className="h-4 w-4 text-blue-600" />
      case 'pending':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case 'failed':
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'text-green-600'
      case 'processing':
        return 'text-blue-600'
      case 'pending':
        return 'text-yellow-600'
      case 'failed':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Settlement Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Settlement Status KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">Pending</span>
              </div>
              <p className="text-2xl font-bold text-yellow-900 mt-2">
                {dashboardUtils.formatCurrency(totalPending)}
              </p>
              <p className="text-xs text-yellow-700 mt-1">Awaiting settlement</p>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Processing</span>
              </div>
              <p className="text-2xl font-bold text-blue-900 mt-2">
                {dashboardUtils.formatCurrency(totalProcessing)}
              </p>
              <p className="text-xs text-blue-700 mt-1">In progress</p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">Completed</span>
              </div>
              <p className="text-2xl font-bold text-green-900 mt-2">
                {dashboardUtils.formatCurrency(totalCompleted)}
              </p>
              <p className="text-xs text-green-700 mt-1">Successfully settled</p>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-800">Completion Rate</span>
              </div>
              <p className="text-2xl font-bold text-purple-900 mt-2">
                {completionRate.toFixed(1)}%
              </p>
              <p className="text-xs text-purple-700 mt-1">Settlement success</p>
            </div>
          </div>

          {/* Settlement Status Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-600">Settlement Status</h3>
                <CreditCard className="h-4 w-4 text-blue-600" />
              </div>
              <DonutChart
                data={settlementData}
                title=""
                subtitle="Distribution by status"
                height={200}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-600">Status Breakdown</h3>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
              <BarChart
                data={settlementData}
                title=""
                subtitle="Amount by settlement status"
                height={200}
                horizontal={true}
              />
            </div>
          </div>

          {/* Brand Settlement Details */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-600">Brand Settlement Details</h3>
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="space-y-3">
                {brandSettlements.map((brand, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(brand.status)}
                      <div>
                        <div className="font-medium text-gray-900">{brand.brandName}</div>
                        <div className="text-sm text-gray-500">
                          Last: {brand.lastSettlement}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-medium ${getStatusColor(brand.status)}`}>
                        {dashboardUtils.formatCurrency(brand.pendingAmount)}
                      </div>
                      <div className="text-xs text-gray-500 capitalize">
                        {brand.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Settlement Alerts */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <h3 className="text-sm font-medium text-yellow-800">Settlement Alerts</h3>
            </div>
            <div className="mt-2 text-sm text-yellow-700">
              <p>• 3 brands have pending settlements over 30 days</p>
              <p>• 1 brand settlement failed - requires manual review</p>
              <p>• 2 brands approaching settlement deadlines</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
