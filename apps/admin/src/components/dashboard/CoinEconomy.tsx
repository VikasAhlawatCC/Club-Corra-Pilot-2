'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { TimeSeriesChart, BarChart, DonutChart } from '@/components/charts'
import { dashboardDataService } from '@/lib/dashboardDataService'
import { dashboardUtils } from '@/lib/dashboardApi'
import { useState, useEffect } from 'react'
import { Coins, TrendingUp, TrendingDown, Activity, Target } from 'lucide-react'

interface CoinEconomyProps {
  className?: string
}

export function CoinEconomy({ className = '' }: CoinEconomyProps) {
  const [circulationData, setCirculationData] = useState<Array<{ date: string; value: number }>>([])
  const [mintBurnData, setMintBurnData] = useState<Array<{ name: string; value: number; color: string }>>([])
  const [coinDistribution, setCoinDistribution] = useState<Array<{ name: string; value: number; color: string }>>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchCoinEconomyData = async () => {
      try {
        setIsLoading(true)
        
        // Generate realistic coin economy data (this would come from API in real implementation)
        const circulationData = generateCirculationData()
        setCirculationData(circulationData)
        
        const mintBurnData = generateMintBurnData()
        setMintBurnData(mintBurnData)
        
        const coinDistribution = generateCoinDistribution()
        setCoinDistribution(coinDistribution)
      } catch (error) {
        console.error('Failed to fetch coin economy data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCoinEconomyData()
  }, [])

  const generateCirculationData = (): Array<{ date: string; value: number }> => {
    const days = 30
    const baseCirculation = 1000000
    const variance = 0.1
    
    return Array.from({ length: days }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (days - i - 1))
      
      // Simulate gradual growth with some variation
      const growthFactor = 1 + (i * 0.002) // 0.2% daily growth
      const randomFactor = 1 + (Math.random() - 0.5) * variance
      
      return {
        date: date.toISOString().split('T')[0],
        value: Math.round(baseCirculation * growthFactor * randomFactor)
      }
    })
  }

  const generateMintBurnData = (): Array<{ name: string; value: number; color: string }> => {
    return [
      { name: 'Coins Minted', value: 250000, color: '#10b981' },
      { name: 'Coins Burned', value: 180000, color: '#ef4444' },
      { name: 'Net Circulation', value: 70000, color: '#3b82f6' }
    ]
  }

  const generateCoinDistribution = (): Array<{ name: string; value: number; color: string }> => {
    return [
      { name: 'User Balances', value: 600000, color: '#3b82f6' },
      { name: 'Pending Transactions', value: 150000, color: '#f59e0b' },
      { name: 'Reserve Pool', value: 200000, color: '#10b981' },
      { name: 'Staked Coins', value: 50000, color: '#8b5cf6' }
    ]
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Coin Economy</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const totalCirculation = circulationData[circulationData.length - 1]?.value || 0
  const totalMinted = mintBurnData.find(d => d.name === 'Coins Minted')?.value || 0
  const totalBurned = mintBurnData.find(d => d.name === 'Coins Burned')?.value || 0
  const netCirculation = totalMinted - totalBurned
  const burnRate = totalMinted > 0 ? (totalBurned / totalMinted) * 100 : 0

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coins className="h-5 w-5" />
          Coin Economy
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Key Coin Economy KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <Coins className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Total Circulation</span>
              </div>
              <p className="text-2xl font-bold text-blue-900 mt-2">
                {dashboardUtils.formatNumber(totalCirculation)}
              </p>
              <p className="text-xs text-blue-700 mt-1">Coins in circulation</p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">Total Minted</span>
              </div>
              <p className="text-2xl font-bold text-green-900 mt-2">
                {dashboardUtils.formatNumber(totalMinted)}
              </p>
              <p className="text-xs text-green-700 mt-1">Coins created</p>
            </div>
            
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium text-red-800">Total Burned</span>
              </div>
              <p className="text-2xl font-bold text-red-900 mt-2">
                {dashboardUtils.formatNumber(totalBurned)}
              </p>
              <p className="text-xs text-red-700 mt-1">Coins destroyed</p>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-800">Burn Rate</span>
              </div>
              <p className="text-2xl font-bold text-purple-900 mt-2">
                {burnRate.toFixed(1)}%
              </p>
              <p className="text-xs text-purple-700 mt-1">Minted vs burned</p>
            </div>
          </div>

          {/* Circulation Trends */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-600">Circulation Trends</h3>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
            <TimeSeriesChart
              data={circulationData}
              title=""
              subtitle="Total coins in circulation over time"
              height={250}
            />
          </div>

          {/* Mint vs Burn Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-600">Mint vs Burn</h3>
                <Target className="h-4 w-4 text-blue-600" />
              </div>
              <BarChart
                data={mintBurnData}
                title=""
                subtitle="Coin creation and destruction"
                height={200}
                horizontal={true}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-600">Coin Distribution</h3>
                <Activity className="h-4 w-4 text-purple-600" />
              </div>
              <DonutChart
                data={coinDistribution}
                title=""
                subtitle="Where coins are held"
                height={200}
              />
            </div>
          </div>

          {/* Additional Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-gray-600">Net Circulation</div>
              <div className="text-xl font-bold text-blue-600 mt-1">
                {dashboardUtils.formatNumber(netCirculation)}
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-gray-600">Circulation Growth</div>
              <div className="text-xl font-bold text-green-600 mt-1">+7.2%</div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-gray-600">Avg Daily Mint</div>
              <div className="text-xl font-bold text-green-600 mt-1">
                {dashboardUtils.formatNumber(Math.round(totalMinted / 30))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
