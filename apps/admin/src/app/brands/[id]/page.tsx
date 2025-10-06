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
      fetchBrand()
      fetchCategories()
    }
  }, [brandId])

  const fetchBrand = async () => {
    try {
      setIsLoading(true)
      const response = await brandApi.getBrand(brandId)
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
      const response = await categoryApi.getAllCategories()
      setCategories(response)
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

  

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="space-y-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

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
            <h1 className="text-3xl font-bold text-gray-900">{brand.name}</h1>
            <p className="text-gray-600">Edit brand details and settings</p>
          </div>
        </div>
        <div className="flex space-x-3">
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
          />
        </div>
      </div>

      
    </div>
  )
}
