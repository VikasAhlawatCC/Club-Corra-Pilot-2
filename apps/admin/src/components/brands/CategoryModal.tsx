'use client'

import { useState, useEffect } from 'react'
import { PlusIcon } from '@heroicons/react/24/outline'
import type { BrandCategory, CreateBrandCategoryRequest, UpdateBrandCategoryRequest } from '@/types'
import {
  Button,
  Input,
  Label,
  Textarea,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const categoryFormSchema = z.object({
  name: z.string().min(1, 'Category name is required').max(100, 'Category name cannot exceed 100 characters'),
  description: z.string().max(500, 'Description cannot exceed 500 characters').optional(),
  iconUrl: z.string().url('Please enter a valid icon URL').optional(),
})

type CategoryFormData = z.infer<typeof categoryFormSchema>

interface BaseCategoryModalProps {
  category?: BrandCategory | null
  isOpen: boolean
  onClose: () => void
  isLoading?: boolean
}

interface CreateCategoryModalProps extends BaseCategoryModalProps {
  mode: 'create'
  onSubmit: (data: CreateBrandCategoryRequest) => Promise<void> | void
}

interface EditCategoryModalProps extends BaseCategoryModalProps {
  mode: 'edit'
  onSubmit: (data: UpdateBrandCategoryRequest) => Promise<void> | void
}

type CategoryModalProps = CreateCategoryModalProps | EditCategoryModalProps

export function CategoryModal({ 
  mode, 
  category, 
  isOpen, 
  onClose, 
  onSubmit, 
  isLoading = false 
}: CategoryModalProps) {
  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: '',
      description: '',
      iconUrl: '',
    }
  })

  useEffect(() => {
    if (category && mode === 'edit') {
      form.reset({
        name: category.name,
        description: category.description || '',
        iconUrl: category.iconUrl || '',
      })
    } else {
      form.reset({
        name: '',
        description: '',
        iconUrl: '',
      })
    }
  }, [category, mode, form])

  const handleSubmit = (data: CategoryFormData) => {
    const submitData = { ...data }
    
    // Clean up empty strings
    if (submitData.description === '') submitData.description = undefined
    if (submitData.iconUrl === '') submitData.iconUrl = undefined

    if (mode === 'create') {
      (onSubmit as (data: CreateBrandCategoryRequest) => Promise<void> | void)(submitData as CreateBrandCategoryRequest)
    } else {
      (onSubmit as (data: UpdateBrandCategoryRequest) => Promise<void> | void)(submitData as UpdateBrandCategoryRequest)
    }
  }

  const handleClose = () => {
    form.reset({
      name: '',
      description: '',
      iconUrl: '',
    })
    onClose()
  }

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {mode === 'create' ? 'Create New Category' : 'Edit Category'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category Name *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter category name"
                        required
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        rows={3}
                        placeholder="Enter category description (optional)"
                      />
                    </FormControl>
                    <FormMessage />
                    <p className="text-xs text-muted-foreground">
                      Optional: Brief description of the category
                    </p>
                  </FormItem>
                )}
              />
            </div>

            {/* Visual Properties */}
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="text-lg font-semibold mb-4">Visual Properties</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="iconUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Icon URL</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="https://example.com/icon.png"
                        />
                      </FormControl>
                      <FormMessage />
                      <p className="text-xs text-muted-foreground">
                        Optional: URL to an icon for the category
                      </p>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="flex items-center"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {mode === 'create' ? 'Creating...' : 'Updating...'}
                  </>
                ) : (
                  <>
                    <PlusIcon className="w-4 h-4 mr-2" />
                    {mode === 'create' ? 'Create Category' : 'Update Category'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
