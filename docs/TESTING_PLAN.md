# Club Corra Pilot 2 — Comprehensive Testing Plan

## Overview
This document outlines a comprehensive testing strategy for the Admin app and its counterpart API, covering all routes, endpoints, and functionality. The plan is designed to ensure complete coverage of the lightweight monorepo implementation.

## Testing Scope

### Admin App Routes (Next.js)
1. **Authentication Routes**
   - `/` - Landing page with auth check
   - `/login` - Admin login page

2. **Dashboard Routes**
   - `/dashboard/analytics` - Analytics dashboard
   - `/dashboard/queue-overview` - Queue overview
   - `/dashboard/risk-and-fraud` - Risk & fraud monitoring
   - `/dashboard/transaction-insights` - Transaction insights
   - `/dashboard/transaction-trends` - Transaction trends

3. **Management Routes**
   - `/brands` - Brand management
   - `/brands/new` - Create new brand
   - `/brands/[id]` - Brand details/edit
   - `/brands/categories` - Brand categories
   - `/users` - User management
   - `/transactions` - Transaction management

### API Endpoints (NestJS)

#### Authentication & Admin
- `POST /api/v1/auth/login` - Admin login
- `GET /api/v1/admin/health` - Health check

#### Dashboard & Analytics
- `GET /api/v1/admin/dashboard/metrics` - Dashboard metrics
- `GET /api/v1/admin/dashboard/metrics/realtime` - Real-time metrics
- `GET /api/v1/admin/dashboard/trends/transactions` - Transaction trends
- `GET /api/v1/admin/dashboard/trends/users` - User growth trends
- `GET /api/v1/admin/dashboard/analytics/brands` - Brand performance
- `GET /api/v1/admin/dashboard/saved-views` - Saved views
- `GET /api/v1/admin/dashboard/risk-signals` - Risk signals
- `GET /api/v1/admin/dashboard/experiments` - Active experiments
- `GET /api/v1/admin/dashboard/financial-reconciliation` - Financial reconciliation

#### Brand Management
- `GET /api/v1/brands` - List brands (with pagination, search, filters)
- `GET /api/v1/brands/active` - Active brands
- `GET /api/v1/brands/category/:categoryId` - Brands by category
- `GET /api/v1/brands/:id` - Get brand by ID
- `POST /api/v1/brands` - Create brand
- `PATCH /api/v1/brands/:id` - Update brand
- `PATCH /api/v1/brands/:id/toggle-status` - Toggle brand status
- `DELETE /api/v1/brands/:id` - Delete brand

#### Brand Categories
- `GET /api/v1/brand-categories` - List categories
- `GET /api/v1/brand-categories/:id` - Get category by ID
- `POST /api/v1/brand-categories` - Create category
- `PATCH /api/v1/brand-categories/:id` - Update category
- `DELETE /api/v1/brand-categories/:id` - Delete category

#### User Management
- `GET /api/v1/admin/users` - List users (with search, pagination)
- `GET /api/v1/admin/users/stats` - User statistics
- `GET /api/v1/admin/users/:id` - Get user by ID
- `POST /api/v1/admin/users` - Create user
- `PUT /api/v1/admin/users/:id/profile` - Update user profile
- `PUT /api/v1/admin/users/:id/email` - Update user email
- `PUT /api/v1/admin/users/:id/status` - Update user status
- `DELETE /api/v1/admin/users/:id` - Delete user

#### Transaction Management
- `GET /api/v1/admin/coins/transactions/pending` - Pending transactions
- `GET /api/v1/admin/coins/transactions` - All transactions
- `GET /api/v1/admin/coins/users/:userId/pending-requests` - User pending requests
- `GET /api/v1/admin/coins/users/:userId/details` - User details
- `GET /api/v1/admin/coins/users/:userId/verification-data` - User verification data
- `PUT /api/v1/admin/coins/transactions/:id/approve` - Approve earn transaction
- `PUT /api/v1/admin/coins/transactions/:id/reject` - Reject earn transaction
- `PUT /api/v1/admin/coins/transactions/:id/approve-redeem` - Approve redeem transaction
- `PUT /api/v1/admin/coins/transactions/:id/reject-redeem` - Reject redeem transaction
- `PUT /api/v1/admin/coins/transactions/:id/process-payment` - Process payment
- `PUT /api/v1/admin/coins/transactions/:id/adjust-redeem` - Adjust redeem amount

#### Coin System
- `GET /api/v1/admin/coins/stats/transactions` - Transaction statistics
- `GET /api/v1/admin/coins/stats/system` - System statistics
- `GET /api/v1/admin/coins/stats/payments` - Payment statistics
- `GET /api/v1/admin/coins/payments/:transactionId/summary` - Payment summary
- `GET /api/v1/admin/coins/balance/:userId` - User balance
- `GET /api/v1/admin/coins/summary/:userId` - User transaction summary
- `GET /api/v1/admin/coins/transactions?userId=:userId` - User transactions
- `PUT /api/v1/admin/users/:userId/coins` - Adjust user coins
- `POST /api/v1/admin/coins/welcome-bonus` - Create welcome bonus

#### Form Submissions
- `GET /api/v1/admin/form-submissions` - List form submissions
- `GET /api/v1/admin/form-submissions/:id` - Get submission by ID
- `PUT /api/v1/admin/form-submissions/:id/status` - Update submission status
- `DELETE /api/v1/admin/form-submissions/:id` - Delete submission

## Testing Strategy

### 1. Unit Tests
**Admin App (Next.js)**
- Component rendering tests
- Hook functionality tests
- API client tests
- Utility function tests
- Context provider tests

**API (NestJS)**
- Controller tests
- Service tests
- Entity tests
- DTO validation tests
- Guard tests
- Interceptor tests

### 2. Integration Tests
**Admin App**
- Page navigation tests
- Form submission tests
- API integration tests
- Authentication flow tests
- State management tests

**API**
- Database integration tests
- External service integration tests
- Authentication middleware tests
- CORS configuration tests

### 3. End-to-End Tests
**Full User Flows**
- Admin login → Dashboard navigation
- Brand management workflow
- User management workflow
- Transaction approval workflow
- Risk monitoring workflow

### 4. API Contract Tests
**Request/Response Validation**
- All endpoint contracts
- Error response formats
- Authentication requirements
- Pagination parameters
- Search and filter parameters

### 5. Performance Tests
**Load Testing**
- Dashboard metrics loading
- Large dataset pagination
- Concurrent user sessions
- API response times

### 6. Security Tests
**Authentication & Authorization**
- JWT token validation
- Admin role enforcement
- CORS policy validation
- Input sanitization
- SQL injection prevention

## Test Implementation Plan

### Phase 1: Foundation Setup
1. **Test Environment Configuration**
   - Jest configuration for Admin app
   - Jest configuration for API
   - Test database setup
   - Mock services setup

2. **Basic Test Structure**
   - Test utilities and helpers
   - Mock data factories
   - Test fixtures
   - Common test patterns

### Phase 2: Unit Testing
1. **Admin App Unit Tests**
   - Components: All UI components
   - Hooks: Custom hooks (useBrands, useDashboardMetrics, etc.)
   - API clients: api.ts, dashboardApi.ts
   - Utils: dateUtils, transactionUtils, s3UrlProxy
   - Context: AuthContext

2. **API Unit Tests**
   - Controllers: All endpoint controllers
   - Services: Business logic services
   - Entities: Database entity validation
   - DTOs: Request/response validation
   - Guards: Authentication and authorization

### Phase 3: Integration Testing
1. **Admin App Integration**
   - Page rendering with API calls
   - Form submissions
   - Navigation flows
   - State management

2. **API Integration**
   - Database operations
   - External service calls
   - Authentication flows
   - Error handling

### Phase 4: End-to-End Testing
1. **Critical User Flows**
   - Complete admin workflows
   - Cross-page functionality
   - Real API interactions
   - Error scenarios

### Phase 5: Performance & Security
1. **Performance Testing**
   - Load testing scripts
   - Performance benchmarks
   - Memory usage monitoring

2. **Security Testing**
   - Authentication bypass attempts
   - Authorization boundary testing
   - Input validation testing
   - CORS policy testing

## Test Data Management

### Test Fixtures
- Admin user accounts
- Sample brands and categories
- Test transactions
- Mock API responses
- Database seed data

### Test Environment
- Separate test database
- Mock external services
- Test API keys
- Isolated test environment

## Continuous Integration

### Pre-commit Hooks
- Lint checks
- Type checking
- Unit test execution
- Code coverage validation

### CI Pipeline
- Automated test execution
- Coverage reporting
- Performance regression detection
- Security vulnerability scanning

### Test Reporting
- Coverage reports
- Performance metrics
- Security scan results
- Test result summaries

## Tools and Technologies

### Testing Frameworks
- **Jest**: Primary testing framework
- **React Testing Library**: Component testing
- **Supertest**: API testing
- **MSW**: API mocking

### Test Utilities
- **Faker.js**: Test data generation
- **Factory Bot**: Test fixtures
- **Test Containers**: Database testing
- **Playwright**: E2E testing

### Monitoring
- **Coverage**: Jest coverage reports
- **Performance**: Lighthouse CI
- **Security**: OWASP ZAP
- **Quality**: SonarQube

## Success Criteria

### Coverage Targets
- **Unit Tests**: 90%+ code coverage
- **Integration Tests**: 80%+ API endpoint coverage
- **E2E Tests**: 100% critical user flow coverage

### Performance Targets
- **API Response**: < 200ms for 95% of requests
- **Page Load**: < 2s for 95% of page loads
- **Database Queries**: < 100ms for 95% of queries

### Quality Gates
- All tests passing
- Coverage thresholds met
- No critical security vulnerabilities
- Performance benchmarks met
- Code quality standards maintained

## Implementation Timeline

### Week 1-2: Foundation
- Test environment setup
- Basic test structure
- Mock services implementation

### Week 3-4: Unit Testing
- Admin app unit tests
- API unit tests
- Test utilities development

### Week 5-6: Integration Testing
- API integration tests
- Admin app integration tests
- Database testing

### Week 7-8: End-to-End Testing
- Critical user flow tests
- Cross-browser testing
- Mobile responsiveness testing

### Week 9-10: Performance & Security
- Load testing implementation
- Security testing
- Performance optimization

### Week 11-12: CI/CD Integration
- Pipeline setup
- Automated reporting
- Quality gates implementation

## Maintenance and Updates

### Regular Updates
- Test data refresh
- Dependency updates
- Test case maintenance
- Performance monitoring

### Continuous Improvement
- Test coverage analysis
- Performance optimization
- Security updates
- Quality metric tracking

This comprehensive testing plan ensures complete coverage of the Admin app and API, providing confidence in the system's reliability, performance, and security.
