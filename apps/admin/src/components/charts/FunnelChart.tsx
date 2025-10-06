'use client'

import React from 'react'

interface FunnelDataPoint {
  name: string
  value: number
  color?: string
}

interface FunnelChartProps {
  data: FunnelDataPoint[]
  title: string
  subtitle?: string
  height?: number
  colors?: string[]
  formatValue?: (value: number) => string
  isLoading?: boolean
  showPercentages?: boolean
}

export function FunnelChart({
  data,
  title,
  subtitle,
  height = 300,
  colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
  formatValue = (value) => value.toLocaleString(),
  isLoading = false,
  showPercentages = true
}: FunnelChartProps) {
  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="animate-pulse space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-500">
        <div className="text-center">
          <div className="text-lg font-medium">No data available</div>
          <div className="text-sm">Chart data is empty</div>
        </div>
      </div>
    )
  }

  const maxValue = Math.max(...data.map(d => d.value))
  const total = data.reduce((sum, item) => sum + item.value, 0)

  return (
    <div className="w-full h-full">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {subtitle && (
          <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
        )}
      </div>
      
      <div className="flex flex-col items-center space-y-2">
        {data.map((item, index) => {
          const percentage = ((item.value / total) * 100).toFixed(1)
          const width = ((item.value / maxValue) * 100)
          const color = item.color || colors[index % colors.length]
          
          return (
            <div key={item.name} className="w-full">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">{item.name}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-semibold text-gray-900">
                    {formatValue(item.value)}
                  </span>
                  {showPercentages && (
                    <span className="text-xs text-gray-500">({percentage}%)</span>
                  )}
                </div>
              </div>
              
              <div className="relative">
                <div className="w-full bg-gray-200 rounded-full h-8">
                  <div
                    className="h-8 rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: `${width}%`,
                      backgroundColor: color
                    }}
                  />
                </div>
                
                {/* Conversion rate indicator */}
                {index > 0 && (
                  <div className="absolute -top-6 right-0 text-xs text-gray-500">
                    {((item.value / data[index - 1].value) * 100).toFixed(1)}%
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
      
      {/* Summary */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">Total Conversion</span>
          <span className="text-lg font-semibold text-gray-900">
            {((data[data.length - 1]?.value / data[0]?.value) * 100).toFixed(1)}%
          </span>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          From {data[0]?.name} to {data[data.length - 1]?.name}
        </div>
      </div>
    </div>
  )
}
