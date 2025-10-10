'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
// import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { SimpleBrandForm } from '@/components/brands/SimpleBrandForm'
import { brandApi, categoryApi } from '@/lib/api'
import { useToast } from '@/components/common'
import type { Brand, BrandCategory, UpdateBrandRequest } from '@/types'

export default function BrandEditPage() {
  const router = useRouter()
  const params = useParams()
  const brandId = params.id as string
  
  const [brand, setBrand] = useState<Brand | null>(null)
  const [categories, setCategories] = useState<BrandCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const { showSuccess, showError } = useToast()

  useEffect(() => {
    if (brandId) {
      // Fetch both brand and categories in parallel for better performance
      Promise.all([
        fetchBrand(),
        fetchCategories()
      ]).catch(error => {
        console.error('Error fetching data:', error)
      })
    }
  }, [brandId])

  const fetchBrand = async () => {
    try {
      setIsLoading(true)
      console.log('Fetching brand with ID:', brandId)
      const response = await brandApi.getBrand(brandId)
      console.log('Brand API response:', response)
      setBrand(response)
    } catch (error) {
      console.error('Failed to fetch brand:', error)
      showError('Failed to fetch brand')
      router.push('/brands')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      // Check if categories are already cached in localStorage
      const cachedCategories = localStorage.getItem('admin_categories')
      if (cachedCategories) {
        const parsed = JSON.parse(cachedCategories)
        // Check if cache is less than 5 minutes old
        if (Date.now() - parsed.timestamp < 5 * 60 * 1000) {
          console.log('Using cached categories')
          setCategories(parsed.data)
          return
        }
      }
      
      const response = await categoryApi.getAllCategories()
      console.log('Categories API response:', response)
      setCategories(response)
      
      // Cache the categories
      localStorage.setItem('admin_categories', JSON.stringify({
        data: response,
        timestamp: Date.now()
      }))
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }

  const handleSave = async (formData: UpdateBrandRequest) => {
    try {
      setIsSaving(true)
      await brandApi.updateBrand(brandId, formData)
      showSuccess('Brand updated successfully')
      // Close the form by navigating back to the brands list
      router.push('/brands')
    } catch (error) {
      console.error('Failed to update brand:', error)
      showError('Failed to update brand')
    } finally {
      setIsSaving(false)
    }
  }

  const handleToggleStatus = async () => {
    try {
      await brandApi.toggleBrandStatus(brandId)
      showSuccess('Brand status updated successfully')
      fetchBrand() // Refresh the brand data
    } catch (error) {
      console.error('Failed to update brand status:', error)
      showError('Failed to update brand status')
    }
  }

  

  // Show form immediately with loading states instead of blocking the entire page

  if (!brand) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Brand not found</h3>
        <p className="text-gray-500 mb-4">The brand you're looking for doesn't exist.</p>
        <Link
          href="/brands"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-green-theme-primary bg-green-theme-secondary hover:bg-green-theme-accent"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Brands
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/brands"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
            Back to Brands
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isLoading ? (
                <div className="h-8 bg-gray-200 rounded animate-pulse w-48"></div>
              ) : (
                brand.name
              )}
            </h1>
            <p className="text-gray-600">
              {isLoading ? (
                <div className="h-4 bg-gray-200 rounded animate-pulse w-64 mt-2"></div>
              ) : (
                'Edit brand details and settings'
              )}
            </p>
          </div>
        </div>
        <div className="flex space-x-3">
          {isLoading ? (
            <div className="h-10 bg-gray-200 rounded animate-pulse w-24"></div>
          ) : (
            <button
              onClick={handleToggleStatus}
              className={`inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md ${
                brand.isActive
                  ? 'border-red-300 text-red-700 bg-red-50 hover:bg-red-100'
                  : 'border-green-300 text-green-700 bg-green-50 hover:bg-green-100'
              }`}
            >
              {brand.isActive ? 'Deactivate' : 'Activate'}
            </button>
          )}
        </div>
      </div>

      {/* Brand Form */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <SimpleBrandForm
            brand={brand}
            categories={categories}
            isOpen={true}
            onClose={() => router.push('/brands')}
            onSubmit={handleSave}
            isLoading={isSaving}
            isDataLoading={isLoading}
          />
        </div>
      </div>

      
    </div>
  )
}
