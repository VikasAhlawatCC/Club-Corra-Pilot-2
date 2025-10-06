import { useState, useCallback } from 'react'

export function useBrandFilters() {
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)

  const clearFilters = useCallback(() => {
    setSearchTerm('')
    setCategoryFilter('all')
    setCurrentPage(1)
  }, [])

  const handleFilterChange = useCallback(() => {
    setCurrentPage(1)
  }, [])

  const hasActiveFilters = searchTerm || categoryFilter !== 'all'

  return {
    searchTerm,
    categoryFilter,
    currentPage,
    setSearchTerm,
    setCategoryFilter,
    setCurrentPage,
    clearFilters,
    handleFilterChange,
    hasActiveFilters,
  }
}
