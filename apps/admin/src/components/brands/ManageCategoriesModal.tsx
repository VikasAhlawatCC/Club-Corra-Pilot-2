'use client'

import { useEffect, useMemo, useState } from 'react'
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import type { BrandCategory, CreateBrandCategoryRequest, UpdateBrandCategoryRequest } from '@/types'
import { brandApi, categoryApi } from '@/lib/api'
import { useToast } from '@/components/common'
import { CategoryModal } from '@/components/brands/CategoryModal'
import { DeleteConfirmationModal } from '@/components/brands/DeleteConfirmationModal'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui'

interface ManageCategoriesModalProps {
  isOpen: boolean
  onClose: () => void
  onUpdated?: () => void
}

interface CategoryWithBrandCount extends BrandCategory {
  brandCount: number
}

export function ManageCategoriesModal({ isOpen, onClose, onUpdated }: ManageCategoriesModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [categories, setCategories] = useState<CategoryWithBrandCount[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<BrandCategory | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null)
  const { showSuccess, showError } = useToast()

  const hasCategories = useMemo(() => categories.length > 0, [categories])

  useEffect(() => {
    if (isOpen) {
      void fetchCategories()
    }
  }, [isOpen])

  const fetchCategories = async () => {
    try {
      setIsLoading(true)
      const categoriesResponse = await categoryApi.getAllCategories()

      // Fetch all brands in pages (backend max limit is 100)
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

      const categoriesWithCounts = categoriesResponse.map((category) => ({
        ...category,
        brandCount: allBrands.filter((brand) => brand.categoryId === category.id).length,
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
      await fetchCategories()
      onUpdated?.()
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
      await fetchCategories()
      onUpdated?.()
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
      await fetchCategories()
      onUpdated?.()
    } catch (error) {
      console.error('Failed to delete category:', error)
      showError('Failed to delete category')
    }
  }

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Manage Categories</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">Add, edit, or remove brand categories.</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-theme-primary hover:bg-green-theme-accent"
            >
              <PlusIcon className="w-4 h-4 mr-2" /> Add Category
            </button>
          </div>

          <div className="bg-white shadow rounded-lg" data-testid="categories-table">
            <div className="px-4 py-5 sm:p-6">
              {isLoading ? (
                <div className="animate-pulse space-y-3">
                  {[...Array(5)].map((_, idx) => (
                    <div key={idx} className="h-12 bg-gray-200 rounded" />
                  ))}
                </div>
              ) : !hasCategories ? (
                <div className="text-center py-12">
                  <p className="text-sm text-gray-600">No categories yet.</p>
                </div>
              ) : (
                <div className="overflow-hidden ring-1 ring-black ring-opacity-5 rounded-md">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Brands</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {categories.map((category) => (
                        <tr key={category.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{category.name}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 max-w-xs truncate">{category.description || '—'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              category.brandCount > 0 ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {category.brandCount}
                            </span>
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
                                disabled={category.brandCount > 0 || !category.id}
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
              categoryName={categories.find((c) => c.id === showDeleteModal)?.name || ''}
              brandCount={categories.find((c) => c.id === showDeleteModal)?.brandCount || 0}
              onConfirm={() => handleDeleteCategory(showDeleteModal)}
              onCancel={() => setShowDeleteModal(null)}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}


