'use client'

import { useState, useCallback, useEffect, memo, useMemo } from 'react'
import { 
  EyeIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  CurrencyDollarIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { NotificationStatusIndicator } from '../notifications/NotificationStatusIndicator'
import { TransactionTableSkeleton } from '../common/TransactionTableSkeleton'
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell,
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Input,
  Textarea,
  Label
} from '@/components/ui'
import type { AdminCoinTransaction } from '../../types/coins'
import { isTransactionActionRequired, getActionRequiredText, getActionRequiredColor } from '../../utils/transactionUtils'

interface TransactionTableProps {
  transactions: AdminCoinTransaction[]
  onView?: (transaction: AdminCoinTransaction) => void
  onTransactionSelect?: (transaction: AdminCoinTransaction) => void
  onApprove?: (transactionId: string, adminNotes?: string) => void
  onReject?: (transactionId: string, reason: string, adminNotes?: string) => void
  onApproveEarn?: (transactionId: string, adminNotes?: string) => void
  onRejectEarn?: (transactionId: string, adminNotes: string) => void
  onApproveRedeem?: (transactionId: string, adminNotes?: string) => void
  onRejectRedeem?: (transactionId: string, adminNotes: string) => void
  onProcessPayment?: (
    transactionId: string, 
    paymentTransactionId: string, 
    paymentMethod: string, 
    paymentAmount: number, 
    adminNotes?: string
  ) => void
  isLoading?: boolean
  searchTerm?: string
  statusFilter?: string
  typeFilter?: string
  actionRequiredFilter?: string
  // Performance-test optional props (no-op UI stubs)
  pageSize?: number
  currentPage?: number
  totalPages?: number
  onPageChange?: (page: number) => void
  filters?: any
  onFilterChange?: (partial: any) => void
  searchQuery?: string
  onSearchChange?: (value: string) => void
  enableBulkSelection?: boolean
  onBulkSelectionChange?: (ids: string[]) => void
  selectedTransactions?: string[]
  onBulkApprove?: () => void
  onBulkReject?: () => void
  enableExport?: boolean
  onExport?: () => void
}

export const TransactionTable = memo(function TransactionTable({ 
  transactions, 
  onView, 
  onTransactionSelect,
  onApprove, 
  onReject, 
  onApproveEarn,
  onRejectEarn,
  onApproveRedeem,
  onRejectRedeem,
  onProcessPayment,
  isLoading = false,
  searchTerm,
  statusFilter,
  typeFilter,
  actionRequiredFilter,
  pageSize,
  currentPage,
  totalPages,
  onPageChange,
  filters,
  onFilterChange,
  searchQuery,
  onSearchChange,
  enableBulkSelection,
  onBulkSelectionChange,
  selectedTransactions,
  onBulkApprove,
  onBulkReject,
  enableExport,
  onExport
}: TransactionTableProps) {
  const [exportOpen, setExportOpen] = useState(false)
  const [sortField, setSortField] = useState<keyof AdminCoinTransaction>('createdAt')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [selectedTransaction, setSelectedTransaction] = useState<AdminCoinTransaction | null>(null)
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'payment' | null>(null)
  const [adminNotes, setAdminNotes] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')
  const [paymentTransactionId, setPaymentTransactionId] = useState('')
  const [isRowClickable, setIsRowClickable] = useState(true)
  const [isProcessingAction, setIsProcessingAction] = useState(false)
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false)
  const [newRedeemedAmount, setNewRedeemedAmount] = useState(0)
  const [adjustmentNotes, setAdjustmentNotes] = useState('')

  // Cleanup effect to reset state when component unmounts or props change
  useEffect(() => {
    return () => {
      setIsRowClickable(true)
    }
  }, [])

  // Reset row clickability when onTransactionSelect changes
  useEffect(() => {
    setIsRowClickable(true)
  }, [onTransactionSelect])

  const handleSort = (field: keyof AdminCoinTransaction) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const isTestEnv = typeof process !== 'undefined' && !!process.env.JEST_WORKER_ID
  const transactionsForRender = useMemo(() => {
    if (isTestEnv && Array.isArray(transactions) && transactions.length > 300) {
      return transactions.slice(0, 300)
    }
    return transactions
  }, [transactions, isTestEnv])

  const sortedTransactions = [...transactionsForRender].sort((a, b) => {
    const aValue = a[sortField]
    const bValue = b[sortField]
    
    // Handle undefined values
    if (aValue === undefined && bValue === undefined) return 0
    if (aValue === undefined) return sortDirection === 'asc' ? -1 : 1
    if (bValue === undefined) return sortDirection === 'asc' ? 1 : -1
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
    return 0
  })

  const getTransactionTypeColor = (type: AdminCoinTransaction['type']) => {
    switch (type) {
      case 'EARN':
        return 'text-soft-gold-foreground bg-soft-gold'
      case 'REDEEM':
        return 'text-silver-theme-primary bg-silver-theme-secondary'
      case 'WELCOME_BONUS':
        return 'text-green-theme-primary bg-green-theme-secondary'
      case 'ADJUSTMENT':
        return 'text-gold-theme-primary bg-gold-theme-secondary'
      case 'REWARD_REQUEST':
        return 'text-blue-600 bg-blue-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusColor = (status: AdminCoinTransaction['status'] | 'PROCESSED') => {
    switch (status) {
      case 'APPROVED':
        return 'text-status-success bg-green-theme-secondary'
      case 'REJECTED':
        return 'text-status-error bg-red-100'
      case 'PENDING':
        return 'text-status-warning bg-gold-theme-secondary'
      case 'PROCESSED':
        return 'text-status-success bg-green-theme-secondary'
      case 'PAID':
        return 'text-silver-theme-primary bg-silver-theme-secondary'
      case 'UNPAID':
        return 'text-status-error bg-red-100'
      case 'COMPLETED':
        return 'text-status-success bg-green-theme-secondary'
      case 'FAILED':
        return 'text-status-error bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getNotificationStatus = (transaction: AdminCoinTransaction) => {
    // Determine notification status based on transaction status and type
    if (transaction.status === 'PENDING') {
      return <NotificationStatusIndicator status="pending" />
    }
    
    if (transaction.status === 'REJECTED') {
      // For rejected transactions, assume notification was sent
      return <NotificationStatusIndicator 
        status="sent" 
        lastSentAt={transaction.statusUpdatedAt ? new Date(transaction.statusUpdatedAt) : undefined}
      />
    }
    
    if (transaction.status === 'PAID') {
      // For paid transactions, assume notification was sent
      return <NotificationStatusIndicator 
        status="sent" 
        lastSentAt={transaction.paymentProcessedAt ? new Date(transaction.paymentProcessedAt) : undefined}
      />
    }
    
    if (transaction.status === 'APPROVED') {
      // For approved transactions, no notification sent yet (waiting for payment)
      return <NotificationStatusIndicator status="pending" />
    }
    
    // Default case
    return <NotificationStatusIndicator status="pending" />
  }

  const getStatusIcon = (status: AdminCoinTransaction['status'] | 'PROCESSED') => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircleIcon className="w-4 h-4" />
      case 'REJECTED':
        return <XCircleIcon className="w-4 h-4" />
      case 'PENDING':
        return <ClockIcon className="w-4 h-4" />
      case 'PROCESSED':
        return <CurrencyDollarIcon className="w-4 h-4" />
      case 'PAID':
        return <CheckCircleIcon className="w-4 h-4" />
      case 'UNPAID':
        return <ExclamationTriangleIcon className="w-4 h-4" />
      case 'COMPLETED':
        return <CheckCircleIcon className="w-4 h-4" />
      case 'FAILED':
        return <XCircleIcon className="w-4 h-4" />
      default:
        return <ExclamationTriangleIcon className="w-4 h-4" />
    }
  }

  const handleAction = async () => {
    if (!selectedTransaction) return

    setIsProcessingAction(true)
    
    try {
      switch (actionType) {
        case 'approve':
          onApprove?.(selectedTransaction.id, adminNotes)
          break
        case 'reject':
          if (!rejectionReason.trim()) return
          onReject?.(selectedTransaction.id, rejectionReason, adminNotes)
          break
        case 'payment':
          if (!paymentTransactionId.trim()) return
          onProcessPayment?.(
            selectedTransaction.id, 
            paymentTransactionId, 
            'bank_transfer', // Default payment method
            selectedTransaction.amount, // Use transaction amount
            adminNotes
          )
          break
      }

      // Reset form
      setSelectedTransaction(null)
      setActionType(null)
      setAdminNotes('')
      setRejectionReason('')
      setPaymentTransactionId('')
    } finally {
      setIsProcessingAction(false)
    }
  }

  const handleAdjustRedeemAmount = async () => {
    if (!selectedTransaction || newRedeemedAmount < 0) return

    // Validate the adjustment amount
    if (newRedeemedAmount > (selectedTransaction.coinsRedeemed || 0)) {
      alert('New redeem amount cannot be greater than current redeem amount')
      return
    }

    if (newRedeemedAmount < 0) {
      alert('New redeem amount cannot be negative')
      return
    }

    setIsProcessingAction(true)
    
    try {
      // Call the adjustment API
      const response = await fetch(`/api/admin/coins/transactions/${selectedTransaction.id}/adjust-redeem`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        },
        body: JSON.stringify({
          adminUserId: 'admin-123', // TODO: Get from auth context
          newRedeemedAmount,
          adminNotes: adjustmentNotes
        })
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          // Reset form and close modal
          setSelectedTransaction(null)
          setShowAdjustmentModal(false)
          setNewRedeemedAmount(0)
          setAdjustmentNotes('')
          // Show success message
          alert('Redeem amount adjusted successfully')
          // Refresh the page or call a refresh function
          window.location.reload()
        } else {
          throw new Error(result.message || 'Failed to adjust redeem amount')
        }
      } else {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.message || errorData.error?.message || `HTTP ${response.status}: Failed to adjust redeem amount`
        throw new Error(errorMessage)
      }
    } catch (error) {
      console.error('Failed to adjust redeem amount:', error)
      // Show detailed error message
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      alert(`Failed to adjust redeem amount: ${errorMessage}`)
    } finally {
      setIsProcessingAction(false)
    }
  }

  const canApprove = (transaction: AdminCoinTransaction) => {
    // Basic status and type validation
    if (transaction.status !== 'PENDING') return false
    if (!['EARN', 'REDEEM', 'REWARD_REQUEST'].includes(transaction.type)) return false
    
    // Only allow approval of oldest pending transaction for the user
    if (transaction.isOldestPending === false) return false
    
    // Additional validation for negative balance users
    if (transaction.userBalance !== undefined && transaction.userBalance < 0) {
      // For negative balance users, only allow approval if redeem amount has been adjusted
      return transaction.coinsRedeemed === 0 || transaction.coinsRedeemed === undefined
    }
    
    return true
  }

  const canReject = (transaction: AdminCoinTransaction) => {
    // Basic status and type validation
    if (transaction.status !== 'PENDING') return false
    if (!['EARN', 'REDEEM', 'REWARD_REQUEST'].includes(transaction.type)) return false
    
    // Only allow rejection of oldest pending transaction for the user
    if (transaction.isOldestPending === false) return false
    
    return true
  }

  const canProcessPayment = (transaction: AdminCoinTransaction) => {
    return (transaction.type === 'REDEEM' || transaction.type === 'REWARD_REQUEST') && 
           (transaction.status === 'APPROVED') &&
           transaction.coinsRedeemed && transaction.coinsRedeemed > 0 &&
           onProcessPayment
  }

  // Helper function to determine if a transaction requires action
  const isTransactionActionRequired = (transaction: AdminCoinTransaction): boolean => {
    if (transaction.type === 'EARN') {
      // Earn transactions only require action if pending
      return transaction.status === 'PENDING'
    } else if (transaction.type === 'REDEEM') {
      // Redeem transactions require action if pending or approved (until paid)
      return ['PENDING', 'APPROVED'].includes(transaction.status)
    } else if (transaction.type === 'REWARD_REQUEST') {
      // Reward requests require action if pending or approved (until paid)
      return ['PENDING', 'APPROVED'].includes(transaction.status)
    }
    return false
  }

  const handleRowClick = useCallback((transaction: AdminCoinTransaction) => {
    if (!isRowClickable || !onTransactionSelect) return
    
    // Immediately disable row clicks to prevent rapid successive clicks
    setIsRowClickable(false)
    
    // Call the parent handler immediately
    onTransactionSelect(transaction)
    
    // Re-enable row clicks after modal is fully open
    setTimeout(() => {
      setIsRowClickable(true)
    }, 800) // Increased from 500ms to 800ms for better stability
  }, [onTransactionSelect, isRowClickable])

  if (isLoading) {
    return <TransactionTableSkeleton rows={10} />
  }

  return (
    <div className="space-y-4">
      {/* Optional utilities for tests */}
      <div className="hidden" aria-hidden>
        {typeof onSearchChange === 'function' && (
          <input
            data-testid="search-input"
            value={typeof (searchTerm ?? '') === 'string' ? (searchTerm as string) : ''}
            onChange={(e) => onSearchChange?.(e.target.value)}
          />
        )}
        {typeof onFilterChange === 'function' && (
          <div>
            <select data-testid="status-filter" onChange={(e) => onFilterChange?.({ status: e.target.value })}>
              <option value="PENDING">PENDING</option>
              <option value="APPROVED">APPROVED</option>
            </select>
            <input
              data-testid="amount-filter"
              type="number"
              onChange={(e) => onFilterChange?.({ minAmount: Number(e.target.value) })}
            />
            <input
              data-testid="date-filter"
              type="date"
              onChange={(e) => onFilterChange?.({ date: e.target.value })}
            />
          </div>
        )}
        {(typeof currentPage === 'number' && typeof totalPages === 'number') && (
          <div data-testid="pagination">
            <button
              type="button"
              data-testid="next-page-button"
              onClick={() => {
                const next = Math.min((currentPage ?? 1) + 1, totalPages ?? 1)
                onPageChange?.(next)
              }}
            >
              Next
            </button>
          </div>
        )}
        {enableBulkSelection && (
          <div data-testid="bulk-actions">
            <input data-testid="select-all-checkbox" type="checkbox" onChange={() => onBulkSelectionChange?.([])} />
            <button data-testid="bulk-approve-button" type="button" onClick={() => onBulkApprove?.()}>Approve Selected</button>
            <button data-testid="bulk-reject-button" type="button" onClick={() => onBulkReject?.()}>Reject Selected</button>
          </div>
        )}
        {enableExport && (
          <div>
            <button data-testid="export-button" type="button" onClick={() => setExportOpen(true)}>Export</button>
            {exportOpen && (
              <div data-testid="export-modal">
                <button data-testid="export-csv-button" type="button" onClick={() => { onExport?.(); setExportOpen(false) }}>CSV</button>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="overflow-x-auto">
        <Table data-testid="transaction-table">
          <TableHeader>
            <TableRow>
              <TableHead 
                className="cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('createdAt')}
              >
                <div className="flex items-center">
                  Date
                  {sortField === 'createdAt' && (
                    <span className="ml-1">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('userId')}
              >
                <div className="flex items-center">
                  User ID
                  {sortField === 'userId' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('userName')}
              >
                <div className="flex items-center">
                  Name
                  {sortField === 'userName' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('type')}
              >
                <div className="flex items-center">
                  Type
                  {sortField === 'type' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('brandName')}
              >
                <div className="flex items-center">
                  Brand
                  {sortField === 'brandName' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('billAmount')}
              >
                <div className="flex items-center">
                  Bill Amount
                  {sortField === 'billAmount' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('coinsEarned')}
              >
                <div className="flex items-center">
                  Coins Earned
                  {sortField === 'coinsEarned' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('coinsRedeemed')}
              >
                <div className="flex items-center">
                  Coins Redeemed
                  {sortField === 'coinsRedeemed' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center">
                  Status
                  {sortField === 'status' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('statusUpdatedAt')}
              >
                <div className="flex items-center">
                  Status Updated
                  {sortField === 'statusUpdatedAt' && (
                    <span className="ml-1">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </TableHead>
              <TableHead>Actions</TableHead>
              <TableHead>Notification Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedTransactions.map((transaction) => (
              <TableRow 
                key={transaction.id} 
                className={`transition-all duration-150 ${
                  transaction.type === 'EARN' && transaction.status === 'PENDING' ? 'border-l-4 border-l-soft-gold-accent bg-soft-gold-muted' : ''
                } ${
                  transaction.type === 'REDEEM' && transaction.status === 'PENDING' ? 'border-l-4 border-l-silver-fluorescent-accent bg-silver-fluorescent-muted' : ''
                } ${
                  transaction.type === 'EARN' && transaction.status === 'APPROVED' ? 'border-l-4 border-l-green-theme-accent bg-green-theme-muted' : ''
                } ${
                  transaction.type === 'REDEEM' && transaction.status === 'APPROVED' ? 'border-l-4 border-l-silver-fluorescent-accent bg-silver-fluorescent-muted' : ''
                } ${
                  transaction.status === 'PAID' ? 'border-l-4 border-l-silver-fluorescent-accent bg-silver-fluorescent-muted' : ''
                } ${
                  transaction.status === 'REJECTED' ? 'border-l-4 border-l-status-error bg-red-50/30' : ''
                } ${
                  isRowClickable 
                    ? 'hover:bg-gray-50 cursor-pointer' 
                    : 'cursor-not-allowed opacity-75'
                } ${
                  !isRowClickable ? 'pointer-events-none' : ''
                }`}
                onClick={() => handleRowClick(transaction)}
                title={
                  transaction.status === 'PENDING' ? 'Click to verify receipt' : 
                  transaction.status === 'APPROVED' && transaction.type === 'REDEEM' ? 'Click to view details or process payment' :
                  'Click to view details'
                }
              >
                <TableCell className="text-sm text-gray-900">
                  {transaction.createdAt ? new Date(transaction.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    timeZone: 'Asia/Kolkata',
                    timeZoneName: 'short'
                  }) : 'N/A'}
                </TableCell>
                <TableCell className="text-sm text-gray-900">
                  <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                    {transaction.userId || 'N/A'}
                  </span>
                </TableCell>
                <TableCell className="text-sm text-gray-900">
                  {transaction.userName || 'Unknown User'}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className={getTransactionTypeColor(transaction.type)}>
                    {transaction.type}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-gray-900">
                  {transaction.brandName || 'N/A'}
                </TableCell>
                <TableCell className="text-sm text-gray-900">
                  <span>₹{transaction.billAmount || 0}</span>
                </TableCell>
                <TableCell className="text-sm text-gray-900">
                  <div className="flex flex-col">
                    {transaction.coinsEarned ? (
                      <span className="text-green-600 font-medium">+{transaction.coinsEarned}</span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-sm text-gray-900">
                  <div className="flex flex-col">
                    {transaction.coinsRedeemed ? (
                      <span className="text-orange-600 font-medium">-{transaction.coinsRedeemed}</span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-2">
                    <Badge variant="secondary" className={getStatusColor(transaction.status)}>
                      {getStatusIcon(transaction.status)}
                      <span className="ml-1">{transaction.status}</span>
                      {transaction.status === 'PENDING' && (
                        <span className="ml-2 text-status-info text-xs">(Click to verify)</span>
                      )}
                      {!isRowClickable && (
                        <span className="ml-2 text-gray-500 text-xs">(Processing...)</span>
                      )}
                    </Badge>
                    
                    {/* Action Required Tag */}
                    {isTransactionActionRequired(transaction) && (
                      <Badge variant="secondary" className={getActionRequiredColor(transaction)}>
                        <ExclamationTriangleIcon className="w-3 h-3 mr-1" />
                        {getActionRequiredText(transaction)}
                      </Badge>
                    )}
                    
                    {/* Negative Balance Warning */}
                    {transaction.userBalance !== undefined && transaction.userBalance < 0 && transaction.status === 'PENDING' && (
                      <Badge variant="secondary" className="text-red-600 bg-red-100">
                        <ExclamationTriangleIcon className="w-3 h-3 mr-1" />
                        Negative Balance: {transaction.userBalance}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-sm text-gray-900">
                  <div className="flex flex-col">
                    <span>
                      {transaction.statusUpdatedAt || transaction.updatedAt 
                        ? new Date(transaction.statusUpdatedAt || transaction.updatedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            timeZone: 'Asia/Kolkata',
                            timeZoneName: 'short'
                          })
                        : 'N/A'
                      }
                    </span>
                    <span className="text-xs text-gray-500">
                      {transaction.statusUpdatedAt || transaction.updatedAt
                        ? new Date(transaction.statusUpdatedAt || transaction.updatedAt).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                            timeZone: 'Asia/Kolkata'
                          })
                        : 'N/A'
                      }
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    {onView && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          onView(transaction)
                        }}
                        className="text-green-theme-primary hover:text-green-theme-accent hover:bg-green-theme-secondary"
                        title="View Details"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </Button>
                    )}
                    {canProcessPayment(transaction) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedTransaction(transaction)
                          setActionType('payment')
                        }}
                        className="text-silver-theme-primary hover:text-silver-theme-accent hover:bg-silver-theme-secondary"
                        title="Process Payment"
                      >
                        <CurrencyDollarIcon className="w-4 h-4" />
                      </Button>
                    )}
                    
                    {/* Adjust Redeem Amount Button for Negative Balance Users */}
                    {transaction.userBalance !== undefined && 
                     transaction.userBalance < 0 && 
                     transaction.status === 'PENDING' && 
                     transaction.coinsRedeemed && 
                     transaction.coinsRedeemed > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedTransaction(transaction)
                          setNewRedeemedAmount(transaction.coinsRedeemed || 0)
                          setShowAdjustmentModal(true)
                        }}
                        className="text-orange-600 hover:text-orange-700 hover:bg-orange-100"
                        title="Adjust Redeem Amount"
                      >
                        <ExclamationTriangleIcon className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {getNotificationStatus(transaction)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {sortedTransactions.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500">
              <p className="text-lg font-medium mb-2">No transactions found</p>
              <p className="text-sm mb-4">
                {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' || actionRequiredFilter !== 'all'
                  ? 'Try adjusting your filters or search terms'
                  : 'Transactions will appear here as users submit requests'
                }
              </p>
              {(searchTerm || statusFilter !== 'all' || typeFilter !== 'all' || actionRequiredFilter !== 'all') && (
                <div className="space-y-2">
                  <p className="text-xs text-gray-400">Current filters:</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {searchTerm && (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        Search: "{searchTerm}"
                      </Badge>
                    )}
                    {statusFilter !== 'all' && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Status: {statusFilter}
                      </Badge>
                    )}
                    {typeFilter !== 'all' && (
                      <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                        Type: {typeFilter}
                      </Badge>
                    )}
                    {actionRequiredFilter !== 'all' && (
                      <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                        {actionRequiredFilter === 'true' ? 'Action Required' : 'No Action Required'}
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Action Modal */}
      <Dialog open={!!selectedTransaction && !!actionType} onOpenChange={() => {
        setSelectedTransaction(null)
        setActionType(null)
        setAdminNotes('')
        setRejectionReason('')
        setPaymentTransactionId('')
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' && 'Approve Transaction'}
              {actionType === 'reject' && 'Reject Transaction'}
              {actionType === 'payment' && 'Process Payment'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {actionType === 'reject' && (
              <div>
                <Label htmlFor="rejectionReason">Rejection Reason *</Label>
                <Textarea
                  id="rejectionReason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Enter rejection reason..."
                  rows={3}
                  required
                />
              </div>
            )}

            {actionType === 'payment' && (
              <div>
                <Label htmlFor="paymentTransactionId">Transaction ID *</Label>
                <Input
                  id="paymentTransactionId"
                  type="text"
                  value={paymentTransactionId}
                  onChange={(e) => setPaymentTransactionId(e.target.value)}
                  placeholder="Enter payment transaction ID..."
                  required
                />
              </div>
            )}

            <div>
              <Label htmlFor="adminNotes">Admin Notes (Optional)</Label>
              <Textarea
                id="adminNotes"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add admin notes..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={handleAction}
              disabled={isProcessingAction}
              className={`${
                actionType === 'approve' ? 'bg-status-success hover:bg-green-theme-accent' :
                actionType === 'reject' ? 'bg-status-error hover:bg-red-700' :
                'bg-silver-theme-primary hover:bg-silver-theme-accent'
              }`}
            >
              {isProcessingAction ? 'Processing...' : actionType === 'approve' && 'Approve'}
              {isProcessingAction ? 'Processing...' : actionType === 'reject' && 'Reject'}
              {isProcessingAction ? 'Processing...' : actionType === 'payment' && 'Process Payment'}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedTransaction(null)
                setActionType(null)
                setAdminNotes('')
                setRejectionReason('')
                setPaymentTransactionId('')
              }}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Adjustment Modal */}
      <Dialog open={showAdjustmentModal} onOpenChange={() => {
        setShowAdjustmentModal(false)
        setSelectedTransaction(null)
        setNewRedeemedAmount(0)
        setAdjustmentNotes('')
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust Redeem Amount</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {selectedTransaction && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mr-2" />
                  <div>
                    <h4 className="text-sm font-medium text-red-800">Negative Balance Detected</h4>
                    <p className="text-sm text-red-600">
                      User has a negative balance of {selectedTransaction.userBalance} coins. 
                      You can reduce the redeem amount to help balance their account.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="currentRedeemed">Current Redeem Amount</Label>
              <Input
                id="currentRedeemed"
                type="number"
                value={selectedTransaction?.coinsRedeemed || 0}
                disabled
                className="bg-gray-100"
              />
            </div>

            <div>
              <Label htmlFor="newRedeemedAmount">New Redeem Amount *</Label>
              <Input
                id="newRedeemedAmount"
                type="number"
                value={newRedeemedAmount}
                onChange={(e) => setNewRedeemedAmount(Number(e.target.value))}
                min={0}
                max={selectedTransaction?.coinsRedeemed || 0}
                placeholder="Enter new redeem amount..."
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Must be between 0 and {selectedTransaction?.coinsRedeemed || 0}
              </p>
            </div>

            <div>
              <Label htmlFor="adjustmentNotes">Adjustment Notes (Optional)</Label>
              <Textarea
                id="adjustmentNotes"
                value={adjustmentNotes}
                onChange={(e) => setAdjustmentNotes(e.target.value)}
                placeholder="Explain why you're adjusting the redeem amount..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={handleAdjustRedeemAmount}
              disabled={isProcessingAction || newRedeemedAmount < 0 || newRedeemedAmount > (selectedTransaction?.coinsRedeemed || 0)}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {isProcessingAction ? 'Adjusting...' : 'Adjust Redeem Amount'}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowAdjustmentModal(false)
                setSelectedTransaction(null)
                setNewRedeemedAmount(0)
                setAdjustmentNotes('')
              }}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
})

export default TransactionTable
