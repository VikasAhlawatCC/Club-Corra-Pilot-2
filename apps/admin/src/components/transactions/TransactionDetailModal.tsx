'use client'

import React, { useState } from 'react'
import { EyeIcon, DocumentTextIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import type { AdminCoinTransaction } from '../../types/coins'
import { formatDate } from '@/utils/dateUtils'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Button,
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui'

import { getProxiedUrl } from '@/utils/s3UrlProxy'
import { transactionApi } from '@/lib/api'
import { useToast, ToastContainer } from '@/components/common'

interface TransactionDetailModalProps {
  transaction: AdminCoinTransaction | null
  isOpen: boolean
  onClose: () => void
}

export function TransactionDetailModal({ 
  transaction, 
  isOpen, 
  onClose 
}: TransactionDetailModalProps) {
  const [isMarkingPaid, setIsMarkingPaid] = useState(false)
  const [paymentTxId, setPaymentTxId] = useState('')
  const [showMarkPaidForm, setShowMarkPaidForm] = useState(false)
  const { toasts, removeToast, showSuccess, showError } = useToast()

  if (!isOpen || !transaction) return null

  const handleMarkAsPaid = async () => {
    if (!paymentTxId || paymentTxId.trim().length < 5) {
      showError('Please enter a valid payment transaction ID (minimum 5 characters)')
      return
    }

    setIsMarkingPaid(true)
    try {
      await transactionApi.markTransactionAsPaid(transaction.id, paymentTxId.trim())
      showSuccess('Transaction marked as paid successfully!')
      setShowMarkPaidForm(false)
      setPaymentTxId('')
      onClose() // Close modal and refresh
    } catch (error) {
      console.error('Error marking transaction as paid:', error)
      showError('Failed to mark transaction as paid. Please try again.')
    } finally {
      setIsMarkingPaid(false)
    }
  }



  const getTransactionTypeColor = (type: AdminCoinTransaction['type']) => {
    switch (type) {
      case 'EARN':
        return 'bg-green-100 text-green-800'
      case 'REDEEM':
        return 'bg-orange-100 text-orange-800'
      case 'WELCOME_BONUS':
        return 'bg-blue-100 text-blue-800'
      case 'ADJUSTMENT':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: AdminCoinTransaction['status']) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800'
      case 'REJECTED':
        return 'bg-red-100 text-red-800'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      // Keep support for legacy PROCESSED visually mapping to Approved color
      case 'PROCESSED':
        return 'bg-green-100 text-green-800'
      case 'PAID':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }


  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            Transaction Details
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Transaction Info */}
          <div className="space-y-6">
            {/* Basic Transaction Info */}
            <Card>
              <CardHeader>
                <CardTitle>Transaction Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Transaction ID:</span>
                  <span className="font-mono text-sm">{transaction.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type:</span>
                  <Badge variant="secondary" className={getTransactionTypeColor(transaction.type)}>
                    {transaction.type}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge variant="secondary" className={getStatusColor(transaction.status)}>
                    {transaction.status}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created:</span>
                  <span>{formatDate(transaction.createdAt)}</span>
                </div>
                {transaction.processedAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Processed:</span>
                    <span>{formatDate(transaction.processedAt)}</span>
                  </div>
                )}
                {transaction.paymentProcessedAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment Processed:</span>
                    <span>{formatDate(transaction.paymentProcessedAt)}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* User Information */}
            <Card>
              <CardHeader>
                <CardTitle>User Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">User ID:</span>
                  <span className="font-mono text-sm">{transaction.userId}</span>
                </div>
                {transaction.userBalance !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Current Balance:</span>
                    <span className={`text-lg font-semibold ${transaction.userBalance < 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {transaction.userBalance} coins
                    </span>
                  </div>
                )}
                {transaction.userUpiId && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">UPI ID:</span>
                    <span className="font-mono text-sm font-semibold text-blue-600">
                      {transaction.userUpiId}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* UNPAID Transaction Payment Section */}
            {transaction.status === 'UNPAID' && transaction.coinsRedeemed && transaction.coinsRedeemed > 0 && (
              <Card className="border-orange-200 bg-orange-50">
                <CardHeader>
                  <CardTitle className="text-orange-800 flex items-center gap-2">
                    <ExclamationTriangleIcon className="w-5 h-5" />
                    Payment Pending
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-orange-700 text-sm">
                    This transaction has been approved and requires payment of {transaction.coinsRedeemed} rupees to the user.
                  </p>
                  {transaction.userUpiId && (
                    <div className="p-3 bg-white rounded-md border border-orange-200">
                      <p className="text-sm font-medium text-gray-700 mb-1">User's UPI ID:</p>
                      <p className="font-mono text-lg font-bold text-blue-600">{transaction.userUpiId}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(transaction.userUpiId!)
                          showSuccess('UPI ID copied to clipboard!')
                        }}
                        className="mt-2 w-full"
                      >
                        Copy UPI ID
                      </Button>
                    </div>
                  )}
                  {!transaction.userUpiId && (
                    <div className="p-3 bg-white rounded-md border border-orange-200">
                      <p className="text-sm text-red-600">⚠️ No UPI ID available for this user. Please contact the user to provide their UPI ID.</p>
                    </div>
                  )}
                  {!showMarkPaidForm ? (
                    <Button
                      onClick={() => setShowMarkPaidForm(true)}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      Mark as Paid
                    </Button>
                  ) : (
                    <div className="space-y-3 p-3 bg-white rounded-md border border-orange-200">
                      <p className="text-sm font-medium text-gray-700">Enter UPI Transaction ID:</p>
                      <input
                        type="text"
                        value={paymentTxId}
                        onChange={(e) => setPaymentTxId(e.target.value)}
                        placeholder="e.g., 123456789012"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        disabled={isMarkingPaid}
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={handleMarkAsPaid}
                          disabled={isMarkingPaid || !paymentTxId || paymentTxId.trim().length < 5}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                          {isMarkingPaid ? 'Processing...' : 'Confirm Payment'}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowMarkPaidForm(false)
                            setPaymentTxId('')
                          }}
                          disabled={isMarkingPaid}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Brand Information */}
            {transaction.brand && (
              <Card>
                <CardHeader>
                  <CardTitle>Brand Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Brand:</span>
                    <span>{transaction.brand.name}</span>
                  </div>
                  {transaction.brand.logoUrl && (
                    <div className="flex justify-center">
                      <img 
                        src={getProxiedUrl(transaction.brand.logoUrl)} 
                        alt={transaction.brand.name}
                        className="h-16 w-16 object-contain rounded-lg"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Balance Warning */}
            {transaction.userBalance !== undefined && transaction.userBalance < 0 && (
              <Card className="border-red-200 bg-red-50">
                <CardHeader>
                  <CardTitle className="text-red-800 flex items-center gap-2">
                    <ExclamationTriangleIcon className="w-5 h-5" />
                    Negative Balance Warning
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-red-700 text-sm">
                    This user has a negative balance of {transaction.userBalance} coins. 
                    {transaction.coinsRedeemed && transaction.coinsRedeemed > 0 && (
                      <span> Consider reducing the redeem amount to prevent further negative balance.</span>
                    )}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Financial Information */}
            <Card>
              <CardHeader>
                <CardTitle>Financial Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {transaction.billAmount && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Bill Amount:</span>
                    <span className="text-lg font-semibold">
                      {formatCurrency(transaction.billAmount)}
                    </span>
                  </div>
                )}
                {transaction.coinsEarned && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Coins Earned:</span>
                    <span className="text-lg font-semibold text-green-600">
                      +{transaction.coinsEarned} coins
                    </span>
                  </div>
                )}
                {transaction.coinsRedeemed && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Coins Redeemed:</span>
                    <span className="text-lg font-semibold text-orange-600">
                      -{transaction.coinsRedeemed} coins
                    </span>
                  </div>
                )}
                {transaction.amount && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Transaction Amount:</span>
                    <span className="text-lg font-semibold">
                      {formatCurrency(transaction.amount)}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Additional Details */}
            {(transaction.billDate || transaction.transactionId || transaction.adminNotes) && (
              <Card>
                <CardHeader>
                  <CardTitle>Additional Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {transaction.billDate && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Bill Date:</span>
                      <span>{formatDate(transaction.billDate)}</span>
                    </div>
                  )}
                  {transaction.transactionId && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Payment Transaction ID:</span>
                      <span className="font-mono text-sm">{transaction.transactionId}</span>
                    </div>
                  )}
                  {transaction.adminNotes && (
                    <div>
                      <span className="text-muted-foreground block mb-2">Admin Notes:</span>
                      <p className="bg-muted p-3 rounded border text-sm">
                        {transaction.adminNotes}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Receipt & Actions */}
          <div className="space-y-6">
            {/* Receipt Image */}
            {transaction.receiptUrl && (
              <div className="space-y-2">
                <div className="relative rounded-md border overflow-hidden">
                  {/* Try image first */}
                  <img
                    alt={`Receipt for ${transaction.id}`}
                    className="w-full max-h-[420px] object-contain"
                    src={getProxiedUrl(transaction.receiptUrl)}
                    onError={(e) => {
                      const container = (e.currentTarget.parentElement as HTMLElement)
                      if (container && transaction.receiptUrl) {
                        container.innerHTML = `<object data="${getProxiedUrl(transaction.receiptUrl)}" type="application/pdf" width="100%" height="420">\n  <p class="p-3 text-sm text-gray-500">Preview not available. <a href="${getProxiedUrl(transaction.receiptUrl)}" target="_blank" class="text-blue-600 underline">Open file</a></p>\n</object>`
                      }
                    }}
                  />
                </div>
                <a
                  className="text-sm text-blue-600 hover:text-blue-800 underline"
                  href={getProxiedUrl(transaction.receiptUrl)}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open original
                </a>
              </div>
            )}

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {transaction.status === 'PENDING' && (
                  <>
                    <Button className="w-full bg-green-600 hover:bg-green-700">
                      Approve Transaction
                    </Button>
                    <Button className="w-full bg-red-600 hover:bg-red-700">
                      Reject Transaction
                    </Button>
                  </>
                )}
                {transaction.type === 'REDEEM' && transaction.status === 'APPROVED' && (
                  <Button className="w-full bg-purple-600 hover:bg-purple-700">
                    Process Payment
                  </Button>
                )}
                <Button 
                  variant="outline"
                  onClick={onClose}
                  className="w-full"
                >
                  Close
                </Button>
              </CardContent>
            </Card>

            {/* Transaction Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Timeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">Transaction Created</p>
                    <p className="text-xs text-muted-foreground">{formatDate(transaction.createdAt)}</p>
                  </div>
                </div>
                {transaction.processedAt && (
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium">Processed</p>
                      <p className="text-xs text-muted-foreground">{formatDate(transaction.processedAt)}</p>
                    </div>
                  </div>
                )}
                {transaction.paymentProcessedAt && (
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium">Payment Processed</p>
                      <p className="text-xs text-muted-foreground">{formatDate(transaction.paymentProcessedAt)}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
      
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </Dialog>
  )
}
