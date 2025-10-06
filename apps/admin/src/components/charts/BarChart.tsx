'use client'

import React from 'react'
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend
} from 'recharts'

interface BarChartDataPoint {
  name: string
  value: number
  secondaryValue?: number
  color?: string
}

interface BarChartProps {
  data: BarChartDataPoint[]
  title: string
  subtitle?: string
  height?: number
  colors?: string[]
  formatValue?: (value: number) => string
  isLoading?: boolean
  horizontal?: boolean
  valueLabel?: string
  secondaryValueLabel?: string
  showLegend?: boolean
}

export function BarChart({
  data,
  title,
  subtitle,
  height = 300,
  colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
  formatValue = (value) => value.toLocaleString(),
  isLoading = false,
  horizontal = false,
  valueLabel,
  secondaryValueLabel,
  showLegend = false
}: BarChartProps) {
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

  const hasSecondaryValues = data.some(item => item.secondaryValue !== undefined)

  return (
    <div className="w-full h-full">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {subtitle && (
          <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
        )}
      </div>
      
      <ResponsiveContainer width="100%" height={height}>
        <RechartsBarChart
          data={data}
          layout={horizontal ? 'horizontal' : 'vertical'}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis
            type={horizontal ? 'number' : 'category'}
            dataKey={horizontal ? 'value' : 'name'}
            stroke="#9ca3af"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={horizontal ? formatValue : undefined}
          />
          <YAxis
            type={horizontal ? 'category' : 'number'}
            dataKey={horizontal ? 'name' : 'value'}
            stroke="#9ca3af"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={horizontal ? undefined : formatValue}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                    <p className="text-sm text-gray-600 mb-1">{label}</p>
                    {payload.map((entry: any, index: number) => (
                      <p key={index} className="text-lg font-semibold text-gray-900" style={{ color: entry.color }}>
                        {entry.name}: {formatValue(entry.value as number)}
                      </p>
                    ))}
                  </div>
                )
              }
              return null
            }}
          />
          {showLegend && <Legend />}
          
          <Bar
            dataKey="value"
            fill="#3b82f6"
            radius={[4, 4, 0, 0]}
            barSize={horizontal ? 20 : 40}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color || colors[index % colors.length]}
              />
            ))}
          </Bar>
          
          {hasSecondaryValues && (
            <Bar
              dataKey="secondaryValue"
              fill="#10b981"
              radius={[4, 4, 0, 0]}
              barSize={horizontal ? 20 : 40}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`secondary-cell-${index}`}
                  fill={entry.color || colors[index % colors.length]}
                />
              ))}
            </Bar>
          )}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  )
}
