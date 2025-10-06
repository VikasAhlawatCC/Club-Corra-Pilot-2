import { useState, useCallback } from 'react'

export interface DashboardFilters {
  type?: string
  severity?: string
  status?: string
  period?: string
  [key: string]: string | undefined
}

export function useDashboardFilters(initialFilters: DashboardFilters = {}) {
  const [filters, setFilters] = useState<DashboardFilters>(initialFilters)

  const updateFilter = useCallback((key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }, [])

  const updateFilters = useCallback((newFilters: Partial<DashboardFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }, [])

  const resetFilters = useCallback(() => {
    setFilters(initialFilters)
  }, [initialFilters])

  const clearFilters = useCallback(() => {
    setFilters({})
  }, [])

  return {
    filters,
    updateFilter,
    updateFilters,
    resetFilters,
    clearFilters
  }
}
