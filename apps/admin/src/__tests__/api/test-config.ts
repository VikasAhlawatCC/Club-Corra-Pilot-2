// Test configuration for API endpoint testing
export const TEST_CONFIG = {
  // API Configuration
  API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api/v1',
  
  // Test Admin Credentials
  TEST_ADMIN_EMAIL: process.env.TEST_ADMIN_EMAIL || 'admin@clubcorra.com',
  TEST_ADMIN_PASSWORD: process.env.TEST_ADMIN_PASSWORD || 'admin123',
  
  // Test Data Configuration
  TEST_BRAND_NAME_PREFIX: 'Test Brand',
  TEST_CATEGORY_NAME_PREFIX: 'Test Category',
  
  // Performance Thresholds
  PERFORMANCE_THRESHOLDS: {
    DASHBOARD_METRICS_MAX_MS: 2000,
    LARGE_DATASET_MAX_MS: 5000,
    CONCURRENT_REQUESTS_MAX_MS: 3000
  },
  
  // Test Data Cleanup
  CLEANUP_TEST_DATA: process.env.CLEANUP_TEST_DATA === 'true',
  
  // Retry Configuration
  RETRY_CONFIG: {
    MAX_RETRIES: 3,
    RETRY_DELAY_MS: 1000
  }
}

// Helper function to generate unique test data names
export function generateTestName(prefix: string): string {
  return `${prefix} ${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// Helper function to wait for a specified time
export function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Helper function to retry a function with exponential backoff
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = TEST_CONFIG.RETRY_CONFIG.MAX_RETRIES,
  delayMs: number = TEST_CONFIG.RETRY_CONFIG.RETRY_DELAY_MS
): Promise<T> {
  let lastError: Error
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      
      if (attempt === maxRetries) {
        throw lastError
      }
      
      // Exponential backoff
      const delay = delayMs * Math.pow(2, attempt)
      await wait(delay)
    }
  }
  
  throw lastError!
}

// Helper function to check if we're in a test environment
export function isTestEnvironment(): boolean {
  return process.env.NODE_ENV === 'test' || process.env.JEST_WORKER_ID !== undefined
}

// Helper function to get test timeout based on environment
export function getTestTimeout(): number {
  if (isTestEnvironment()) {
    return 30000 // 30 seconds for test environment
  }
  return 10000 // 10 seconds for development
}
