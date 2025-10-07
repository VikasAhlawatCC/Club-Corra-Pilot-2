'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline'
import { Input, Button, Label } from '@/components/ui'

interface TransactionFiltersProps {
  searchTerm?: string
  statusFilter?: string
  typeFilter?: string
  actionRequiredFilter?: string
  onSearchChange?: (value: string) => void
  onStatusFilterChange?: (value: string) => void
  onTypeFilterChange?: (value: string) => void
  onActionRequiredFilterChange?: (value: string) => void
  onSearchSubmit?: (e?: React.FormEvent) => void
}

export function TransactionFilters({
  searchTerm = '',
  statusFilter = 'all',
  typeFilter = 'all',
  actionRequiredFilter = 'all',
  onSearchChange,
  onStatusFilterChange,
  onTypeFilterChange,
  onActionRequiredFilterChange,
  onSearchSubmit
}: TransactionFiltersProps) {
  const [localSearch, setLocalSearch] = useState(searchTerm)
  const [localStatus, setLocalStatus] = useState(statusFilter)
  const [localType, setLocalType] = useState(typeFilter)
  const [localActionRequired, setLocalActionRequired] = useState(actionRequiredFilter)
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [dateError, setDateError] = useState<string>('')

  const searchInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  // Update local state when props change
  useEffect(() => {
    setLocalSearch(searchTerm)
  }, [searchTerm])

  useEffect(() => {
    setLocalStatus(statusFilter)
  }, [statusFilter])

  useEffect(() => {
    setLocalType(typeFilter)
  }, [typeFilter])

  useEffect(() => {
    setLocalActionRequired(actionRequiredFilter)
  }, [actionRequiredFilter])

  const activeFilterCount = useMemo(() => {
    let count = 0
    if (localStatus && localStatus !== 'all') count++
    if (localType && localType !== 'all') count++
    if (localActionRequired && localActionRequired !== 'all') count++
    if (localSearch && localSearch.trim().length > 0) count++
    if (startDate || endDate) count++
    return count
  }, [localStatus, localType, localActionRequired, localSearch, startDate, endDate])

  const apply = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (startDate && endDate && startDate > endDate) {
      setDateError('End date must be after start date')
      return
    }
    setDateError('')
    
    if (onSearchSubmit) {
      onSearchSubmit(e)
    }
  }

  const clear = () => {
    setLocalStatus('all')
    setLocalType('all')
    setLocalActionRequired('all')
    setLocalSearch('')
    setStartDate('')
    setEndDate('')
    setDateError('')
    
    // Trigger parent callbacks to clear filters
    onSearchChange?.('')
    onStatusFilterChange?.('all')
    onTypeFilterChange?.('all')
    onActionRequiredFilterChange?.('all')
  }

  return (
    <div className="bg-white shadow rounded-lg p-6 mb-6">
      <form onSubmit={apply} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <Label htmlFor="search">Search Transactions</Label>
            <div className="relative">
              <Input
                ref={searchInputRef}
                type="text"
                id="search"
                value={localSearch}
                onChange={(e) => {
                  const value = e.target.value
                  setLocalSearch(value)
                  onSearchChange?.(value)
                }}
                placeholder="Search transactions..."
                className="pl-10"
              />
              <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <select
              aria-label="Status"
              id="status"
              value={localStatus}
              onChange={(e) => {
                const value = e.target.value
                setLocalStatus(value)
                onStatusFilterChange?.(value)
              }}
              className="w-full h-10 px-3 py-2 border rounded-md"
            >
              <option value="all">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="PAID">Paid</option>
              <option value="UNPAID">Unpaid</option>
              <option value="PROCESSED">Processed</option>
              <option value="COMPLETED">Completed</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>

          <div>
            <Label htmlFor="type">Type</Label>
            <select
              aria-label="Type"
              id="type"
              value={localType}
              onChange={(e) => {
                const value = e.target.value
                setLocalType(value)
                onTypeFilterChange?.(value)
              }}
              className="w-full h-10 px-3 py-2 border rounded-md"
            >
              <option value="all">All Types</option>
              <option value="EARN">Earn</option>
              <option value="REDEEM">Redeem</option>
              <option value="WELCOME_BONUS">Welcome Bonus</option>
              <option value="ADJUSTMENT">Adjustment</option>
            </select>
          </div>

          <div>
            <Label htmlFor="actionRequired">Action Required</Label>
            <select
              aria-label="Action Required"
              id="actionRequired"
              value={localActionRequired}
              onChange={(e) => {
                const value = e.target.value
                setLocalActionRequired(value)
                onActionRequiredFilterChange?.(value)
              }}
              className="w-full h-10 px-3 py-2 border rounded-md"
            >
              <option value="all">All</option>
              <option value="true">Action Required</option>
              <option value="false">No Action Required</option>
            </select>
          </div>

          <div>
            <Label>Date Range</Label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="start">Start Date</Label>
                <Input 
                  id="start" 
                  type="date" 
                  value={startDate} 
                  onChange={(e) => {
                    const v = e.target.value
                    setStartDate(v)
                  }} 
                />
              </div>
              <div>
                <Label htmlFor="end">End Date</Label>
                <Input 
                  id="end" 
                  type="date" 
                  value={endDate} 
                  onChange={(e) => {
                    const v = e.target.value
                    setEndDate(v)
                  }} 
                />
              </div>
            </div>
            {dateError && <p className="text-sm text-red-600 mt-1">{dateError}</p>}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                onStatusFilterChange?.('PENDING')
                onTypeFilterChange?.('all')
                onActionRequiredFilterChange?.('true')
              }}
            >
              Pending Actions
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                onStatusFilterChange?.('APPROVED')
                onTypeFilterChange?.('all')
                onActionRequiredFilterChange?.('all')
              }}
            >
              Approved
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                onStatusFilterChange?.('REJECTED')
                onTypeFilterChange?.('all')
                onActionRequiredFilterChange?.('all')
              }}
            >
              Rejected
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                const today = new Date().toISOString().split('T')[0]
                setStartDate(today)
                setEndDate(today)
                setDateError('')
              }}
            >
              Today
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                const now = new Date()
                const start = new Date(now.setDate(now.getDate() - now.getDay()))
                const end = new Date(now.setDate(now.getDate() - now.getDay() + 6))
                const s = start.toISOString().split('T')[0]
                const e = end.toISOString().split('T')[0]
                setStartDate(s)
                setEndDate(e)
                setDateError('')
              }}
            >
              This Week
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                const now = new Date()
                const start = new Date(now.getFullYear(), now.getMonth(), 1)
                const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
                const s = start.toISOString().split('T')[0]
                const e = end.toISOString().split('T')[0]
                setStartDate(s)
                setEndDate(e)
                setDateError('')
              }}
            >
              This Month
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" onClick={clear}>
              Clear Filters
            </Button>
            <Button type="submit">
              <FunnelIcon className="w-4 h-4 mr-2" />
              Apply Filters
            </Button>
          </div>
        </div>

        {activeFilterCount > 0 && (
          <div className="text-sm text-gray-700 mt-2">{activeFilterCount} active filters</div>
        )}
      </form>
    </div>
  )
}
