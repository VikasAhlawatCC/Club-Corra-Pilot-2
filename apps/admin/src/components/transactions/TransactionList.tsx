'use client'

import React, { memo } from 'react'
import { TransactionTable } from './TransactionTable'
import { TransactionDetailModal } from './TransactionDetailModal'
import { TransactionVerificationModal } from './TransactionVerificationModal'
import { PaymentProcessingModal } from './PaymentProcessingModal'
import { TransactionActionButtons } from './TransactionActionButtons'
import type { AdminCoinTransaction } from '../../types/coins'

interface TransactionListProps {
  transactions: AdminCoinTransaction[]
  processingOrder?: any[]
  isLoading: boolean
  selectedTransaction: AdminCoinTransaction | null
  showDetailModal: boolean
  showVerificationModal: boolean
  onTransactionSelect: (transaction: AdminCoinTransaction) => void
  onDetailModalClose: () => void
  onVerificationModalClose: () => void
  onPaymentModalClose: () => void
  onApproveEarn: (transactionId: string, adminNotes?: string) => Promise<void>
  onRejectEarn: (transactionId: string, adminNotes: string) => Promise<void>
  onApproveRedeem: (transactionId: string, adminNotes?: string) => Promise<void>
  onRejectRedeem: (transactionId: string, adminNotes: string) => Promise<void>
  onProcessPayment: (
    transactionId: string,
    paymentTransactionId: string,
    paymentMethod: string,
    paymentAmount: number,
    adminNotes?: string
  ) => Promise<void>
  searchTerm?: string
  statusFilter?: string
  typeFilter?: string
  actionRequiredFilter?: string
}

export const TransactionList = memo(function TransactionList({
  transactions,
  processingOrder = [],
  isLoading,
  selectedTransaction,
  showDetailModal,
  showVerificationModal,
  onTransactionSelect,
  onDetailModalClose,
  onVerificationModalClose,
  onPaymentModalClose,
  onApproveEarn,
  onRejectEarn,
  onApproveRedeem,
  onRejectRedeem,
  onProcessPayment,
  searchTerm,
  statusFilter,
  typeFilter,
  actionRequiredFilter,
}: TransactionListProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-theme-primary"></div>
      </div>
    )
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 text-lg">No transactions found</p>
        <p className="text-gray-400 text-sm mt-2">Transactions will appear here once they are created</p>
      </div>
    )
  }

  return (
    <>
      <TransactionTable
        transactions={transactions}
        processingOrder={Array.isArray(processingOrder) ? processingOrder : []}
        onTransactionSelect={onTransactionSelect}
        onApproveEarn={onApproveEarn}
        onRejectEarn={onRejectEarn}
        onApproveRedeem={onApproveRedeem}
        onRejectRedeem={onRejectRedeem}
        onProcessPayment={onProcessPayment}
        searchTerm={searchTerm}
        statusFilter={statusFilter}
        typeFilter={typeFilter}
        actionRequiredFilter={actionRequiredFilter}
      />

      {/* Stable Modal Container - Prevents DOM manipulation errors */}
      <div className="modal-container">
        {/* Transaction Verification Modal - keep open regardless of current selected transaction status */}
        {selectedTransaction && showVerificationModal && (
          <div key={`verification-container-${selectedTransaction.id}`}>
            <TransactionVerificationModal
              key={`verification-${selectedTransaction.id}`}
              transaction={selectedTransaction}
              isOpen={showVerificationModal}
              onClose={onVerificationModalClose}
              onApprove={async (transactionId: string, verificationData: any) => {
                const txType = verificationData?.type || (transactions.find(t => t.id === transactionId) || selectedTransaction)?.type
                if (txType === 'EARN') {
                  await onApproveEarn(transactionId, verificationData.adminNotes)
                } else if (txType === 'REDEEM') {
                  await onApproveRedeem(transactionId, verificationData.adminNotes)
                }
              }}
              onReject={async (transactionId: string, reason: string, adminNotes?: string, type?: 'EARN' | 'REDEEM') => {
                const txType = type || (transactions.find(t => t.id === transactionId) || selectedTransaction)?.type
                if (txType === 'EARN') {
                  await onRejectEarn(transactionId, reason)
                } else if (txType === 'REDEEM') {
                  await onRejectRedeem(transactionId, reason)
                }
              }}
              onApproveAndPay={selectedTransaction.type === 'REDEEM' ? async (transactionId: string, verificationData: any) => {
                // For redeem transactions, we can process payment after approval
                await onApproveRedeem(transactionId, verificationData.adminNotes)
                // TODO: Handle payment processing
              } : undefined}
            />
          </div>
        )}

        {/* Transaction Detail Modal for Completed Transactions */}
        {selectedTransaction && selectedTransaction.status !== 'PENDING' && showDetailModal && (
          <div key={`detail-container-${selectedTransaction.id}`}>
            <TransactionDetailModal
              key={`detail-${selectedTransaction.id}`}
              transaction={selectedTransaction}
              isOpen={showDetailModal}
              onClose={onDetailModalClose}
            />
          </div>
        )}

        {/* Payment Processing Modal */}
        {selectedTransaction && selectedTransaction.type === 'REDEEM' && (
          <PaymentProcessingModal
            transaction={selectedTransaction}
            isOpen={false} // This will be controlled by the parent
            onClose={onPaymentModalClose}
            onProcessPayment={onProcessPayment}
          />
        )}
      </div>
    </>
  )
})
