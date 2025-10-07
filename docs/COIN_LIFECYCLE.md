# Corra Coins Lifecycle - Technical Documentation

## Overview
This document provides a comprehensive technical specification for how corra coins are managed throughout their lifecycle in the Club Corra platform. It serves as the single source of truth for developers working with the coin system.

## Core Principle
**Users can ONLY earn coins through transaction requests and ONLY burn coins through redemption requests.**

## Currency Model
- **1 Corra Coin = ₹1 (1 Indian Rupee)**
- All amounts are stored and processed as **whole numbers only** (integers)
- No decimal values are allowed anywhere in the system

## Database Schema

### CoinBalance Entity
Location: `apps/api/src/coins/entities/coin-balance.entity.ts`

```typescript
{
  id: string (UUID)
  userId: string (Foreign Key -> users.id)
  balance: number (INTEGER) // Current available coins
  totalEarned: number (INTEGER) // Lifetime earnings
  totalRedeemed: number (INTEGER) // Lifetime redemptions
  createdAt: Date
  updatedAt: Date
}
```

**Invariant**: `balance = totalEarned - totalRedeemed` (after accounting for rejections)

### CoinTransaction Entity
Location: `apps/api/src/coins/entities/coin-transaction.entity.ts`

```typescript
{
  id: string (UUID)
  userId: string (Foreign Key -> users.id)
  brandId: string (Foreign Key -> brands.id)
  type: string // 'REWARD_REQUEST'
  status: string // 'PENDING' | 'APPROVED' | 'REJECTED' | 'UNPAID' | 'PAID'
  
  // Transaction amounts (all integers)
  billAmount: number // Original bill/MRP
  coinsEarned: number // Coins earned from this transaction
  coinsRedeemed: number // Coins redeemed in this transaction
  amount: string // Net change (coinsEarned - coinsRedeemed) stored as string for bigint
  
  // Balance snapshots for audit trail
  previousBalance: number // Balance before this transaction
  balanceAfterEarn: number // Balance after adding earnings
  balanceAfterRedeem: number // Balance after subtracting redemption
  
  // Receipt and metadata
  receiptUrl: string // S3 URL
  billDate: Date // Date on receipt
  
  // Admin workflow
  adminNotes: string // Admin comments/rejection reason
  processedAt: Date // When admin approved/rejected
  paymentProcessedAt: Date // When UPI payment was made
  statusUpdatedAt: Date // Last status change
  transactionId: string // External payment transaction ID
  
  createdAt: Date
  updatedAt: Date
}
```

## Lifecycle States

### 1. Transaction Submission (PENDING)

**When**: User submits a reward request via webapp

**Process**:
1. User fills form:
   - Selects brand
   - Uploads receipt (stored in S3)
   - Enters `billAmount` (MRP on receipt)
   - Optionally slides redemption slider to set `coinsToRedeem` (0 to maxRedeemable)

2. System validates:
   ```typescript
   // Check sufficient balance for redemption
   if (coinsToRedeem > user.balance) {
     throw Error("Insufficient balance")
   }
   
   // Calculate maximum redeemable
   maxRedeemable = min(
     user.balance,
     billAmount × brand.redemptionPercentage / 100,
     brand.maxRedemptionPerTransaction
   )
   
   // Calculate coins earned (on NET amount)
   netBillAmount = billAmount - coinsToRedeem
   coinsEarned = max(1, round(netBillAmount × brand.earningPercentage / 100))
   
   // Check brand limits
   if (coinsEarned > brand.maxEarningPerTransaction) {
     throw Error("Exceeds earning limit")
   }
   ```

3. System creates transaction record:
   ```typescript
   transaction = {
     userId,
     brandId,
     type: 'REWARD_REQUEST',
     status: 'PENDING',
     billAmount,
     coinsEarned,
     coinsRedeemed,
     amount: (coinsEarned - coinsRedeemed).toString(),
     previousBalance: currentBalance,
     balanceAfterEarn: currentBalance + coinsEarned,
     balanceAfterRedeem: currentBalance + coinsEarned - coinsRedeemed,
     receiptUrl,
     billDate,
     statusUpdatedAt: now()
   }
   ```

4. **System immediately updates balance** (Business Rule #2):
   ```typescript
   coinBalance.balance += coinsEarned - coinsRedeemed
   coinBalance.totalEarned += coinsEarned
   coinBalance.totalRedeemed += coinsRedeemed
   ```

5. User sees updated balance immediately on dashboard

**Key Points**:
- Balance is updated **immediately** when request is submitted
- Users see their "pending" balance right away
- Balance snapshots are saved for potential reversion
- All operations happen in a database transaction (atomic)

### 2. Admin Approval (APPROVED → UNPAID/PAID)

**When**: Admin approves transaction in admin panel

**Process**:
1. Admin validates in TransactionVerificationModal:
   - Reviews receipt image
   - Checks bill details match
   - Verifies calculations are correct

2. System validates:
   ```typescript
   // Check no older pending transactions exist
   olderPending = await findOlderPendingTransactions(userId, currentTransactionDate)
   if (olderPending.length > 0) {
     throw Error("Process older transactions first")
   }
   
   // Verify user still has sufficient balance (if redemption involved)
   if (transaction.coinsRedeemed > 0) {
     currentBalance = await getUserBalance(userId)
     if (currentBalance.balance < transaction.coinsRedeemed) {
       throw Error("Insufficient balance now")
     }
   }
   ```

3. System updates transaction:
   ```typescript
   // Determine new status based on redemption
   if (transaction.coinsRedeemed > 0) {
     transaction.status = 'UNPAID' // Needs UPI payment
   } else {
     transaction.status = 'PAID' // Auto-complete
   }
   
   transaction.processedAt = now()
   transaction.statusUpdatedAt = now()
   transaction.adminNotes = approvalDto.adminNotes
   ```

4. **No balance change** (already applied at submission)

**Key Points**:
- No balance update occurs on approval
- Oldest-first processing is enforced
- Status depends on whether redemption was involved
- If redemption = 0, status goes directly to PAID

### 3. Admin Rejection (REJECTED)

**When**: Admin rejects transaction (invalid receipt, fraud, etc.)

**Process**:
1. System validates:
   ```typescript
   if (transaction.status !== 'PENDING') {
     throw Error("Can only reject pending transactions")
   }
   ```

2. **System reverts balance** (Business Rule #3):
   ```typescript
   // Revert to previous state
   coinBalance.balance = transaction.previousBalance
   
   // Revert cumulative totals
   coinBalance.totalEarned -= transaction.coinsEarned
   coinBalance.totalRedeemed -= transaction.coinsRedeemed
   ```

3. System updates transaction:
   ```typescript
   transaction.status = 'REJECTED'
   transaction.processedAt = now()
   transaction.statusUpdatedAt = now()
   transaction.adminNotes = rejectionDto.reason
   ```

4. User sees original balance restored

**Key Points**:
- Complete reversion of balance to pre-submission state
- Both `balance` and cumulative totals (`totalEarned`, `totalRedeemed`) are reverted
- All operations in database transaction (atomic)
- User is notified (TODO: WebSocket notification)

### 4. Payment Processing (UNPAID → PAID)

**When**: Admin marks transaction as paid after UPI transfer

**Process**:
1. Admin verifies UPI payment was sent to user's UPI ID
2. System updates transaction:
   ```typescript
   if (transaction.status !== 'UNPAID') {
     throw Error("Transaction must be in UNPAID status")
   }
   
   transaction.status = 'PAID'
   transaction.paymentProcessedAt = now()
   transaction.statusUpdatedAt = now()
   transaction.transactionId = markPaidDto.transactionId // UPI ref
   transaction.adminNotes += markPaidDto.adminNotes
   ```

3. **No balance change** (already applied at submission)

**Key Points**:
- Only applies to transactions with redemption > 0
- Tracks external payment transaction ID
- Final state of transaction lifecycle

## Balance Calculation Examples

### Example 1: Earn Only (No Redemption)
```
Initial State:
  balance = 100
  totalEarned = 100
  totalRedeemed = 0

User submits:
  billAmount = 1000
  brand.earningPercentage = 10%
  coinsToRedeem = 0

Calculations:
  netBillAmount = 1000 - 0 = 1000
  coinsEarned = round(1000 × 0.10) = 100
  coinsRedeemed = 0

After Submission (PENDING):
  balance = 100 + 100 - 0 = 200
  totalEarned = 100 + 100 = 200
  totalRedeemed = 0 + 0 = 0

After Approval:
  No change (already applied)

After Rejection:
  balance = 100 (reverted)
  totalEarned = 100 (reverted)
  totalRedeemed = 0 (reverted)
```

### Example 2: Earn + Redeem
```
Initial State:
  balance = 500
  totalEarned = 500
  totalRedeemed = 0

User submits:
  billAmount = 2000
  brand.earningPercentage = 10%
  brand.redemptionPercentage = 50%
  coinsToRedeem = 200 (user slides redemption slider)

Calculations:
  maxRedeemable = min(500, 2000 × 0.50, brandMax) = 500
  userChooses = 200 (within max)
  netBillAmount = 2000 - 200 = 1800
  coinsEarned = round(1800 × 0.10) = 180
  coinsRedeemed = 200

After Submission (PENDING):
  balance = 500 + 180 - 200 = 480
  totalEarned = 500 + 180 = 680
  totalRedeemed = 0 + 200 = 200

After Approval (becomes UNPAID):
  No change (already applied)
  Status = UNPAID (because coinsRedeemed > 0)

After Payment (becomes PAID):
  No change (already applied)
  Status = PAID
  paymentProcessedAt = now()
  User receives ₹200 via UPI
```

### Example 3: Multiple Transactions
```
Initial State:
  balance = 0
  totalEarned = 0
  totalRedeemed = 0

Transaction 1 (Earn 100, Redeem 0):
  PENDING → balance = 100, totalEarned = 100
  APPROVED → No change

Transaction 2 (Earn 50, Redeem 0):
  PENDING → balance = 150, totalEarned = 150
  APPROVED → No change

Transaction 3 (Earn 80, Redeem 100):
  PENDING → balance = 130, totalEarned = 230, totalRedeemed = 100
  REJECTED → balance = 150, totalEarned = 150, totalRedeemed = 0

Final State:
  balance = 150
  totalEarned = 150
  totalRedeemed = 0
```

## API Endpoints

### User Endpoints

#### POST /transactions/rewards
Create a reward request (earn + optional redeem)

```typescript
Request:
{
  brandId: string
  billAmount: number // integer
  billDate: string // ISO date
  receiptUrl: string // S3 URL
  coinsToRedeem?: number // integer, default 0
  upiId?: string // required if coinsToRedeem > 0
}

Response:
{
  success: boolean
  message: string
  transaction: {
    id: string
    status: 'PENDING'
    coinsEarned: number
    coinsRedeemed: number
    billAmount: number
    // ... other fields
  }
  balance: {
    balance: number
    totalEarned: number
    totalRedeemed: number
  }
  recentTransactions: Transaction[]
}
```

#### GET /transactions/my-transactions
Get user's transaction history

```typescript
Response:
{
  success: boolean
  data: Transaction[]
  balance: {
    balance: number
    totalEarned: number
    totalRedeemed: number
  }
}
```

### Admin Endpoints

#### POST /coins/transactions/:id/approve
Approve a pending transaction

```typescript
Request:
{
  adminNotes?: string
}

Response:
{
  id: string
  status: 'UNPAID' | 'PAID'
  processedAt: Date
  // ... full transaction
}
```

#### POST /coins/transactions/:id/reject
Reject a pending transaction

```typescript
Request:
{
  reason: string // Required
  adminNotes?: string
}

Response:
{
  id: string
  status: 'REJECTED'
  adminNotes: string
  processedAt: Date
  // ... full transaction
}
```

#### POST /coins/transactions/:id/mark-paid
Mark UNPAID transaction as PAID

```typescript
Request:
{
  transactionId: string // UPI transaction ref
  adminNotes?: string
}

Response:
{
  id: string
  status: 'PAID'
  paymentProcessedAt: Date
  transactionId: string
  // ... full transaction
}
```

## Validation Rules

### Submission Validation
1. **Brand exists and is active**
2. **Bill amount > 0**
3. **Receipt uploaded successfully to S3**
4. **Redemption validation**:
   - `coinsToRedeem >= 0`
   - `coinsToRedeem <= user.balance`
   - `coinsToRedeem <= billAmount × brand.redemptionPercentage / 100`
   - `coinsToRedeem <= brand.maxRedemptionPerTransaction`
5. **Earning validation**:
   - Calculated `coinsEarned <= brand.maxEarningPerTransaction`
6. **Balance validation**:
   - Final balance won't be negative: `balance + coinsEarned - coinsRedeemed >= 0`
7. **UPI validation**:
   - If `coinsToRedeem > 0`, UPI ID must be provided

### Approval Validation
1. **Transaction exists and status is PENDING**
2. **No older pending transactions** for same user
3. **User still has sufficient balance** (if redemption involved)
4. **Final balance validation**: Recheck that approval won't cause negative balance

### Rejection Validation
1. **Transaction exists and status is PENDING**
2. **Reason is provided**

### Payment Validation
1. **Transaction exists and status is UNPAID**
2. **Transaction ID provided**

## Display Requirements

### Webapp Dashboard
**Location**: `apps/webapp/src/app/dashboard/page.tsx`

Must display from **server values only**:
```typescript
const totalCoins = user.balance // NOT calculated from transactions
const totalEarned = user.totalEarned // NOT calculated from transactions
const totalRedeemed = user.totalRedeemed // NOT calculated from transactions
```

### Admin Interface
**Location**: `apps/admin/src/components/transactions/TransactionVerificationModal.tsx`

Must display:
- User's current balance
- Transaction details: `coinsEarned`, `coinsRedeemed`, `billAmount`
- Balance snapshots: `previousBalance`, `balanceAfterEarn`, `balanceAfterRedeem`
- Warning if approval would cause negative balance

## Error Handling

### Common Errors

1. **Insufficient Balance**:
   ```
   Status: 400
   Message: "Insufficient balance. You have X coins but trying to redeem Y coins"
   ```

2. **Negative Balance Prevention**:
   ```
   Status: 400
   Message: "Transaction would result in negative balance"
   ```

3. **Older Pending Transactions**:
   ```
   Status: 400
   Message: "Cannot approve this transaction. User has an older pending transaction (ID: xxx) that must be processed first"
   ```

4. **Invalid Status Transition**:
   ```
   Status: 400
   Message: "Transaction is not in pending status"
   ```

## Race Conditions and Concurrency

### Protection Mechanisms

1. **Database Transactions**: All balance updates wrapped in DB transactions
2. **Row Locking**: Use `FOR UPDATE` when reading balance before update
3. **Optimistic Locking**: Entity versioning to detect concurrent modifications
4. **Validation on Approval**: Recheck balance at approval time (not just submission)

### Example Transaction Flow
```typescript
await dataSource.transaction(async (manager) => {
  // Lock the balance row
  const balance = await manager.findOne(CoinBalance, {
    where: { user: { id: userId } },
    lock: { mode: 'pessimistic_write' }
  })
  
  // Update balance
  balance.balance += coinsEarned - coinsRedeemed
  balance.totalEarned += coinsEarned
  balance.totalRedeemed += coinsRedeemed
  
  await manager.save(balance)
  
  // Create transaction record
  const transaction = manager.create(CoinTransaction, { ... })
  await manager.save(transaction)
  
  // Both saved or both rolled back
})
```

## Testing Checklist

### Unit Tests
- [ ] Balance calculation with earn only
- [ ] Balance calculation with redeem only
- [ ] Balance calculation with both earn and redeem
- [ ] Balance reversion on rejection
- [ ] Validation: insufficient balance
- [ ] Validation: negative balance prevention
- [ ] Validation: brand limits

### Integration Tests
- [ ] Full lifecycle: Submit → Approve → Mark Paid
- [ ] Full lifecycle: Submit → Reject → Resubmit
- [ ] Concurrent submissions from same user
- [ ] Multiple pending transactions (oldest first enforcement)

### E2E Tests
- [ ] Webapp: Submit request and see balance update
- [ ] Admin: Approve request and verify status
- [ ] Admin: Reject request and verify balance reversion
- [ ] Webapp: Dashboard shows correct server values

## Monitoring and Auditing

### Key Metrics to Track
1. **Balance Consistency**: Regular audit that `balance = totalEarned - totalRedeemed`
2. **Pending Transactions**: Count and age of pending transactions
3. **Rejection Rate**: Percentage of transactions rejected
4. **Average Processing Time**: Time from PENDING to APPROVED/REJECTED

### Audit Script
Location: `apps/api/src/scripts/audit-coin-balances.ts`

Should verify:
- All balances match transaction history
- No negative balances
- `totalEarned` and `totalRedeemed` are accurate
- Status transitions are valid

## Future Enhancements

1. **WebSocket Notifications**: Real-time updates when admin approves/rejects
2. **Balance History**: Track all balance changes with timestamps
3. **Automated Approval**: Auto-approve low-value transactions with ML verification
4. **Batch Payment Processing**: Mark multiple transactions as paid at once
5. **Referral Bonuses**: Award coins for referrals (new earning source)

## Related Documentation

- [PRODUCT_REQUIREMENTS.md](./PRODUCT_REQUIREMENTS.md) - Business requirements
- [Feature 0005 Plan](./features/0005_COIN_LIFECYCLE_MANAGEMENT_PLAN.md) - Implementation plan
- [API_INDEX.md](./API_INDEX.md) - API service structure
- [TYPES_INDEX.md](./TYPES_INDEX.md) - TypeScript interfaces

