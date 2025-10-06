'use client'

import { useMemo, useState } from 'react'
import { 
  PencilIcon, 
  TrashIcon, 
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell,
  Badge,
  Button
} from '@/components/ui'
import type { Brand } from '@/types'
import { getProxiedUrl } from '@/utils/s3UrlProxy'

interface BrandTableProps {
  brands: Brand[]
  onEdit?: (brand: Brand) => void
  onDelete?: (brandId: string) => void
  onView?: (brand: Brand) => void
  onToggleStatus?: (brandId: string) => void
}

type SortField = keyof Brand | 'categoryName'

export function BrandTable({ brands, onEdit, onDelete, onView, onToggleStatus }: BrandTableProps) {
  const [sortField, setSortField] = useState<SortField>('updatedAt')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const sortedBrands = useMemo(() => {
    const getComparable = (brand: Brand): any => {
      if (sortField === 'categoryName') return brand.category?.name ?? ''
      if (sortField === 'updatedAt') return new Date(brand.updatedAt as unknown as any).getTime()
      if (sortField === 'createdAt') return new Date(brand.createdAt as unknown as any).getTime()
      return (brand as any)[sortField]
    }

    return [...brands].sort((a, b) => {
      const aValue = getComparable(a)
      const bValue = getComparable(b)

      if (aValue === undefined && bValue === undefined) return 0
      if (aValue === undefined) return sortDirection === 'asc' ? -1 : 1
      if (bValue === undefined) return sortDirection === 'asc' ? 1 : -1

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }, [brands, sortField, sortDirection])

  const formatDateTime = (input: Date | string | undefined) => {
    if (!input) return '—'
    const d = typeof input === 'string' ? new Date(input) : input
    try {
      return new Intl.DateTimeFormat('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(d)
    } catch {
      return d.toString()
    }
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead 
              className="cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('name')}
            >
              <div className="flex items-center">
                Brand Name
                {sortField === 'name' && (
                  <span className="ml-1">
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </div>
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('categoryName')}
            >
              <div className="flex items-center">
                Category
                {sortField === 'categoryName' && (
                  <span className="ml-1">
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </div>
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('earningPercentage')}
            >
              <div className="flex items-center">
                Earning %
                {sortField === 'earningPercentage' && (
                  <span className="ml-1">
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </div>
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('redemptionPercentage')}
            >
              <div className="flex items-center">
                Redemption %
                {sortField === 'redemptionPercentage' && (
                  <span className="ml-1">
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </div>
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('brandwiseMaxCap')}
            >
              <div className="flex items-center">
                Caps
                {sortField === 'brandwiseMaxCap' && (
                  <span className="ml-1">
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </div>
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('isActive')}
            >
              <div className="flex items-center">
                Status
                {sortField === 'isActive' && (
                  <span className="ml-1">
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </div>
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('updatedAt')}
            >
              <div className="flex items-center">
                Last Updated
                {sortField === 'updatedAt' && (
                  <span className="ml-1">
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </div>
            </TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedBrands.map((brand) => (
            <TableRow key={brand.id} className="hover:bg-gray-50">
              <TableCell>
                <div className="flex items-center">
                  {brand.logoUrl ? (
                    <img 
                      className="h-10 w-10 rounded-full mr-3 object-cover" 
                      src={getProxiedUrl(brand.logoUrl)} 
                      alt={brand.name}
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      onError={(e) => {
                        // Fallback to initials if image fails to load
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                        target.nextElementSibling?.classList.remove('hidden')
                      }}
                    />
                  ) : null}
                  <div className={`h-10 w-10 rounded-full bg-gray-200 mr-3 flex items-center justify-center ${brand.logoUrl ? 'hidden' : ''}`}>
                    <span className="text-gray-500 text-sm font-medium">
                      {brand.name?.charAt(0)?.toUpperCase() || '?'}
                    </span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{brand.name || 'Unnamed Brand'}</div>
                    <div className="text-sm text-gray-500 truncate max-w-xs">
                      {brand.description}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                {brand.category ? (
                  <Badge variant="secondary" className="bg-green-theme-secondary text-green-theme-primary hover:bg-green-theme-accent">
                    {brand.category.name}
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-gray-100 text-gray-800 hover:bg-gray-200">
                    No Category
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-sm text-gray-900">
                <span className="font-medium">{brand.earningPercentage}%</span>
              </TableCell>
              <TableCell className="text-sm text-gray-900">
                <span className="font-medium">{brand.redemptionPercentage}%</span>
              </TableCell>
              <TableCell className="text-sm text-gray-900">
                <div className="text-xs space-y-1">
                  <div>
                    <span className="text-gray-500">Max Per Tx: </span>
                    <span className="font-medium">₹{brand.brandwiseMaxCap}</span>
                  </div>
                  {brand.minRedemptionAmount && brand.maxRedemptionAmount && (
                    <div>
                      <span className="text-gray-500">Range: </span>
                      <span className="font-medium">₹{brand.minRedemptionAmount} - ₹{brand.maxRedemptionAmount}</span>
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {brand.isActive ? (
                  <Badge variant="secondary" className="bg-green-theme-secondary text-green-theme-primary hover:bg-green-theme-accent">
                    <CheckCircleIcon className="w-4 h-4 mr-1" />
                    Active
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-red-100 text-red-800 hover:bg-red-200">
                    <XCircleIcon className="w-4 h-4 mr-1" />
                    Inactive
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-sm text-gray-900">
                {formatDateTime(brand.updatedAt)}
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  {onView && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onView(brand)}
                      className="text-green-theme-primary hover:text-green-theme-accent hover:bg-green-theme-secondary"
                      title="View Brand"
                    >
                      <EyeIcon className="w-4 h-4" />
                    </Button>
                  )}
                  {onToggleStatus && brand.id && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onToggleStatus(brand.id!)}
                      className={`hover:bg-gray-50 ${
                        brand.isActive 
                          ? 'text-gold-theme-primary hover:text-gold-theme-accent' 
                          : 'text-green-theme-primary hover:text-green-theme-accent'
                      }`}
                      title={brand.isActive ? 'Deactivate Brand' : 'Activate Brand'}
                    >
                      {brand.isActive ? (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </Button>
                  )}
                  {onEdit && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(brand)}
                      className="text-green-theme-primary hover:text-green-theme-accent hover:bg-green-theme-secondary"
                      title="Edit Brand"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </Button>
                  )}
                  {onDelete && brand.id && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(brand.id!)}
                      className="text-status-error hover:text-status-error/80 hover:bg-red-50"
                      title="Delete Brand"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {sortedBrands.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500">
            <p>No brands found</p>
            <p className="text-sm mt-2">Start by adding your first partner brand</p>
          </div>
        </div>
      )}
    </div>
  )
}
