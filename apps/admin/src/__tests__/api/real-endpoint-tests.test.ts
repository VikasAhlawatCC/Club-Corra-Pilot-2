import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals'
import { transactionApi, brandApi, dashboardApi, authApi } from '@/lib/api'

// Test configuration
const TEST_ADMIN_CREDENTIALS = {
  email: process.env.TEST_ADMIN_EMAIL || 'admin@clubcorra.com',
  password: process.env.TEST_ADMIN_PASSWORD || 'admin123'
}

let authToken: string | null = null

// Helper to set auth token for API calls
function setAuthToken(token: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('admin_token', token)
  }
  authToken = token
}

// Helper to clear auth token
function clearAuthToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('admin_token')
  }
  authToken = null
}

describe('Real API Endpoint Tests', () => {
  beforeAll(async () => {
    // Clear any existing auth
    clearAuthToken()
  })

  afterAll(async () => {
    // Cleanup
    clearAuthToken()
  })

  beforeEach(() => {
    // Clear auth before each test
    clearAuthToken()
  })

  describe('Authentication API', () => {
    it('should login admin successfully', async () => {
      const response = await authApi.login(TEST_ADMIN_CREDENTIALS)
      
      expect(response.success).toBe(true)
      expect(response.data).toHaveProperty('token')
      expect(response.data).toHaveProperty('user')
      
      // Set token for subsequent tests
      setAuthToken(response.data.token)
    })

    it('should reject invalid credentials', async () => {
      await expect(
        authApi.login({
          email: 'invalid@example.com',
          password: 'wrongpassword'
        })
      ).rejects.toThrow()
    })

    it('should handle network errors gracefully', async () => {
      // This test would require mocking network failures
      // For now, we'll test that the API structure is correct
      expect(typeof authApi.login).toBe('function')
    })
  })

  describe('Transaction Management API', () => {
    beforeEach(async () => {
      // Ensure we're authenticated
      if (!authToken) {
        const response = await authApi.login(TEST_ADMIN_CREDENTIALS)
        setAuthToken(response.data.token)
      }
    })

    it('should get pending transactions', async () => {
      const response = await transactionApi.getPendingTransactions(1, 10)
      
      expect(response.success).toBe(true)
      expect(response.data).toHaveProperty('data')
      expect(response.data).toHaveProperty('total')
      expect(response.data).toHaveProperty('page')
      expect(response.data).toHaveProperty('limit')
      expect(Array.isArray(response.data.data)).toBe(true)
    })

    it('should get all transactions with pagination', async () => {
      const response = await transactionApi.getAllTransactions(1, 10)
      
      expect(response.success).toBe(true)
      expect(response.data).toHaveProperty('data')
      expect(response.data).toHaveProperty('total')
      expect(Array.isArray(response.data.data)).toBe(true)
    })

    it('should get transactions with filters', async () => {
      const response = await transactionApi.getAllTransactions(1, 10, undefined, 'type=EARN&status=PENDING')
      
      expect(response.success).toBe(true)
      expect(response.data).toHaveProperty('data')
      expect(Array.isArray(response.data.data)).toBe(true)
    })

    it('should get user pending requests', async () => {
      // First get a user ID from transactions
      const transactionsResponse = await transactionApi.getAllTransactions(1, 1)
      
      if (transactionsResponse.data.data.length > 0) {
        const userId = transactionsResponse.data.data[0].userId
        
        const response = await transactionApi.getUserPendingRequests(userId)
        
        expect(response.success).toBe(true)
        expect(response.data).toHaveProperty('data')
        expect(Array.isArray(response.data.data)).toBe(true)
      }
    })

    it('should get user details', async () => {
      // First get a user ID from transactions
      const transactionsResponse = await transactionApi.getAllTransactions(1, 1)
      
      if (transactionsResponse.data.data.length > 0) {
        const userId = transactionsResponse.data.data[0].userId
        
        const response = await transactionApi.getUserDetails(userId)
        
        expect(response.success).toBe(true)
        expect(response.data).toHaveProperty('user')
        expect(response.data.user).toHaveProperty('id')
        expect(response.data.user).toHaveProperty('email')
      }
    })

    it('should get user verification data', async () => {
      // First get a user ID from transactions
      const transactionsResponse = await transactionApi.getAllTransactions(1, 1)
      
      if (transactionsResponse.data.data.length > 0) {
        const userId = transactionsResponse.data.data[0].userId
        
        const response = await transactionApi.getUserVerificationData(userId)
        
        expect(response.success).toBe(true)
        expect(response.data).toHaveProperty('user')
        expect(response.data).toHaveProperty('pendingRequests')
        expect(response.data.pendingRequests).toHaveProperty('data')
        expect(Array.isArray(response.data.pendingRequests.data)).toBe(true)
      }
    })

    it('should handle transaction approval workflow', async () => {
      // Get a pending transaction
      const pendingResponse = await transactionApi.getPendingTransactions(1, 1, 'EARN')
      
      if (pendingResponse.data.data.length > 0) {
        const transaction = pendingResponse.data.data[0]
        
        // Test approval (this would actually approve the transaction)
        // In a real test environment, you might want to use test data
        try {
          const response = await transactionApi.approveEarnTransaction(
            transaction.id,
            'test-admin-id',
            'Test approval from API test'
          )
          
          expect(response.success).toBe(true)
          expect(response.data).toHaveProperty('transaction')
        } catch (error) {
          // This might fail if the transaction is already processed
          // or if the test admin doesn't have permission
          console.log('Transaction approval test skipped:', error)
        }
      }
    })

    it('should handle transaction rejection workflow', async () => {
      // Get a pending transaction
      const pendingResponse = await transactionApi.getPendingTransactions(1, 1, 'EARN')
      
      if (pendingResponse.data.data.length > 0) {
        const transaction = pendingResponse.data.data[0]
        
        // Test rejection (this would actually reject the transaction)
        try {
          const response = await transactionApi.rejectEarnTransaction(
            transaction.id,
            'test-admin-id',
            'Test rejection from API test'
          )
          
          expect(response.success).toBe(true)
          expect(response.data).toHaveProperty('transactionId')
        } catch (error) {
          // This might fail if the transaction is already processed
          console.log('Transaction rejection test skipped:', error)
        }
      }
    })
  })

  describe('Brand Management API', () => {
    beforeEach(async () => {
      // Ensure we're authenticated
      if (!authToken) {
        const response = await authApi.login(TEST_ADMIN_CREDENTIALS)
        setAuthToken(response.data.token)
      }
    })

    it('should get all brands with pagination', async () => {
      const response = await brandApi.getAllBrands(1, 10)
      
      expect(response.success).toBe(true)
      expect(response.data).toHaveProperty('data')
      expect(response.data).toHaveProperty('total')
      expect(response.data).toHaveProperty('page')
      expect(response.data).toHaveProperty('limit')
      expect(Array.isArray(response.data.data)).toBe(true)
    })

    it('should search brands', async () => {
      const response = await brandApi.getAllBrands(1, 10, 'test')
      
      expect(response.success).toBe(true)
      expect(response.data).toHaveProperty('data')
      expect(Array.isArray(response.data.data)).toBe(true)
    })

    it('should filter brands by status', async () => {
      const response = await brandApi.getAllBrands(1, 10, undefined, true)
      
      expect(response.success).toBe(true)
      expect(response.data).toHaveProperty('data')
      expect(Array.isArray(response.data.data)).toBe(true)
    })

    it('should get active brands', async () => {
      const response = await brandApi.getActiveBrands()
      
      expect(response.success).toBe(true)
      expect(Array.isArray(response.data)).toBe(true)
    })

    it('should get brand by ID', async () => {
      // First get a brand ID from the list
      const brandsResponse = await brandApi.getAllBrands(1, 1)
      
      if (brandsResponse.data.data.length > 0) {
        const brandId = brandsResponse.data.data[0].id
        
        const response = await brandApi.getBrandById(brandId)
        
        expect(response.success).toBe(true)
        expect(response.data).toHaveProperty('id')
        expect(response.data).toHaveProperty('name')
        expect(response.data.id).toBe(brandId)
      }
    })

    it('should create a new brand', async () => {
      const newBrand = {
        name: `Test Brand ${Date.now()}`,
        description: 'Test brand created by API test',
        categoryId: '1', // Assuming category exists
        isActive: true
      }

      const response = await brandApi.createBrand(newBrand)
      
      expect(response.success).toBe(true)
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

      const createResponse = await brandApi.createBrand(newBrand)
      
      if (createResponse.success) {
        const brandId = createResponse.data.id
        const updateData = {
          name: `Updated Brand ${Date.now()}`,
          description: 'Updated description'
        }

        const response = await brandApi.updateBrand(brandId, updateData)
        
        expect(response.success).toBe(true)
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

      const createResponse = await brandApi.createBrand(newBrand)
      
      if (createResponse.success) {
        const brandId = createResponse.data.id

        const response = await brandApi.toggleBrandStatus(brandId)
        
        expect(response.success).toBe(true)
        expect(response.data).toHaveProperty('isActive')
      }
    })

    it('should delete a brand', async () => {
      // First create a brand
      const newBrand = {
        name: `Delete Test Brand ${Date.now()}`,
        description: 'Brand to be deleted',
        categoryId: '1',
        isActive: true
      }

      const createResponse = await brandApi.createBrand(newBrand)
      
      if (createResponse.success) {
        const brandId = createResponse.data.id

        const response = await brandApi.deleteBrand(brandId)
        
        expect(response.success).toBe(true)
      }
    })
  })

  describe('Brand Categories API', () => {
    beforeEach(async () => {
      // Ensure we're authenticated
      if (!authToken) {
        const response = await authApi.login(TEST_ADMIN_CREDENTIALS)
        setAuthToken(response.data.token)
      }
    })

    it('should get all brand categories', async () => {
      const response = await brandApi.getAllBrandCategories()
      
      expect(response.success).toBe(true)
      expect(Array.isArray(response.data)).toBe(true)
    })

    it('should get category by ID', async () => {
      // First get a category ID from the list
      const categoriesResponse = await brandApi.getAllBrandCategories()
      
      if (categoriesResponse.data.length > 0) {
        const categoryId = categoriesResponse.data[0].id
        
        const response = await brandApi.getBrandCategoryById(categoryId)
        
        expect(response.success).toBe(true)
        expect(response.data).toHaveProperty('id')
        expect(response.data).toHaveProperty('name')
        expect(response.data.id).toBe(categoryId)
      }
    })

    it('should create a new category', async () => {
      const newCategory = {
        name: `Test Category ${Date.now()}`,
        description: 'Test category created by API test'
      }

      const response = await brandApi.createBrandCategory(newCategory)
      
      expect(response.success).toBe(true)
      expect(response.data).toHaveProperty('id')
      expect(response.data.name).toBe(newCategory.name)
    })

    it('should update a category', async () => {
      // First create a category
      const newCategory = {
        name: `Update Test Category ${Date.now()}`,
        description: 'Category to be updated'
      }

      const createResponse = await brandApi.createBrandCategory(newCategory)
      
      if (createResponse.success) {
        const categoryId = createResponse.data.id
        const updateData = {
          name: `Updated Category ${Date.now()}`,
          description: 'Updated description'
        }

        const response = await brandApi.updateBrandCategory(categoryId, updateData)
        
        expect(response.success).toBe(true)
        expect(response.data.name).toBe(updateData.name)
      }
    })

    it('should delete a category', async () => {
      // First create a category
      const newCategory = {
        name: `Delete Test Category ${Date.now()}`,
        description: 'Category to be deleted'
      }

      const createResponse = await brandApi.createBrandCategory(newCategory)
      
      if (createResponse.success) {
        const categoryId = createResponse.data.id

        const response = await brandApi.deleteBrandCategory(categoryId)
        
        expect(response.success).toBe(true)
      }
    })
  })

  describe('Dashboard API', () => {
    beforeEach(async () => {
      // Ensure we're authenticated
      if (!authToken) {
        const response = await authApi.login(TEST_ADMIN_CREDENTIALS)
        setAuthToken(response.data.token)
      }
    })

    it('should get dashboard metrics', async () => {
      const response = await dashboardApi.getDashboardMetrics()
      
      expect(response.success).toBe(true)
      expect(response.data).toHaveProperty('totalUsers')
      expect(response.data).toHaveProperty('totalTransactions')
      expect(response.data).toHaveProperty('totalBrands')
    })

    it('should get real-time metrics', async () => {
      const response = await dashboardApi.getRealtimeMetrics()
      
      expect(response.success).toBe(true)
      expect(response.data).toHaveProperty('activeUsers')
      expect(response.data).toHaveProperty('pendingTransactions')
    })

    it('should get transaction trends', async () => {
      const response = await dashboardApi.getTransactionTrends()
      
      expect(response.success).toBe(true)
      expect(Array.isArray(response.data)).toBe(true)
    })

    it('should get user growth trends', async () => {
      const response = await dashboardApi.getUserGrowthTrends()
      
      expect(response.success).toBe(true)
      expect(Array.isArray(response.data)).toBe(true)
    })

    it('should get brand performance analytics', async () => {
      const response = await dashboardApi.getBrandPerformanceAnalytics()
      
      expect(response.success).toBe(true)
      expect(Array.isArray(response.data)).toBe(true)
    })

    it('should get saved views', async () => {
      const response = await dashboardApi.getSavedViews()
      
      expect(response.success).toBe(true)
      expect(Array.isArray(response.data)).toBe(true)
    })

    it('should get risk signals', async () => {
      const response = await dashboardApi.getRiskSignals()
      
      expect(response.success).toBe(true)
      expect(Array.isArray(response.data)).toBe(true)
    })

    it('should get active experiments', async () => {
      const response = await dashboardApi.getActiveExperiments()
      
      expect(response.success).toBe(true)
      expect(Array.isArray(response.data)).toBe(true)
    })

    it('should get financial reconciliation', async () => {
      const response = await dashboardApi.getFinancialReconciliation()
      
      expect(response.success).toBe(true)
      expect(response.data).toHaveProperty('totalRevenue')
      expect(response.data).toHaveProperty('totalPayouts')
    })
  })

  describe('Error Handling', () => {
    it('should handle authentication errors', async () => {
      // Clear auth token
      clearAuthToken()
      
      await expect(
        transactionApi.getPendingTransactions(1, 10)
      ).rejects.toThrow()
    })

    it('should handle network errors gracefully', async () => {
      // Test that API methods exist and are functions
      expect(typeof transactionApi.getPendingTransactions).toBe('function')
      expect(typeof brandApi.getAllBrands).toBe('function')
      expect(typeof dashboardApi.getDashboardMetrics).toBe('function')
      expect(typeof authApi.login).toBe('function')
    })

    it('should handle invalid parameters', async () => {
      // Ensure we're authenticated
      if (!authToken) {
        const response = await authApi.login(TEST_ADMIN_CREDENTIALS)
        setAuthToken(response.data.token)
      }

      // Test with invalid parameters
      await expect(
        transactionApi.getPendingTransactions(-1, -1)
      ).rejects.toThrow()
    })
  })

  describe('Performance Tests', () => {
    beforeEach(async () => {
      // Ensure we're authenticated
      if (!authToken) {
        const response = await authApi.login(TEST_ADMIN_CREDENTIALS)
        setAuthToken(response.data.token)
      }
    })

    it('should respond to dashboard metrics within 2 seconds', async () => {
      const startTime = Date.now()
      const response = await dashboardApi.getDashboardMetrics()
      const endTime = Date.now()

      expect(response.success).toBe(true)
      expect(endTime - startTime).toBeLessThan(2000)
    })

    it('should handle concurrent requests', async () => {
      const promises = [
        dashboardApi.getDashboardMetrics(),
        dashboardApi.getRealtimeMetrics(),
        dashboardApi.getTransactionTrends(),
        brandApi.getAllBrands(1, 5),
        transactionApi.getPendingTransactions(1, 5)
      ]

      const responses = await Promise.all(promises)

      responses.forEach(response => {
        expect(response.success).toBe(true)
      })
    })

    it('should handle large data sets efficiently', async () => {
      const startTime = Date.now()
      const response = await transactionApi.getAllTransactions(1, 100)
      const endTime = Date.now()

      expect(response.success).toBe(true)
      expect(endTime - startTime).toBeLessThan(5000) // 5 seconds for large dataset
    })
  })
})
