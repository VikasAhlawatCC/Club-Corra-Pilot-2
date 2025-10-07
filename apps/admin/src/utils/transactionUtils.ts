import type { AdminCoinTransaction } from '@/types/coins'

/**
 * Determines if a transaction requires admin action based on the original plan requirements
 * 
 * For EARN requests:
 * - PENDING: Show action required
 * - APPROVED: Remove action required
 * - REJECTED: Remove action required
 * 
 * For REDEEM requests:
 * - PENDING: Show action required
 * - APPROVED: Keep action required (until paid)
 * - UNPAID: Keep action required (payment pending)
 * - PROCESSED: Keep action required (until paid)
 * - PAID: Remove action required
 * - REJECTED: Remove action required
 */
export const isTransactionActionRequired = (transaction: AdminCoinTransaction): boolean => {
  if (transaction.type === 'EARN') {
    return transaction.status === 'PENDING'
  }
  
  if (transaction.type === 'REDEEM') {
    return ['PENDING', 'APPROVED', 'UNPAID'].includes(transaction.status)
  }
  
  return false
}

/**
 * Gets the action required status text for display
 */
export const getActionRequiredText = (transaction: AdminCoinTransaction): string | null => {
  if (!isTransactionActionRequired(transaction)) {
    return null
  }
  
  if (transaction.type === 'EARN') {
    return 'Action Required'
  }
  
  if (transaction.type === 'REDEEM') {
    if (transaction.status === 'PENDING') {
      return 'Action Required'
    }
    if (transaction.status === 'APPROVED') {
      return 'Payment Required'
    }
    if (transaction.status === 'UNPAID') {
      return 'Payment Pending'
    }
  }
  
  return 'Action Required'
}

/**
 * Gets the action required status color for styling
 */
export const getActionRequiredColor = (transaction: AdminCoinTransaction): string => {
  if (!isTransactionActionRequired(transaction)) {
    return ''
  }
  
  if (transaction.type === 'EARN') {
    return 'text-yellow-600 bg-yellow-100'
  }
  
  if (transaction.type === 'REDEEM') {
    if (transaction.status === 'PENDING') {
      return 'text-yellow-600 bg-yellow-100'
    }
    if (transaction.status === 'APPROVED') {
      return 'text-orange-600 bg-orange-100'
    }
    if (transaction.status === 'UNPAID') {
      return 'text-red-600 bg-red-100'
    }
  }
  
  return 'text-yellow-600 bg-yellow-100'
}
