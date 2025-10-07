'use client'

import React from 'react'
import { useState } from 'react'
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  CurrencyDollarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  EyeIcon
} from '@heroicons/react/24/outline'
import type { AdminCoinTransaction } from '../../types/coins'
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Textarea,
  Input,
} from '@/components/ui'
// Form components temporarily disabled in UI exports
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const approveFormSchema = z.object({
  adminNotes: z.string().max(1000, 'Admin notes cannot exceed 1000 characters').optional(),
})

const rejectFormSchema = z.object({
  rejectionReason: z.string().min(1, 'Rejection reason is required').max(500, 'Rejection reason cannot exceed 500 characters'),
  adminNotes: z.string().max(1000, 'Admin notes cannot exceed 1000 characters').optional(),
})

const paymentFormSchema = z.object({
  paymentTransactionId: z.string().min(1, 'Transaction ID is required').max(100, 'Transaction ID cannot exceed 100 characters'),
  adminNotes: z.string().max(1000, 'Admin notes cannot exceed 1000 characters').optional(),
})

type ApproveFormData = z.infer<typeof approveFormSchema>
type RejectFormData = z.infer<typeof rejectFormSchema>
type PaymentFormData = z.infer<typeof paymentFormSchema>

interface TransactionActionButtonsProps {
  transaction: AdminCoinTransaction
  onView?: (transaction: AdminCoinTransaction) => void
  onApprove?: (transactionId: string, adminNotes?: string) => void
  onReject?: (transactionId: string, reason: string, adminNotes?: string) => void
  onProcessPayment?: (
    transactionId: string, 
    paymentTransactionId: string, 
    paymentMethod: string, 
    paymentAmount: number, 
    adminNotes?: string
  ) => void
  isLoading?: boolean
}

export function TransactionActionButtons({ 
  transaction, 
  onApprove, 
  onReject, 
  onProcessPayment,
  isLoading = false 
}: TransactionActionButtonsProps) {
  const [showApproveModal, setShowApproveModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  const approveForm = useForm<ApproveFormData>({
    resolver: zodResolver(approveFormSchema),
    defaultValues: {
      adminNotes: '',
    }
  })

  const rejectForm = useForm<RejectFormData>({
    resolver: zodResolver(rejectFormSchema),
    defaultValues: {
      rejectionReason: '',
      adminNotes: '',
    }
  })

  const paymentForm = useForm<PaymentFormData>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      paymentTransactionId: '',
      adminNotes: '',
    }
  })

  const canApprove = transaction.status === 'PENDING' && 
                     (transaction.type === 'EARN' || transaction.type === 'REDEEM') &&
                     // Prevent approval if user has negative balance and trying to redeem
                     !(transaction.userBalance !== undefined && 
                       transaction.userBalance < 0 && 
                       transaction.coinsRedeemed && 
                       transaction.coinsRedeemed > 0)

  const canReject = transaction.status === 'PENDING' && 
                    (transaction.type === 'EARN' || transaction.type === 'REDEEM')

  const canProcessPayment = transaction.type === 'REDEEM' && transaction.status === 'APPROVED'

  const handleApprove = (data: ApproveFormData) => {
    onApprove?.(transaction.id, data.adminNotes?.trim())
    setShowApproveModal(false)
    approveForm.reset()
  }

  const handleReject = (data: RejectFormData) => {
    onReject?.(transaction.id, data.rejectionReason.trim(), data.adminNotes?.trim())
    setShowRejectModal(false)
    rejectForm.reset()
  }

  const handleProcessPayment = (data: PaymentFormData) => {
    onProcessPayment?.(
      transaction.id, 
      data.paymentTransactionId.trim(), 
      'bank_transfer', // Default payment method
      transaction.amount, // Use transaction amount
      data.adminNotes?.trim()
    )
    setShowPaymentModal(false)
    paymentForm.reset()
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-2">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-theme-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {/* Status Display */}
      <div className="flex items-center space-x-2">
        {getStatusIcon(transaction.status)}
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
          {transaction.status}
        </span>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        {canApprove && (
          <Button
            onClick={() => setShowApproveModal(true)}
            disabled={isLoading}
            size="sm"
            className="bg-status-success hover:bg-green-theme-accent"
            title="Approve transaction and notify user"
          >
            <CheckCircleIcon className="w-3 h-3 mr-1" />
            Approve
            <div className="w-1.5 h-1.5 bg-white rounded-full ml-1 opacity-75" title="User will be notified"></div>
          </Button>
        )}
        
        {/* Show disabled approve button with warning for negative balance users */}
        {transaction.status === 'PENDING' && 
         (transaction.type === 'EARN' || transaction.type === 'REDEEM') &&
         !canApprove && 
         transaction.userBalance !== undefined && 
         transaction.userBalance < 0 && 
         transaction.coinsRedeemed && 
         transaction.coinsRedeemed > 0 && (
          <Button
            disabled={true}
            size="sm"
            className="bg-gray-400 text-white cursor-not-allowed"
            title="Cannot approve: User has negative balance. Adjust redeem amount first."
          >
            <ExclamationTriangleIcon className="w-3 h-3 mr-1" />
            Approve (Disabled)
          </Button>
        )}

        {canReject && (
          <Button
            onClick={() => setShowRejectModal(true)}
            disabled={isLoading}
            size="sm"
            variant="destructive"
            title="Reject transaction and notify user with reason"
          >
            <XCircleIcon className="w-3 h-3 mr-1" />
            Reject
            <div className="w-1.5 h-1.5 bg-white rounded-full ml-1 opacity-75" title="User will be notified"></div>
          </Button>
        )}

        {canProcessPayment && (
          <Button
            onClick={() => setShowPaymentModal(true)}
            disabled={isLoading}
            size="sm"
            className="bg-silver-theme-primary hover:bg-silver-theme-accent"
            title="Process payment and notify user"
          >
            <CurrencyDollarIcon className="w-3 h-3 mr-1" />
            Process Payment
            <div className="w-1.5 h-1.5 bg-white rounded-full ml-1 opacity-75" title="User will be notified"></div>
          </Button>
        )}
      </div>

      {/* Approve Modal */}
      <Dialog open={showApproveModal} onOpenChange={setShowApproveModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Transaction</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Notification Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium text-blue-800">User Notification</span>
              </div>
              <p className="text-xs text-blue-700 mt-1">
                The user will be notified that their {transaction.type.toLowerCase()} request has been approved.
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget as HTMLFormElement)
                const adminNotes = (formData.get('adminNotes') as string)?.trim() || undefined
                handleApprove({ adminNotes })
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <label className="text-sm font-medium">Admin Notes (Optional)</label>
                <Textarea name="adminNotes" rows={3} placeholder="Add admin notes..." maxLength={1000} />
                <p className="text-xs text-muted-foreground">Optional notes for audit trail</p>
              </div>

              <div className="flex space-x-3">
                <Button type="submit" className="flex-1 bg-status-success hover:bg-green-theme-accent">
                  Approve & Notify User
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowApproveModal(false)
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reject Modal */}
      <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Transaction</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Notification Info */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-sm font-medium text-orange-800">User Notification</span>
              </div>
              <p className="text-xs text-orange-700 mt-1">
                The user will be notified that their {transaction.type.toLowerCase()} request has been rejected with the reason you provide.
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget as HTMLFormElement)
                const rejectionReason = (formData.get('rejectionReason') as string)?.trim() || ''
                const adminNotes = (formData.get('adminNotes') as string)?.trim() || undefined
                handleReject({ rejectionReason, adminNotes })
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <label className="text-sm font-medium">Rejection Reason *</label>
                <Textarea name="rejectionReason" rows={3} placeholder="Enter rejection reason..." required maxLength={500} />
                <p className="text-xs text-muted-foreground">This reason will be shown to the user</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Admin Notes (Optional)</label>
                <Textarea name="adminNotes" rows={3} placeholder="Add admin notes..." maxLength={1000} />
                <p className="text-xs text-muted-foreground">Internal notes for audit trail</p>
              </div>

              <div className="flex space-x-3">
                <Button type="submit" variant="destructive" className="flex-1">
                  Reject & Notify User
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowRejectModal(false)
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Payment</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Payment Amount Display */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-green-800">Payment Amount</span>
                <span className="text-lg font-bold text-green-900">₹{transaction.amount}</span>
              </div>
            </div>

            {/* Notification Info */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-green-800">User Notification</span>
              </div>
              <p className="text-xs text-green-700 mt-1">
                The user will be notified that ₹{transaction.amount} has been redeemed and paid to them.
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget as HTMLFormElement)
                const paymentTransactionId = (formData.get('paymentTransactionId') as string)?.trim() || ''
                const adminNotes = (formData.get('adminNotes') as string)?.trim() || undefined
                handleProcessPayment({ paymentTransactionId, adminNotes })
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <label className="text-sm font-medium">Payment Transaction ID *</label>
                <Input name="paymentTransactionId" placeholder="Enter payment transaction ID..." required maxLength={100} />
                <p className="text-xs text-muted-foreground">Reference ID for the payment transaction</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Admin Notes (Optional)</label>
                <Textarea name="adminNotes" rows={3} placeholder="Add admin notes..." maxLength={1000} />
                <p className="text-xs text-muted-foreground">Internal notes for audit trail</p>
              </div>

              <div className="flex space-x-3">
                <Button type="submit" className="flex-1 bg-silver-theme-primary hover:bg-silver-theme-accent">
                  Process Payment & Notify User
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowPaymentModal(false)
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
