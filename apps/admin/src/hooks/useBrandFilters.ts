import { useState, useCallback } from 'react'

export function useBrandFilters() {
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [sortBy, setSortBy] = useState<string>('updatedAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const clearFilters = useCallback(() => {
    setSearchTerm('')
    setCategoryFilter('all')
    setStatusFilter('all')
    setCurrentPage(1)
    setSortBy('updatedAt')
    setSortOrder('desc')
  }, [])

  const handleFilterChange = useCallback(() => {
    setCurrentPage(1)
  }, [])

  const handleSort = useCallback((field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('asc')
    }
    setCurrentPage(1) // Reset to first page when sorting changes
  }, [sortBy, sortOrder])

  const hasActiveFilters = searchTerm || categoryFilter !== 'all' || statusFilter !== 'all'

  return {
    searchTerm,
    categoryFilter,
    statusFilter,
    currentPage,
    sortBy,
    sortOrder,
    setSearchTerm,
    setCategoryFilter,
    setStatusFilter,
    setCurrentPage,
    setSortBy,
    setSortOrder,
    clearFilters,
    handleFilterChange,
    handleSort,
    hasActiveFilters,
  }
}
