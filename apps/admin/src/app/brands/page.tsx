'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { PlusIcon, MagnifyingGlassIcon, FunnelIcon, ArrowPathIcon } from '@/components/icons/SvgIcons'
import { BrandTable } from '@/components/brands/BrandTable'
import { ManageCategoriesModal } from '@/components/brands'
import { SimpleBrandForm } from '@/components/brands/SimpleBrandForm'
import { categoryApi, brandApi } from '@/lib/api'
import { useToast } from '@/components/common'
import { useBrands } from '@/hooks/useBrands'
import { useBrandFilters } from '@/hooks/useBrandFilters'
import { useDebounce } from '@/hooks/useDebounce'
import { useAuth } from '@/contexts/AuthContext'
import type { Brand, BrandCategory } from '@/types'

function BrandsPageContent() {
  const router = useRouter()
  const [categories, setCategories] = useState<BrandCategory[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)
  const [showManageCategories, setShowManageCategories] = useState(false)
  const [pageSize, setPageSize] = useState(20)
  const { showSuccess, showError } = useToast()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  
  const {
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
    clearFilters,
    handleFilterChange,
    handleSort,
    hasActiveFilters,
  } = useBrandFilters()

  // Debounce search term to prevent excessive API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 500)

  const {
    brands,
    isLoading,
    totalPages,
    totalBrands,
    fetchBrands,
    refetch,
    toggleBrandStatus,
  } = useBrands({
    page: currentPage,
    pageSize,
    searchTerm: debouncedSearchTerm || undefined,
    categoryId: categoryFilter === 'all' ? undefined : categoryFilter,
    isActive: statusFilter === 'all' ? undefined : statusFilter === 'active',
    sortBy,
    sortOrder,
  })

  // Ensure brands is always an array to prevent crashes
  const safeBrands = brands || []

  // No status filter: display all brands
  const displayBrands = safeBrands

  useEffect(() => {
    // Only fetch categories when authenticated and not loading
    if (isAuthenticated && !authLoading) {
      fetchCategories()
      console.log('Initial fetch for brands')
    }
  }, [isAuthenticated, authLoading]) // Run when auth status changes

  // React Query will automatically handle fetching brands when parameters change

  const fetchCategories = async () => {
    try {
      setIsLoadingCategories(true)
      const response = await categoryApi.getAllCategories()
      console.log('Categories API response:', response)
      console.log('Categories type:', typeof response)
      console.log('Categories is array:', Array.isArray(response))
      
      // Handle the API response - categoryApi.getAllCategories returns BrandCategory[] directly
      if (Array.isArray(response)) {
        setCategories(response)
      } else {
        console.error('Categories response is not an array:', response)
        setCategories([])
        showError('Invalid categories data received')
      }
    } catch (error: any) {
      console.error('Failed to fetch categories:', error)
      setCategories([]) // Set empty array as fallback
      
      // Handle specific error types
      if (error?.status === 401) {
        showError('Authentication required. Please log in again.')
        // Optionally redirect to login
        // window.location.href = '/login'
      } else if (error?.status === 403) {
        showError('Access denied. You do not have permission to view categories.')
      } else {
        showError('Failed to fetch categories. Please try again.')
      }
    } finally {
      setIsLoadingCategories(false)
    }
  }



  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const handleEdit = (brand: Brand) => {
    setSelectedBrand(brand)
    setIsEditModalOpen(true)
  }

  const handleView = (brand: Brand) => {
    setSelectedBrand(brand)
    setIsEditModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsEditModalOpen(false)
    setSelectedBrand(null)
  }

  const handleBrandUpdate = async (formData: any) => {
    if (!selectedBrand) return
    
    try {
      await brandApi.updateBrand(selectedBrand.id, formData)
      showSuccess('Brand updated successfully')
      handleCloseModal()
      // Refresh the brands list
      refetch()
    } catch (error) {
      console.error('Failed to update brand:', error)
      showError('Failed to update brand')
    }
  }

  const handleToggleStatus = async (brandId: string) => {
    try {
      await toggleBrandStatus(brandId)
      showSuccess('Brand status updated successfully')
      // Update the selected brand if it's the one being toggled
      if (selectedBrand && selectedBrand.id === brandId) {
        setSelectedBrand({ ...selectedBrand, isActive: !selectedBrand.isActive })
      }
      // Refresh the brands list
      refetch()
    } catch (error) {
      console.error('Failed to update brand status:', error)
      showError('Failed to update brand status')
    }
  }

  const handleSearch = (e: any) => {
    e.preventDefault()
    if (isLoading) return // Prevent multiple API calls while loading
    
    setCurrentPage(1)
    // React Query will automatically refetch when currentPage changes
  }

  // Handle category filter change with immediate effect
  const handleCategoryChange = (categoryId: string) => {
    setCategoryFilter(categoryId)
    setCurrentPage(1) // Reset to first page when filter changes
  }

  // Handle status filter change with immediate effect
  const handleStatusChange = (status: string) => {
    setStatusFilter(status)
    setCurrentPage(1) // Reset to first page when filter changes
  }


  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-theme-primary"></div>
      </div>
    )
  }

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h1>
          <p className="text-gray-600 mb-6">Please log in to access the brands management page.</p>
          <Link
            href="/login"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-theme-primary hover:bg-green-theme-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-theme-primary"
          >
            Go to Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Brand Management</h1>
          <p className="text-gray-600">Manage partner brands and their earning/redeeming rules</p>
          
          {/* Live Status Indicator */}
          <div className="mt-2 flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm text-gray-500">Live Updates Connected</span>
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowManageCategories(true)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Manage Categories
          </button>
          <button
            onClick={() => {
              if (isLoading) return // Prevent multiple API calls while loading
              refetch()
            }}
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            title="Refresh brands list"
          >
            <ArrowPathIcon className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <Link
            href="/brands/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-theme-primary hover:bg-green-theme-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-theme-primary"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Add Brand
          </Link>
        </div>
      </div>



      {/* Search and Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                Search Brands
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name or description..."
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 pl-10 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
                <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>
            
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                id="category"
                value={categoryFilter}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                disabled={isLoadingCategories}
              >
                <option value="all">All Categories</option>
                {isLoadingCategories ? (
                  <option value="" disabled>Loading categories...</option>
                ) : (
                  Array.isArray(categories) ? categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  )) : (
                    <option value="" disabled>No categories available</option>
                  )
                )}
              </select>
              {isLoadingCategories && (
                <p className="mt-1 text-xs text-gray-500">Loading categories...</p>
              )}
            </div>
            
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="status"
                value={statusFilter}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex space-x-3">
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-theme-primary hover:bg-green-theme-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-theme-primary"
              >
                <FunnelIcon className="w-4 h-4 mr-2" />
                Apply Filters
              </button>
              
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={() => {
                    clearFilters()
                  }}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Clear Filters
                </button>
              )}
            </div>
            
            <div className="text-sm text-gray-500">
              {isLoading ? (
                <span className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-theme-primary mr-2"></div>
                  Loading brands...
                </span>
              ) : (
                <>
                  Showing {displayBrands.length} of {totalBrands} brands
                  {hasActiveFilters && (
                    <span className="ml-2 text-green-theme-primary">
                      (filtered)
                    </span>
                  )}
                </>
              )}
            </div>
          </div>
        </form>
      </div>
      
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Partner Brands
          </h3>
          
          {isLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="flex items-center justify-between">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/6"></div>
              </div>
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          ) : displayBrands.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">No brands found</h3>
              <p className="text-sm text-gray-500 mb-4">
                {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all'
                  ? 'Try adjusting your search criteria.'
                  : 'Get started by adding your first brand.'}
              </p>
              {!searchTerm && categoryFilter === 'all' && statusFilter === 'all' && (
                <Link
                  href="/brands/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-green-theme-primary bg-green-theme-secondary hover:bg-green-theme-accent"
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Add Brand
                </Link>
              )}
            </div>
          ) : (
            <>
              <BrandTable 
                brands={displayBrands}
                onEdit={handleEdit}
                onView={handleView}
                onToggleStatus={handleToggleStatus}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={handleSort}
              />
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Page {currentPage} of {totalPages} ({totalBrands} total brands)
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1 || isLoading}
                      className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    
                    {/* Page numbers */}
                    <div className="flex space-x-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            disabled={isLoading}
                            className={`px-3 py-2 text-sm font-medium rounded-md ${
                              currentPage === pageNum
                                ? 'bg-green-theme-primary text-white'
                                : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages || isLoading}
                      className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      
      {/* Manage Categories Modal */}
      {showManageCategories && (
        <ManageCategoriesModal
          isOpen={showManageCategories}
          onClose={() => setShowManageCategories(false)}
          onUpdated={() => {
            // refresh local categories used in the filter
            fetchCategories()
          }}
        />
      )}

      {/* Brand Edit Modal */}
      {isEditModalOpen && selectedBrand && (
        <SimpleBrandForm
          brand={selectedBrand}
          categories={categories}
          isOpen={isEditModalOpen}
          onClose={handleCloseModal}
          onSubmit={handleBrandUpdate}
          isLoading={false}
          onToggleStatus={handleToggleStatus}
        />
      )}
      
    </div>
  )
}

export default function BrandsPage() {
  return <BrandsPageContent />
}
