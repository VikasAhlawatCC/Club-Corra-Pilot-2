'use client'

import React from 'react'
import { EyeIcon, DocumentTextIcon } from '@heroicons/react/24/outline'
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
  if (!isOpen || !transaction) return null



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
              </CardContent>
            </Card>

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
    </Dialog>
  )
}
