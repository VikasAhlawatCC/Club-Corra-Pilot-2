'use client'

import React, { useState } from 'react'
import { CurrencyDollarIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import type { AdminCoinTransaction } from '../../types/coins'
import {
  Button,
  Input,
  Textarea,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  // Form components temporarily disabled in UI exports
  Alert,
  AlertDescription,
} from '@/components/ui'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const paymentFormSchema = z.object({
  adminTransactionId: z.string().min(5, 'Transaction ID must be at least 5 characters').max(100, 'Transaction ID cannot exceed 100 characters'),
  adminNotes: z.string().max(1000, 'Admin notes cannot exceed 1000 characters').optional(),
})

type PaymentFormData = z.infer<typeof paymentFormSchema>

interface PaymentProcessingModalProps {
  transaction: AdminCoinTransaction | null
  isOpen: boolean
  onClose: () => void
  onProcessPayment: (
    transactionId: string,
    paymentTransactionId: string,
    paymentMethod: string,
    paymentAmount: number,
    adminNotes?: string
  ) => void
  isLoading?: boolean
}

export function PaymentProcessingModal({ 
  transaction, 
  isOpen, 
  onClose, 
  onProcessPayment,
  isLoading = false 
}: PaymentProcessingModalProps) {
  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      adminTransactionId: '',
      adminNotes: '',
    }
  })

  if (!isOpen || !transaction) return null

  const handleSubmit = (data: PaymentFormData) => {
    onProcessPayment(transaction.id, data.adminTransactionId.trim(), 'MANUAL', 0, data.adminNotes?.trim() || undefined)
    
    // Reset form
    form.reset()
  }

  const handleClose = () => {
    form.reset()
    onClose()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center">
            <CurrencyDollarIcon className="w-6 h-6 mr-2 text-purple-600" />
            Process Payment
          </DialogTitle>
        </DialogHeader>

        {/* Transaction Summary */}
        <div className="bg-muted p-4 rounded-lg mb-6">
          <h4 className="text-sm font-medium mb-3">Transaction Summary</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">User ID:</span>
              <span className="font-mono">{transaction.userId.slice(0, 8)}...</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Brand:</span>
              <span>{transaction.brand?.name || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Bill Amount:</span>
              <span className="font-semibold">
                {transaction.billAmount ? formatCurrency(transaction.billAmount) : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Coins Redeemed:</span>
              <span className="font-semibold text-orange-600">
                {transaction.coinsRedeemed || 0} coins
              </span>
            </div>
            {transaction.userUpiId && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">User UPI ID:</span>
                <span className="font-mono text-sm bg-blue-50 px-2 py-1 rounded border">
                  {transaction.userUpiId}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Warning */}
        <Alert className="mb-6">
          <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400" />
          <AlertDescription>
            <p className="font-medium">Payment Processing</p>
            <p className="mt-1">
              This action will mark the redemption as paid. Ensure you have processed the actual UPI payment 
              to the user before proceeding.
            </p>
          </AlertDescription>
        </Alert>

        {/* Payment Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault()
            const formData = new FormData(e.currentTarget as HTMLFormElement)
            const adminTransactionId = (formData.get('adminTransactionId') as string)?.trim() || ''
            const adminNotes = (formData.get('adminNotes') as string)?.trim() || undefined
            handleSubmit({ adminTransactionId, adminNotes } as any)
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <label className="text-sm font-medium">Payment Transaction ID *</label>
            <Input name="adminTransactionId" placeholder="Enter your payment transaction ID" required />
            <p className="text-xs text-muted-foreground">
              This should be the transaction ID from your UPI payment app (e.g., Google Pay, PhonePe)
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Admin Notes (Optional)</label>
            <Textarea name="adminNotes" rows={3} placeholder="Add any additional notes about this payment..." />
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <CurrencyDollarIcon className="w-4 h-4 mr-2" />
                  Process Payment
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>

        {/* Additional Information */}
        <div className="mt-6 pt-4 border-t">
          <h4 className="text-sm font-medium mb-2">What happens next?</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Transaction status will be updated to "PAID"</li>
            <li>• User will receive a notification about payment completion</li>
            <li>• Payment will be recorded in the audit trail</li>
            <li>• Transaction will be marked as completed</li>
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  )
}
