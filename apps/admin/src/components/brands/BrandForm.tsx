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
}).refine((data) => {
  if (data.minRedemptionAmount !== undefined && data.maxRedemptionAmount !== undefined) {
    return data.minRedemptionAmount <= data.maxRedemptionAmount
  }
  return true
}, {
  message: 'Maximum redemption amount must be greater than minimum',
  path: ['maxRedemptionAmount']
}).refine((data) => {
  if (data.maxRedemptionAmount !== undefined && data.brandwiseMaxCap !== undefined) {
    return data.maxRedemptionAmount === data.brandwiseMaxCap
  }
  return true
}, {
  message: 'Maximum redemption amount must equal brandwise max cap',
  path: ['maxRedemptionAmount']
}).refine((data) => {
  if (data.maxRedemptionAmount !== undefined && data.brandwiseMaxCap !== undefined) {
    return data.maxRedemptionAmount === data.brandwiseMaxCap
  }
  return true
}, {
  message: 'Brandwise max cap must equal maximum redemption amount',
  path: ['brandwiseMaxCap']
})

type BrandFormData = z.infer<typeof brandFormSchema>

interface BrandFormProps {
  brand?: Brand | null
  categories: BrandCategory[]
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateBrandRequest | UpdateBrandRequest) => void
  isLoading?: boolean
}

export function BrandForm({ 
  brand, 
  categories, 
  isOpen, 
  onClose, 
  onSubmit, 
  isLoading = false 
}: BrandFormProps) {
  const form = useForm<BrandFormData>({
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
      form.reset({
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
      form.reset({
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
  }, [brand, form])

  const handleSubmit = (data: BrandFormData) => {
    const submitData = { ...data }
    
    // Clean up undefined values
    if (submitData.logoUrl === '') submitData.logoUrl = undefined

    onSubmit(submitData)
  }

  const handleClose = () => {
    form.reset({
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
  const brandwiseMaxCap = form.watch('brandwiseMaxCap')
  const maxRedemptionAmount = form.watch('maxRedemptionAmount')

  useEffect(() => {
    if (brandwiseMaxCap !== undefined && maxRedemptionAmount !== undefined) {
      if (brandwiseMaxCap !== maxRedemptionAmount) {
        form.setValue('maxRedemptionAmount', brandwiseMaxCap)
      }
    }
  }, [brandwiseMaxCap, form])

  useEffect(() => {
    if (maxRedemptionAmount !== undefined && brandwiseMaxCap !== undefined) {
      if (maxRedemptionAmount !== brandwiseMaxCap) {
        form.setValue('brandwiseMaxCap', maxRedemptionAmount)
      }
    }
  }, [maxRedemptionAmount, form])

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {brand ? 'Edit Brand' : 'Create New Brand'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brand Name *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter brand name"
                          required
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
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
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="logoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Logo URL</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="url"
                          placeholder="https://example.com/logo.png"
                        />
                      </FormControl>
                      <FormMessage />
                      <p className="text-xs text-muted-foreground">
                        Optional: URL to the brand logo image
                      </p>
                    </FormItem>
                  )}
                />
              </div>

              {/* Description */}
              <div>
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description *</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          rows={4}
                          placeholder="Enter brand description"
                          required
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Percentage Configuration */}
            <div className="bg-green-theme-muted p-4 rounded-lg border border-green-theme-accent">
              <h4 className="text-lg font-semibold mb-4 text-green-theme-primary">Percentage Configuration</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="earningPercentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Earning Percentage *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            type="number"
                            min="0"
                            max="100"
                            step="1"
                            required
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                          <span className="absolute right-3 top-2 text-muted-foreground">%</span>
                        </div>
                      </FormControl>
                      <FormMessage />
                      <p className="text-xs text-muted-foreground">
                        Percentage of bill amount users earn as coins
                      </p>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="redemptionPercentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Redemption Percentage *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            type="number"
                            min="0"
                            max="100"
                            step="1"
                            required
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                          <span className="absolute right-3 top-2 text-muted-foreground">%</span>
                        </div>
                      </FormControl>
                      <FormMessage />
                      <p className="text-xs text-muted-foreground">
                        Percentage of bill amount users can redeem with coins
                      </p>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Redemption Amount Limits */}
            <div className="bg-gold-theme-muted p-4 rounded-lg border border-gold-theme-accent">
              <h4 className="text-lg font-semibold mb-4 text-gold-theme-primary">Redemption Amount Limits</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="minRedemptionAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimum Redemption Amount</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-2 text-muted-foreground">₹</span>
                          <Input
                            {...field}
                            type="number"
                            min="0"
                            step="1"
                            placeholder="No minimum"
                            className="pl-8"
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                            value={field.value || ''}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                      <p className="text-xs text-muted-foreground">
                        Optional: Minimum bill amount for redemption
                      </p>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maxRedemptionAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maximum Redemption Amount</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-2 text-muted-foreground">₹</span>
                          <Input
                            {...field}
                            type="number"
                            min="0"
                            step="1"
                            placeholder="No maximum"
                            className="pl-8"
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                            value={field.value || ''}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                      <p className="text-xs text-muted-foreground">
                        Optional: Maximum bill amount for redemption
                      </p>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Cap Configuration */}
            <div className="bg-silver-muted p-4 rounded-lg border border-silver-theme-accent">
              <h4 className="text-lg font-semibold mb-4 text-silver-theme-primary">Cap Configuration</h4>
              <div className="grid grid-cols-1 gap-6">
                <FormField
                  control={form.control}
                  name="brandwiseMaxCap"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maximum redemption absolute amount *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-2 text-muted-foreground">₹</span>
                          <Input
                            {...field}
                            type="number"
                            min="0"
                            step="1"
                            required
                            className="pl-8"
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                      <p className="text-xs text-muted-foreground">
                        Per-transaction maximum redemption limit. Defaults to ₹2000.
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
                className="border-gold-theme-accent text-gold-theme-primary hover:bg-gold-theme-secondary"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="flex items-center bg-green-theme-primary hover:bg-green-theme-accent"
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
        </Form>
      </DialogContent>
    </Dialog>
  )
}
