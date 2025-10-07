import React, { useState, useCallback, useEffect } from 'react'
import { transactionApi, userApi, welcomeBonusApi } from '@/lib/api'
import { 
  CoinSystemStats, 
  AdminCoinTransaction, 
  TransactionFilters,
  TransactionStats,
  PaymentStats,
  UserCoinSummary 
} from '@/types/coins'

export const useCoins = (skipInitialFetch = false) => {
  const [stats, setStats] = useState<CoinSystemStats | null>(null)
  const [transactions, setTransactions] = useState<AdminCoinTransaction[]>([])
  const [transactionStats, setTransactionStats] = useState<TransactionStats | null>(null)
  const [paymentStats, setPaymentStats] = useState<PaymentStats | null>(null)
  const [processingOrder, setProcessingOrder] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  })

  // Fetch coin system statistics
  const fetchStats = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Get comprehensive coin system stats
      const statsResponse = await transactionApi.getCoinSystemStats()
      if (statsResponse.success) {
        const statsData = statsResponse.data
        
        const systemStats: CoinSystemStats = {
          totalCoinsInCirculation: statsData.totalCoinsInCirculation || 0,
          totalUsers: statsData.totalUsers || 0,
          welcomeBonusesGiven: statsData.welcomeBonusesGiven || 0,
          pendingRedemptions: statsData.pendingRedemptions || 0,
          activeBrands: statsData.activeBrands || 0,
          systemHealth: statsData.systemHealth || 'healthy'
        }
        
        setStats(systemStats)
        
        // Also set transaction stats for compatibility
        const transactionStatsData = {
          pendingEarn: statsData.pendingEarnRequests || 0,
          pendingRedeem: statsData.pendingRedemptions || 0,
          totalEarned: statsData.totalEarned || 0,
          totalRedeemed: statsData.totalRedeemed || 0,
          totalBalance: statsData.totalCoinsInCirculation || 0,
          totalWelcomeBonuses: statsData.welcomeBonusesGiven || 0,
          totalUsers: statsData.totalUsers || 0,
          activeBrands: statsData.activeBrands || 0,
          totalTransactions: statsData.totalTransactions || 0,
          approvedTransactions: statsData.approvedTransactions || 0,
          rejectedTransactions: statsData.rejectedTransactions || 0,
          transactionSuccessRate: statsData.transactionSuccessRate || 0
        }
        setTransactionStats(transactionStatsData)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stats')
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch processing order for sequential transaction processing
  const fetchProcessingOrder = useCallback(async () => {
    try {
      setError(null)
      
      const response = await transactionApi.getProcessingOrder()
      if (response.success) {
        setProcessingOrder(response.data || [])
      } else {
        setError('Failed to fetch processing order')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch processing order')
    }
  }, [])

  // Fetch transactions with filters
  const fetchTransactions = useCallback(async (filters: TransactionFilters = {}) => {
    try {
      setLoading(true)
      setError(null)
      
      const { page = 1, limit = 20, userId, type, status, startDate, endDate, search, actionRequired } = filters
      
      // Build query parameters
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      })
      
      if (userId) queryParams.append('userId', userId)
      // Ensure type is uppercase to match backend enum values
      if (type) queryParams.append('type', type.toUpperCase() as any)
      // Normalize status to uppercase to satisfy backend enum ('PENDING','APPROVED','REJECTED','PAID')
      if (status) queryParams.append('status', (status as any as string).toUpperCase())
      if (startDate) queryParams.append('startDate', startDate)
      if (endDate) queryParams.append('endDate', endDate)
      if (search) {
        const sanitizedSearch = search.replace(/\s+/g, ' ').trim()
        if (sanitizedSearch) {
          queryParams.append('search', sanitizedSearch)
        }
      }
      if (actionRequired) queryParams.append('actionRequired', actionRequired)
      
      const response = await transactionApi.getAllTransactions(undefined, undefined, undefined, queryParams.toString())
      if (response.success) {
        const { data: responseData, total, totalPages } = response.data
        
        // The actual array is nested inside data.data
        const data = responseData.data || responseData
        
        // Transform backend data to admin format
        if (!Array.isArray(data)) {
          console.error('Data is not an array:', data)
          setTransactions([])
          setPagination({ page: 1, limit: 20, total: 0, totalPages: 0 })
          return
        }
        
        const adminTransactions: AdminCoinTransaction[] = data.map((tx: any) => ({
          id: tx.id,
          userId: tx.userId,
          userName: tx.user?.profile?.firstName && tx.user?.profile?.lastName 
            ? `${tx.user.profile.firstName} ${tx.user.profile.lastName}`
            : tx.user?.profile?.firstName 
            ? tx.user.profile.firstName
            : tx.user?.mobileNumber 
            ? `User ${tx.user.mobileNumber.slice(-4)}`
            : 'Unknown User',
          userMobile: tx.user?.mobileNumber || 'N/A',
          type: tx.type,
          amount: tx.amount,
          status: tx.status === 'PROCESSED' ? 'APPROVED' : tx.status,
          brandName: tx.brand?.name,
          brandId: tx.brandId,
          billAmount: tx.billAmount,
          receiptUrl: tx.receiptUrl,
          adminNotes: tx.adminNotes,
          createdAt: new Date(tx.createdAt),
          updatedAt: new Date(tx.updatedAt),
          // Additional fields
          coinsEarned: tx.coinsEarned,
          coinsRedeemed: tx.coinsRedeemed,
          billDate: tx.billDate ? new Date(tx.billDate) : undefined,
          transactionId: tx.transactionId,
          processedAt: tx.processedAt ? new Date(tx.processedAt) : undefined,
          paymentProcessedAt: tx.paymentProcessedAt ? new Date(tx.paymentProcessedAt) : undefined,
          statusUpdatedAt: tx.statusUpdatedAt ? new Date(tx.statusUpdatedAt) : tx.updatedAt ? new Date(tx.updatedAt) : undefined,
          // Brand object for compatibility
          brand: tx.brand ? {
            id: tx.brand.id,
            name: tx.brand.name,
            logoUrl: tx.brand.logoUrl,
            description: tx.brand.description
          } : undefined
        }))
        
        setTransactions(adminTransactions)
        setPagination({
          page: responseData.page || page,
          limit: responseData.limit || limit,
          total: responseData.total || total,
          totalPages: responseData.totalPages || totalPages
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch transactions')
    } finally {
      setLoading(false)
    }
  }, []) // Empty dependency array since this function doesn't depend on any external values

  // Fetch payment statistics
  const fetchPaymentStats = useCallback(async (startDate?: string, endDate?: string) => {
    try {
      setError(null)
      
      const response = await transactionApi.getPaymentStats(startDate, endDate)
      if (response.success) {
        setPaymentStats(response.data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch payment stats')
    }
  }, [])

  // Get user coin summary
  const getUserSummary = useCallback(async (userId: string): Promise<UserCoinSummary | null> => {
    try {
      const response = await userApi.getUserTransactionSummary(userId)
      if (response.success) {
        const { data } = response
        return {
          userId,
          userName: 'User', // Will be populated from user data
          userMobile: 'N/A', // Will be populated from user data
          currentBalance: data.balance,
          totalEarned: data.totalEarned,
          totalRedeemed: data.totalRedeemed,
          pendingRequests: data.pendingTransactions || 0,
          lastTransactionDate: data.recentTransactions?.[0]?.createdAt 
            ? new Date(data.recentTransactions[0].createdAt)
            : undefined
        }
      }
      return null
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user summary')
      return null
    }
  }, [])

  // Approve transaction (unified for all types)
  const approveTransaction = useCallback(async (transactionId: string, adminNotes?: string) => {
    try {
      setError(null)
      
      // Get the transaction to determine its type
      const transaction = transactions.find((tx: AdminCoinTransaction) => tx.id === transactionId)
      if (!transaction) {
        setError('Transaction not found')
        return false
      }
      
      let response
      if (transaction.type === 'EARN') {
        response = await transactionApi.approveEarnTransaction(transactionId, 'current-admin-id', adminNotes)
      } else if (transaction.type === 'REDEEM') {
        response = await transactionApi.approveRedeemTransaction(transactionId, 'current-admin-id', adminNotes)
      } else {
        // For other types, use the earn endpoint as fallback
        response = await transactionApi.approveEarnTransaction(transactionId, 'current-admin-id', adminNotes)
      }
      
      if (response.success) {
        // Update the local transaction state instead of refetching
        // Determine new status based on whether there's redemption
        // TODO: Change to 'UNPAID' once the enum value is added to the database
        const newStatus = transaction.coinsRedeemed && transaction.coinsRedeemed > 0 ? 'APPROVED' : 'PAID'
        
        setTransactions((prevTransactions: AdminCoinTransaction[]) => 
          prevTransactions.map((tx: AdminCoinTransaction) => 
            tx.id === transactionId 
              ? { ...tx, status: newStatus, updatedAt: new Date() }
              : tx
          )
        )
        return true
      }
      
      return false
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve transaction')
      return false
    }
  }, [transactions])

  // Reject transaction (unified for all types)
  const rejectTransaction = useCallback(async (transactionId: string, adminNotes: string) => {
    try {
      setError(null)
      
      // Get the transaction to determine its type
      const transaction = transactions.find((tx: AdminCoinTransaction) => tx.id === transactionId)
      if (!transaction) {
        setError('Transaction not found')
        return false
      }
      
      let response
      if (transaction.type === 'EARN') {
        response = await transactionApi.rejectEarnTransaction(transactionId, 'current-admin-id', adminNotes)
      } else if (transaction.type === 'REDEEM') {
        response = await transactionApi.rejectRedeemTransaction(transactionId, 'current-admin-id', adminNotes)
      } else {
        // For other types, use the earn endpoint as fallback
        response = await transactionApi.rejectEarnTransaction(transactionId, 'current-admin-id', adminNotes)
      }
      
      if (response.success) {
        // Update the local transaction state instead of refetching
        setTransactions((prevTransactions: AdminCoinTransaction[]) => 
          prevTransactions.map((tx: AdminCoinTransaction) => 
            tx.id === transactionId 
              ? { ...tx, status: 'REJECTED', updatedAt: new Date() }
              : tx
          )
        )
        return true
      }
      return false
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject transaction')
      return false
    }
  }, [transactions])

  // Process payment
  const processPayment = useCallback(async (
    transactionId: string, 
    paymentTransactionId: string,
    paymentMethod: string,
    paymentAmount: number,
    adminNotes?: string
  ) => {
    try {
      setError(null)
      
      const response = await transactionApi.processPayment(
        transactionId,
        'current-admin-id',
        paymentTransactionId,
        paymentMethod,
        paymentAmount,
        adminNotes
      )
      
      if (response.success) {
        // Update the local transaction state instead of refetching
        setTransactions((prevTransactions: AdminCoinTransaction[]) => 
          prevTransactions.map((tx: AdminCoinTransaction) => 
            tx.id === transactionId 
              ? { ...tx, status: 'PAID', updatedAt: new Date() }
              : tx
          )
        )
        // Only fetch payment stats, not transactions
        await fetchPaymentStats()
        return true
      }
      return false
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process payment')
      return false
    }
  }, [fetchPaymentStats])

  // Create welcome bonus for a user (admin action)
  const createWelcomeBonus = useCallback(async (userId: string, mobileNumber: string) => {
    try {
      setError(null)
      
      const response = await welcomeBonusApi.createWelcomeBonus(userId, 100)
      
      if (response.success) {
        // Only refresh stats, not transactions
        await fetchStats()
        return true
      }
      return false
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create welcome bonus')
      return false
    }
  }, [fetchStats])

  // Auto-refresh coin stats every 30 seconds
  useEffect(() => {
    if (skipInitialFetch) return;
    
    const interval = setInterval(() => {
      fetchStats();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [fetchStats, skipInitialFetch]);

  // Initial fetch
  useEffect(() => {
    if (!skipInitialFetch) {
      fetchStats();
      fetchTransactions();
    }
  }, [fetchStats, fetchTransactions, skipInitialFetch]);

  return {
    // State
    stats,
    transactions,
    transactionStats,
    paymentStats,
    processingOrder,
    loading,
    error,
    pagination,
    
    // Actions
    fetchStats,
    fetchTransactions,
    fetchProcessingOrder,
    fetchPaymentStats,
    getUserSummary,
    approveTransaction,
    rejectTransaction,
    processPayment,
    createWelcomeBonus,
    
    // Utilities
    clearError: () => setError(null)
  }
}
