# Club Corra Pilot 2 - Testing Guide

This guide covers the comprehensive testing setup for the Club Corra Pilot 2 monorepo, including both the Admin app (Next.js) and API (NestJS).

## Overview

The testing strategy covers:
- **Unit Tests**: Individual components, hooks, services, and controllers
- **Integration Tests**: API endpoints, database operations, and cross-component functionality
- **End-to-End Tests**: Complete user workflows and critical paths
- **Performance Tests**: Load testing and performance benchmarks
- **Security Tests**: Authentication, authorization, and input validation

## Test Structure

```
apps/
├── admin/
│   ├── src/
│   │   ├── __tests__/
│   │   │   ├── components/          # Component tests
│   │   │   ├── hooks/              # Hook tests
│   │   │   ├── pages/              # Page tests
│   │   │   └── integration/        # Integration tests
│   │   └── test/
│   │       └── __mocks__/          # Test mocks
│   ├── jest.config.js              # Jest configuration
│   ├── jest.setup.js               # Test setup
│   └── package.json                # Test scripts
├── api/
│   ├── src/
│   │   └── **/*.spec.ts            # Unit tests
│   ├── test/
│   │   └── setup.ts                # Test setup
│   ├── jest.config.js              # Jest configuration
│   └── package.json                # Test scripts
└── test-reports/                   # Generated test reports
```

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Database (PostgreSQL for API tests)

### Installation

```bash
# Install dependencies
npm install

# Setup test environment
npm run test:setup
```

### Running Tests

```bash
# Run all tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run specific app tests
npm run test:admin
npm run test:api

# Run specific test types
npm run test:unit
npm run test:integration
npm run test:components
npm run test:hooks
npm run test:controllers
npm run test:services

# Run tests in watch mode
npm run test:watch

# Run tests for CI
npm run test:ci
```

## Test Categories

### 1. Unit Tests

#### Admin App Unit Tests

**Components** (`apps/admin/src/__tests__/components/`)
- Button component rendering and interactions
- Form components with validation
- UI components with different states
- Chart components with data visualization

**Hooks** (`apps/admin/src/__tests__/hooks/`)
- Custom hooks like `useBrands`, `useDashboardMetrics`
- State management hooks
- API integration hooks
- Performance monitoring hooks

**Pages** (`apps/admin/src/__tests__/pages/`)
- Page rendering with different states
- Navigation and routing
- Authentication flows
- Error handling

#### API Unit Tests

**Controllers** (`apps/api/src/**/*.controller.spec.ts`)
- Endpoint functionality
- Request/response handling
- Error scenarios
- Authentication and authorization

**Services** (`apps/api/src/**/*.service.spec.ts`)
- Business logic
- Database operations
- External service integration
- Data transformation

**Guards** (`apps/api/src/**/*.guard.spec.ts`)
- Authentication validation
- Authorization checks
- Role-based access control

### 2. Integration Tests

**API Integration** (`apps/api/src/**/*.integration.spec.ts`)
- Database operations
- External service calls
- Authentication flows
- Error handling

**Admin Integration** (`apps/admin/src/__tests__/integration/`)
- Page navigation flows
- Form submissions
- API integration
- State management

### 3. End-to-End Tests

**Critical User Flows**
- Admin login → Dashboard navigation
- Brand management workflow
- User management workflow
- Transaction approval workflow
- Risk monitoring workflow

## Test Configuration

### Admin App (Jest)

```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
}
```

### API (Jest)

```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/../test/setup.ts'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
}
```

## Mocking Strategy

### Admin App Mocks

**API Mocks** (`apps/admin/test/__mocks__/api.ts`)
- Mock API responses
- Mock fetch function
- Mock localStorage
- Mock authentication

**Component Mocks** (`apps/admin/test/__mocks__/`)
- Heroicons components
- Radix UI components
- Next.js components
- External libraries

### API Mocks

**Database Mocks** (`apps/api/test/setup.ts`)
- Repository mocks
- Entity mocks
- Database connection mocks

**Service Mocks**
- External service mocks
- Authentication mocks
- File system mocks

## Test Data Management

### Test Fixtures

```typescript
// apps/api/test/setup.ts
export const createMockAdmin = (overrides = {}) => ({
  id: 'admin-1',
  email: 'admin@clubcorra.com',
  firstName: 'Admin',
  lastName: 'User',
  role: 'ADMIN',
  isActive: true,
  ...overrides,
})

export const createMockUser = (overrides = {}) => ({
  id: 'user-1',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  mobileNumber: '+1234567890',
  status: 'ACTIVE',
  ...overrides,
})
```

### Test Database

- In-memory SQLite for unit tests
- Test database for integration tests
- Isolated test environment
- Automatic cleanup after tests

## Coverage Reporting

### Coverage Thresholds

- **Lines**: 80%
- **Functions**: 80%
- **Branches**: 80%
- **Statements**: 80%

### Coverage Reports

```bash
# Generate coverage reports
npm run test:coverage

# Generate comprehensive test report
npm run test:report
```

Reports are generated in:
- `apps/admin/coverage/` - Admin app coverage
- `apps/api/coverage/` - API coverage
- `test-reports/` - Comprehensive reports

## Performance Testing

### Load Testing

```bash
# Run performance tests
npm run test:performance

# Run load tests
npm run test:load
```

### Performance Metrics

- API response times
- Database query performance
- Memory usage
- CPU usage

## Security Testing

### Authentication Tests

- JWT token validation
- Session management
- Password security
- Multi-factor authentication

### Authorization Tests

- Role-based access control
- Permission validation
- Resource access control
- API endpoint protection

### Input Validation Tests

- SQL injection prevention
- XSS protection
- CSRF protection
- Input sanitization

## Continuous Integration

### Pre-commit Hooks

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm run test:unit && npm run lint",
      "pre-push": "npm run test:all"
    }
  }
}
```

### CI Pipeline

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run test:ci
      - run: npm run test:coverage
```

## Debugging Tests

### Debug Mode

```bash
# Run tests in debug mode
npm run test:debug

# Run specific test file
npm run test -- --testNamePattern="Button Component"

# Run tests with verbose output
npm run test -- --verbose
```

### Common Issues

1. **Mock Issues**: Ensure mocks are properly configured
2. **Async Issues**: Use proper async/await patterns
3. **Database Issues**: Check test database setup
4. **Coverage Issues**: Verify test coverage thresholds

## Best Practices

### Test Writing

1. **Arrange-Act-Assert**: Structure tests clearly
2. **Descriptive Names**: Use clear test descriptions
3. **Single Responsibility**: One test per scenario
4. **Mock External Dependencies**: Isolate units under test
5. **Clean Setup/Teardown**: Reset state between tests

### Test Organization

1. **Group Related Tests**: Use describe blocks
2. **Test Data**: Use factories and fixtures
3. **Test Isolation**: Avoid test dependencies
4. **Consistent Naming**: Follow naming conventions

### Performance

1. **Fast Tests**: Keep unit tests fast
2. **Parallel Execution**: Use Jest's parallel execution
3. **Selective Testing**: Run only relevant tests
4. **Test Caching**: Leverage Jest's caching

## Troubleshooting

### Common Problems

1. **Test Timeouts**: Increase timeout for slow tests
2. **Memory Issues**: Clean up resources properly
3. **Database Issues**: Ensure proper test database setup
4. **Mock Issues**: Verify mock implementations

### Debug Commands

```bash
# Debug specific test
npm run test -- --testNamePattern="specific test" --verbose

# Run tests with coverage for specific file
npm run test:coverage -- --testPathPattern="specific-file"

# Run tests in watch mode for development
npm run test:watch
```

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)

## Support

For testing-related issues:
1. Check this documentation
2. Review test examples in the codebase
3. Check Jest and testing library documentation
4. Create an issue in the repository
