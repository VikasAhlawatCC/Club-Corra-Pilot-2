# Reward Request System Workplan

## Overview
This workplan outlines the implementation of a unified reward request system that combines earn and redeem functionality into a single transaction, similar to the old repository but adapted for our lightweight monorepo structure.

## Current State Analysis
- ✅ Coin transaction entity already has user and brand relationships
- ✅ Basic earn/redeem methods exist in coins service
- ✅ Seeding script properly assigns users and brands to transactions
- ❌ No unified reward request system
- ❌ No transaction validation service
- ❌ No transaction approval service
- ❌ No balance update service

## Phase 1: Update Entity Structure (1-2 hours)

### 1.1 Update CoinTransaction Entity
**File**: `apps/api/src/coins/entities/coin-transaction.entity.ts`

**Changes needed**:
- Add `billAmount` field (decimal, nullable)
- Add `coinsEarned` field (int, nullable) 
- Add `coinsRedeemed` field (int, nullable)
- Add `receiptUrl` field (varchar, nullable)
- Add `adminNotes` field (text, nullable)
- Add `processedAt` field (timestamp, nullable)
- Add `transactionId` field (varchar, nullable) - for admin payment tracking
- Add `billDate` field (date, nullable)
- Add `paymentProcessedAt` field (timestamp, nullable)
- Add `statusUpdatedAt` field (timestamp, nullable)
- Update status enum to include: `PENDING`, `APPROVED`, `REJECTED`, `PROCESSED`, `PAID`
- Add `@BeforeInsert()` and `@BeforeUpdate()` hooks to calculate `amount` field
- Update relationships to use proper foreign keys

### 1.2 Create Migration
**File**: `apps/api/src/migrations/[timestamp]-UpdateCoinTransactionForRewardRequests.ts`

**Changes**:
- Add new columns to `coin_transactions` table
- Update status enum values
- Add indexes for performance

## Phase 2: Create DTOs and Validation (1 hour)

### 2.1 Create Reward Request DTO
**File**: `apps/api/src/coins/dto/create-reward-request.dto.ts`

```typescript
export class CreateRewardRequestDto {
  @IsUUID()
  brandId: string;

  @IsNumber()
  @Min(0.01)
  @Max(100000)
  billAmount: number;

  @IsDateString()
  billDate: string;

  @IsUrl()
  receiptUrl: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  coinsToRedeem?: number;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}
```

### 2.2 Create Response DTOs
**File**: `apps/api/src/coins/dto/reward-request-response.dto.ts`

```typescript
export class RewardRequestResponseDto {
  success: boolean;
  message: string;
  transaction: {
    id: string;
    type: string;
    status: string;
    billAmount: number;
    billDate: Date;
    coinsEarned: number;
    coinsRedeemed: number;
    brand: Brand;
    createdAt: Date;
  };
  newBalance: number;
  transactions: any[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
```

## Phase 3: Create Service Layer (3-4 hours)

### 3.1 Transaction Validation Service
**File**: `apps/api/src/coins/services/transaction-validation.service.ts`

**Key methods**:
- `validateRewardRequest()` - Main validation for unified requests
- `validateEarnRequest()` - Legacy earn validation
- `validateRedeemRequest()` - Legacy redeem validation
- `hasPendingEarnRequests()` - Check for pending requests
- `canProcessRedeemRequest()` - Check if redeem can be processed

**Validation rules**:
- Bill amount minimum/maximum limits
- Bill date validation (not future, not too old)
- Duplicate submission prevention
- Brand active status check
- User balance sufficiency for redemption
- Brand earning/redemption caps
- Time between submissions

### 3.2 Transaction Approval Service
**File**: `apps/api/src/coins/services/transaction-approval.service.ts`

**Key methods**:
- `approveTransaction()` - Approve unified reward request
- `rejectTransaction()` - Reject unified reward request
- `markRedeemTransactionAsPaid()` - Mark redemption as paid
- `getPendingTransactions()` - Get pending for admin review
- `getTransactionStats()` - Admin dashboard statistics

**Features**:
- Database transactions for consistency
- Balance rollback on rejection
- Real-time notifications via WebSocket
- Admin notification system

### 3.3 Balance Update Service
**File**: `apps/api/src/coins/services/balance-update.service.ts`

**Key methods**:
- `updateBalanceForRewardRequest()` - Update balance for unified request
- `updateBalanceForEarnRequest()` - Legacy earn balance update
- `updateBalanceForRedeemRequest()` - Legacy redeem balance update
- `rollbackBalanceUpdate()` - Rollback on rejection

**Features**:
- Optimistic balance updates
- Real-time balance notifications
- Transaction consistency

## Phase 4: Update Coins Service (2 hours)

### 4.1 Update CoinsService
**File**: `apps/api/src/coins/coins.service.ts`

**New methods**:
- `createRewardRequest()` - Main unified method (already exists, needs enhancement)
- `getCoinSystemStats()` - Enhanced statistics (already exists)

**Enhancements**:
- Integrate with new validation service
- Integrate with new approval service
- Integrate with new balance update service
- Add proper error handling and logging

### 4.2 Update Coins Module
**File**: `apps/api/src/coins/coins.module.ts`

**Add providers**:
- `TransactionValidationService`
- `TransactionApprovalService`
- `BalanceUpdateService`

## Phase 5: Update Controllers (1-2 hours)

### 5.1 Update Transaction Controller
**File**: `apps/api/src/coins/controllers/transaction.controller.ts`

**Key endpoints**:
- `POST /transactions/rewards` - Create unified reward request
- `GET /transactions` - Get user transactions with filters
- `GET /transactions/:id` - Get specific transaction
- `GET /transactions/my` - Get user's own transactions

**Features**:
- Comprehensive logging
- Error handling
- Response formatting
- Validation integration

### 5.2 Update Admin Controller
**File**: `apps/api/src/coins/controllers/coin-admin.controller.ts`

**New endpoints**:
- `POST /admin/coins/transactions/:id/approve` - Approve transaction
- `POST /admin/coins/transactions/:id/reject` - Reject transaction
- `POST /admin/coins/transactions/:id/mark-paid` - Mark as paid
- `GET /admin/coins/transactions/pending` - Get pending transactions
- `GET /admin/coins/stats` - Get system statistics

## Phase 6: Update Frontend Integration (2-3 hours)

### 6.1 Update Admin Dashboard
**File**: `apps/admin/src/components/dashboard/EnhancedDashboardContent.tsx`

**Changes**:
- Update transaction display to show unified reward requests
- Add approval/rejection interface
- Show coinsEarned and coinsRedeemed separately
- Add payment processing interface

### 6.2 Update Hooks
**File**: `apps/admin/src/hooks/useCoins.ts`

**Changes**:
- Add methods for unified reward requests
- Update transaction fetching logic
- Add approval/rejection methods

### 6.3 Update Types
**File**: `apps/admin/src/types/entities/coin-transaction.ts`

**Changes**:
- Add new fields from updated entity
- Update status enum
- Add response types

## Phase 7: Testing and Validation (2-3 hours)

### 7.1 Unit Tests
**Files**: `apps/api/src/__tests__/unit/coins/`

**Test files to create/update**:
- `transaction-validation.service.spec.ts`
- `transaction-approval.service.spec.ts`
- `balance-update.service.spec.ts`
- `coins.service.spec.ts`
- `transaction.controller.spec.ts`

### 7.2 Integration Tests
**Files**: `apps/api/src/__tests__/integration/`

**Test files to create/update**:
- `unified-transaction-flow.spec.ts`
- `reward-request-endpoints.spec.ts`

### 7.3 Update Seeding Script
**File**: `apps/api/src/scripts/seed-dummy-data-simple.ts`

**Changes**:
- Create unified reward requests instead of separate earn/redeem
- Use proper bill amounts and dates
- Include receipt URLs
- Set proper status values

## Phase 8: Documentation and Deployment (1 hour)

### 8.1 Update API Documentation
**File**: `docs/API_INDEX.md`

**Changes**:
- Document new reward request endpoints
- Update transaction flow documentation
- Add validation rules documentation

### 8.2 Update Component Index
**File**: `docs/COMPONENT_INDEX.md`

**Changes**:
- Document updated dashboard components
- Update transaction management interfaces

### 8.3 Deployment Considerations
- No database migration needed (already has relationships)
- Backward compatibility with existing transactions
- Gradual rollout possible

## Implementation Timeline

| Phase | Duration | Dependencies | Priority |
|-------|----------|--------------|----------|
| Phase 1: Entity Updates | 1-2 hours | None | High |
| Phase 2: DTOs | 1 hour | Phase 1 | High |
| Phase 3: Services | 3-4 hours | Phase 2 | High |
| Phase 4: Coins Service | 2 hours | Phase 3 | High |
| Phase 5: Controllers | 1-2 hours | Phase 4 | High |
| Phase 6: Frontend | 2-3 hours | Phase 5 | Medium |
| Phase 7: Testing | 2-3 hours | Phase 6 | High |
| Phase 8: Documentation | 1 hour | Phase 7 | Low |

**Total Estimated Time**: 11-16 hours

## Key Benefits

1. **Unified Experience**: Single endpoint for both earning and redeeming
2. **Better UX**: Users can earn and redeem in one transaction
3. **Simplified Admin**: One approval process for combined requests
4. **Consistent Data**: All transaction data in one place
5. **Real-time Updates**: WebSocket integration for live updates
6. **Comprehensive Validation**: Robust business rule enforcement

## Migration Strategy

1. **Backward Compatibility**: Keep existing earn/redeem endpoints
2. **Gradual Rollout**: Deploy new system alongside old
3. **Data Migration**: Convert existing transactions if needed
4. **Feature Flags**: Enable/disable new system as needed

## Success Criteria

- [ ] Unified reward request endpoint working
- [ ] Admin approval/rejection flow functional
- [ ] Real-time balance updates working
- [ ] All validation rules enforced
- [ ] Frontend integration complete
- [ ] Comprehensive test coverage
- [ ] Documentation updated
- [ ] Performance acceptable (< 200ms response time)

## Risk Mitigation

1. **Database Changes**: Use migrations with rollback capability
2. **Service Dependencies**: Implement proper error handling
3. **Frontend Changes**: Maintain backward compatibility
4. **Performance**: Monitor and optimize as needed
5. **Testing**: Comprehensive test coverage before deployment
