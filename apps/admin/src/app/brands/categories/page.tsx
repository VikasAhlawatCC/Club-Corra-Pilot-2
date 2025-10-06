'use client'

import { useState, useEffect } from 'react'
import { PlusIcon, PencilIcon, TrashIcon } from '@/components/icons/SvgIcons'
import { categoryApi, brandApi } from '@/lib/api'
import { useToast } from '@/components/common'
import { CategoryModal } from '@/components/brands/CategoryModal'
import type { BrandCategory, CreateBrandCategoryRequest, UpdateBrandCategoryRequest } from '@/types'

interface CategoryWithBrandCount extends BrandCategory {
  brandCount: number
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryWithBrandCount[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<BrandCategory | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null)
  const { showSuccess, showError } = useToast()

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setIsLoading(true)
      const categoriesResponse = await categoryApi.getAllCategories()
      const firstPage = await brandApi.getAllBrands(1, 100)
      const totalPages = firstPage.totalPages || 1
      let allBrands = [...firstPage.brands]
      if (totalPages > 1) {
        const pagePromises: Array<Promise<{ brands: any[] }>> = []
        for (let page = 2; page <= totalPages; page++) {
          pagePromises.push(brandApi.getAllBrands(page, 100))
        }
        const restPages = await Promise.all(pagePromises)
        restPages.forEach((res) => {
          allBrands = allBrands.concat(res.brands)
        })
      }

      const categoriesWithCounts = categoriesResponse.map(category => ({
        ...category,
        brandCount: allBrands.filter(brand => brand.categoryId === category.id).length
      }))
      
      setCategories(categoriesWithCounts)
    } catch (error) {
      console.error('Failed to fetch categories:', error)
      showError('Failed to fetch categories')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateCategory = async (data: CreateBrandCategoryRequest) => {
    try {
      await categoryApi.createCategory(data)
      showSuccess('Category created successfully')
      setShowCreateModal(false)
      fetchCategories()
    } catch (error) {
      console.error('Failed to create category:', error)
      showError('Failed to create category')
    }
  }

  const handleUpdateCategory = async (id: string, data: UpdateBrandCategoryRequest) => {
    try {
      await categoryApi.updateCategory(id, data)
      showSuccess('Category updated successfully')
      setEditingCategory(null)
      fetchCategories()
    } catch (error) {
      console.error('Failed to update category:', error)
      showError('Failed to update category')
    }
  }

  const handleDeleteCategory = async (id: string) => {
    try {
      await categoryApi.deleteCategory(id)
      showSuccess('Category deleted successfully')
      setShowDeleteModal(null)
      fetchCategories()
    } catch (error) {
      console.error('Failed to delete category:', error)
      showError('Failed to delete category')
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Brand Categories</h1>
          <p className="text-gray-600">Manage brand categories and their properties</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-theme-primary hover:bg-green-theme-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-theme-primary"
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          Add Category
        </button>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            All Categories
          </h3>
          
          {categories.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">No categories</h3>
              <p className="text-sm text-gray-500 mb-4">Get started by creating your first brand category.</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-green-theme-primary bg-green-theme-secondary hover:bg-green-theme-accent"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Add Category
              </button>
            </div>
          ) : (
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Icon
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Color
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Brands
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {categories.map((category) => (
                    <tr key={category.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-gray-900">
                            {category.name}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {category.description || 'No description'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {category.iconUrl || '—'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {/* color not defined in BrandCategory; omit */}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            category.brandCount > 0 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {category.brandCount} {category.brandCount === 1 ? 'brand' : 'brands'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => setEditingCategory(category)}
                            className="text-green-theme-primary hover:text-green-theme-accent"
                            title="Edit category"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => category.id && setShowDeleteModal(category.id)}
                            className="text-status-error hover:text-status-error/80"
                            title="Delete category"
                            disabled={category.brandCount > 0}
                          >
                            <TrashIcon className={`w-4 h-4 ${category.brandCount > 0 ? 'opacity-50 cursor-not-allowed' : ''}`} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

             {/* Create Category Modal */}
       {showCreateModal && (
         <CategoryModal
           mode="create"
           isOpen={showCreateModal}
           onClose={() => setShowCreateModal(false)}
           onSubmit={handleCreateCategory}
         />
       )}

       {/* Edit Category Modal */}
       {editingCategory && (
         <CategoryModal
           mode="edit"
           category={editingCategory}
           isOpen={true}
           onClose={() => setEditingCategory(null)}
           onSubmit={(data) => {
             if (editingCategory.id) {
               handleUpdateCategory(editingCategory.id, data)
             }
           }}
         />
       )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <DeleteConfirmationModal
          categoryName={categories.find(c => c.id === showDeleteModal)?.name || ''}
          brandCount={categories.find(c => c.id === showDeleteModal)?.brandCount || 0}
          onConfirm={() => handleDeleteCategory(showDeleteModal)}
          onCancel={() => setShowDeleteModal(null)}
        />
      )}
    </div>
  )
}



// Delete Confirmation Modal
interface DeleteConfirmationModalProps {
  categoryName: string
  brandCount: number
  onConfirm: () => void
  onCancel: () => void
}

function DeleteConfirmationModal({ categoryName, brandCount, onConfirm, onCancel }: DeleteConfirmationModalProps) {
  const canDelete = brandCount === 0

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <TrashIcon className="w-6 h-6 text-status-error" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mt-4">Delete Category</h3>
          <p className="text-sm text-gray-500 mt-2">
            {canDelete ? (
              `Are you sure you want to delete "${categoryName}"? This action cannot be undone.`
            ) : (
              `Cannot delete "${categoryName}" because it has ${brandCount} associated brand${brandCount === 1 ? '' : 's'}. Please remove or reassign the brands first.`
            )}
          </p>
          <div className="flex justify-center space-x-3 mt-6">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {canDelete ? 'Cancel' : 'Close'}
            </button>
            {canDelete && (
              <button
                onClick={onConfirm}
                className="px-4 py-2 text-sm font-medium text-white bg-status-error border border-transparent rounded-md hover:bg-status-error/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-status-error"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
