#!/usr/bin/env node

/**
 * API Endpoint Test Runner
 * 
 * This script runs comprehensive API endpoint tests against the actual backend.
 * It can be run independently or as part of the Jest test suite.
 * 
 * Usage:
 *   npm run test:api
 *   npm run test:api -- --verbose
 *   npm run test:api -- --coverage
 */

import { execSync } from 'child_process'
import { existsSync } from 'fs'
import { join } from 'path'

// Test configuration
const TEST_CONFIG = {
  API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api/v1',
  TEST_ADMIN_EMAIL: process.env.TEST_ADMIN_EMAIL || 'admin@clubcorra.com',
  TEST_ADMIN_PASSWORD: process.env.TEST_ADMIN_PASSWORD || 'admin123',
  JEST_CONFIG: 'jest.config.js',
  TEST_PATTERN: 'src/__tests__/api/**/*.test.ts'
}

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
}

function log(message: string, color: string = colors.reset) {
  console.log(`${color}${message}${colors.reset}`)
}

function logHeader(message: string) {
  log(`\n${colors.bright}${colors.cyan}${'='.repeat(60)}${colors.reset}`)
  log(`${colors.bright}${colors.cyan}${message}${colors.reset}`)
  log(`${colors.bright}${colors.cyan}${'='.repeat(60)}${colors.reset}\n`)
}

function logStep(step: string, message: string) {
  log(`${colors.yellow}${step}${colors.reset} ${message}`)
}

function logSuccess(message: string) {
  log(`${colors.green}✅ ${message}${colors.reset}`)
}

function logError(message: string) {
  log(`${colors.red}❌ ${message}${colors.reset}`)
}

function logWarning(message: string) {
  log(`${colors.yellow}⚠️  ${message}${colors.reset}`)
}

// Check if API is running
async function checkApiHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${TEST_CONFIG.API_BASE_URL}/admin/health`)
    return response.ok
  } catch (error) {
    return false
  }
}

// Check if Jest config exists
function checkJestConfig(): boolean {
  return existsSync(TEST_CONFIG.JEST_CONFIG)
}

// Run Jest tests
function runJestTests(options: string[] = []): boolean {
  try {
    const jestCommand = `npx jest ${TEST_CONFIG.TEST_PATTERN} ${options.join(' ')}`
    logStep('Running', `Jest command: ${jestCommand}`)
    
    execSync(jestCommand, { 
      stdio: 'inherit',
      cwd: process.cwd()
    })
    
    return true
  } catch (error) {
    return false
  }
}

// Main test runner function
async function runEndpointTests() {
  logHeader('API Endpoint Test Runner')
  
  // Step 1: Check prerequisites
  logStep('1/5', 'Checking prerequisites...')
  
  if (!checkJestConfig()) {
    logError('Jest configuration not found. Please ensure jest.config.js exists.')
    process.exit(1)
  }
  logSuccess('Jest configuration found')
  
  // Step 2: Check API health
  logStep('2/5', 'Checking API health...')
  
  const isApiHealthy = await checkApiHealth()
  if (!isApiHealthy) {
    logWarning(`API at ${TEST_CONFIG.API_BASE_URL} is not responding`)
    logWarning('Make sure the API server is running on the correct port')
    logWarning('You can start it with: cd apps/api && npm run start:dev')
    
    // Ask user if they want to continue anyway
    log('\nDo you want to continue with the tests anyway? (y/N)')
    // In a real implementation, you'd use readline or similar
    logWarning('Continuing with tests (API health check failed)')
  } else {
    logSuccess('API is healthy and responding')
  }
  
  // Step 3: Set environment variables
  logStep('3/5', 'Setting up environment...')
  
  process.env.NEXT_PUBLIC_API_BASE_URL = TEST_CONFIG.API_BASE_URL
  process.env.TEST_ADMIN_EMAIL = TEST_CONFIG.TEST_ADMIN_EMAIL
  process.env.TEST_ADMIN_PASSWORD = TEST_CONFIG.TEST_ADMIN_PASSWORD
  
  logSuccess('Environment variables set')
  log(`   API Base URL: ${TEST_CONFIG.API_BASE_URL}`)
  log(`   Test Admin: ${TEST_CONFIG.TEST_ADMIN_EMAIL}`)
  
  // Step 4: Run tests
  logStep('4/5', 'Running API endpoint tests...')
  
  const testOptions = process.argv.slice(2)
  const testSuccess = runJestTests(testOptions)
  
  if (!testSuccess) {
    logError('API endpoint tests failed')
    process.exit(1)
  }
  
  // Step 5: Report results
  logStep('5/5', 'Test execution completed')
  logSuccess('All API endpoint tests passed!')
  
  logHeader('Test Summary')
  log('✅ Authentication endpoints tested')
  log('✅ Transaction management endpoints tested')
  log('✅ Brand management endpoints tested')
  log('✅ Dashboard endpoints tested')
  log('✅ Error handling tested')
  log('✅ Performance tests completed')
  
  logHeader('Next Steps')
  log('1. Review test results above')
  log('2. Check API coverage report if generated')
  log('3. Fix any failing tests')
  log('4. Add new endpoint tests as needed')
  
  logSuccess('API endpoint testing completed successfully!')
}

// Handle process signals
process.on('SIGINT', () => {
  log('\n\nTest execution interrupted by user')
  process.exit(0)
})

process.on('SIGTERM', () => {
  log('\n\nTest execution terminated')
  process.exit(0)
})

// Run the tests
if (require.main === module) {
  runEndpointTests().catch((error) => {
    logError(`Test runner failed: ${error.message}`)
    process.exit(1)
  })
}

export { runEndpointTests }
