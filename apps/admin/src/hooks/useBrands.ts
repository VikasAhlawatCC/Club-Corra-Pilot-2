import { useState, useCallback } from 'react'
import { brandApi } from '@/lib/api'
import { useToast } from '@/components/common'
import type { Brand } from '@/types'

interface BrandSearchParams {
  page: number
  pageSize: number
  searchTerm?: string
  categoryId?: string
  isActive?: boolean
}

export function useBrands() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [totalPages, setTotalPages] = useState(1)
  const [totalBrands, setTotalBrands] = useState(0)
  const { showError } = useToast()

  const fetchBrands = useCallback(async (params: BrandSearchParams) => {
    try {
      setIsLoading(true)
      
      const response = await brandApi.getAllBrands(
        params.page,
        params.pageSize,
        params.searchTerm,
        params.categoryId,
        params.isActive
      )
      
      // Handle the API response structure: {success: true, data: {brands: [...], total: ..., page: ..., limit: ..., totalPages: ...}}
      if (response && response.success && response.data) {
        const data = response.data
        console.log('API response:', response)
        console.log('Brands returned:', data.brands?.length || 0)
        console.log('Active brands:', data.brands?.filter(b => b.isActive)?.length || 0)
        console.log('Inactive brands:', data.brands?.filter(b => !b.isActive)?.length || 0)

        // Frontend safety filter in case backend ignores isActive param
        let hydratedBrands = data.brands || []
        if (params.isActive !== undefined) {
          hydratedBrands = hydratedBrands.filter((brand) => brand.isActive === params.isActive)
        }

        setBrands(hydratedBrands)
        setTotalPages(data.totalPages || 1)
        setTotalBrands(data.total || 0)
      } else if (response && typeof response === 'object' && response.brands) {
        // Fallback for direct response structure
        console.log('API response (fallback):', response)
        console.log('Brands returned:', response.brands?.length || 0)
        
        let hydratedBrands = response.brands || []
        if (params.isActive !== undefined) {
          hydratedBrands = hydratedBrands.filter((brand) => brand.isActive === params.isActive)
        }

        setBrands(hydratedBrands)
        setTotalPages(response.totalPages || 1)
        setTotalBrands(response.total || 0)
      } else {
        console.error('Invalid response structure:', response)
        setBrands([])
        setTotalPages(1)
        setTotalBrands(0)
        showError('Invalid response from server')
      }
    } catch (error) {
      console.error('Failed to fetch brands:', error)
      showError('Failed to fetch brands')
      // Set default values on error
      setBrands([])
      setTotalPages(1)
      setTotalBrands(0)
    } finally {
      setIsLoading(false)
    }
  }, [showError]) // Re-add showError dependency since we're using it in the error handling

  const deleteBrand = useCallback(async (brandId: string) => {
    try {
      await brandApi.deleteBrand(brandId)
      return true
    } catch (error) {
      console.error('Failed to delete brand:', error)
      showError('Failed to delete brand')
      return false
    }
  }, [showError])

  const toggleBrandStatus = useCallback(async (brandId: string) => {
    try {
      const updated = await brandApi.toggleBrandStatus(brandId)
      // Optimistically update local state so UI reflects DB change immediately
      setBrands((prev) => prev.map((b) => b.id === brandId ? { ...b, isActive: updated.isActive, updatedAt: updated.updatedAt } as Brand : b))
      return true
    } catch (error) {
      console.error('Failed to update brand status:', error)
      showError('Failed to update brand status')
      return false
    }
  }, [showError])

  return {
    brands,
    isLoading,
    totalPages,
    totalBrands,
    fetchBrands,
    deleteBrand,
    toggleBrandStatus,
  }
}
