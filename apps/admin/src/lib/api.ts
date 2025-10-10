import type { 
  Brand, 
  BrandCategory, 
  CreateBrandRequest, 
  UpdateBrandRequest, 
  CreateBrandCategoryRequest, 
  UpdateBrandCategoryRequest,
  CoinTransaction
} from '@/types'
import { getApiBaseUrl } from './env'

const API_BASE_URL = getApiBaseUrl()

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('admin_token')
  }
  return null
}

async function apiRequest<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  }

  // Add authentication token
  const token = getAuthToken()
  if (token) {
    config.headers = { ...config.headers, Authorization: `Bearer ${token}` }
    console.log('API Request with token:', url, 'Token length:', token.length)
  } else {
    console.log('API Request without token:', url)
    console.warn('No authentication token found. User may need to log in again.')
  }

  try {
    const response = await fetch(url, config)
    console.log('API Response status:', response.status, 'for URL:', url)
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const backendMessage = (errorData?.error?.message || errorData?.message)
      const composed = backendMessage || `HTTP ${response.status}`
      throw new ApiError(response.status, composed)
    }

    const responseData = await response.json()
    
    // Handle nested response format from backend
    if (responseData && typeof responseData === 'object' && responseData.success && responseData.data) {
      return responseData.data
    }
    
    return responseData
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiError(0, error instanceof Error ? error.message : 'Network error')
  }
}

// Transaction Management API
export const transactionApi = {
  // Get pending transactions
  getPendingTransactions: (page = 1, limit = 20, type?: 'EARN' | 'REDEEM') =>
    apiRequest<{ success: boolean, message: string, data: { data: CoinTransaction[], total: number, page: number, limit: number, totalPages: number } }>(
      `/admin/coins/transactions/pending?page=${page}&limit=${limit}${type ? `&type=${type}` : ''}`
    ),

  // Get all transactions
  getAllTransactions: (page = 1, limit = 20, userId?: string, queryParams?: string) =>
    apiRequest<{ 
      success: boolean, 
      message: string, 
      data: CoinTransaction[], 
      pagination: {
        page: number,
        limit: number,
        total: number,
        totalPages: number,
        hasNext: boolean,
        hasPrev: boolean
      }
    }>(
      `/admin/coins/transactions${queryParams ? `?${queryParams}` : `?page=${page}&limit=${limit}`}`
    ),

  // Get processing order for sequential transaction processing
  getProcessingOrder: () =>
    apiRequest<{ success: boolean, message: string, data: any[] }>(
      '/admin/coins/transactions/processing-order'
    ),

  // Get user pending requests for verification navigation
  getUserPendingRequests: (userId: string) =>
    apiRequest<{ success: boolean, message: string, data: { data: CoinTransaction[], total: number, page: number, limit: number, totalPages: number } }>(
      `/admin/coins/users/${userId}/pending-transactions`
    ),

  // Get user details for verification form
  getUserDetails: (userId: string) =>
    apiRequest<{ success: boolean, message: string, data: { user: any } }>(
      `/admin/users/${userId}` // Corrected path to admin/users from admin/coins/users
    ),

  // Get complete user verification data (user details + pending requests)
  getUserVerificationData: (userId: string) =>
    apiRequest<{ 
      success: boolean, 
      message: string, 
      data: { 
        user: any, 
        pendingRequests: { 
          data: any[], 
          total: number, 
          page: number, 
          limit: number, 
          totalPages: number 
        } 
      } 
    }>(
      `/admin/coins/users/${userId}/verification-data`
    ),

  // Approve transaction (unified for both EARN and REDEEM)
  approveEarnTransaction: (id: string, adminUserId: string, adminNotes?: string) =>
    apiRequest<{ success: boolean, message: string, data: { transaction: CoinTransaction } }>(
      `/admin/coins/transactions/${id}/approve`,
      {
        method: 'POST',
        body: JSON.stringify({ adminNotes }),
      }
    ),

  // Reject transaction (unified for both EARN and REDEEM)
  rejectEarnTransaction: (id: string, adminUserId: string, adminNotes: string) =>
    apiRequest<{ success: boolean, message: string, data: { transactionId: string, adminNotes: string } }>(
      `/admin/coins/transactions/${id}/reject`,
      {
        method: 'POST',
        body: JSON.stringify({ reason: adminNotes }),
      }
    ),

  // Approve redeem transaction (same endpoint as earn)
  approveRedeemTransaction: (id: string, adminUserId: string, adminNotes?: string) =>
    apiRequest<{ success: boolean, message: string, data: { transaction: CoinTransaction } }>(
      `/admin/coins/transactions/${id}/approve`,
      {
        method: 'POST',
        body: JSON.stringify({ adminNotes }),
      }
    ),

  // Reject redeem transaction (same endpoint as earn)
  rejectRedeemTransaction: (id: string, adminUserId: string, adminNotes: string) =>
    apiRequest<{ success: boolean, message: string, data: { transaction: CoinTransaction } }>(
      `/admin/coins/transactions/${id}/reject`,
      {
        method: 'POST',
        body: JSON.stringify({ reason: adminNotes }),
      }
    ),

  // Mark transaction as paid
  markTransactionAsPaid: (id: string, paymentTransactionId: string, adminNotes?: string) =>
    apiRequest<{ success: boolean, message: string, data: { transaction: CoinTransaction } }>(
      `/admin/coins/transactions/${id}/mark-paid`,
      {
        method: 'POST',
        body: JSON.stringify({ transactionId: paymentTransactionId, adminNotes }),
      }
    ),

  // Process payment
  processPayment: (
    id: string, 
    adminUserId: string, 
    paymentTransactionId: string, 
    paymentMethod: string, 
    paymentAmount: number, 
    adminNotes?: string
  ) =>
    apiRequest<{ success: boolean, message: string, data: { transaction: CoinTransaction } }>(
      `/admin/coins/transactions/${id}/process-payment`,
      {
        method: 'PUT',
        body: JSON.stringify({ 
          adminUserId, 
          paymentTransactionId, 
          paymentMethod, 
          paymentAmount, 
          adminNotes 
        }),
      }
    ),

  // Adjust redeem amount for negative balance users
  adjustRedeemAmount: (id: string, adminUserId: string, newRedeemedAmount: number, adminNotes?: string) =>
    apiRequest<{ success: boolean, message: string, data: { transaction: CoinTransaction } }>(
      `/admin/coins/transactions/${id}/adjust-redeem`,
      {
        method: 'PUT',
        body: JSON.stringify({ 
          adminUserId, 
          newRedeemedAmount, 
          adminNotes 
        }),
      }
    ),

  // Transaction statistics
  getTransactionStats: () =>
    apiRequest<{ success: boolean; message: string; data: any }>(
      '/admin/coins/stats/transactions'
    ),

  // Unified reward request endpoints
  createRewardRequest: (data: {
    brandId: string
    billAmount: number
    billDate: string
    receiptUrl: string
    coinsToRedeem?: number
    notes?: string
  }) =>
    apiRequest<{ success: boolean, message: string, data: any }>(
      '/transactions/rewards',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    ),

  getUserTransactions: (page = 1, limit = 20, filters?: {
    status?: string
    type?: string
    brandId?: string
  }) => {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters,
    })
    return apiRequest<{ success: boolean, message: string, data: { data: CoinTransaction[], total: number, page: number, limit: number, totalPages: number } }>(
      `/transactions?${queryParams}`
    )
  },

  // Comprehensive coin system statistics
  getCoinSystemStats: () =>
    apiRequest<{ success: boolean; message: string; data: any }>(
      '/admin/coins/stats'
    ),

  // Get payment statistics
  getPaymentStats: (startDate?: string, endDate?: string) =>
    apiRequest<{ success: boolean, message: string, data: any }>(
      `/admin/coins/stats/payments${startDate ? `?startDate=${startDate}&endDate=${endDate}` : ''}`
    ),

  // Get payment summary
  getPaymentSummary: (transactionId: string) =>
    apiRequest<{ success: boolean, message: string, data: any }>(
      `/admin/coins/payments/${transactionId}/summary`
    ),
}

// Brand Management API
export const brandApi = {
  // Get all brands
  getAllBrands: (page = 1, limit = 20, query?: string, categoryId?: string, isActive?: boolean, sortBy?: string, sortOrder?: string) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    })
    if (query) params.append('query', query)
    if (categoryId) params.append('categoryId', categoryId)
    // Send as true/false to align with backend boolean parsing
    if (isActive !== undefined) params.append('isActive', String(isActive))
    if (sortBy) params.append('sortBy', sortBy)
    if (sortOrder) params.append('sortOrder', sortOrder)
    
    console.log('API call to /brands with params:', params.toString())
    
    return apiRequest<{ brands: Brand[], total: number, page: number, limit: number, totalPages: number }>(
      `/brands?${params.toString()}`
    )
  },

  // Get active brands
  getActiveBrands: () =>
    apiRequest<Brand[]>('/brands/active'),

  // Get brands by category
  getBrandsByCategory: (categoryId: string) =>
    apiRequest<Brand[]>(`/brands/category/${categoryId}`),

  // Get brand by ID
  getBrand: (id: string) =>
    apiRequest<Brand>(`/brands/${id}`),

  // Create brand
  createBrand: (data: CreateBrandRequest) =>
    apiRequest<Brand>('/brands', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Update brand
  updateBrand: (id: string, data: UpdateBrandRequest) =>
    apiRequest<Brand>(`/brands/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  // Toggle brand status
  toggleBrandStatus: (id: string) =>
    apiRequest<Brand>(`/brands/${id}/toggle-status`, {
      method: 'PATCH',
    }),

  // Delete brand
  deleteBrand: (id: string) =>
    apiRequest<{ success: boolean, message: string }>(`/brands/${id}`, {
      method: 'DELETE',
    }),
}

// Category Management API
export const categoryApi = {
  // Get all categories
  getAllCategories: () =>
    apiRequest<BrandCategory[]>('/brand-categories'),

  // Get category by ID
  getCategory: (id: string) =>
    apiRequest<BrandCategory>(`/brand-categories/${id}`),

  // Create category
  createCategory: (data: CreateBrandCategoryRequest) =>
    apiRequest<BrandCategory>('/brand-categories', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Update category
  updateCategory: (id: string, data: UpdateBrandCategoryRequest) =>
    apiRequest<BrandCategory>(`/brand-categories/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  // Delete category
  deleteCategory: (id: string) =>
    apiRequest<{ success: boolean, message: string }>(`/brand-categories/${id}`, {
      method: 'DELETE',
    }),
}

// User Management API
export const userApi = {
  // Get all users
  getAllUsers: () =>
    apiRequest<{ success: boolean, message: string, data: { data: any[], total: number, page: number, limit: number, totalPages: number } }>(
      '/admin/users'
    ),

  // Get user statistics
  getUserStats: () =>
    apiRequest<{ success: boolean, message: string, data: any }>(
      '/admin/users/stats'
    ),

  // Get user by ID
  getUserById: (userId: string) =>
    apiRequest<{ success: boolean, message: string, data: any }>(
      `/admin/users/${userId}`
    ),

  // Create user (minimal)
  createUser: (payload: { firstName: string; lastName: string; mobileNumber: string; email?: string }) =>
    apiRequest<{ success: boolean, message: string, data: any }>(
      `/admin/users`,
      {
        method: 'POST',
        body: JSON.stringify(payload)
      }
    ),

  // Update user profile
  updateUserProfile: (userId: string, payload: any) =>
    apiRequest<{ success: boolean, message: string, data: any }>(
      `/admin/users/${userId}/profile`,
      {
        method: 'PUT',
        body: JSON.stringify(payload)
      }
    ),

  // Update user email
  updateUserEmail: (userId: string, email: string) =>
    apiRequest<{ success: boolean, message: string, data: any }>(
      `/admin/users/${userId}/email`,
      {
        method: 'PUT',
        body: JSON.stringify({ email })
      }
    ),

  // Update user status
  updateUserStatus: (userId: string, status: 'ACTIVE' | 'PENDING' | 'SUSPENDED' | 'DELETED') =>
    apiRequest<{ success: boolean, message: string, data: any }>(
      `/admin/users/${userId}/status`,
      {
        method: 'PUT',
        body: JSON.stringify({ status })
      }
    ),

  // Soft delete user
  deleteUser: (userId: string) =>
    apiRequest<{ success: boolean, message: string, data: any }>(
      `/admin/users/${userId}`,
      { method: 'DELETE' }
    ),

  // Get user balance
  getUserBalance: (userId: string) =>
    apiRequest<{ success: boolean, message: string, data: { balance: any } }>(
      `/admin/coins/balance/${userId}`
    ),

  // Get user transaction summary
  getUserTransactionSummary: (userId: string) =>
    apiRequest<{ success: boolean, message: string, data: any }>(
      `/admin/coins/summary/${userId}`
    ),

  // Get user transactions
  getUserTransactions: (userId: string, page = 1, limit = 20) =>
    apiRequest<{ success: boolean, message: string, data: any }>(
      `/admin/coins/transactions?userId=${userId}&page=${page}&limit=${limit}`
    ),

  // Adjust user coins (set absolute or delta)
  adjustUserCoins: (userId: string, payload: { newBalance?: number; delta?: number; reason?: string }) =>
    apiRequest<{ success: boolean, message: string, data: any }>(
      `/admin/users/${userId}/coins`,
      {
        method: 'PUT',
        body: JSON.stringify({
          ...payload,
          newBalance: typeof payload.newBalance === 'number' ? Math.round(payload.newBalance) : undefined,
          delta: typeof payload.delta === 'number' ? Math.round(payload.delta) : undefined,
        })
      }
    ),
}

// Welcome Bonus API
export const welcomeBonusApi = {
  // Create welcome bonus
  createWelcomeBonus: (userId: string, amount: number = 100) =>
    apiRequest<{ success: boolean, message: string, data: any }>(
      '/admin/coins/welcome-bonus',
      {
        method: 'POST',
        body: JSON.stringify({ userId, amount }),
      }
    ),
}

export { ApiError }
