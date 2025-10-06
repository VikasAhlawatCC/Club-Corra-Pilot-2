'use client'

import React, { useState, useEffect } from 'react'
import { CalendarIcon, MagnifyingGlassIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Badge } from '@/components/ui/badge'
import { format, subDays, startOfDay, endOfDay } from 'date-fns'

interface FilterState {
  dateRange: {
    start: Date | undefined
    end: Date | undefined
  }
  brands: string[]
  categories: string[]
  statuses: string[]
  userSegments: string[]
  search: string
}

interface GlobalFiltersProps {
  onFiltersChange: (filters: FilterState) => void
  availableBrands?: Array<{ id: string; name: string }>
  availableCategories?: Array<{ id: string; name: string }>
  availableStatuses?: Array<{ id: string; name: string }>
  availableUserSegments?: Array<{ id: string; name: string }>
  className?: string
}

const PRESET_DATE_RANGES = [
  { label: 'Today', value: 'today' },
  { label: 'Yesterday', value: 'yesterday' },
  { label: 'Last 7 days', value: 'last7days' },
  { label: 'Last 30 days', value: 'last30days' },
  { label: 'This month', value: 'thisMonth' },
  { label: 'Last month', value: 'lastMonth' }
]

export function GlobalFilters({
  onFiltersChange,
  availableBrands = [],
  availableCategories = [],
  availableStatuses = [],
  availableUserSegments = [],
  className = ''
}: GlobalFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    dateRange: {
      start: undefined,
      end: undefined
    },
    brands: [],
    categories: [],
    statuses: [],
    userSegments: [],
    search: ''
  })

  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    onFiltersChange(filters)
  }, [filters, onFiltersChange])

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleDateRangeChange = (start: Date | undefined, end: Date | undefined) => {
    setFilters(prev => ({
      ...prev,
      dateRange: { start, end }
    }))
  }

  const handlePresetDateRange = (preset: string) => {
    const now = new Date()
    let start: Date | undefined
    let end: Date | undefined

    switch (preset) {
      case 'today':
        start = startOfDay(now)
        end = endOfDay(now)
        break
      case 'yesterday':
        start = startOfDay(subDays(now, 1))
        end = endOfDay(subDays(now, 1))
        break
      case 'last7days':
        start = startOfDay(subDays(now, 7))
        end = endOfDay(now)
        break
      case 'last30days':
        start = startOfDay(subDays(now, 30))
        end = endOfDay(now)
        break
      case 'thisMonth':
        start = new Date(now.getFullYear(), now.getMonth(), 1)
        end = endOfDay(now)
        break
      case 'lastMonth':
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        end = new Date(now.getFullYear(), now.getMonth(), 0)
        break
    }

    handleDateRangeChange(start, end)
  }

  const clearFilters = () => {
    setFilters({
      dateRange: { start: undefined, end: undefined },
      brands: [],
      categories: [],
      statuses: [],
      userSegments: [],
      search: ''
    })
  }

  const hasActiveFilters = () => {
    return (
      filters.dateRange.start ||
      filters.dateRange.end ||
      filters.brands.length > 0 ||
      filters.categories.length > 0 ||
      filters.statuses.length > 0 ||
      filters.userSegments.length > 0 ||
      filters.search.trim() !== ''
    )
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.dateRange.start || filters.dateRange.end) count++
    if (filters.brands.length > 0) count++
    if (filters.categories.length > 0) count++
    if (filters.statuses.length > 0) count++
    if (filters.userSegments.length > 0) count++
    if (filters.search.trim() !== '') count++
    return count
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <FunnelIcon className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-medium text-gray-900">Filters</h3>
          {hasActiveFilters() && (
            <Badge variant="secondary" className="ml-2">
              {getActiveFiltersCount()} active
            </Badge>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Collapse' : 'Expand'}
          </Button>
          {hasActiveFilters() && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-red-600 hover:text-red-700"
            >
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search transactions, users, brands..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
        <div className="flex items-center space-x-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.dateRange.start ? (
                  filters.dateRange.end ? (
                    <>
                      {format(filters.dateRange.start, 'MMM dd, yyyy')} - {format(filters.dateRange.end, 'MMM dd, yyyy')}
                    </>
                  ) : (
                    format(filters.dateRange.start, 'MMM dd, yyyy')
                  )
                ) : (
                  'Pick a date range'
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                selected={{
                  from: filters.dateRange.start,
                  to: filters.dateRange.end
                }}
                onSelect={(range) => {
                  handleDateRangeChange(range?.from, range?.to)
                }}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
          
          {/* Preset Date Ranges */}
          <Select onValueChange={handlePresetDateRange}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Presets" />
            </SelectTrigger>
            <SelectContent>
              {PRESET_DATE_RANGES.map((preset) => (
                <SelectItem key={preset.value} value={preset.value}>
                  {preset.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="space-y-4">
          {/* Brands Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Brands</label>
            <Select
              onValueChange={(value) => {
                if (!filters.brands.includes(value)) {
                  handleFilterChange('brands', [...filters.brands, value])
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select brands" />
              </SelectTrigger>
              <SelectContent>
                {availableBrands.map((brand) => (
                  <SelectItem key={brand.id} value={brand.id}>
                    {brand.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {filters.brands.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {filters.brands.map((brandId) => {
                  const brand = availableBrands.find(b => b.id === brandId)
                  return (
                    <Badge
                      key={brandId}
                      variant="secondary"
                      className="flex items-center space-x-1"
                    >
                      <span>{brand?.name || brandId}</span>
                      <button
                        onClick={() => {
                          handleFilterChange('brands', filters.brands.filter(id => id !== brandId))
                        }}
                        className="ml-1 hover:text-red-600"
                      >
                        <XMarkIcon className="w-3 h-3" />
                      </button>
                    </Badge>
                  )
                })}
              </div>
            )}
          </div>

          {/* Categories Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Categories</label>
            <Select
              onValueChange={(value) => {
                if (!filters.categories.includes(value)) {
                  handleFilterChange('categories', [...filters.categories, value])
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select categories" />
              </SelectTrigger>
              <SelectContent>
                {availableCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {filters.categories.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {filters.categories.map((categoryId) => {
                  const category = availableCategories.find(c => c.id === categoryId)
                  return (
                    <Badge
                      key={categoryId}
                      variant="secondary"
                      className="flex items-center space-x-1"
                    >
                      <span>{category?.name || categoryId}</span>
                      <button
                        onClick={() => {
                          handleFilterChange('categories', filters.categories.filter(id => id !== categoryId))
                        }}
                        className="ml-1 hover:text-red-600"
                      >
                        <XMarkIcon className="w-3 h-3" />
                      </button>
                    </Badge>
                  )
                })}
              </div>
            )}
          </div>

          {/* Statuses Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Statuses</label>
            <Select
              onValueChange={(value) => {
                if (!filters.statuses.includes(value)) {
                  handleFilterChange('statuses', [...filters.statuses, value])
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select statuses" />
              </SelectTrigger>
              <SelectContent>
                {availableStatuses.map((status) => (
                  <SelectItem key={status.id} value={status.id}>
                    {status.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {filters.statuses.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {filters.statuses.map((statusId) => {
                  const status = availableStatuses.find(s => s.id === statusId)
                  return (
                    <Badge
                      key={statusId}
                      variant="secondary"
                      className="flex items-center space-x-1"
                    >
                      <span>{status?.name || statusId}</span>
                      <button
                        onClick={() => {
                          handleFilterChange('statuses', filters.statuses.filter(id => id !== statusId))
                        }}
                        className="ml-1 hover:text-red-600"
                      >
                        <XMarkIcon className="w-3 h-3" />
                      </button>
                    </Badge>
                  )
                })}
              </div>
            )}
          </div>

          {/* User Segments Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">User Segments</label>
            <Select
              onValueChange={(value) => {
                if (!filters.userSegments.includes(value)) {
                  handleFilterChange('userSegments', [...filters.userSegments, value])
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select user segments" />
              </SelectTrigger>
              <SelectContent>
                {availableUserSegments.map((segment) => (
                  <SelectItem key={segment.id} value={segment.id}>
                    {segment.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {filters.userSegments.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {filters.userSegments.map((segmentId) => {
                  const segment = availableUserSegments.find(s => s.id === segmentId)
                  return (
                    <Badge
                      key={segmentId}
                      variant="secondary"
                      className="flex items-center space-x-1"
                    >
                      <span>{segment?.name || segmentId}</span>
                      <button
                        onClick={() => {
                          handleFilterChange('userSegments', filters.userSegments.filter(id => id !== segmentId))
                        }}
                        className="ml-1 hover:text-red-600"
                      >
                        <XMarkIcon className="w-3 h-3" />
                      </button>
                    </Badge>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
