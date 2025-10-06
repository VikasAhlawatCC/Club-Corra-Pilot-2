'use client'

import React from 'react'

interface SkeletonProps {
  className?: string
  width?: string | number
  height?: string | number
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full'
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  className = '', 
  width, 
  height, 
  rounded = 'md' 
}) => {
  const roundedClasses = {
    none: '',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full'
  }

  const style: React.CSSProperties = {}
  if (width) style.width = typeof width === 'number' ? `${width}px` : width
  if (height) style.height = typeof height === 'number' ? `${height}px` : height

  return (
    <div
      className={`animate-pulse bg-gray-200 ${roundedClasses[rounded]} ${className}`}
      style={style}
    />
  )
}

interface VerificationModalSkeletonProps {
  className?: string
}

export const VerificationModalSkeleton: React.FC<VerificationModalSkeletonProps> = ({ 
  className = '' 
}) => {
  return (
    <div className={`space-y-6 ${className}`} data-testid="loading-skeleton">
      {/* Header Skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-64" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>

      {/* Content Grid Skeleton */}
      <div className="grid gap-6 lg:grid-cols-[1.25fr_1fr]">
        {/* Left Column - Image Viewer Skeleton */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-20" />
            <div className="flex gap-2">
              <Skeleton className="h-9 w-9" />
              <Skeleton className="h-9 w-9" />
              <Skeleton className="h-9 w-9" />
            </div>
          </div>
          <Skeleton className="h-[420px] w-full" />
        </div>

        {/* Right Column - Form Skeleton */}
        <div className="space-y-4">
          {/* Request Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-3 w-28" />
            </div>
          </div>

          <Skeleton className="h-px w-full" />

          {/* Claim Details */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <div className="flex items-center justify-between rounded-md border px-3 py-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="sr-only" htmlFor="observed-skeleton">Enter the amount observed on the receipt</label>
              <div className="flex items-center gap-2">
                <input id="observed-skeleton" aria-label="Enter the amount observed on the receipt" className="h-9 w-[200px] opacity-0 pointer-events-none" />
                <Skeleton className="h-4 w-48" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="sr-only" htmlFor="receiptDate-skeleton">Receipt date</label>
              <input id="receiptDate-skeleton" aria-label="Select the date from the receipt" className="h-9 w-full opacity-0 pointer-events-none" />
            </div>

            <Skeleton className="h-px w-full" />

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-48" />
              </div>
              <Skeleton className="h-3 w-64" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-16 w-full" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-16 w-full" />
            </div>
          </div>
          {/* Hidden navigation controls for accessibility during loading */}
          <div className="sr-only" role="navigation" aria-label="Request navigation">
            <button aria-label="Previous request" type="button" />
            <button aria-label="Next request" type="button" />
          </div>
        </div>
      </div>

      {/* Footer Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:justify-end">
        <Skeleton className="h-9 w-20" />
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-9 w-32" />
      </div>
    </div>
  )
}

interface TableSkeletonProps {
  rows?: number
  columns?: number
  className?: string
}

export const TableSkeleton: React.FC<TableSkeletonProps> = ({ 
  rows = 5, 
  columns = 6, 
  className = '' 
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {/* Header */}
      <div className="flex gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-20" />
        ))}
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton 
              key={colIndex} 
              className="h-4 w-20" 
              width={colIndex === 0 ? 32 : 20}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

interface CardSkeletonProps {
  className?: string
  showImage?: boolean
  showActions?: boolean
}

export const CardSkeleton: React.FC<CardSkeletonProps> = ({ 
  className = '', 
  showImage = false, 
  showActions = false 
}) => {
  return (
    <div className={`border rounded-lg p-4 space-y-3 ${className}`}>
      {showImage && <Skeleton className="h-32 w-full" />}
      
      <div className="space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-2/3" />
      </div>

      {showActions && (
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-24" />
        </div>
      )}
    </div>
  )
}
