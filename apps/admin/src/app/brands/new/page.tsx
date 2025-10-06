'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
// import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { SimpleBrandForm } from '@/components/brands/SimpleBrandForm'
import { brandApi, categoryApi } from '@/lib/api'
import { useToast, ToastContainer } from '@/components/common'
import type { CreateBrandRequest, BrandCategory } from '@/types'

export default function NewBrandPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [categories, setCategories] = useState<BrandCategory[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)
  const { toasts, removeToast, showSuccess, showError } = useToast()

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setIsLoadingCategories(true)
      const response = await categoryApi.getAllCategories()
      setCategories(response)
    } catch (error) {
      console.error('Failed to fetch categories:', error)
      showError('Failed to fetch categories', 'Unable to load brand categories. Please try again.')
    } finally {
      setIsLoadingCategories(false)
    }
  }

  const handleSubmit = async (data: CreateBrandRequest | any) => {
    setIsLoading(true)
    try {
      // Ensure data is properly typed as CreateBrandRequest
      const brandData: CreateBrandRequest = {
        name: data.name,
        description: data.description,
        categoryId: data.categoryId,
        earningPercentage: data.earningPercentage,
        redemptionPercentage: data.redemptionPercentage,
        minRedemptionAmount: data.minRedemptionAmount,
        maxRedemptionAmount: data.maxRedemptionAmount,
        brandwiseMaxCap: data.brandwiseMaxCap,
        logoUrl: data.logoUrl,
      }
      
      await brandApi.createBrand(brandData)
      showSuccess('Brand Created', 'New brand has been created successfully')
      
      // Redirect to brands list after a short delay
      setTimeout(() => {
        router.push('/brands')
      }, 1500)
      
    } catch (error: any) {
      console.error('Failed to create brand:', error)
      const errorMessage = error.message || 'Failed to create brand. Please try again.'
      showError('Creation Failed', errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    router.push('/brands')
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <button
            onClick={handleClose}
            className="mr-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create New Brand</h1>
            <p className="mt-2 text-gray-600">
              Add a new partner brand to the Club Corra system.
            </p>
          </div>
        </div>
      </div>

      <SimpleBrandForm
        brand={null}
        categories={categories}
        isOpen={true}
        onClose={handleClose}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
      
      {isLoadingCategories && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-40">
          <div className="relative top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-theme-primary"></div>
            <p className="mt-4 text-center text-gray-600">Loading categories...</p>
          </div>
        </div>
      )}
      
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}
