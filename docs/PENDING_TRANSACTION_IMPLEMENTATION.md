# Pending Transaction Implementation Summary

## Overview

Successfully implemented a robust system to handle transaction requests from unauthenticated users. When users visit `http://localhost:3002/upload?brand=adidas&amount=1000` and submit a transaction request **before** authentication, the request is now:

1. **Stored in the backend** with a unique session ID
2. **Automatically claimed** after successful sign in/sign up
3. **Converted to a real transaction** and assigned to the authenticated user

## Architecture

### Backend Components

#### 1. Database Entity (`PendingTransaction`)
- **Location**: `apps/api/src/coins/entities/pending-transaction.entity.ts`
- **Table**: `pending_transactions`
- **Key Fields**:
  - `sessionId`: Unique identifier to track user session
  - `brandId`: Brand for the transaction
  - `billAmount`: Transaction amount
  - `receiptUrl`: S3 URL of uploaded receipt
  - `expiresAt`: Auto-expires after 24 hours
  - `claimed`: Boolean flag if transaction was claimed
  - `claimedBy`: User ID who claimed the transaction
  - `claimedAt`: Timestamp when claimed

#### 2. Service Layer
- **Location**: `apps/api/src/coins/services/pending-transaction.service.ts`
- **Key Methods**:
  - `createPendingTransaction()`: Store unauthenticated request
  - `claimPendingTransaction()`: Convert pending to actual transaction
  - `cleanupExpiredTransactions()`: Remove expired entries
  - `cleanupOldClaimedTransactions()`: Remove old claimed entries

#### 3. API Endpoints
- **Location**: `apps/api/src/coins/controllers/pending-transaction.controller.ts`
- **Endpoints**:
  - `POST /api/v1/transactions/pending` - Create pending transaction (no auth)
  - `POST /api/v1/transactions/pending/claim` - Claim after login (requires auth)

#### 4. Database Migration
- **Location**: `apps/api/src/migrations/1759877635657-CreatePendingTransactionsTable.ts`
- **Status**: ✅ Successfully executed
- **Creates**: `pending_transactions` table with indexes on:
  - `session_id` (for fast lookup)
  - `claimed_by` (for user transaction history)
  - `expires_at` (for efficient cleanup)

#### 5. Cleanup Script
- **Location**: `apps/api/src/scripts/cleanup-pending-transactions.ts`
- **Purpose**: Remove expired and old pending transactions
- **Usage**: `npx ts-node -r tsconfig-paths/register src/scripts/cleanup-pending-transactions.ts`
- **Recommended**: Run daily via cron job

### Frontend Components

#### 1. Upload Page
- **Location**: `apps/webapp/src/app/upload/page.tsx`
- **Changes**:
  - Generates unique `sessionId` on page load
  - Stores sessionId in localStorage
  - Calls `createPendingTransaction()` API when user clicks "Continue"
  - Shows success toast and navigates to phone verification

#### 2. Phone Verification Component
- **Location**: `apps/webapp/src/components/PhoneVerification.tsx`
- **Changes**:
  - After successful OTP verification, checks for `pendingTransactionSessionId` in localStorage
  - Calls `claimPendingTransaction()` API with the session ID
  - Shows success toast when transaction is claimed
  - Clears session ID from localStorage after successful claim

#### 3. Login Page
- **Location**: `apps/webapp/src/app/login/page.tsx`
- **Changes**:
  - Also checks for pending transactions after login
  - Claims pending transaction if session ID exists
  - Ensures pending requests are claimed whether user signs in via upload flow or regular login

#### 4. API Client
- **Location**: `apps/webapp/src/lib/api.ts`
- **New Functions**:
  - `createPendingTransaction()`: Create pending transaction in backend
  - `claimPendingTransaction()`: Claim pending transaction after auth
- **New Interface**: `PendingTransaction` with all relevant fields

## User Flow

### Scenario 1: Upload → Sign In → Success

1. **User visits**: `http://localhost:3002/upload?brand=adidas&amount=1000`
2. **User actions**:
   - Selects brand (pre-filled from URL)
   - Uploads receipt → Auto-uploaded to S3
   - Enters amount (pre-filled from URL)
   - Clicks "Continue"
3. **System response**:
   - Creates pending transaction in backend
   - Shows: "Request saved! Please sign in to continue."
   - Navigates to phone verification
4. **User authenticates**:
   - Enters phone number
   - Enters OTP
   - System verifies OTP
5. **Auto-claim**:
   - System automatically claims pending transaction
   - Creates real reward request assigned to user
   - Shows: "Reward request submitted successfully!"
   - Navigates to success page
6. **User dashboard**:
   - Transaction appears in user's history
   - Balance is updated

### Scenario 2: Upload → Close Browser → Login Later

1. **User uploads** transaction data
2. **Pending transaction** stored in backend
3. **User closes** browser (session ID in localStorage)
4. **24 hours later**: User comes back
5. **User logs in** via normal login page
6. **System checks** for pending transaction using session ID
7. **If found and not expired**: Auto-claims transaction
8. **If expired**: Transaction is deleted, user must re-upload

### Scenario 3: Upload → Don't Sign In

1. **User uploads** transaction data
2. **Pending transaction** stored in backend
3. **User never signs in**
4. **After 24 hours**: Cleanup script removes expired transaction
5. **No data leak**: Transaction data is automatically purged

## Benefits

### 1. Improved UX
- Users can start the process without authentication
- No data loss if they close the browser
- Seamless flow from upload to authentication

### 2. Server-Side Reliability
- Data stored in database, not just localStorage
- Server validates brand existence before storing
- Prevents data corruption

### 3. Security
- Session IDs are unique and time-limited
- No PII stored in pending transactions
- Auto-cleanup prevents database bloat

### 4. Scalability
- Handles high volume of unauthenticated users
- Efficient database queries with proper indexes
- Can track analytics on abandoned transactions

### 5. Future Extensibility
- Session ID can be shared via URL/QR code
- Can add email verification flow
- Can implement "Save for later" feature

## Configuration

### Environment Variables
No new environment variables required. Uses existing:
- `DATABASE_URL`: PostgreSQL connection string
- `NEXT_PUBLIC_API_BASE_URL`: API endpoint for webapp

### Database
Ensure your database has the `uuid-ossp` extension (auto-created by migration).

## Maintenance

### Daily Cleanup (Recommended)
Add to crontab:
```bash
0 2 * * * cd /path/to/apps/api && npx ts-node -r tsconfig-paths/register src/scripts/cleanup-pending-transactions.ts
```

### Monitoring
Monitor these metrics:
- Number of pending transactions created per day
- Claim rate (pending → actual transactions)
- Average time between creation and claim
- Expired transaction count

### Troubleshooting

#### Issue: Pending transaction not claimed
**Symptoms**: User completes login but transaction not created
**Debug steps**:
1. Check browser localStorage for `pendingTransactionSessionId`
2. Query database: `SELECT * FROM pending_transactions WHERE session_id = '<sessionId>'`
3. Check API logs for `/transactions/pending/claim` errors
4. Verify transaction hasn't expired

#### Issue: Duplicate transactions
**Symptoms**: User has multiple pending transactions
**Cause**: Session ID was regenerated (localStorage cleared)
**Solution**: This is expected behavior; cleanup script will remove expired ones

#### Issue: Database growing too large
**Symptoms**: `pending_transactions` table has many rows
**Debug steps**:
1. Check cleanup script is running: `SELECT COUNT(*) FROM pending_transactions`
2. Check for expired transactions: `SELECT COUNT(*) FROM pending_transactions WHERE expires_at < NOW()`
3. Manually run cleanup script if needed

## Testing

### Manual Test Flow
1. Clear localStorage and cookies
2. Go to `http://localhost:3002/upload?brand=<brand-id>&amount=1000`
3. Upload a receipt image
4. Click "Continue"
5. Enter phone number and verify OTP
6. Check that transaction appears in dashboard
7. Verify `pendingTransactionSessionId` is cleared from localStorage

### Database Verification
```sql
-- Check pending transactions
SELECT * FROM pending_transactions ORDER BY created_at DESC LIMIT 10;

-- Check claimed transactions
SELECT * FROM pending_transactions WHERE claimed = true ORDER BY claimed_at DESC LIMIT 10;

-- Check expired transactions
SELECT * FROM pending_transactions WHERE expires_at < NOW();

-- Check if transaction was created
SELECT ct.*, pt.session_id 
FROM coin_transactions ct 
LEFT JOIN pending_transactions pt ON pt.claimed_by = ct.user_id 
WHERE ct.type = 'REWARD_REQUEST' 
ORDER BY ct.created_at DESC LIMIT 10;
```

## API Examples

### Create Pending Transaction (Unauthenticated)
```bash
curl -X POST http://localhost:3001/api/v1/transactions/pending \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "session_1234567890_abc123",
    "brandId": "brand-uuid-here",
    "billAmount": 1000,
    "receiptUrl": "https://s3.amazonaws.com/bucket/receipt.jpg",
    "fileName": "receipt.jpg"
  }'
```

### Claim Pending Transaction (Authenticated)
```bash
curl -X POST http://localhost:3001/api/v1/transactions/pending/claim \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <jwt-token>" \
  -d '{
    "sessionId": "session_1234567890_abc123"
  }'
```

## Files Changed/Created

### Backend
- ✅ `apps/api/src/coins/entities/pending-transaction.entity.ts` (new)
- ✅ `apps/api/src/coins/services/pending-transaction.service.ts` (new)
- ✅ `apps/api/src/coins/controllers/pending-transaction.controller.ts` (new)
- ✅ `apps/api/src/coins/dto/create-pending-transaction.dto.ts` (new)
- ✅ `apps/api/src/coins/dto/pending-transaction-response.dto.ts` (new)
- ✅ `apps/api/src/coins/coins.module.ts` (modified)
- ✅ `apps/api/src/migrations/1759877635657-CreatePendingTransactionsTable.ts` (new)
- ✅ `apps/api/src/scripts/cleanup-pending-transactions.ts` (new)

### Frontend
- ✅ `apps/webapp/src/lib/api.ts` (modified)
- ✅ `apps/webapp/src/app/upload/page.tsx` (modified)
- ✅ `apps/webapp/src/components/PhoneVerification.tsx` (modified)
- ✅ `apps/webapp/src/app/login/page.tsx` (modified)

### Documentation
- ✅ `apps/api/src/coins/README_PENDING_TRANSACTIONS.md` (new)
- ✅ `docs/PENDING_TRANSACTION_IMPLEMENTATION.md` (this file)

## Next Steps

1. **Test the flow**: Visit the upload page and complete the full flow
2. **Setup cleanup cron**: Add the cleanup script to your cron scheduler
3. **Monitor metrics**: Track pending transaction creation and claim rates
4. **Consider enhancements**:
   - Email notifications for unclaimed transactions
   - Shareable links with session ID
   - Admin dashboard to view pending transactions
   - Analytics on abandoned transaction reasons

## Support

For issues or questions:
1. Check this documentation first
2. Review API logs: `apps/api/logs`
3. Check database: Query `pending_transactions` table
4. Review browser console for frontend errors
5. Check README_PENDING_TRANSACTIONS.md for detailed technical info

---

**Implementation Date**: October 7, 2025  
**Status**: ✅ Complete and Ready for Testing

