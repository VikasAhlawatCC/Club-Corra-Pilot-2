// Admin-specific coin types for the admin portal
export interface CoinSystemStats {
  totalCoinsInCirculation: number
  totalUsers: number
  welcomeBonusesGiven: number
  pendingRedemptions: number
  activeBrands: number
  systemHealth: 'healthy' | 'warning' | 'critical'
  // Additional fields for comprehensive stats
  totalEarned?: number
  totalRedeemed?: number
  transactionSuccessRate?: number
  totalTransactions?: number
  approvedTransactions?: number
  rejectedTransactions?: number
  pendingEarnRequests?: number
}

export interface AdminCoinTransaction {
  id: string
  userId: string
  userName: string
  userMobile: string
  type: 'EARN' | 'REDEEM' | 'WELCOME_BONUS' | 'ADJUSTMENT' | 'REWARD_REQUEST'
  amount: number // integer - net change (coinsEarned - coinsRedeemed)
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PROCESSED' | 'PAID'
  brandName?: string
  brandId?: string
  billAmount?: number
  receiptUrl?: string
  adminNotes?: string
  createdAt: Date
  updatedAt: Date
  // Additional fields that components expect
  coinsEarned?: number // integer
  coinsRedeemed?: number // integer
  billDate?: Date
  transactionId?: string
  processedAt?: Date
  paymentProcessedAt?: Date
  statusUpdatedAt?: Date // Last status update timestamp
  // Brand object for compatibility
  brand?: {
    id: string
    name: string
    logoUrl?: string
    description?: string
  }
  // New fields for unified flow
  userBalance?: number // Current user balance for negative balance checks
  isOldestPending?: boolean // Whether this is the oldest pending transaction for the user
}

export interface TransactionFilters {
  page?: number
  limit?: number
  userId?: string
  type?: 'EARN' | 'REDEEM' | 'WELCOME_BONUS' | 'ADJUSTMENT' | 'REWARD_REQUEST'
  status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PROCESSED' | 'PAID'
  startDate?: string
  endDate?: string
  search?: string
  actionRequired?: string
}

export interface TransactionStats {
  pendingEarn: number
  pendingRedeem: number
  totalEarned: number
  totalRedeemed: number
  totalBalance: number
  totalWelcomeBonuses: number
  totalUsers: number
  activeBrands: number
  totalTransactions: number
  approvedTransactions: number
  rejectedTransactions: number
  transactionSuccessRate: number
}

export interface PaymentStats {
  totalPayments: number
  totalAmountPaid: number
  pendingPayments: number
  completedPayments: number
  averagePaymentAmount: number
}

export interface UserCoinSummary {
  userId: string
  userName: string
  userMobile: string
  currentBalance: number
  totalEarned: number
  totalRedeemed: number
  pendingRequests: number
  lastTransactionDate?: Date
}
