import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals'

// API endpoint testing configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api/v1'
const TEST_ADMIN_CREDENTIALS = {
  email: process.env.TEST_ADMIN_EMAIL || 'admin@clubcorra.com',
  password: process.env.TEST_ADMIN_PASSWORD || 'admin123'
}

let authToken: string | null = null

// Helper function to make authenticated API calls
async function apiCall(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`
  const headers = {
    'Content-Type': 'application/json',
    ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
    ...options.headers
  }

  const response = await fetch(url, {
    ...options,
    headers
  })

  return {
    status: response.status,
    ok: response.ok,
    data: response.ok ? await response.json() : null,
    error: !response.ok ? await response.text() : null
  }
}

// Helper function to login and get auth token
async function loginAdmin() {
  const response = await apiCall('/auth/login', {
    method: 'POST',
    body: JSON.stringify(TEST_ADMIN_CREDENTIALS)
  })

  if (response.ok && response.data?.token) {
    authToken = response.data.token
    return true
  }
  return false
}

describe('API Endpoint Tests', () => {
  beforeAll(async () => {
    // Login before running tests
    const loginSuccess = await loginAdmin()
    if (!loginSuccess) {
      throw new Error('Failed to login with test admin credentials')
    }
  })

  afterAll(async () => {
    // Cleanup if needed
    authToken = null
  })

  describe('Authentication Endpoints', () => {
    it('should login admin successfully', async () => {
      const response = await apiCall('/auth/login', {
        method: 'POST',
        body: JSON.stringify(TEST_ADMIN_CREDENTIALS)
      })

      expect(response.ok).toBe(true)
      expect(response.data).toHaveProperty('token')
      expect(response.data).toHaveProperty('user')
    })

    it('should reject invalid credentials', async () => {
      const response = await apiCall('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'invalid@example.com',
          password: 'wrongpassword'
        })
      })

      expect(response.ok).toBe(false)
      expect(response.status).toBe(401)
    })
  })

  describe('Dashboard Endpoints', () => {
    it('should get dashboard metrics', async () => {
      const response = await apiCall('/admin/dashboard/metrics')

      expect(response.ok).toBe(true)
      expect(response.data).toHaveProperty('totalUsers')
      expect(response.data).toHaveProperty('totalTransactions')
      expect(response.data).toHaveProperty('totalBrands')
    })

    it('should get real-time metrics', async () => {
      const response = await apiCall('/admin/dashboard/metrics/realtime')

      expect(response.ok).toBe(true)
      expect(response.data).toHaveProperty('activeUsers')
      expect(response.data).toHaveProperty('pendingTransactions')
    })

    it('should get transaction trends', async () => {
      const response = await apiCall('/admin/dashboard/trends/transactions')

      expect(response.ok).toBe(true)
      expect(Array.isArray(response.data)).toBe(true)
    })

    it('should get user growth trends', async () => {
      const response = await apiCall('/admin/dashboard/trends/users')

      expect(response.ok).toBe(true)
      expect(Array.isArray(response.data)).toBe(true)
    })

    it('should get brand performance analytics', async () => {
      const response = await apiCall('/admin/dashboard/analytics/brands')

      expect(response.ok).toBe(true)
      expect(Array.isArray(response.data)).toBe(true)
    })

    it('should get saved views', async () => {
      const response = await apiCall('/admin/dashboard/saved-views')

      expect(response.ok).toBe(true)
      expect(Array.isArray(response.data)).toBe(true)
    })

    it('should get risk signals', async () => {
      const response = await apiCall('/admin/dashboard/risk-signals')

      expect(response.ok).toBe(true)
      expect(Array.isArray(response.data)).toBe(true)
    })

    it('should get active experiments', async () => {
      const response = await apiCall('/admin/dashboard/experiments')

      expect(response.ok).toBe(true)
      expect(Array.isArray(response.data)).toBe(true)
    })

    it('should get financial reconciliation', async () => {
      const response = await apiCall('/admin/dashboard/financial-reconciliation')

      expect(response.ok).toBe(true)
      expect(response.data).toHaveProperty('totalRevenue')
      expect(response.data).toHaveProperty('totalPayouts')
    })
  })

  describe('Brand Management Endpoints', () => {
    it('should list brands with pagination', async () => {
      const response = await apiCall('/brands?page=1&limit=10')

      expect(response.ok).toBe(true)
      expect(response.data).toHaveProperty('data')
      expect(response.data).toHaveProperty('total')
      expect(response.data).toHaveProperty('page')
      expect(response.data).toHaveProperty('limit')
      expect(Array.isArray(response.data.data)).toBe(true)
    })

    it('should search brands', async () => {
      const response = await apiCall('/brands?search=test')

      expect(response.ok).toBe(true)
      expect(Array.isArray(response.data.data)).toBe(true)
    })

    it('should filter brands by status', async () => {
      const response = await apiCall('/brands?status=active')

      expect(response.ok).toBe(true)
      expect(Array.isArray(response.data.data)).toBe(true)
    })

    it('should get active brands', async () => {
      const response = await apiCall('/brands/active')

      expect(response.ok).toBe(true)
      expect(Array.isArray(response.data)).toBe(true)
    })

    it('should get brand by ID', async () => {
      // First get a list to find an existing brand ID
      const listResponse = await apiCall('/brands?limit=1')
      
      if (listResponse.ok && listResponse.data.data.length > 0) {
        const brandId = listResponse.data.data[0].id
        const response = await apiCall(`/brands/${brandId}`)

        expect(response.ok).toBe(true)
        expect(response.data).toHaveProperty('id')
        expect(response.data).toHaveProperty('name')
      }
    })

    it('should create a new brand', async () => {
      const newBrand = {
        name: `Test Brand ${Date.now()}`,
        description: 'Test brand created by API test',
        categoryId: '1', // Assuming category exists
        isActive: true
      }

      const response = await apiCall('/brands', {
        method: 'POST',
        body: JSON.stringify(newBrand)
      })

      expect(response.ok).toBe(true)
      expect(response.data).toHaveProperty('id')
      expect(response.data.name).toBe(newBrand.name)
    })

    it('should update a brand', async () => {
      // First create a brand
      const newBrand = {
        name: `Update Test Brand ${Date.now()}`,
        description: 'Brand to be updated',
        categoryId: '1',
        isActive: true
      }

      const createResponse = await apiCall('/brands', {
        method: 'POST',
        body: JSON.stringify(newBrand)
      })

      if (createResponse.ok) {
        const brandId = createResponse.data.id
        const updateData = {
          name: `Updated Brand ${Date.now()}`,
          description: 'Updated description'
        }

        const response = await apiCall(`/brands/${brandId}`, {
          method: 'PATCH',
          body: JSON.stringify(updateData)
        })

        expect(response.ok).toBe(true)
        expect(response.data.name).toBe(updateData.name)
      }
    })

    it('should toggle brand status', async () => {
      // First create a brand
      const newBrand = {
        name: `Toggle Test Brand ${Date.now()}`,
        description: 'Brand for status toggle test',
        categoryId: '1',
        isActive: true
      }

      const createResponse = await apiCall('/brands', {
        method: 'POST',
        body: JSON.stringify(newBrand)
      })

      if (createResponse.ok) {
        const brandId = createResponse.data.id

        const response = await apiCall(`/brands/${brandId}/toggle-status`, {
          method: 'PATCH'
        })

        expect(response.ok).toBe(true)
        expect(response.data).toHaveProperty('isActive')
      }
    })
  })

  describe('Brand Categories Endpoints', () => {
    it('should list brand categories', async () => {
      const response = await apiCall('/brand-categories')

      expect(response.ok).toBe(true)
      expect(Array.isArray(response.data)).toBe(true)
    })

    it('should get category by ID', async () => {
      // First get a list to find an existing category ID
      const listResponse = await apiCall('/brand-categories')
      
      if (listResponse.ok && listResponse.data.length > 0) {
        const categoryId = listResponse.data[0].id
        const response = await apiCall(`/brand-categories/${categoryId}`)

        expect(response.ok).toBe(true)
        expect(response.data).toHaveProperty('id')
        expect(response.data).toHaveProperty('name')
      }
    })

    it('should create a new category', async () => {
      const newCategory = {
        name: `Test Category ${Date.now()}`,
        description: 'Test category created by API test'
      }

      const response = await apiCall('/brand-categories', {
        method: 'POST',
        body: JSON.stringify(newCategory)
      })

      expect(response.ok).toBe(true)
      expect(response.data).toHaveProperty('id')
      expect(response.data.name).toBe(newCategory.name)
    })
  })

  describe('User Management Endpoints', () => {
    it('should list users with pagination', async () => {
      const response = await apiCall('/admin/users?page=1&limit=10')

      expect(response.ok).toBe(true)
      expect(response.data).toHaveProperty('data')
      expect(response.data).toHaveProperty('total')
      expect(Array.isArray(response.data.data)).toBe(true)
    })

    it('should search users', async () => {
      const response = await apiCall('/admin/users?search=test')

      expect(response.ok).toBe(true)
      expect(Array.isArray(response.data.data)).toBe(true)
    })

    it('should get user statistics', async () => {
      const response = await apiCall('/admin/users/stats')

      expect(response.ok).toBe(true)
      expect(response.data).toHaveProperty('totalUsers')
      expect(response.data).toHaveProperty('activeUsers')
    })

    it('should get user by ID', async () => {
      // First get a list to find an existing user ID
      const listResponse = await apiCall('/admin/users?limit=1')
      
      if (listResponse.ok && listResponse.data.data.length > 0) {
        const userId = listResponse.data.data[0].id
        const response = await apiCall(`/admin/users/${userId}`)

        expect(response.ok).toBe(true)
        expect(response.data).toHaveProperty('id')
        expect(response.data).toHaveProperty('email')
      }
    })
  })

  describe('Transaction Management Endpoints', () => {
    it('should get pending transactions', async () => {
      const response = await apiCall('/admin/coins/transactions/pending')

      expect(response.ok).toBe(true)
      expect(Array.isArray(response.data)).toBe(true)
    })

    it('should get all transactions', async () => {
      const response = await apiCall('/admin/coins/transactions')

      expect(response.ok).toBe(true)
      expect(Array.isArray(response.data)).toBe(true)
    })

    it('should get transaction statistics', async () => {
      const response = await apiCall('/admin/coins/stats/transactions')

      expect(response.ok).toBe(true)
      expect(response.data).toHaveProperty('totalTransactions')
      expect(response.data).toHaveProperty('pendingTransactions')
    })

    it('should get system statistics', async () => {
      const response = await apiCall('/admin/coins/stats/system')

      expect(response.ok).toBe(true)
      expect(response.data).toHaveProperty('totalCoins')
      expect(response.data).toHaveProperty('activeUsers')
    })

    it('should get payment statistics', async () => {
      const response = await apiCall('/admin/coins/stats/payments')

      expect(response.ok).toBe(true)
      expect(response.data).toHaveProperty('totalPayments')
      expect(response.data).toHaveProperty('totalAmount')
    })
  })

  describe('Form Submissions Endpoints', () => {
    it('should list form submissions', async () => {
      const response = await apiCall('/admin/form-submissions')

      expect(response.ok).toBe(true)
      expect(Array.isArray(response.data)).toBe(true)
    })

    it('should get form submission by ID', async () => {
      // First get a list to find an existing submission ID
      const listResponse = await apiCall('/admin/form-submissions')
      
      if (listResponse.ok && listResponse.data.length > 0) {
        const submissionId = listResponse.data[0].id
        const response = await apiCall(`/admin/form-submissions/${submissionId}`)

        expect(response.ok).toBe(true)
        expect(response.data).toHaveProperty('id')
        expect(response.data).toHaveProperty('formData')
      }
    })
  })

  describe('Error Handling', () => {
    it('should return 404 for non-existent endpoints', async () => {
      const response = await apiCall('/non-existent-endpoint')

      expect(response.ok).toBe(false)
      expect(response.status).toBe(404)
    })

    it('should return 401 for protected endpoints without auth', async () => {
      // Temporarily remove auth token
      const originalToken = authToken
      authToken = null

      const response = await apiCall('/admin/dashboard/metrics')

      expect(response.ok).toBe(false)
      expect(response.status).toBe(401)

      // Restore auth token
      authToken = originalToken
    })

    it('should return 400 for invalid request data', async () => {
      const response = await apiCall('/brands', {
        method: 'POST',
        body: JSON.stringify({ invalid: 'data' })
      })

      expect(response.ok).toBe(false)
      expect(response.status).toBe(400)
    })
  })

  describe('Performance Tests', () => {
    it('should respond to dashboard metrics within 2 seconds', async () => {
      const startTime = Date.now()
      const response = await apiCall('/admin/dashboard/metrics')
      const endTime = Date.now()

      expect(response.ok).toBe(true)
      expect(endTime - startTime).toBeLessThan(2000)
    })

    it('should handle concurrent requests', async () => {
      const promises = Array(5).fill(null).map(() => 
        apiCall('/admin/dashboard/metrics')
      )

      const responses = await Promise.all(promises)

      responses.forEach(response => {
        expect(response.ok).toBe(true)
      })
    })
  })
})
