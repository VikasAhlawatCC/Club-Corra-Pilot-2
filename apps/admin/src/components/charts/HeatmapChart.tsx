'use client'

import React from 'react'
import { format, startOfWeek, addDays, getDay } from 'date-fns'

interface HeatmapDataPoint {
  date: string
  value: number
  day: number
  week: number
}

interface HeatmapChartProps {
  data: HeatmapDataPoint[]
  title: string
  subtitle?: string
  height?: number
  colorScale?: string[]
  formatValue?: (value: number) => string
  isLoading?: boolean
  weeks?: number
}

export function HeatmapChart({
  data,
  title,
  subtitle,
  height = 300,
  colorScale = ['#f3f4f6', '#dbeafe', '#93c5fd', '#3b82f6', '#1d4ed8'],
  formatValue = (value) => value.toString(),
  isLoading = false,
  weeks = 12
}: HeatmapChartProps) {
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

  // Generate heatmap grid
  const generateHeatmapGrid = () => {
    const grid: (HeatmapDataPoint | null)[][] = []
    const maxValue = Math.max(...data.map(d => d.value))
    
    for (let week = 0; week < weeks; week++) {
      const weekData: (HeatmapDataPoint | null)[] = []
      for (let day = 0; day < 7; day++) {
        const dayData = data.find(d => d.week === week && d.day === day)
        weekData.push(dayData || null)
      }
      grid.push(weekData)
    }
    
    return { grid, maxValue }
  }

  const { grid, maxValue } = generateHeatmapGrid()

  const getColor = (value: number) => {
    if (value === 0) return colorScale[0]
    const intensity = Math.ceil((value / maxValue) * (colorScale.length - 1))
    return colorScale[Math.min(intensity, colorScale.length - 1)]
  }

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="w-full h-full">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {subtitle && (
          <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
        )}
      </div>
      
      <div className="flex items-start space-x-2">
        {/* Day labels */}
        <div className="flex flex-col space-y-1 pt-6">
          {dayLabels.map((day, index) => (
            <div key={day} className="h-3 text-xs text-gray-500 w-8 text-center">
              {day}
            </div>
          ))}
        </div>
        
        {/* Heatmap grid */}
        <div className="flex-1">
          <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${weeks}, 1fr)` }}>
            {grid.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1">
                {week.map((day, dayIndex) => (
                  <div
                    key={`${weekIndex}-${dayIndex}`}
                    className="w-3 h-3 rounded-sm cursor-pointer transition-colors hover:opacity-80"
                    style={{
                      backgroundColor: day ? getColor(day.value) : colorScale[0]
                    }}
                    title={day ? `${format(new Date(day.date), 'MMM dd, yyyy')}: ${formatValue(day.value)}` : 'No data'}
                  />
                ))}
              </div>
            ))}
          </div>
          
          {/* Legend */}
          <div className="flex items-center justify-center mt-4 space-x-2">
            <span className="text-xs text-gray-500">Less</span>
            {colorScale.map((color, index) => (
              <div
                key={index}
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: color }}
              />
            ))}
            <span className="text-xs text-gray-500">More</span>
          </div>
        </div>
      </div>
    </div>
  )
}
