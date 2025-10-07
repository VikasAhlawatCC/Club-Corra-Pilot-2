# Feature 0005: Comprehensive Corra Coins Lifecycle Management Plan

## Overview
Implement and enforce a complete, robust lifecycle management system for corra coins that ensures proper tracking, validation, and display of coin balances across all user-facing and admin interfaces. This plan ensures that coins are only earned through transactions and only burned through redemptions, with complete audit trails and accurate balance tracking.

## Current Implementation Analysis

### Existing Coin Flow
1. **Transaction Submission (PENDING)**:
   - User submits request via webapp
   - System calculates: `coinsEarned = (billAmount - coinsRedeemed) * brand.earningPercentage / 100`
   - Immediately updates balance: `newBalance = currentBalance + coinsEarned - coinsRedeemed`
   - Saves balance snapshots: `previousBalance`, `balanceAfterEarn`, `balanceAfterRedeem`
   - Creates transaction record with status PENDING

2. **Admin Approval**:
   - Admin approves transaction
   - Status changes: PENDING -> UNPAID (if coinsRedeemed > 0) or PAID (if coinsRedeemed = 0)
   - No balance change (already applied at submission)

3. **Admin Rejection**:
   - Admin rejects transaction
   - Balance reverted to `previousBalance`
   - Status changes: PENDING -> REJECTED

4. **Payment Processing**:
   - Admin marks as paid
   - Status changes: UNPAID -> PAID
   - No balance change

### Database Schema
- **CoinBalance**: `balance`, `totalEarned`, `totalRedeemed` (all integers)
- **CoinTransaction**: `billAmount`, `coinsEarned`, `coinsRedeemed`, `previousBalance`, `balanceAfterEarn`, `balanceAfterRedeem`, `status`, etc.

### Current Issues
1. ❌ `totalEarned` and `totalRedeemed` fields in CoinBalance are not being updated
2. ❌ No aggregate tracking of lifetime earnings/redemptions
3. ❌ Inconsistent display of balance information across webapp and admin
4. ❌ Missing validation that balance calculations match transaction history
5. ❌ No clear documentation of when coins are "actually" earned vs. pending

## Business Rules (from PRODUCT_REQUIREMENTS.md)

1. **Whole Numbers Only**: All amounts must be integers
2. **Immediate Balance Updates**: Coins added/subtracted when request is submitted
3. **Reversion on Rejection**: Balance reverted to previous state on rejection
4. **No Negative Balances**: Cannot submit request if balance would go negative

## Required Changes

### Phase 1: Balance Tracking Enhancement

#### 1.1 Update CoinBalance Entity and Service
**Files to modify**:
- `apps/api/src/coins/entities/coin-balance.entity.ts`
- `apps/api/src/coins/coins.service.ts`
- `apps/api/src/coins/services/balance-update.service.ts`

**Changes**:
- Ensure `totalEarned` and `totalRedeemed` are updated whenever balance changes
- Add helper methods to track cumulative earnings and redemptions
- Update `updateUserBalance()` to properly increment `totalEarned` or `totalRedeemed`
- Ensure all balance updates happen within database transactions

**Algorithm**:
```typescript
// When transaction is submitted (PENDING):
if (coinsEarned > 0) {
  coinBalance.totalEarned += coinsEarned
}
if (coinsRedeemed > 0) {
  coinBalance.totalRedeemed += coinsRedeemed
}
coinBalance.balance = balance + coinsEarned - coinsRedeemed

// When transaction is rejected:
// Revert totalEarned and totalRedeemed
if (transaction.coinsEarned > 0) {
  coinBalance.totalEarned -= transaction.coinsEarned
}
if (transaction.coinsRedeemed > 0) {
  coinBalance.totalRedeemed -= transaction.coinsRedeemed
}
coinBalance.balance = transaction.previousBalance
```

#### 1.2 Update Transaction Services
**Files to modify**:
- `apps/api/src/coins/services/transaction-approval.service.ts`
- `apps/api/src/coins/services/transaction-validation.service.ts`

**Changes**:
- Update `revertUserBalance()` to also revert `totalEarned` and `totalRedeemed`
- Add validation to ensure balance calculations are consistent
- Add validation that prevents approval if current balance < redemption amount

**Algorithm for rejection reversion**:
```typescript
private async revertUserBalance(manager, userId, transaction) {
  let balance = await manager.findOne(CoinBalance, { where: { user: { id: userId } }})
  
  // Revert balance
  balance.balance = transaction.previousBalance
  
  // Revert totalEarned if coins were earned
  if (transaction.coinsEarned > 0) {
    balance.totalEarned = Math.max(0, balance.totalEarned - transaction.coinsEarned)
  }
  
  // Revert totalRedeemed if coins were redeemed
  if (transaction.coinsRedeemed > 0) {
    balance.totalRedeemed = Math.max(0, balance.totalRedeemed - transaction.coinsRedeemed)
  }
  
  await manager.save(CoinBalance, balance)
}
```

### Phase 2: Display and API Updates

#### 2.1 Update User API Responses
**Files to modify**:
- `apps/api/src/users/users.service.ts`
- `apps/api/src/auth/auth.service.ts`

**Changes**:
- Ensure user response includes accurate `totalCoins` (same as `balance`)
- Include `totalEarned` and `totalRedeemed` in user profile responses
- Update DTOs to include these fields

#### 2.2 Update Admin APIs
**Files to modify**:
- `apps/api/src/coins/controllers/coin-admin.controller.ts`
- `apps/api/src/admin/admin.controller.ts`

**Changes**:
- Include balance breakdown (`balance`, `totalEarned`, `totalRedeemed`) in user lists
- Show these fields in transaction details
- Add endpoints to get balance history/audit trail

#### 2.3 Update Webapp Balance Display
**Files to modify**:
- `apps/webapp/src/app/dashboard/page.tsx`
- `apps/webapp/src/lib/api.ts`
- `apps/webapp/src/contexts/AuthContext.tsx`

**Changes**:
- Display actual `balance` from `user.totalCoins` (from CoinBalance entity)
- Show `totalEarned` and `totalRedeemed` from user object
- Remove client-side calculation of totals from transactions (use server values)
- Update API client to fetch and handle new fields

**Current Issue**:
```typescript
// Current (WRONG - calculates from transactions):
const totalEarned = transactions.reduce((sum, t) => sum + t.coinsEarned, 0);

// Should be (RIGHT - use server value):
const totalEarned = user?.totalEarned || 0;
```

#### 2.4 Update Admin Balance Display
**Files to modify**:
- `apps/admin/src/components/coins/CoinBalanceCard.tsx`
- `apps/admin/src/components/users/UserList.tsx`
- `apps/admin/src/components/transactions/TransactionVerificationModal.tsx`
- `apps/admin/src/lib/api.ts`

**Changes**:
- Display `balance`, `totalEarned`, `totalRedeemed` from CoinBalance
- Show warning if user balance is insufficient for redemption approval
- Display balance history in transaction modal

### Phase 3: Validation and Business Logic Enforcement

#### 3.1 Enhanced Validation Service
**Files to modify**:
- `apps/api/src/coins/services/transaction-validation.service.ts`

**Changes**:
- Add validation: `user.balance >= coinsToRedeem` at submission time
- Add validation: Calculate expected balance and verify it won't go negative
- Validate that redemption doesn't exceed brand limits
- Validate that earning doesn't exceed brand limits

**New Validation Logic**:
```typescript
async validateRewardRequest(userId, createRewardRequestDto) {
  const { coinsToRedeem, billAmount, brandId } = createRewardRequestDto
  
  // Get current balance
  const balance = await this.getUserBalance(userId)
  
  // Validate sufficient balance for redemption
  if (coinsToRedeem > balance.balance) {
    throw new BadRequestException(
      `Insufficient balance. You have ${balance.balance} coins but trying to redeem ${coinsToRedeem} coins`
    )
  }
  
  // Get brand
  const brand = await this.getBrand(brandId)
  
  // Calculate expected earning
  const netBillAmount = billAmount - coinsToRedeem
  const coinsEarned = Math.max(1, Math.round((netBillAmount * brand.earningPercentage) / 100))
  
  // Validate final balance won't be negative
  const finalBalance = balance.balance + coinsEarned - coinsToRedeem
  if (finalBalance < 0) {
    throw new BadRequestException('Transaction would result in negative balance')
  }
  
  // Validate brand limits
  if (brand.maxRedemptionPerTransaction && coinsToRedeem > brand.maxRedemptionPerTransaction) {
    throw new BadRequestException(`Maximum redemption for ${brand.name} is ${brand.maxRedemptionPerTransaction} coins`)
  }
  
  if (brand.maxEarningPerTransaction && coinsEarned > brand.maxEarningPerTransaction) {
    throw new BadRequestException(`Maximum earning for ${brand.name} is ${brand.maxEarningPerTransaction} coins`)
  }
}
```

#### 3.2 Enhanced Approval Validation
**Files to modify**:
- `apps/api/src/coins/services/transaction-approval.service.ts`

**Changes**:
- Before approval, verify user still has sufficient balance if redemption was involved
- Check for race conditions where balance might have changed since submission

**New Approval Logic**:
```typescript
async approveTransaction(transactionId, approvalDto) {
  return await this.transactionRepository.manager.transaction(async (manager) => {
    const transaction = await manager.findOne(CoinTransaction, { 
      where: { id: transactionId },
      relations: ['user', 'brand']
    })
    
    // ... existing validations ...
    
    // Additional validation: Check if user still has sufficient balance
    if (transaction.coinsRedeemed && transaction.coinsRedeemed > 0) {
      const currentBalance = await manager.findOne(CoinBalance, {
        where: { user: { id: transaction.user.id } }
      })
      
      if (currentBalance.balance < transaction.coinsRedeemed) {
        throw new BadRequestException(
          `Cannot approve: User balance (${currentBalance.balance}) is less than redemption amount (${transaction.coinsRedeemed})`
        )
      }
    }
    
    // ... proceed with approval ...
  })
}
```

### Phase 4: Data Integrity and Migration

#### 4.1 Create Migration for Recalculation
**Files to create**:
- `apps/api/src/migrations/1759790000000-RecalculateCoinBalances.ts`

**Purpose**:
- Recalculate `totalEarned` and `totalRedeemed` for all existing users
- Verify that calculated balances match stored balances
- Fix any inconsistencies

**Algorithm**:
```typescript
// For each user:
const transactions = await getApprovedTransactions(userId)

let totalEarned = 0
let totalRedeemed = 0
let balance = 0

for (const tx of transactions.sortBy('createdAt')) {
  if (tx.status !== 'REJECTED') {
    totalEarned += tx.coinsEarned || 0
    totalRedeemed += tx.coinsRedeemed || 0
    balance += (tx.coinsEarned || 0) - (tx.coinsRedeemed || 0)
  }
}

// Update CoinBalance
await updateCoinBalance(userId, { balance, totalEarned, totalRedeemed })
```

#### 4.2 Add Balance Audit Script
**Files to create**:
- `apps/api/src/scripts/audit-coin-balances.ts`

**Purpose**:
- Verify that all user balances match transaction history
- Report any discrepancies
- Provide fix suggestions

### Phase 5: Testing and Documentation

#### 5.1 Update Tests
**Files to modify/create**:
- `apps/admin/src/__tests__/api/coins.test.ts`
- `apps/admin/src/__tests__/hooks/useCoins.test.ts`

**Test Cases**:
1. Submit request with earning only (coinsRedeemed = 0)
2. Submit request with both earning and redemption
3. Reject request and verify balance reversion
4. Approve request and verify no balance change
5. Verify totalEarned and totalRedeemed are correctly updated
6. Test insufficient balance validation
7. Test negative balance prevention

#### 5.2 Update Documentation
**Files to modify**:
- `docs/PRODUCT_REQUIREMENTS.md` (update with clarified lifecycle)
- Create `docs/COIN_LIFECYCLE.md` (detailed technical documentation)

## Implementation Phases Summary

### Phase 1: Core Balance Tracking (Critical)
- Update balance update logic to track totalEarned/totalRedeemed
- Update rejection reversion to properly revert all fields
- Estimated effort: 4 hours

### Phase 2: Display Updates (High Priority)
- Update webapp to show server-side balance values
- Update admin to show complete balance breakdown
- Estimated effort: 3 hours

### Phase 3: Enhanced Validation (High Priority)
- Add comprehensive validation at submission and approval
- Prevent negative balances and race conditions
- Estimated effort: 3 hours

### Phase 4: Data Integrity (Medium Priority)
- Create migration to fix existing data
- Add audit script for ongoing monitoring
- Estimated effort: 2 hours

### Phase 5: Testing & Documentation (Medium Priority)
- Write comprehensive tests
- Update all documentation
- Estimated effort: 2 hours

## Success Criteria

1. ✅ All balance updates correctly update `balance`, `totalEarned`, and `totalRedeemed`
2. ✅ Rejection properly reverts all three fields
3. ✅ Webapp dashboard shows accurate server-side values
4. ✅ Admin interface shows complete balance breakdown
5. ✅ Validation prevents all negative balance scenarios
6. ✅ All existing data is corrected and validated
7. ✅ Comprehensive tests pass
8. ✅ Documentation is complete and accurate

## Risk Mitigation

1. **Data Inconsistency**: Run migration in transaction, with rollback capability
2. **Race Conditions**: Use database transactions for all balance updates
3. **Display Confusion**: Clear labeling of pending vs. approved amounts
4. **Migration Failures**: Test on copy of production data first

## Files Summary

### Files to Modify (17 files)
1. `apps/api/src/coins/entities/coin-balance.entity.ts`
2. `apps/api/src/coins/coins.service.ts`
3. `apps/api/src/coins/services/balance-update.service.ts`
4. `apps/api/src/coins/services/transaction-approval.service.ts`
5. `apps/api/src/coins/services/transaction-validation.service.ts`
6. `apps/api/src/users/users.service.ts`
7. `apps/api/src/auth/auth.service.ts`
8. `apps/api/src/coins/controllers/coin-admin.controller.ts`
9. `apps/webapp/src/app/dashboard/page.tsx`
10. `apps/webapp/src/lib/api.ts`
11. `apps/webapp/src/contexts/AuthContext.tsx`
12. `apps/admin/src/components/coins/CoinBalanceCard.tsx`
13. `apps/admin/src/components/users/UserList.tsx`
14. `apps/admin/src/components/transactions/TransactionVerificationModal.tsx`
15. `apps/admin/src/lib/api.ts`
16. `apps/admin/src/__tests__/api/coins.test.ts`
17. `apps/admin/src/__tests__/hooks/useCoins.test.ts`

### Files to Create (3 files)
1. `apps/api/src/migrations/1759790000000-RecalculateCoinBalances.ts`
2. `apps/api/src/scripts/audit-coin-balances.ts`
3. `docs/COIN_LIFECYCLE.md`

## Dependencies

- TypeORM for database operations
- NestJS transaction management
- React Query for data fetching (webapp/admin)

## Rollback Plan

If issues arise:
1. Revert database migration
2. Restore previous balance update logic
3. Revert API response changes
4. Revert frontend display changes

