// Mock API responses for testing
export const mockApiResponses = {
  // Auth responses
  login: {
    success: true,
    message: 'Login successful',
    data: {
      token: 'mock-jwt-token',
      admin: {
        id: 'admin-1',
        email: 'admin@clubcorra.com',
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN',
      },
    },
  },

  // Dashboard responses
  dashboardMetrics: {
    success: true,
    message: 'Dashboard metrics retrieved successfully',
    data: {
      totalUsers: 1250,
      activeUsers: 1100,
      totalTransactions: 5670,
      pendingTransactions: 45,
      totalRevenue: 125000,
      monthlyGrowth: 12.5,
      userGrowth: 8.3,
      transactionGrowth: 15.2,
      revenueGrowth: 18.7,
    },
    timestamp: new Date().toISOString(),
    cacheExpiry: new Date(Date.now() + 300000).toISOString(),
  },

  realtimeMetrics: {
    success: true,
    message: 'Real-time metrics retrieved successfully',
    data: {
      activeUsers: 45,
      pendingTransactions: 12,
      systemHealth: 'HEALTHY',
      lastUpdate: new Date().toISOString(),
    },
    timestamp: new Date().toISOString(),
    cacheExpiry: new Date(Date.now() + 60000).toISOString(),
  },

  // Brand responses
  brands: {
    success: true,
    message: 'Brands retrieved successfully',
    data: {
      brands: [
        {
          id: 'brand-1',
          name: 'Test Brand 1',
          description: 'Test brand description',
          logo: 'https://example.com/logo1.png',
          website: 'https://brand1.com',
          isActive: true,
          category: {
            id: 'cat-1',
            name: 'Retail',
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'brand-2',
          name: 'Test Brand 2',
          description: 'Another test brand',
          logo: 'https://example.com/logo2.png',
          website: 'https://brand2.com',
          isActive: false,
          category: {
            id: 'cat-2',
            name: 'Food & Beverage',
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      total: 2,
      page: 1,
      limit: 20,
      totalPages: 1,
    },
  },

  brandCategories: {
    success: true,
    message: 'Brand categories retrieved successfully',
    data: [
      {
        id: 'cat-1',
        name: 'Retail',
        description: 'Retail brands',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'cat-2',
        name: 'Food & Beverage',
        description: 'Food and beverage brands',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
  },

  // User responses
  users: {
    success: true,
    message: 'Users retrieved successfully',
    data: {
      users: [
        {
          id: 'user-1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          mobileNumber: '+1234567890',
          status: 'ACTIVE',
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
        },
        {
          id: 'user-2',
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane@example.com',
          mobileNumber: '+1234567891',
          status: 'PENDING',
          createdAt: new Date().toISOString(),
          lastLoginAt: null,
        },
      ],
      total: 2,
      page: 1,
      limit: 20,
      totalPages: 1,
    },
  },

  userStats: {
    success: true,
    message: 'User statistics retrieved successfully',
    data: {
      totalUsers: 1250,
      activeUsers: 1100,
      pendingUsers: 50,
      suspendedUsers: 25,
      deletedUsers: 75,
      newUsersToday: 12,
      newUsersThisWeek: 85,
      newUsersThisMonth: 320,
    },
  },

  // Transaction responses
  transactions: {
    success: true,
    message: 'Transactions retrieved successfully',
    data: {
      transactions: [
        {
          id: 'txn-1',
          userId: 'user-1',
          type: 'EARN',
          amount: 100,
          status: 'PENDING',
          description: 'Welcome bonus',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'txn-2',
          userId: 'user-2',
          type: 'REDEEM',
          amount: 50,
          status: 'APPROVED',
          description: 'Redeemed for gift card',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      total: 2,
      page: 1,
      limit: 20,
      totalPages: 1,
    },
  },

  transactionStats: {
    success: true,
    message: 'Transaction statistics retrieved successfully',
    data: {
      totalTransactions: 5670,
      pendingTransactions: 45,
      approvedTransactions: 5200,
      rejectedTransactions: 425,
      totalEarned: 125000,
      totalRedeemed: 85000,
      netBalance: 40000,
    },
  },

  // Error responses
  unauthorized: {
    success: false,
    message: 'Unauthorized access',
    error: {
      code: 'UNAUTHORIZED',
      message: 'Invalid or missing authentication token',
    },
  },

  notFound: {
    success: false,
    message: 'Resource not found',
    error: {
      code: 'NOT_FOUND',
      message: 'The requested resource was not found',
    },
  },

  validationError: {
    success: false,
    message: 'Validation failed',
    error: {
      code: 'VALIDATION_ERROR',
      message: 'Invalid input data',
      details: [
        {
          field: 'email',
          message: 'Invalid email format',
        },
      ],
    },
  },

  serverError: {
    success: false,
    message: 'Internal server error',
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    },
  },
}

// Mock fetch function
export const mockFetch = (url: string, options?: RequestInit) => {
  return new Promise((resolve, reject) => {
    // Simulate network delay
    setTimeout(() => {
      const response = {
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockApiResponses.dashboardMetrics),
      }

      // Mock different responses based on URL
      if (url.includes('/auth/login')) {
        response.json = () => Promise.resolve(mockApiResponses.login)
      } else if (url.includes('/admin/dashboard/metrics')) {
        response.json = () => Promise.resolve(mockApiResponses.dashboardMetrics)
      } else if (url.includes('/admin/dashboard/metrics/realtime')) {
        response.json = () => Promise.resolve(mockApiResponses.realtimeMetrics)
      } else if (url.includes('/brands')) {
        response.json = () => Promise.resolve(mockApiResponses.brands)
      } else if (url.includes('/brand-categories')) {
        response.json = () => Promise.resolve(mockApiResponses.brandCategories)
      } else if (url.includes('/admin/users')) {
        response.json = () => Promise.resolve(mockApiResponses.users)
      } else if (url.includes('/admin/coins/transactions')) {
        response.json = () => Promise.resolve(mockApiResponses.transactions)
      } else if (url.includes('/admin/coins/stats')) {
        response.json = () => Promise.resolve(mockApiResponses.transactionStats)
      }

      resolve(response as Response)
    }, 100)
  })
}

// Mock localStorage
export const mockLocalStorage = {
  getItem: jest.fn((key: string) => {
    if (key === 'admin_token') {
      return 'mock-jwt-token'
    }
    return null
  }),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
