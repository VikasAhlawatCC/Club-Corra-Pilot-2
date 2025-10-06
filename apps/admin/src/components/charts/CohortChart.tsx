'use client'

import React from 'react'
import { format, subMonths, startOfMonth } from 'date-fns'

interface CohortDataPoint {
  month: string
  users: number
  retention: number[]
}

interface CohortChartProps {
  data: CohortDataPoint[]
  title: string
  subtitle?: string
  height?: number
  months?: number
  isLoading?: boolean
}

export function CohortChart({
  data,
  title,
  subtitle,
  height = 400,
  months = 6,
  isLoading = false
}: CohortChartProps) {
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

  // Generate month labels
  const generateMonthLabels = () => {
    const labels = []
    for (let i = 0; i < months; i++) {
      const date = subMonths(new Date(), months - 1 - i)
      labels.push(format(startOfMonth(date), 'MMM yyyy'))
    }
    return labels
  }

  const monthLabels = generateMonthLabels()

  const getRetentionColor = (retention: number) => {
    if (retention >= 80) return 'bg-green-100 text-green-800'
    if (retention >= 60) return 'bg-blue-100 text-blue-800'
    if (retention >= 40) return 'bg-yellow-100 text-yellow-800'
    if (retention >= 20) return 'bg-orange-100 text-orange-800'
    return 'bg-red-100 text-red-800'
  }

  return (
    <div className="w-full h-full">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {subtitle && (
          <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
        )}
      </div>
      
      <div className="overflow-x-auto">
        <div className="min-w-max">
          {/* Header row */}
          <div className="flex border-b border-gray-200">
            <div className="w-32 p-3 font-medium text-gray-700 bg-gray-50">Month</div>
            <div className="w-24 p-3 font-medium text-gray-700 bg-gray-50 text-center">Users</div>
            {monthLabels.map((month, index) => (
              <div key={month} className="w-20 p-3 font-medium text-gray-700 bg-gray-50 text-center">
                {index === 0 ? 'Month 0' : `Month ${index}`}
              </div>
            ))}
          </div>
          
          {/* Data rows */}
          {data.map((cohort, cohortIndex) => (
            <div key={cohort.month} className="flex border-b border-gray-100 hover:bg-gray-50">
              <div className="w-32 p-3 text-sm text-gray-900 font-medium">
                {cohort.month}
              </div>
              <div className="w-24 p-3 text-sm text-gray-900 text-center font-semibold">
                {cohort.users.toLocaleString()}
              </div>
              {cohort.retention.map((retention, monthIndex) => (
                <div key={monthIndex} className="w-20 p-3 text-center">
                  {monthIndex === 0 ? (
                    <span className="text-sm font-semibold text-gray-900">100%</span>
                  ) : (
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRetentionColor(retention)}`}>
                      {retention}%
                    </span>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      
      {/* Legend */}
      <div className="mt-4 flex items-center justify-center space-x-4">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-100 rounded"></div>
          <span className="text-xs text-gray-600">80%+ Retention</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-blue-100 rounded"></div>
          <span className="text-xs text-gray-600">60-79% Retention</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-yellow-100 rounded"></div>
          <span className="text-xs text-gray-600">40-59% Retention</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-orange-100 rounded"></div>
          <span className="text-xs text-gray-600">20-39% Retention</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-100 rounded"></div>
          <span className="text-xs text-gray-600">&lt;20% Retention</span>
        </div>
      </div>
    </div>
  )
}
