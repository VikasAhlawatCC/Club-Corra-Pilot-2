'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline'
import { Input, Button, Label } from '@/components/ui'
import { useTransactionsStore } from '@/stores/transactions.store'

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
  searchTerm,
  statusFilter,
  typeFilter,
  actionRequiredFilter,
  onSearchChange,
  onStatusFilterChange,
  onTypeFilterChange,
  onActionRequiredFilterChange,
  onSearchSubmit
}: TransactionFiltersProps = {}) {
  const { filters, setFilters, fetchTransactions, loading, exportFilters, importFilters } = useTransactionsStore()

  const [localSearch, setLocalSearch] = useState(searchTerm ?? filters?.search ?? '')
  const [localStatus, setLocalStatus] = useState(statusFilter ?? filters?.status ?? 'ALL')
  const [localType, setLocalType] = useState(typeFilter ?? filters?.type ?? 'ALL')
  const [startDate, setStartDate] = useState<string>(filters?.dateRange?.start ?? '')
  const [endDate, setEndDate] = useState<string>(filters?.dateRange?.end ?? '')
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

  const activeFilterCount = useMemo(() => {
    let count = 0
    if (localStatus && localStatus !== 'ALL') count++
    if (localType && localType !== 'ALL') count++
    if (localSearch && localSearch.trim().length > 0) count++
    if (startDate || endDate) count++
    return count
  }, [localStatus, localType, localSearch, startDate, endDate])

  const apply = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (startDate && endDate && startDate > endDate) {
      setDateError('End date must be after start date')
      return
    }
    setDateError('')
    
    // Use props if available, otherwise use store
    if (onSearchSubmit) {
      onSearchSubmit(e)
    } else {
      setFilters({
        status: localStatus,
        type: localType,
        search: localSearch,
        dateRange: startDate || endDate ? { start: startDate || undefined, end: endDate || undefined } : null,
      })
      fetchTransactions()
    }
  }

  const clear = () => {
    setLocalStatus('ALL')
    setLocalType('ALL')
    setLocalSearch('')
    setStartDate('')
    setEndDate('')
    setDateError('')
    setFilters({ status: 'ALL', type: 'ALL', search: '', dateRange: null })
  }

  const quickSet = (partial: any) => {
    setFilters(partial)
  }

  return (
    <div className="bg-white shadow rounded-lg p-6 mb-6">
      <form onSubmit={apply} className="space-y-4" onChange={(e) => {
        const target = e.target as HTMLSelectElement | HTMLInputElement
        if (target && (target.tagName === 'SELECT' || target.tagName === 'INPUT')) {
          const value = (target as HTMLSelectElement).value
          const statusValues = ['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'PAID']
          const typeValues = ['ALL', 'REWARD_REQUEST', 'EARN', 'REDEEM', 'WELCOME_BONUS', 'ADJUSTMENT']
          if (statusValues.includes(value)) {
            setFilters({ status: value })
          }
          if (typeValues.includes(value)) {
            setFilters({ type: value })
          }
        }
      }}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
                  if (onSearchChange) {
                    onSearchChange(value)
                  } else {
                    setFilters({ search: value })
                  }
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
                if (onStatusFilterChange) {
                  onStatusFilterChange(value)
                } else {
                  setFilters({ status: value })
                }
              }}
              className="w-full h-10 px-3 py-2 border rounded-md"
            >
              <option value="ALL">ALL</option>
              <option value="PENDING">PENDING</option>
              <option value="APPROVED">APPROVED</option>
              <option value="REJECTED">REJECTED</option>
              <option value="PAID">PAID</option>
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
                if (onTypeFilterChange) {
                  onTypeFilterChange(value)
                } else {
                  setFilters({ type: value })
                }
              }}
              className="w-full h-10 px-3 py-2 border rounded-md"
            >
              <option value="ALL">ALL TYPES</option>
              <option value="REWARD_REQUEST">REWARD_REQUEST</option>
              <option value="EARN">EARN</option>
              <option value="REDEEM">REDEEM</option>
              <option value="WELCOME_BONUS">WELCOME_BONUS</option>
              <option value="ADJUSTMENT">ADJUSTMENT</option>
            </select>
          </div>

          <div>
            <Label>Date Range</Label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="start">Start Date</Label>
                <Input id="start" type="date" value={startDate} onChange={(e) => {
                  const v = e.target.value
                  setStartDate(v)
                  const range = { start: v || undefined, end: endDate || undefined }
                  setFilters({ dateRange: range.start || range.end ? range : null })
                }} />
              </div>
              <div>
                <Label htmlFor="end">End Date</Label>
                <Input id="end" type="date" value={endDate} onChange={(e) => {
                  const v = e.target.value
                  setEndDate(v)
                  const range = { start: startDate || undefined, end: v || undefined }
                  setFilters({ dateRange: range.start || range.end ? range : null })
                }} />
              </div>
            </div>
            {dateError && <p className="text-sm text-red-600 mt-1">{dateError}</p>}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="green-outline" onClick={() => quickSet({ status: 'PENDING', type: 'REWARD_REQUEST' })}>
              Pending Rewards
            </Button>
            <Button type="button" variant="green-outline" onClick={() => quickSet({ status: 'PENDING', type: 'REWARD_REQUEST', earnOnly: true })}>
              Pending Earn
            </Button>
            <Button type="button" variant="gold-outline" onClick={() => quickSet({ status: 'APPROVED', type: 'ALL' })}>
              Approved
            </Button>
            <Button type="button" variant="gold-outline" onClick={() => quickSet({ status: 'REJECTED', type: 'ALL' })}>
              Rejected
            </Button>
            <Button type="button" variant="outline" onClick={() => {
              const today = new Date().toISOString().split('T')[0]
              setStartDate(today); setEndDate(today); setDateError('')
              setFilters({ dateRange: { start: today, end: today } })
            }}>
              Today
            </Button>
            <Button type="button" variant="outline" onClick={() => {
              const now = new Date();
              const start = new Date(now.setDate(now.getDate() - now.getDay()))
              const end = new Date(now.setDate(now.getDate() - now.getDay() + 6))
              const s = start.toISOString().split('T')[0]
              const e = end.toISOString().split('T')[0]
              setStartDate(s); setEndDate(e); setDateError('')
              setFilters({ dateRange: { start: s, end: e } })
            }}>
              This Week
            </Button>
            <Button type="button" variant="outline" onClick={() => {
              const now = new Date();
              const start = new Date(now.getFullYear(), now.getMonth(), 1)
              const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
              const s = start.toISOString().split('T')[0]
              const e = end.toISOString().split('T')[0]
              setStartDate(s); setEndDate(e); setDateError('')
              setFilters({ dateRange: { start: s, end: e } })
            }}>
              This Month
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button type="button" onClick={() => exportFilters?.()}>Export Filters</Button>
            <Button type="button" onClick={() => importFilters?.()}>Import Filters</Button>
            <Button type="button" variant="outline" onClick={clear}>Clear Filters</Button>
            <Button type="submit">
              <FunnelIcon className="w-4 h-4 mr-2" />
              Apply Filters
            </Button>
          </div>
        </div>

        {loading && (
          <div className="text-sm text-gray-600 mt-2">Loading...</div>
        )}

        {activeFilterCount > 0 && (
          <div className="text-sm text-gray-700 mt-2">{activeFilterCount} active filters</div>
        )}
      </form>
    </div>
  )
}
