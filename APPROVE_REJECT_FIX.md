# Approve/Reject Transaction Fix

## Issue
When clicking "Approve" on the verify receipt page, the transaction status was not changing.

## Root Cause
The frontend was calling **non-existent API endpoints**:

### What Frontend Was Calling:
- `PUT /admin/coins/transactions/:id/approve` ❌
- `PUT /admin/coins/transactions/:id/approve-redeem` ❌ (doesn't exist)
- `PUT /admin/coins/transactions/:id/reject-redeem` ❌ (doesn't exist)

### What Backend Actually Has:
- `POST /admin/coins/transactions/:id/approve` ✅ (unified for EARN & REDEEM)
- `POST /admin/coins/transactions/:id/reject` ✅ (unified for EARN & REDEEM)
- `POST /admin/coins/transactions/:id/mark-paid` ✅

## Changes Made

### 1. Fixed API Endpoints (`apps/admin/src/lib/api.ts`)
```typescript
// Before: Using wrong method (PUT) and non-existent endpoints
approveEarnTransaction: PUT /approve
approveRedeemTransaction: PUT /approve-redeem ❌

// After: Using correct method (POST) and unified endpoint
approveEarnTransaction: POST /approve ✅
approveRedeemTransaction: POST /approve ✅
```

### 2. Fixed Request Body Format
```typescript
// Before
body: JSON.stringify({ adminUserId, adminNotes })

// After (matches backend DTO)
body: JSON.stringify({ adminNotes }) // for approve
body: JSON.stringify({ reason: adminNotes }) // for reject
```

### 3. Fixed Status Update Logic (`apps/admin/src/hooks/useCoins.ts`)
```typescript
// Before: Always set to 'APPROVED'
status: 'APPROVED'

// After: Set based on redemption amount (per requirements)
const newStatus = transaction.coinsRedeemed && transaction.coinsRedeemed > 0 
  ? 'UNPAID'  // Has redemption → needs payment
  : 'PAID'    // No redemption → auto-completed
```

## How It Works Now (Per Requirements)

### Transaction with NO Redemption (`coinsRedeemed = 0`):
1. Admin clicks "Approve"
2. Status changes to **PAID** (auto-completed)
3. No further action needed

### Transaction WITH Redemption (`coinsRedeemed > 0`):
1. Admin clicks "Approve"
2. Status changes to **UNPAID** (awaits payment)
3. Admin sees UPI ID in transaction details
4. Admin processes UPI payment manually
5. Admin clicks "Mark as Paid" and enters UPI transaction ID
6. Status changes to **PAID**

## Backend Flow (No Changes Needed)
The backend `approveTransaction()` method already handles this correctly:

```typescript
// Determine status based on redemption
if (transaction.coinsRedeemed && transaction.coinsRedeemed > 0) {
  newStatus = 'UNPAID'; // Needs payment processing
} else {
  newStatus = 'PAID'; // No redemption, automatically paid
}
```

## Testing
✅ Approve transaction with NO redemption → status changes to PAID
✅ Approve transaction WITH redemption → status changes to UNPAID
✅ Reject transaction → balance reverted, status changes to REJECTED
✅ Mark UNPAID as PAID → status changes to PAID with payment details

## Critical Backend Fix

### The Backend Response Issue
The backend controller was returning the raw `CoinTransaction` entity instead of wrapping it in a proper API response format:

```typescript
// Before (WRONG - frontend couldn't detect success)
return this.coinsService.approveTransaction(id, req.user.id, approvalDto.adminNotes);

// After (CORRECT - proper API response)
const transaction = await this.coinsService.approveTransaction(id, req.user.id, approvalDto.adminNotes);
return {
  success: true,
  message: 'Transaction approved successfully',
  data: { transaction }
};
```

**Why This Was Critical:**
- Frontend checks `if (response.success)` before updating UI
- Backend was returning raw entity (no `success` field)
- Frontend saw `response.success === undefined` (falsy)
- UI updated locally but backend changes were ignored
- Transaction status in database was actually being updated, but frontend thought it failed!

## Files Modified
1. `apps/admin/src/lib/api.ts` - Fixed API endpoints and HTTP methods
2. `apps/admin/src/hooks/useCoins.ts` - Fixed status update logic
3. `apps/api/src/coins/controllers/coin-admin.controller.ts` - **CRITICAL: Wrap responses in success format**

