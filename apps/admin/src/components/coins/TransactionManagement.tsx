'use client'

import { useState } from 'react'
import { AdminCoinTransaction } from '@/types/coins'
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  CurrencyDollarIcon,
  EyeIcon 
} from '@heroicons/react/24/outline'

interface TransactionManagementProps {
  transaction: AdminCoinTransaction
  onApprove: (transactionId: string, adminNotes?: string) => Promise<boolean>
  onReject: (transactionId: string, adminNotes: string) => Promise<boolean>
  onProcessPayment: (
    transactionId: string,
    paymentTransactionId: string,
    paymentMethod: string,
    paymentAmount: number,
    adminNotes?: string
  ) => Promise<boolean>
  onViewDetails: (transaction: AdminCoinTransaction) => void
}

export function TransactionManagement({
  transaction,
  onApprove,
  onReject,
  onProcessPayment,
  onViewDetails
}: TransactionManagementProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [adminNotes, setAdminNotes] = useState('')
  const [paymentData, setPaymentData] = useState({
    paymentTransactionId: '',
    paymentMethod: 'UPI',
    paymentAmount: transaction.billAmount || 0
  })

  const handleApprove = async () => {
    setIsProcessing(true)
    try {
      const success = await onApprove(transaction.id, adminNotes)
      if (success) {
        setAdminNotes('')
      }
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!adminNotes.trim()) {
      alert('Please provide a reason for rejection')
      return
    }
    
    setIsProcessing(true)
    try {
      const success = await onReject(transaction.id, adminNotes)
      if (success) {
        setShowRejectModal(false)
        setAdminNotes('')
      }
    } finally {
      setIsProcessing(false)
    }
  }

  const handleProcessPayment = async () => {
    if (!paymentData.paymentTransactionId.trim()) {
      alert('Please provide a payment transaction ID')
      return
    }
    
    setIsProcessing(true)
    try {
      const success = await onProcessPayment(
        transaction.id,
        paymentData.paymentTransactionId,
        paymentData.paymentMethod,
        paymentData.paymentAmount,
        adminNotes
      )
      if (success) {
        setShowPaymentModal(false)
        setAdminNotes('')
        setPaymentData({
          paymentTransactionId: '',
          paymentMethod: 'UPI',
          paymentAmount: transaction.billAmount || 0
        })
      }
    } finally {
      setIsProcessing(false)
    }
  }

  const canProcessPayment = transaction.status === 'APPROVED' && transaction.type === 'REDEEM'
  const canApprove = transaction.status === 'PENDING'
  const canReject = transaction.status === 'PENDING'

  return (
    <div className="space-y-4">
      {/* Transaction Info */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">User:</span>
            <span className="ml-2 text-gray-900">{transaction.userName}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Type:</span>
            <span className="ml-2 text-gray-900">{transaction.type}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Amount:</span>
            <span className="ml-2 text-gray-900">{transaction.amount} coins</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Status:</span>
            <span className="ml-2 text-gray-900">{transaction.status}</span>
          </div>
          {transaction.billAmount && (
            <div>
              <span className="font-medium text-gray-700">Bill Amount:</span>
              <span className="ml-2 text-gray-900">₹{transaction.billAmount}</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onViewDetails(transaction)}
          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <EyeIcon className="h-4 w-4 mr-2" />
          View Details
        </button>

        {canApprove && (
          <button
            onClick={handleApprove}
            disabled={isProcessing}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
          >
            <CheckCircleIcon className="h-4 w-4 mr-2" />
            {isProcessing ? 'Approving...' : 'Approve'}
          </button>
        )}

        {canReject && (
          <button
            onClick={() => setShowRejectModal(true)}
            disabled={isProcessing}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
          >
            <XCircleIcon className="h-4 w-4 mr-2" />
            Reject
          </button>
        )}

        {canProcessPayment && (
          <button
            onClick={() => setShowPaymentModal(true)}
            disabled={isProcessing}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <CurrencyDollarIcon className="h-4 w-4 mr-2" />
            Process Payment
          </button>
        )}
      </div>

      {/* Admin Notes */}
      <div>
        <label htmlFor="adminNotes" className="block text-sm font-medium text-gray-700">
          Admin Notes
        </label>
        <textarea
          id="adminNotes"
          rows={3}
          value={adminNotes}
          onChange={(e) => setAdminNotes(e.target.value)}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="Add notes about this transaction..."
        />
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Reject Transaction</h3>
              <div className="mb-4">
                <label htmlFor="rejectReason" className="block text-sm font-medium text-gray-700">
                  Reason for Rejection *
                </label>
                <textarea
                  id="rejectReason"
                  rows={3}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Please provide a reason for rejection..."
                  required
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={isProcessing || !adminNotes.trim()}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  {isProcessing ? 'Rejecting...' : 'Reject'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Process Payment</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="paymentTransactionId" className="block text-sm font-medium text-gray-700">
                    Payment Transaction ID *
                  </label>
                  <input
                    type="text"
                    id="paymentTransactionId"
                    value={paymentData.paymentTransactionId}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, paymentTransactionId: e.target.value }))}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Enter payment transaction ID"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700">
                    Payment Method
                  </label>
                  <select
                    id="paymentMethod"
                    value={paymentData.paymentMethod}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="UPI">UPI</option>
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                    <option value="CASH">Cash</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="paymentAmount" className="block text-sm font-medium text-gray-700">
                    Payment Amount
                  </label>
                  <input
                    type="number"
                    id="paymentAmount"
                    value={paymentData.paymentAmount}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, paymentAmount: parseFloat(e.target.value) || 0 }))}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleProcessPayment}
                  disabled={isProcessing || !paymentData.paymentTransactionId.trim()}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {isProcessing ? 'Processing...' : 'Process Payment'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
