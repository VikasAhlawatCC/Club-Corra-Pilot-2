import { beforeAll, afterAll, beforeEach } from '@jest/globals'
import { TEST_CONFIG, generateTestName, wait } from './test-config'

// Global test state
let globalAuthToken: string | null = null
let testDataCleanup: Array<() => Promise<void>> = []

// Helper to set global auth token
export function setGlobalAuthToken(token: string) {
  globalAuthToken = token
  if (typeof window !== 'undefined') {
    localStorage.setItem('admin_token', token)
  }
}

// Helper to get global auth token
export function getGlobalAuthToken(): string | null {
  return globalAuthToken
}

// Helper to clear global auth token
export function clearGlobalAuthToken() {
  globalAuthToken = null
  if (typeof window !== 'undefined') {
    localStorage.removeItem('admin_token')
  }
}

// Helper to register cleanup function
export function registerCleanup(cleanupFn: () => Promise<void>) {
  testDataCleanup.push(cleanupFn)
}

// Setup function to run before all tests
beforeAll(async () => {
  console.log('🚀 Setting up API endpoint tests...')
  console.log(`📡 API Base URL: ${TEST_CONFIG.API_BASE_URL}`)
  console.log(`👤 Test Admin: ${TEST_CONFIG.TEST_ADMIN_EMAIL}`)
  
  // Clear any existing auth
  clearGlobalAuthToken()
  
  // Wait a bit for API to be ready
  await wait(1000)
})

// Cleanup function to run after all tests
afterAll(async () => {
  console.log('🧹 Cleaning up API endpoint tests...')
  
  // Run all registered cleanup functions
  for (const cleanupFn of testDataCleanup) {
    try {
      await cleanupFn()
    } catch (error) {
      console.warn('Cleanup function failed:', error)
    }
  }
  
  // Clear auth token
  clearGlobalAuthToken()
  
  console.log('✅ API endpoint tests cleanup completed')
})

// Setup function to run before each test
beforeEach(() => {
  // Clear auth before each test to ensure clean state
  clearGlobalAuthToken()
})

// Export test utilities
export const TestUtils = {
  generateTestName,
  wait,
  setGlobalAuthToken,
  getGlobalAuthToken,
  clearGlobalAuthToken,
  registerCleanup
}
