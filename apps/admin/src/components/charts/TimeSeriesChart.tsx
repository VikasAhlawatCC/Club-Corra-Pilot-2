'use client'

import React from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts'
import { format, parseISO } from 'date-fns'

interface TimeSeriesDataPoint {
  date: string
  value: number
  label?: string
}

interface TimeSeriesChartProps {
  data: TimeSeriesDataPoint[]
  title: string
  subtitle?: string
  height?: number
  showArea?: boolean
  color?: string
  formatValue?: (value: number) => string
  formatDate?: (date: string) => string
  isLoading?: boolean
}

export function TimeSeriesChart({
  data,
  title,
  subtitle,
  height = 300,
  showArea = false,
  color = '#3b82f6',
  formatValue = (value) => value.toLocaleString(),
  formatDate = (date) => format(parseISO(date), 'MMM dd'),
  isLoading = false
}: TimeSeriesChartProps) {
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

  const ChartComponent = showArea ? AreaChart : LineChart
  const DataComponent = showArea ? Area : Line

  return (
    <div className="w-full h-full">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {subtitle && (
          <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
        )}
      </div>
      
      <ResponsiveContainer width="100%" height={height}>
        <ChartComponent data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            stroke="#9ca3af"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#9ca3af"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={formatValue}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length && label) {
                return (
                  <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                    <p className="text-sm text-gray-600 mb-1">
                      {formatDate(label as string)}
                    </p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatValue(payload[0].value as number)}
                    </p>
                  </div>
                )
              }
              return null
            }}
          />
          <DataComponent
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            fill={showArea ? color : undefined}
            fillOpacity={showArea ? 0.1 : undefined}
            dot={{ fill: color, strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: color, strokeWidth: 2 }}
          />
        </ChartComponent>
      </ResponsiveContainer>
    </div>
  )
}
