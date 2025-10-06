# 0001 Implementation Plan - Complete Admin Migration

## Executive Summary

This document outlines the phased approach to **exactly replicate** the old admin implementation while maintaining NO shared packages (per plan requirement). All types from `@club-corra/shared` will be inlined into both admin and API apps.

## Gap Analysis

### Current State Issues

1. **Incomplete Type Definitions** ❌
   - Current: ~300 lines in `apps/admin/src/types/entities.ts`
   - Required: ~1000+ lines with ALL types from shared package
   - Missing: Notification types, Firebase types, complete dashboard schemas, etc.

2. **Missing API Entities** ❌
   - Missing: Location, Offer, AuthProvider, PaymentDetails, Notification, File, FinancialReconciliation
   - Current: Only 15 entities vs 22+ needed

3. **Incomplete Dashboard Service** ❌
   - Current: 27 lines with basic count queries
   - Required: 677 lines with full metrics calculation
   - Missing: All analytics endpoints, trends, cohorts, brand performance

4. **Missing Coins Service Logic** ❌
   - Current: Placeholder methods
   - Required: Full transaction lifecycle (approve, reject, process payment, adjustments)
   - Missing: Welcome bonus, user verification data, payment stats

5. **Missing Brands/Categories Services** ❌
   - Current: Empty stubs
   - Required: Full CRUD with search, filtering, pagination

6. **Missing Users Service** ❌
   - Current: Empty stubs
   - Required: List, get, update, stats, profile management

7. **Incomplete Admin Controllers** ❌
   - Missing: Form submissions controller
   - Missing: Admin users management endpoints

## Phase-by-Phase Implementation Plan

---

## Phase 1: Complete Type Definitions (1-2 hours)

### Goal
Inline ALL types from `@club-corra/shared` into `apps/admin/src/types/entities.ts` to eliminate shared package dependency while maintaining full functionality.

### Files to Modify
- `apps/admin/src/types/entities.ts` - Expand from 339 lines to 1000+ lines

### Types to Add

#### From `shared/src/types.ts`:
- Base types: `BaseEntity`, `ApiResponse`, `FilterState`
- Auth types: `AuthProvider`, `UserStatus`, `VerificationStatus`, `AuthToken`, `JwtPayload`, `OTPVerification`
- User types: `User`, `UserProfile`, `Address`, `PaymentDetails`, `AuthProviderLink`
- Dashboard types: All metric interfaces (already partially done)

#### From `shared/src/schemas/`:
- `brand.schema.ts` - Zod schemas converted to TypeScript types
- `coin.schema.ts` - All transaction, balance, verification types
- `dashboard.schema.ts` - Complete dashboard metric types
- `notification.schema.ts` - Notification types
- `auth.schema.ts` - Auth request/response types
- `user.schema.ts` - User management types
- `partner-application.schema.ts` - Partner types
- `waitlist-entry.schema.ts` - Waitlist types

#### Firebase Types:
- All Firebase auth types from `shared/src/types/firebase-auth.ts`

### Success Criteria
- ✅ NO import from `@club-corra/shared` anywhere in admin app
- ✅ All types self-contained in `apps/admin/src/types/entities.ts`
- ✅ Admin app compiles without errors
- ✅ Type coverage matches old admin 100%

---

## Phase 2: Add Missing API Entities (1 hour)

### Goal
Add all missing TypeORM entities to match old repo schema exactly.

### Entities to Create

#### 1. `apps/api/src/brands/entities/location.entity.ts`
```typescript
@Entity('locations')
export class Location {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  brandId: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  state: string;

  @Column({ nullable: true })
  postalCode: string;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude: number;

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => Brand, brand => brand.locations)
  @JoinColumn({ name: 'brandId' })
  brand: Brand;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

#### 2. `apps/api/src/brands/entities/offer.entity.ts`
- Brand offers/promotions entity

#### 3. `apps/api/src/users/entities/auth-provider.entity.ts`
- OAuth provider links (Google, Facebook, etc.)

#### 4. `apps/api/src/users/entities/payment-details.entity.ts`
- UPI, mobile number for payments

#### 5. `apps/api/src/notifications/notification.entity.ts`
- User notifications

#### 6. `apps/api/src/files/file.entity.ts`
- File uploads (receipts, etc.)

#### 7. `apps/api/src/admin/entities/financial-reconciliation.entity.ts`
- Brand settlement tracking

### Success Criteria
- ✅ All 22+ entities created
- ✅ Relationships properly defined
- ✅ Matches old repo schema exactly

---

## Phase 3: Implement Complete Dashboard Service (2-3 hours)

### Goal
Replace placeholder dashboard service with full implementation from old repo.

### File to Replace
- `apps/api/src/admin/dashboard.service.ts` (expand from 27 to 677 lines)

### Methods to Implement

#### Core Metrics:
- `getDashboardMetrics()` - With 1-minute caching
- `calculateUserMetrics()` - Total, active, new users, growth rate
- `calculateTransactionMetrics()` - All transaction stats, pending counts
- `calculateBrandMetrics()` - Active brands, top performers
- `calculateFinancialMetrics()` - Coins in circulation, liability, settlement status
- `calculateSystemMetrics()` - Health, uptime, connections

#### Analytics:
- `getTransactionTrends(period)` - Daily trends with growth rate
- `getUserGrowthTrends(period)` - User acquisition trends
- `getBrandPerformanceAnalytics(period)` - Brand performance metrics

#### Saved Views:
- `getSavedViews(userId)` - User's saved filter presets
- `createSavedView(userId, data)`
- `updateSavedView(id, userId, data)`
- `deleteSavedView(id, userId)`

#### Risk Management:
- `getRiskSignals(page, limit, filters)` - Fraud detection
- `createRiskSignal(data)`
- `updateRiskSignal(id, data)`

#### Audit & Experiments:
- `logAction(userId, action, resource, ...)` - Audit trail
- `getActiveExperiments()` - A/B tests
- `getFinancialReconciliation()` - Settlement tracking

#### Cache Management:
- `clearCache()` - Force refresh dashboard

### Controller Updates
- `apps/api/src/admin/dashboard.controller.ts` - Already complete, just wire to new service

### Success Criteria
- ✅ Dashboard shows real data from database
- ✅ All analytics endpoints return meaningful data
- ✅ Cache mechanism working (1-minute expiry)
- ✅ Saved views functional
- ✅ Risk signals queryable

---

## Phase 4: Implement Full Coins Service (3-4 hours)

### Goal
Implement complete transaction lifecycle management.

### File to Enhance
- `apps/api/src/coins/coins.service.ts`

### Methods to Implement

#### Balance Management:
- `getUserBalance(userId)` - Get user's coin balance
- `getOrCreateBalance(userId)` - Initialize if not exists

#### Transaction Lifecycle:
- `createWelcomeBonus(data)` - 100 coins for new users
- `approveTransaction(id, adminId, notes)` - Approve earn request
- `rejectTransaction(id, adminId, notes)` - Reject with reason
- `approveRedeemTransaction(id, adminId, notes)` - Approve redemption
- `rejectRedeemTransaction(id, adminId, notes)` - Reject redemption
- `processPayment(id, adminId, txnId, method, amount, notes)` - Mark as paid
- `adjustRedeemAmount(id, newAmount, adminId, notes)` - Adjust coins

#### Query Methods:
- `getAllTransactionsWithFilters(page, limit, filters)` - Admin transaction list
- `getPendingTransactions(page, limit)` - Awaiting review
- `getTransactionHistory(userId, page, limit)` - User's transactions
- `getUserPendingRequests(userId)` - User's pending requests
- `getUserDetails(userId)` - User info for verification

#### Stats:
- `getTransactionStats()` - Overall system stats
- `getPaymentStats(startDate, endDate)` - Payment processing stats
- `getPaymentSummary(transactionId)` - Individual payment details

### Success Criteria
- ✅ Admin can approve/reject transactions
- ✅ Payment processing workflow complete
- ✅ Welcome bonus grants 100 coins
- ✅ Balance updates correctly
- ✅ WebSocket notifications sent on status changes

---

## Phase 5: Implement Brands & Categories Services (2 hours)

### Goal
Full CRUD operations for brands and categories.

### Files to Implement

#### `apps/api/src/brands/brands.service.ts`:
- `findAll(query)` - List with search, filters, pagination
- `findOne(id)` - Get single brand
- `findActive()` - Active brands only
- `findByCategory(categoryId)` - Filter by category
- `create(data)` - Create new brand
- `update(id, data)` - Update brand
- `deactivate(id)` - Soft delete

#### `apps/api/src/brands/brand-categories.service.ts`:
- `findAll()` - List all categories
- `findOne(id)` - Get single category
- `create(data)` - Create category
- `update(id, data)` - Update category
- `delete(id)` - Remove category

### Success Criteria
- ✅ Brand list shows all brands with categories
- ✅ Search and filters work
- ✅ Create/edit brands functional
- ✅ Categories manageable

---

## Phase 6: Implement Users Service (2 hours)

### Goal
User management and profile updates.

### File to Implement
- `apps/api/src/users/users.service.ts`

### Methods:
- `findAll(page, limit, filters)` - Paginated user list
- `findOne(id)` - Get user details
- `getUserStats()` - Overall user statistics
- `updateProfile(userId, data)` - Update user profile
- `updateEmail(userId, email)` - Change email
- `updateStatus(userId, status)` - Activate/suspend
- `getUserWithRelations(id)` - User + profile + payment details

### Success Criteria
- ✅ User list page shows data
- ✅ User details page loads
- ✅ Profile updates work
- ✅ User stats displayed on dashboard

---

## Phase 7: Add Missing Admin Controllers (1 hour)

### Goal
Complete admin functionality.

### Files to Create/Enhance

#### `apps/api/src/admin/form-submissions.controller.ts`:
Already exists, ensure it has:
- `GET /admin/form-submissions/partner-applications` - List partner applications
- `GET /admin/form-submissions/waitlist-entries` - List waitlist entries
- Update methods for status changes

#### `apps/api/src/admin/admin-users.controller.ts`:
- CRUD for admin user management
- Role assignments
- Permission management

### Success Criteria
- ✅ Form submissions page shows partner/waitlist data
- ✅ Admin users manageable

---

## Phase 8: Verify DB Schema & Run Migrations (1-2 hours)

### Goal
Ensure database schema exactly matches old repo.

### Steps:

1. **Compare Migrations**:
   - Review all migrations in old repo: `/Users/vikasahlawat/Documents/club-corra-pilot/apps/api/src/migrations/`
   - Ensure new repo has equivalent migrations

2. **Generate Initial Migration**:
   ```bash
   cd apps/api
   yarn migration:generate --name=CompleteSchema
   ```

3. **Review Generated Migration**:
   - Compare with old repo migrations
   - Ensure all tables, columns, indexes, foreign keys match

4. **Add Missing Columns**:
   Check for:
   - `users.firebaseUid` (unique)
   - `users.passwordHash`
   - `users.refreshTokenHash`
   - `users.emailVerificationToken`
   - `users.roles` (array)
   - `coin_transactions.statusUpdatedAt`
   - `brands` decimal transformers for percentages
   - All indexes for performance

5. **Run Migrations**:
   ```bash
   yarn migration:run
   ```

6. **Seed Data**:
   ```bash
   yarn seed:admin  # Create admin user
   ```

### Success Criteria
- ✅ All entities have corresponding tables
- ✅ All relationships (foreign keys) created
- ✅ Indexes match old repo
- ✅ Seed data works

---

## Phase 9: Update Documentation (30 minutes)

### Goal
Reflect actual implementation status.

### Files to Update:

#### 1. `docs/features/0001_SUMMARY.md`:
Update completion percentages:
- Phase 1: Types - 100%
- Phase 2: Entities - 100%
- Phase 3: Dashboard - 100%
- Phase 4: Coins - 100%
- Phase 5: Brands - 100%
- Phase 6: Users - 100%
- Phase 7: Admin - 100%
- Phase 8: DB - 100%
- Overall: 100%

#### 2. `docs/features/0001_REVIEW.md`:
- Mark all issues as RESOLVED
- Update completion matrix
- Update testing checklist

### Success Criteria
- ✅ Documentation reflects 100% implementation
- ✅ No placeholder warnings
- ✅ All phases marked complete

---

## Execution Timeline

| Phase | Duration | Cumulative |
|-------|----------|------------|
| Phase 1: Types | 1-2 hours | 2 hours |
| Phase 2: Entities | 1 hour | 3 hours |
| Phase 3: Dashboard | 2-3 hours | 6 hours |
| Phase 4: Coins | 3-4 hours | 10 hours |
| Phase 5: Brands | 2 hours | 12 hours |
| Phase 6: Users | 2 hours | 14 hours |
| Phase 7: Admin | 1 hour | 15 hours |
| Phase 8: DB | 1-2 hours | 17 hours |
| Phase 9: Docs | 30 min | 17.5 hours |

**Total Estimated Time: 15-18 hours**

---

## Post-Implementation Testing Checklist

### Admin UI Tests:
- [ ] Login works
- [ ] Dashboard loads with real data
- [ ] User list shows users with search/filter
- [ ] Brand list shows brands with categories
- [ ] Transaction list shows transactions
- [ ] Transaction approval/rejection works
- [ ] Payment processing works
- [ ] User profile updates work
- [ ] Brand create/edit works
- [ ] Analytics charts show data
- [ ] Saved views work
- [ ] Risk signals displayed

### API Tests:
- [ ] All endpoints return 200 (not 500)
- [ ] Auth endpoints work
- [ ] Dashboard metrics endpoint returns complete data
- [ ] Transaction endpoints support all statuses
- [ ] User endpoints support CRUD
- [ ] Brand endpoints support CRUD
- [ ] Form submission endpoints return data

### Database Tests:
- [ ] All tables created
- [ ] Foreign keys enforced
- [ ] Indexes created
- [ ] Seed data present
- [ ] Migrations reversible

---

## Critical Success Factors

1. **No Shared Packages** ✅
   - All types inlined in both apps
   - Apps deployable independently

2. **Exact Feature Parity** ✅
   - All old admin features replicated
   - No regressions from old implementation

3. **Database Integrity** ✅
   - Schema matches old repo
   - All relationships preserved
   - Data integrity constraints enforced

4. **Code Quality** ✅
   - TypeScript strict mode passes
   - No linter errors
   - Proper error handling
   - Logging implemented

---

## Rollback Plan

If implementation fails:
1. Revert to commit before Phase 1
2. Document blockers
3. Re-evaluate approach

---

## Next Steps

Execute phases in order:
1. Start with Phase 1 (Types)
2. Verify compilation after each phase
3. Test incrementally
4. Update summary docs after each phase
5. Mark todos as complete

**Current Phase: Phase 1 - Type Definitions**
**Status: Ready to Begin**

