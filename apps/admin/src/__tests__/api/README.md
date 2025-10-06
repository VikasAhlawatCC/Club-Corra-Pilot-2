# API Endpoint Testing

This directory contains comprehensive tests for the Club Corra API endpoints. These tests verify that the actual backend API is working correctly, not just mocked responses.

## 🎯 Overview

The API endpoint tests cover:
- **Authentication endpoints** - Login, token validation
- **Dashboard endpoints** - Metrics, analytics, trends
- **Brand management** - CRUD operations, categories
- **Transaction management** - Approval workflows, user data
- **Error handling** - Network errors, validation errors
- **Performance testing** - Response times, concurrent requests

## 📁 File Structure

```
src/__tests__/api/
├── README.md                    # This documentation
├── setup.ts                     # Test setup and utilities
├── test-config.ts               # Test configuration
├── run-endpoint-tests.ts        # Test runner script
├── real-endpoint-tests.test.ts  # Main endpoint tests
└── endpoint-tests.test.ts       # Alternative test implementation
```

## 🚀 Quick Start

### Prerequisites

1. **API Server Running**: Ensure the backend API is running
   ```bash
   cd apps/api
   npm run start:dev
   ```

2. **Environment Variables**: Set up test credentials
   ```bash
   export TEST_ADMIN_EMAIL="admin@clubcorra.com"
   export TEST_ADMIN_PASSWORD="admin123"
   export NEXT_PUBLIC_API_BASE_URL="http://localhost:3001/api/v1"
   ```

### Running Tests

```bash
# Run all API endpoint tests
npm run test:api

# Run with coverage
npm run test:api:coverage

# Run in watch mode
npm run test:api:watch

# Run the comprehensive test runner
npm run test:endpoints
```

## 🧪 Test Categories

### 1. Authentication Tests
- ✅ Admin login with valid credentials
- ✅ Login rejection with invalid credentials
- ✅ Token-based authentication
- ✅ Network error handling

### 2. Dashboard API Tests
- ✅ Dashboard metrics retrieval
- ✅ Real-time metrics
- ✅ Transaction trends
- ✅ User growth trends
- ✅ Brand performance analytics
- ✅ Saved views
- ✅ Risk signals
- ✅ Active experiments
- ✅ Financial reconciliation

### 3. Brand Management Tests
- ✅ List brands with pagination
- ✅ Search brands
- ✅ Filter brands by status
- ✅ Get active brands
- ✅ Get brand by ID
- ✅ Create new brand
- ✅ Update brand
- ✅ Toggle brand status
- ✅ Delete brand

### 4. Brand Categories Tests
- ✅ List categories
- ✅ Get category by ID
- ✅ Create new category
- ✅ Update category
- ✅ Delete category

### 5. Transaction Management Tests
- ✅ Get pending transactions
- ✅ Get all transactions with pagination
- ✅ Get transactions with filters
- ✅ Get user pending requests
- ✅ Get user details
- ✅ Get user verification data
- ✅ Transaction approval workflow
- ✅ Transaction rejection workflow

### 6. Error Handling Tests
- ✅ Authentication errors
- ✅ Network errors
- ✅ Invalid parameters
- ✅ 404 errors
- ✅ 400 validation errors

### 7. Performance Tests
- ✅ Response time thresholds
- ✅ Concurrent request handling
- ✅ Large dataset efficiency

## ⚙️ Configuration

### Test Configuration (`test-config.ts`)

```typescript
export const TEST_CONFIG = {
  API_BASE_URL: 'http://localhost:3001/api/v1',
  TEST_ADMIN_EMAIL: 'admin@clubcorra.com',
  TEST_ADMIN_PASSWORD: 'admin123',
  PERFORMANCE_THRESHOLDS: {
    DASHBOARD_METRICS_MAX_MS: 2000,
    LARGE_DATASET_MAX_MS: 5000,
    CONCURRENT_REQUESTS_MAX_MS: 3000
  }
}
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_BASE_URL` | API base URL | `http://localhost:3001/api/v1` |
| `TEST_ADMIN_EMAIL` | Test admin email | `admin@clubcorra.com` |
| `TEST_ADMIN_PASSWORD` | Test admin password | `admin123` |
| `CLEANUP_TEST_DATA` | Clean up test data after tests | `false` |

## 🔧 Test Utilities

### Setup Functions (`setup.ts`)

```typescript
import { TestUtils } from './setup'

// Generate unique test names
const brandName = TestUtils.generateTestName('Test Brand')

// Wait for async operations
await TestUtils.wait(1000)

// Manage authentication
TestUtils.setGlobalAuthToken(token)
TestUtils.clearGlobalAuthToken()

// Register cleanup functions
TestUtils.registerCleanup(async () => {
  // Clean up test data
})
```

### Retry Logic

```typescript
import { retryWithBackoff } from './test-config'

// Retry with exponential backoff
const result = await retryWithBackoff(async () => {
  return await apiCall('/endpoint')
})
```

## 📊 Test Results

### Success Criteria

- ✅ All endpoints respond within performance thresholds
- ✅ Authentication works correctly
- ✅ CRUD operations function properly
- ✅ Error handling is appropriate
- ✅ Data validation works as expected

### Performance Benchmarks

| Endpoint Category | Max Response Time |
|------------------|-------------------|
| Dashboard Metrics | 2 seconds |
| Large Datasets | 5 seconds |
| Concurrent Requests | 3 seconds |

## 🐛 Troubleshooting

### Common Issues

1. **API Not Running**
   ```
   Error: API at http://localhost:3001/api/v1 is not responding
   ```
   **Solution**: Start the API server with `cd apps/api && npm run start:dev`

2. **Authentication Failures**
   ```
   Error: Failed to login with test admin credentials
   ```
   **Solution**: Check that test admin user exists in the database

3. **Network Timeouts**
   ```
   Error: Request timeout
   ```
   **Solution**: Increase timeout values in test configuration

4. **Test Data Conflicts**
   ```
   Error: Duplicate key constraint
   ```
   **Solution**: Enable test data cleanup or use unique test data names

### Debug Mode

Run tests with verbose output:
```bash
npm run test:api -- --verbose
```

## 🔄 Continuous Integration

### GitHub Actions Example

```yaml
name: API Endpoint Tests
on: [push, pull_request]

jobs:
  api-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: cd apps/api && npm run start:dev &
      - run: cd apps/admin && npm run test:api:coverage
        env:
          TEST_ADMIN_EMAIL: ${{ secrets.TEST_ADMIN_EMAIL }}
          TEST_ADMIN_PASSWORD: ${{ secrets.TEST_ADMIN_PASSWORD }}
```

## 📈 Coverage Reports

Generate coverage reports:
```bash
npm run test:api:coverage
```

Coverage reports will be generated in `coverage/` directory.

## 🚀 Advanced Usage

### Custom Test Scenarios

```typescript
describe('Custom API Test', () => {
  it('should handle custom scenario', async () => {
    // Your custom test logic
    const response = await customApiCall()
    expect(response.success).toBe(true)
  })
})
```

### Mock External Services

```typescript
// Mock external services for testing
jest.mock('@/lib/external-service', () => ({
  externalApi: {
    call: jest.fn().mockResolvedValue({ success: true })
  }
}))
```

## 📝 Contributing

When adding new endpoint tests:

1. **Follow the existing pattern** in `real-endpoint-tests.test.ts`
2. **Add proper error handling** for network failures
3. **Include performance benchmarks** for new endpoints
4. **Update this documentation** with new test categories
5. **Add cleanup logic** for test data if needed

## 🎯 Best Practices

1. **Use descriptive test names** that explain what is being tested
2. **Include both success and failure scenarios**
3. **Test edge cases** like invalid parameters and network errors
4. **Clean up test data** to avoid conflicts
5. **Use realistic test data** that matches production scenarios
6. **Include performance assertions** for critical endpoints
7. **Document any special setup requirements**

## 📚 Related Documentation

- [Testing Plan](../../../docs/TESTING_PLAN.md)
- [API Documentation](../../../docs/API_INDEX.md)
- [Deployment Guide](../../../docs/DEPLOYMENT_INDEX.md)
