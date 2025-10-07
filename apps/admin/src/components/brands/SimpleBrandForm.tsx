'use client'

import { useState, useEffect } from 'react'
import { XMarkIcon, PlusIcon } from '@heroicons/react/24/outline'
import type { Brand, CreateBrandRequest, UpdateBrandRequest, BrandCategory } from '@/types'
import {
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const brandFormSchema = z.object({
  name: z.string().min(1, 'Brand name is required').max(200, 'Brand name cannot exceed 200 characters'),
  description: z.string().min(1, 'Description is required'),
  logoUrl: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  categoryId: z.string().min(1, 'Category is required'),
  earningPercentage: z.number().min(0, 'Earning percentage must be between 0 and 100').max(100, 'Earning percentage must be between 0 and 100'),
  redemptionPercentage: z.number().min(0, 'Redemption percentage must be between 0 and 100').max(100, 'Redemption percentage must be between 0 and 100'),
  minRedemptionAmount: z.number().min(0, 'Minimum redemption amount must be non-negative').optional(),
  maxRedemptionAmount: z.number().min(0, 'Maximum redemption amount must be non-negative').optional(),
  brandwiseMaxCap: z.number().min(0, 'Brandwise max cap must be non-negative'),
})

type BrandFormData = z.infer<typeof brandFormSchema>

interface SimpleBrandFormProps {
  brand?: Brand | null
  categories: BrandCategory[]
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateBrandRequest | UpdateBrandRequest) => void
  isLoading?: boolean
}

export function SimpleBrandForm({ 
  brand, 
  categories, 
  isOpen, 
  onClose, 
  onSubmit, 
  isLoading = false 
}: SimpleBrandFormProps) {
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<BrandFormData>({
    resolver: zodResolver(brandFormSchema),
    defaultValues: {
      name: '',
      description: '',
      logoUrl: '',
      categoryId: '',
      earningPercentage: 30,
      redemptionPercentage: 100,
      minRedemptionAmount: 1,
      maxRedemptionAmount: 2000,
      brandwiseMaxCap: 2000,
    }
  })

  useEffect(() => {
    if (brand) {
      reset({
        name: brand.name,
        description: brand.description,
        logoUrl: brand.logoUrl || '',
        categoryId: brand.categoryId,
        earningPercentage: brand.earningPercentage,
        redemptionPercentage: brand.redemptionPercentage,
        minRedemptionAmount: brand.minRedemptionAmount,
        maxRedemptionAmount: brand.maxRedemptionAmount,
        brandwiseMaxCap: brand.brandwiseMaxCap,
      })
    } else {
      reset({
        name: '',
        description: '',
        logoUrl: '',
        categoryId: '',
        earningPercentage: 30,
        redemptionPercentage: 100,
        minRedemptionAmount: 1,
        maxRedemptionAmount: 2000,
        brandwiseMaxCap: 2000,
      })
    }
  }, [brand, reset])

  const handleFormSubmit = (data: BrandFormData) => {
    const submitData = { ...data }
    
    // Clean up undefined values
    if (submitData.logoUrl === '') submitData.logoUrl = undefined

    onSubmit(submitData)
  }

  const handleClose = () => {
    reset({
      name: '',
      description: '',
      logoUrl: '',
      categoryId: '',
      earningPercentage: 30,
      redemptionPercentage: 100,
      minRedemptionAmount: 1,
      maxRedemptionAmount: 2000,
      brandwiseMaxCap: 2000,
    })
    onClose()
  }

  // Watch for changes to sync maxRedemptionAmount with brandwiseMaxCap
  const brandwiseMaxCap = watch('brandwiseMaxCap')
  const maxRedemptionAmount = watch('maxRedemptionAmount')

  useEffect(() => {
    if (brandwiseMaxCap !== undefined && maxRedemptionAmount !== undefined) {
      if (brandwiseMaxCap !== maxRedemptionAmount) {
        setValue('maxRedemptionAmount', brandwiseMaxCap)
      }
    }
  }, [brandwiseMaxCap, setValue])

  useEffect(() => {
    if (maxRedemptionAmount !== undefined && brandwiseMaxCap !== undefined) {
      if (maxRedemptionAmount !== brandwiseMaxCap) {
        setValue('brandwiseMaxCap', maxRedemptionAmount)
      }
    }
  }, [maxRedemptionAmount, setValue])

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {brand ? 'Edit Brand' : 'Create New Brand'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Brand Name *</Label>
                <Input
                  {...register('name')}
                  id="name"
                  placeholder="Enter brand name"
                  required
                />
                {errors.name && (
                  <p className="text-sm font-medium text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoryId">Category *</Label>
                <Select onValueChange={(value) => setValue('categoryId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.isArray(categories) ? categories.filter(category => category.id).map((category) => (
                      <SelectItem key={category.id!} value={category.id!}>
                        {category.name}
                      </SelectItem>
                    )) : (
                      <SelectItem value="no-categories" disabled>
                        No categories available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {errors.categoryId && (
                  <p className="text-sm font-medium text-destructive">{errors.categoryId.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="logoUrl">Logo URL</Label>
                <Input
                  {...register('logoUrl')}
                  id="logoUrl"
                  type="url"
                  placeholder="https://example.com/logo.png"
                />
                {errors.logoUrl && (
                  <p className="text-sm font-medium text-destructive">{errors.logoUrl.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Optional: URL to the brand logo image
                </p>
              </div>
            </div>

            {/* Description */}
            <div>
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  {...register('description')}
                  id="description"
                  rows={4}
                  placeholder="Enter brand description"
                  required
                />
                {errors.description && (
                  <p className="text-sm font-medium text-destructive">{errors.description.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Percentage Configuration */}
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="text-lg font-semibold mb-4">Percentage Configuration</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="earningPercentage">Earning Percentage *</Label>
                <div className="relative">
                  <Input
                    {...register('earningPercentage', { valueAsNumber: true })}
                    id="earningPercentage"
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    required
                  />
                  <span className="absolute right-3 top-2 text-muted-foreground">%</span>
                </div>
                {errors.earningPercentage && (
                  <p className="text-sm font-medium text-destructive">{errors.earningPercentage.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Percentage of bill amount users earn as coins
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="redemptionPercentage">Redemption Percentage *</Label>
                <div className="relative">
                  <Input
                    {...register('redemptionPercentage', { valueAsNumber: true })}
                    id="redemptionPercentage"
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    required
                  />
                  <span className="absolute right-3 top-2 text-muted-foreground">%</span>
                </div>
                {errors.redemptionPercentage && (
                  <p className="text-sm font-medium text-destructive">{errors.redemptionPercentage.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Percentage of bill amount users can redeem with coins
                </p>
              </div>
            </div>
          </div>

          {/* Redemption Limit */}
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="text-lg font-semibold mb-4">Redemption Limit</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="brandwiseMaxCap">Maximum redemption absolute amount *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-muted-foreground">₹</span>
                  <Input
                    {...register('brandwiseMaxCap', { valueAsNumber: true })}
                    id="brandwiseMaxCap"
                    type="number"
                    min="0"
                    step="1"
                    required
                    className="pl-8"
                  />
                </div>
                {errors.brandwiseMaxCap && (
                  <p className="text-sm font-medium text-destructive">{errors.brandwiseMaxCap.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Per-transaction maximum redemption limit. Defaults to ₹2000.
                </p>
              </div>
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
                  {brand ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <PlusIcon className="w-4 h-4 mr-2" />
                  {brand ? 'Update Brand' : 'Create Brand'}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
