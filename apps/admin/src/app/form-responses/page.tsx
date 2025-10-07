'use client'

import { useState, useEffect, useCallback } from 'react'
import { useToast, ToastContainer } from '@/components/common'
import { ArrowPathIcon, CommandLineIcon, XCircleIcon } from '@heroicons/react/24/outline'
import { Mail, Users, Building2 } from 'lucide-react'
import { FormResponseModal } from '@/components/form-responses/FormResponseModal'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDate } from '@/utils/dateUtils'

interface WaitlistEntry {
  id: string
  email: string
  source?: string
  status: string
  adminNotes?: string
  createdAt: string
  updatedAt: string
}

interface PartnerApplication {
  id: string
  brandName: string
  category: string
  website?: string
  instagram?: string
  contactName: string
  contactEmail: string
  partnershipReason: string
  excitementFactor: string
  source: string
  status: string
  createdAt: string
  updatedAt: string
}

interface FormResponse {
  id: string
  type: 'waitlist' | 'partner'
  data: WaitlistEntry | PartnerApplication
  createdAt: string
}

export default function FormResponsesPage() {
  const [responses, setResponses] = useState<FormResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalResponses, setTotalResponses] = useState(0)
  const [pageSize, setPageSize] = useState(50)
  
  const [selectedResponse, setSelectedResponse] = useState<FormResponse | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showShortcutsModal, setShowShortcutsModal] = useState(false)
  
  const { toasts, removeToast, showSuccess, showError } = useToast()

  // Fetch form responses
  const fetchResponses = useCallback(async () => {
    try {
      setIsLoading(true)
      
      // Get API base URL
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api/v1'
      
      // Fetch waitlist entries
      const waitlistResponse = await fetch(`${apiBaseUrl}/admin/form-submissions/waitlist-entries`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!waitlistResponse.ok) {
        throw new Error('Failed to fetch waitlist entries')
      }
      
      const waitlistData = await waitlistResponse.json()
      
      // Fetch partner applications
      const partnerResponse = await fetch(`${apiBaseUrl}/admin/form-submissions/partner-applications`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!partnerResponse.ok) {
        throw new Error('Failed to fetch partner applications')
      }
      
      const partnerData = await partnerResponse.json()
      
      // Combine and transform data
      const waitlistResponses: FormResponse[] = waitlistData.data.map((entry: WaitlistEntry) => ({
        id: entry.id,
        type: 'waitlist' as const,
        data: entry,
        createdAt: entry.createdAt
      }))
      
      const partnerResponses: FormResponse[] = partnerData.data.map((app: PartnerApplication) => ({
        id: app.id,
        type: 'partner' as const,
        data: app,
        createdAt: app.createdAt
      }))
      
      // Combine and sort by creation date (latest first)
      const allResponses = [...waitlistResponses, ...partnerResponses]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      
      setResponses(allResponses)
      setTotalResponses(allResponses.length)
      setTotalPages(Math.ceil(allResponses.length / pageSize))
      
    } catch (error) {
      console.error('Failed to fetch form responses:', error)
      showError('Failed to fetch form responses')
    } finally {
      setIsLoading(false)
    }
  }, [pageSize, showError])

  // Apply filters
  const filteredResponses = responses.filter((response: FormResponse) => {
    const matchesSearch = !searchTerm || 
      (response.type === 'waitlist' && (response.data as WaitlistEntry).email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (response.type === 'partner' && ((response.data as PartnerApplication).brandName.toLowerCase().includes(searchTerm.toLowerCase()) ||
       (response.data as PartnerApplication).contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
       (response.data as PartnerApplication).contactEmail.toLowerCase().includes(searchTerm.toLowerCase())))
    
    const matchesType = typeFilter === 'all' || response.type === typeFilter
    
    const matchesStatus = statusFilter === 'all' || 
      (response.type === 'waitlist' && (response.data as WaitlistEntry).status === statusFilter) ||
      (response.type === 'partner' && (response.data as PartnerApplication).status === statusFilter)
    
    return matchesSearch && matchesType && matchesStatus
  })

  // Paginate filtered results
  const paginatedResponses = filteredResponses.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  // Update total pages based on filtered results
  useEffect(() => {
    setTotalPages(Math.ceil(filteredResponses.length / pageSize))
    if (currentPage > Math.ceil(filteredResponses.length / pageSize)) {
      setCurrentPage(1)
    }
  }, [filteredResponses.length, pageSize, currentPage])

  // Refresh responses
  const refreshResponses = useCallback(async () => {
    try {
      setIsRefreshing(true)
      await fetchResponses()
    } catch (error) {
      console.error('Failed to refresh responses:', error)
      showError('Failed to refresh responses')
    } finally {
      setIsRefreshing(false)
    }
  }, [fetchResponses, showError])

  // Handle response selection
  const handleResponseSelect = useCallback((response: FormResponse) => {
    setSelectedResponse(response)
    setShowDetailModal(true)
  }, [])

  const handleDetailModalClose = useCallback(() => {
    setShowDetailModal(false)
    setSelectedResponse(null)
  }, [])

  // Handle filter changes
  const handleFilterChange = useCallback((filterType: string, value: string) => {
    switch (filterType) {
      case 'type':
        setTypeFilter(value)
        break
      case 'status':
        setStatusFilter(value)
        break
      case 'search':
        setSearchTerm(value)
        break
    }
    setCurrentPage(1)
  }, [])

  // Handle page change
  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  // Handle page size change
  const handlePageSizeChange = useCallback((newPageSize: number) => {
    setPageSize(newPageSize)
    setCurrentPage(1)
  }, [])

  // Load data on mount
  useEffect(() => {
    fetchResponses()
  }, [fetchResponses])

  // Get status badge variant
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending':
        return 'secondary'
      case 'approved':
        return 'default'
      case 'rejected':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  // Get type badge variant
  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'waitlist':
        return 'default'
      case 'partner':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Form Responses</h1>
          <p className="text-gray-600">Manage waitlist entries and partner applications</p>
          
          {/* Live Status Indicator */}
          <div className="mt-2 flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm text-gray-500">Live Updates Connected</span>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex space-x-2">
          <button
            onClick={() => setShowShortcutsModal(true)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            title="Keyboard shortcuts"
          >
            <CommandLineIcon className="w-4 h-4 mr-2" />
            Shortcuts
          </button>
          <button
            onClick={refreshResponses}
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            title="Refresh responses (Ctrl/Cmd + R)"
          >
            <ArrowPathIcon className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <Input
              id="search"
              type="text"
              placeholder="Search by email, name, or brand..."
              value={searchTerm}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full"
            />
          </div>
          
          {/* Type Filter */}
          <div>
            <label htmlFor="typeFilter" className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <Select value={typeFilter} onValueChange={(value: string) => handleFilterChange('type', value)}>
              <SelectTrigger>
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="waitlist">Waitlist</SelectItem>
                <SelectItem value="partner">Partner Applications</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Status Filter */}
          <div>
            <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <Select value={statusFilter} onValueChange={(value: string) => handleFilterChange('status', value)}>
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Clear Filters */}
          <div className="flex items-end">
            <Button
              onClick={() => {
                setSearchTerm('')
                setTypeFilter('all')
                setStatusFilter('all')
                setCurrentPage(1)
              }}
              variant="outline"
              className="w-full"
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Filter Summary */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span>
              Showing <span className="font-medium text-gray-900">{paginatedResponses.length}</span> of{' '}
              <span className="font-medium text-gray-900">{filteredResponses.length}</span> responses
            </span>
            {(searchTerm || typeFilter !== 'all' || statusFilter !== 'all') && (
              <span className="text-gray-400">|</span>
            )}
            {searchTerm && (
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                Search: "{searchTerm}"
              </span>
            )}
            {typeFilter !== 'all' && (
              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
                Type: {typeFilter}
              </span>
            )}
            {statusFilter !== 'all' && (
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                Status: {statusFilter}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Responses</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalResponses}</div>
            <p className="text-xs text-muted-foreground">
              All form submissions
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Waitlist Entries</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {responses.filter((r: FormResponse) => r.type === 'waitlist').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Email signups
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Partner Applications</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {responses.filter((r: FormResponse) => r.type === 'partner').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Brand partnerships
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Responses List */}
      <div className="bg-white shadow rounded-lg">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            ))}
          </div>
        ) : paginatedResponses.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500">No responses found matching your criteria.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {paginatedResponses.map((response: FormResponse) => (
              <div
                key={response.id}
                className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => handleResponseSelect(response)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {response.type === 'waitlist' ? (
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Mail className="w-5 h-5 text-blue-600" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-green-600" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-lg font-medium text-gray-900 truncate">
                          {response.type === 'waitlist' 
                            ? (response.data as WaitlistEntry).email
                            : (response.data as PartnerApplication).brandName
                          }
                        </h3>
                        <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-secondary text-secondary-foreground">
                          {response.type}
                        </span>
                        <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-secondary text-secondary-foreground">
                          {response.type === 'waitlist' 
                            ? (response.data as WaitlistEntry).status
                            : (response.data as PartnerApplication).status
                          }
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-500">
                        {response.type === 'waitlist' ? (
                          <span>Waitlist Entry</span>
                        ) : (
                          <span>
                            Contact: {(response.data as PartnerApplication).contactName} • 
                            {(response.data as PartnerApplication).contactEmail}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-shrink-0 text-right">
                    <div className="text-sm text-gray-500">
                      {formatDate(response.createdAt)}
                    </div>
                    <div className="text-xs text-gray-400">
                      {response.type === 'waitlist' 
                        ? (response.data as WaitlistEntry).source || 'webapp'
                        : (response.data as PartnerApplication).source
                      }
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white shadow rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Page Size Selector */}
              <div className="flex items-center space-x-2">
                <label htmlFor="pageSize" className="text-sm text-gray-700">
                  Show:
                </label>
                <select
                  id="pageSize"
                  value={pageSize}
                  onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                  className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span className="text-sm text-gray-500">per page</span>
              </div>
              
              {/* Page Info */}
              <span className="text-sm text-gray-700">
                Showing {((currentPage - 1) * pageSize) + 1} to{' '}
                {Math.min(currentPage * pageSize, filteredResponses.length)} of{' '}
                {filteredResponses.length} responses
              </span>
            </div>
            
            {/* Pagination Navigation */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(1)}
                disabled={currentPage <= 1}
                className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                title="First page"
              >
                First
              </button>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                title="Previous page"
              >
                Previous
              </button>
              
              {/* Page Numbers */}
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number
                  if (totalPages <= 5) {
                    pageNum = i + 1
                  } else if (currentPage <= 3) {
                    pageNum = i + 1
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i
                  } else {
                    pageNum = currentPage - 2 + i
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-1 text-sm border rounded ${
                        currentPage === pageNum
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                })}
              </div>
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                title="Next page"
              >
                Next
              </button>
              <button
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage >= totalPages}
                className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                title="Last page"
              >
                Last
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form Response Modal */}
      {selectedResponse && (
        <FormResponseModal
          isOpen={showDetailModal}
          onClose={handleDetailModalClose}
          type={selectedResponse.type}
          data={selectedResponse.data}
        />
      )}

      {/* Keyboard Shortcuts Modal */}
      {showShortcutsModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Keyboard Shortcuts</h3>
                <button
                  onClick={() => setShowShortcutsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircleIcon className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Refresh responses</span>
                  <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg">
                    Ctrl/Cmd + R
                  </kbd>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Focus search</span>
                  <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg">
                    Ctrl/Cmd + F
                  </kbd>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowShortcutsModal(false)}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Got it
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}
