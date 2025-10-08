'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { TransactionList } from '@/components/transactions/TransactionList'
import { TransactionFilters } from '@/components/transactions/TransactionFilters'
import { useToast, ToastContainer } from '@/components/common'
import { ArrowPathIcon, CommandLineIcon, XCircleIcon } from '@heroicons/react/24/outline'
import { NotificationDeliverySummary } from '@/components/notifications/NotificationStatusIndicator'
import { useCoins } from '@/hooks/useCoins'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { transactionApi } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { useAdminWebSocket } from '@/hooks/useWebSocket'
import { isTransactionActionRequired } from '@/utils/transactionUtils'
import type { AdminCoinTransaction, TransactionFilters as TransactionFiltersType } from '@/types/coins'

export default function TransactionsPage() {
  const [filteredTransactions, setFilteredTransactions] = useState<AdminCoinTransaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [actionRequiredFilter, setActionRequiredFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalTransactions, setTotalTransactions] = useState(0)
  const [pageSize, setPageSize] = useState(50) // Increased from default 20 to show more transactions
  const { user } = useAuth()
  const { toasts, removeToast, showSuccess, showError } = useToast()
  
  // Use the useCoins hook for transaction management
  const { 
    transactions, 
    processingOrder,
    loading: coinsLoading, 
    error: coinsError,
    pagination,
    fetchTransactions,
    fetchProcessingOrder,
    approveTransaction,
    rejectTransaction,
    processPayment
  } = useCoins(true) // Skip initial fetch since we handle it manually
  
  // WebSocket integration for real-time updates
  const { isConnected, pendingRequestCounts, recentActivity, connectionError } = useAdminWebSocket()

  // Keyboard shortcuts
  const { getShortcuts } = useKeyboardShortcuts({
    onRefresh: () => {
      fetchTransactions()
    },
    onSearch: () => {
      // Focus on search input
      const searchInput = document.getElementById('search') as HTMLInputElement
      if (searchInput) {
        searchInput.focus()
        searchInput.select()
      }
    },
    onNextPage: () => {
      if (currentPage < totalPages) {
        handlePageChange(currentPage + 1)
      }
    },
    onPrevPage: () => {
      if (currentPage > 1) {
        handlePageChange(currentPage - 1)
      }
    },
    onFirstPage: () => {
      handlePageChange(1)
    },
    onLastPage: () => {
      handlePageChange(totalPages)
    },
  })

  // Store fetchTransactions in a ref to prevent infinite re-renders
  const fetchTransactionsRef = useRef(fetchTransactions)
  
  // Update the ref when fetchTransactions changes
  useEffect(() => {
    fetchTransactionsRef.current = fetchTransactions
  }, [fetchTransactions])

  // Refs to track modal state more reliably
  const modalOpenRef = useRef(false)
  const selectedTransactionRef = useRef<AdminCoinTransaction | null>(null)

  // Unified transaction action handlers
  const handleApproveTransaction = async (transactionId: string, adminNotes?: string) => {
    try {
      const success = await approveTransaction(transactionId, adminNotes)
      
      if (success) {
        showSuccess('Transaction Processed Successfully! The redeem request has been processed. If approved, you can now process the payment.')
        
        // Refresh both transactions and processing order
        await Promise.all([
          fetchTransactions({ page: currentPage, limit: pageSize }),
          fetchProcessingOrder()
        ])
        
        // Show additional message about next transaction if available
        setTimeout(() => {
          if (Array.isArray(processingOrder)) {
            const remainingReadyTransactions = processingOrder.filter(order => order.transactionId !== transactionId)
            if (remainingReadyTransactions.length > 0) {
              showSuccess('The next transaction in line will automatically become the oldest and ready to get verified next!')
            }
          }
        }, 1000)
      } else {
        showError('Failed to approve transaction. Please try again.')
      }
    } catch (error) {
      console.error('Failed to approve transaction:', error)
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      
      // Handle specific error cases
      if (errorMessage.includes('negative balance')) {
        showError('Cannot approve transaction. User has negative balance. Please adjust the redeem amount first.')
      } else if (errorMessage.includes('pending earn requests')) {
        showError('Cannot approve transaction. User has pending earn requests that must be processed first.')
      } else if (errorMessage.includes('not found')) {
        showError('Transaction not found. It may have been processed by another admin.')
      } else if (errorMessage.includes('not pending')) {
        showError('Transaction is no longer pending. It may have been processed by another admin.')
      } else {
        showError(`Failed to approve transaction: ${errorMessage}`)
      }
    }
  }

  const handleRejectTransaction = async (transactionId: string, adminNotes: string) => {
    try {
      const success = await rejectTransaction(transactionId, adminNotes)
      if (success) {
        showSuccess('Transaction rejected successfully. User has been notified with rejection reason.')
        await fetchTransactions({ page: currentPage, limit: pageSize })
      } else {
        showError('Failed to reject transaction. Please try again.')
      }
    } catch (error) {
      console.error('Failed to reject transaction:', error)
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      
      // Handle specific error cases
      if (errorMessage.includes('not found')) {
        showError('Transaction not found. It may have been processed by another admin.')
      } else if (errorMessage.includes('not pending')) {
        showError('Transaction is no longer pending. It may have been processed by another admin.')
      } else if (errorMessage.includes('admin notes')) {
        showError('Admin notes are required for rejection. Please provide a reason.')
      } else {
        showError(`Failed to reject transaction: ${errorMessage}`)
      }
    }
  }

  // Legacy handlers for backward compatibility
  const handleApproveEarn = handleApproveTransaction
  const handleRejectEarn = handleRejectTransaction
  const handleApproveRedeem = handleApproveTransaction
  const handleRejectRedeem = handleRejectTransaction

  const handleProcessPayment = async (
    transactionId: string,
    paymentTransactionId: string,
    paymentMethod: string,
    paymentAmount: number,
    adminNotes?: string
  ) => {
    try {
      const success = await processPayment(transactionId, paymentTransactionId, paymentMethod, paymentAmount, adminNotes)
      if (success) {
        showSuccess(`Payment processed successfully. User has been notified that ₹${paymentAmount} has been paid.`)
        // Refresh transactions to show updated status
        await fetchTransactionsWithFilters()
      } else {
        showError('Failed to process payment')
      }
    } catch (error) {
      console.error('Failed to process payment:', error)
      showError('Failed to process payment')
    }
  }



  // Fetch transactions with filters applied to entire dataset
  const fetchTransactionsWithFilters = useCallback(async () => {
    try {
      setIsLoading(true)
      
      // Build filter parameters
      const filters: TransactionFiltersType = {
        page: currentPage,
        limit: pageSize
      }
      
      if (searchTerm) {
        const sanitized = searchTerm.replace(/\s+/g, ' ').trim()
        if (sanitized) {
          filters.search = sanitized
        }
      }
      
      if (statusFilter !== 'all') {
        filters.status = statusFilter as any
      }
      
      if (typeFilter !== 'all') {
        filters.type = typeFilter as any
      }
      
      if (actionRequiredFilter !== 'all') {
        filters.actionRequired = actionRequiredFilter
      }
      
      // Call fetchTransactions with the built filters
      await fetchTransactionsRef.current(filters)
    } catch (error) {
      console.error('Failed to fetch transactions with filters:', error)
      // Use the toast hook directly instead of showError to avoid dependency issues
      if (typeof window !== 'undefined') {
        // This will be handled by the useCoins hook error handling
      }
    } finally {
      setIsLoading(false)
    }
  }, [currentPage, pageSize, searchTerm, statusFilter, typeFilter, actionRequiredFilter])

  // Enhanced transaction refresh with proper state management
  const refreshTransactions = useCallback(async () => {
    try {
      setIsRefreshing(true)
      // Use the new filtering function instead of direct fetchTransactions
      await fetchTransactionsWithFilters()
    } catch (error) {
      console.error('Failed to refresh transactions:', error)
      showError('Failed to refresh transactions')
    } finally {
      setIsRefreshing(false)
    }
  }, [fetchTransactionsWithFilters, showError])

  // Apply filters and fetch data
  useEffect(() => {
    const loadData = async () => {
      await fetchTransactionsWithFilters()
      await fetchProcessingOrder()
    }
    loadData()
  }, [fetchTransactionsWithFilters, fetchProcessingOrder])

  // Update pagination state from useCoins hook
  useEffect(() => {
    if (pagination) {
      setCurrentPage(pagination.page)
      setTotalPages(pagination.totalPages)
      setTotalTransactions(pagination.total)
    }
  }, [pagination])

  // Update loading state based on coins loading
  useEffect(() => {
    setIsLoading(coinsLoading)
  }, [coinsLoading])

  // Handle coins error
  useEffect(() => {
    if (coinsError) {
      showError(coinsError)
    }
  }, [coinsError, showError])

  // Handle page change
  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage)
    // Reset to top of page
    window.scrollTo({ top: 0, behavior: 'smooth' })
    // The useEffect will automatically trigger a new fetch
  }, [])

  // Handle page size change
  const handlePageSizeChange = useCallback((newPageSize: number) => {
    setPageSize(newPageSize)
    setCurrentPage(1) // Reset to first page when changing page size
    // The useEffect will automatically trigger a new fetch
  }, [])

  // Handle filter changes - reset to first page
  const handleFilterChange = useCallback((filterType: string, value: string) => {
    switch (filterType) {
      case 'status':
        setStatusFilter(value)
        break
      case 'type':
        setTypeFilter(value)
        break
      case 'actionRequired':
        setActionRequiredFilter(value)
        break
      case 'search':
        setSearchTerm(value)
        break
    }
    // Reset to first page when filters change
    setCurrentPage(1)
  }, [])

  // Simple state management
  const [selectedTransaction, setSelectedTransaction] = useState<AdminCoinTransaction | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showVerificationModal, setShowVerificationModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [isSelectingTransaction, setIsSelectingTransaction] = useState(false)
  const [showShortcutsModal, setShowShortcutsModal] = useState(false)

  const handleTransactionSelect = useCallback((transaction: AdminCoinTransaction) => {
    // Prevent rapid successive clicks
    if (isSelectingTransaction) {
      return
    }

    setIsSelectingTransaction(true)
    setSelectedTransaction(transaction)
    selectedTransactionRef.current = transaction

    // Show appropriate modal based on transaction status
    if (transaction.status === 'PENDING') {
      setShowVerificationModal(true)
      modalOpenRef.current = true
    } else {
      setShowDetailModal(true)
      modalOpenRef.current = true
    }

    // Re-enable selection after a delay
    setTimeout(() => {
      setIsSelectingTransaction(false)
    }, 1000)
  }, [isSelectingTransaction])

  const handleDetailModalClose = useCallback(() => {
    setShowDetailModal(false)
    setSelectedTransaction(null)
    selectedTransactionRef.current = null
    modalOpenRef.current = false
  }, [])

  const handleVerificationModalClose = useCallback(() => {
    setShowVerificationModal(false)
    setSelectedTransaction(null)
    selectedTransactionRef.current = null
    modalOpenRef.current = false
  }, [])

  const handlePaymentModalClose = useCallback(() => {
    setShowPaymentModal(false)
  }, [])

  const handleOpenPaymentModal = useCallback(() => {
    setShowPaymentModal(true)
  }, [])

  // Handle search submit
  const handleSearchSubmit = useCallback((e?: React.FormEvent) => {
    if (e && typeof e.preventDefault === 'function') e.preventDefault()
    setCurrentPage(1)
  }, [])

  // Helper function to determine if a transaction requires action
  const isTransactionActionRequired = (transaction: AdminCoinTransaction): boolean => {
    if (transaction.type === 'EARN') {
      // Earn transactions only require action if pending
      return transaction.status === 'PENDING'
    } else if (transaction.type === 'REDEEM') {
      // Redeem transactions require action if pending or approved (until paid)
      return ['PENDING', 'APPROVED'].includes(transaction.status)
    }
    return false
  }



  // Clean up state when transactions change or component unmounts
  useEffect(() => {
    return () => {
      // Only cleanup if not selecting and no modals are open
      if (!isSelectingTransaction && !modalOpenRef.current) {
        setSelectedTransaction(null)
        setShowDetailModal(false)
        setShowVerificationModal(false)
        selectedTransactionRef.current = null
        modalOpenRef.current = false
      }
    }
  }, [isSelectingTransaction])

  // Reset selection state when transactions change - but only if no modal is open
  useEffect(() => {
    // Only reset if we have a selected transaction and it's no longer in the list
    if (selectedTransaction && !transactions.find(t => t.id === selectedTransaction?.id)) {
      // Don't reset if we're currently showing a modal
      if (!modalOpenRef.current) {
        setSelectedTransaction(null)
        selectedTransactionRef.current = null
      }
    }
  }, [transactions, selectedTransaction])

  // Prevent modal from closing when transactions are refreshed
  useEffect(() => {
    // If we have a selected transaction and a modal is open, preserve the state
    if (selectedTransaction && modalOpenRef.current) {
      // Check if the selected transaction still exists in the current transactions
      const transactionExists = transactions.find(t => t.id === selectedTransaction.id)
      if (!transactionExists) {
        // Only close if the transaction was actually removed/deleted
        setShowDetailModal(false)
        setShowVerificationModal(false)
        setSelectedTransaction(null)
        selectedTransactionRef.current = null
        modalOpenRef.current = false
      }
    }
  }, [transactions, selectedTransaction])

  // Synchronize refs with state when component re-renders
  useEffect(() => {
    modalOpenRef.current = showDetailModal || showVerificationModal
    if (!selectedTransaction) {
      selectedTransactionRef.current = null
    }
  }, [showDetailModal, showVerificationModal, selectedTransaction])

  return (
    <div className="space-y-6">
              <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Transaction Management</h1>
            <p className="text-gray-600">Review and process earn/redeem requests from users</p>
            
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
              onClick={() => {
                fetchTransactions()
              }}
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              title="Refresh transactions (Ctrl/Cmd + R)"
            >
              <ArrowPathIcon className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

      {/* Filters */}
      <TransactionFilters
        searchTerm={searchTerm}
        statusFilter={statusFilter}
        typeFilter={typeFilter}
        actionRequiredFilter={actionRequiredFilter}
        onSearchChange={(value) => handleFilterChange('search', value)}
        onStatusFilterChange={(value) => handleFilterChange('status', value)}
        onTypeFilterChange={(value) => handleFilterChange('type', value)}
        onActionRequiredFilterChange={(value) => handleFilterChange('actionRequired', value)}
        onSearchSubmit={handleSearchSubmit}
      />

      {/* Filter Summary */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span>
              Showing <span className="font-medium text-gray-900">{transactions.length}</span> of{' '}
              <span className="font-medium text-gray-900">{totalTransactions}</span> transactions
            </span>
            {(searchTerm || statusFilter !== 'all' || typeFilter !== 'all' || actionRequiredFilter !== 'all') && (
              <span className="text-gray-400">|</span>
            )}
            {searchTerm && (
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                Search: "{searchTerm}"
              </span>
            )}
            {statusFilter !== 'all' && (
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                Status: {statusFilter}
              </span>
            )}
            {typeFilter !== 'all' && (
              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
                Type: {typeFilter}
              </span>
            )}
            {actionRequiredFilter !== 'all' && (
              <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs">
                {actionRequiredFilter === 'true' ? 'Action Required' : 'No Action Required'}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {transactions.length > 0 && (
              <span className="text-xs text-gray-500">
                {transactions.filter(t => isTransactionActionRequired(t)).length} require action
              </span>
            )}
            <button
              onClick={() => {
                setSearchTerm('')
                setStatusFilter('all')
                setTypeFilter('all')
                setActionRequiredFilter('all')
                setCurrentPage(1)
                // The useEffect will automatically trigger a new fetch
              }}
              className="text-xs text-gray-500 hover:text-gray-700 underline"
              title="Clear all filters"
            >
              Clear filters
            </button>
          </div>
        </div>
      </div>

      {/* Notification Delivery Summary */}
      <NotificationDeliverySummary
        totalNotifications={transactions.filter(t => ['REJECTED', 'PAID'].includes(t.status)).length}
        deliveredCount={transactions.filter(t => ['REJECTED', 'PAID'].includes(t.status)).length}
        failedCount={0}
        pendingCount={transactions.filter(t => t.status === 'PENDING').length}
        className="mb-6"
      />

      {/* Transaction List */}
      <TransactionList
        transactions={transactions}
        processingOrder={processingOrder}
        isLoading={isLoading}
        selectedTransaction={selectedTransaction}
        showDetailModal={showDetailModal}
        showVerificationModal={showVerificationModal}
        onTransactionSelect={handleTransactionSelect}
        onDetailModalClose={handleDetailModalClose}
        onVerificationModalClose={handleVerificationModalClose}
        onPaymentModalClose={handlePaymentModalClose}
        onOpenPaymentModal={handleOpenPaymentModal}
        showPaymentModal={showPaymentModal}
        onApproveEarn={handleApproveTransaction}
        onRejectEarn={handleRejectTransaction}
        onApproveRedeem={handleApproveTransaction}
        onRejectRedeem={handleRejectTransaction}
        onProcessPayment={handleProcessPayment}
        searchTerm={searchTerm}
        statusFilter={statusFilter}
        typeFilter={typeFilter}
        actionRequiredFilter={actionRequiredFilter}
      />

      {/* Pagination Controls */}
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
                  <option value={200}>200</option>
                </select>
                <span className="text-sm text-gray-500">per page</span>
              </div>
              
              {/* Page Info */}
              <span className="text-sm text-gray-700">
                Showing {((currentPage - 1) * pageSize) + 1} to{' '}
                {Math.min(currentPage * pageSize, totalTransactions)} of{' '}
                {totalTransactions} transactions
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
                
                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <span className="px-2 text-gray-500">...</span>
                )}
                
                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <button
                    onClick={() => handlePageChange(totalPages)}
                    className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
                  >
                    {totalPages}
                  </button>
                )}
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
                {getShortcuts().map((shortcut, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{shortcut.description}</span>
                    <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg">
                      {shortcut.key}
                    </kbd>
                  </div>
                ))}
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
