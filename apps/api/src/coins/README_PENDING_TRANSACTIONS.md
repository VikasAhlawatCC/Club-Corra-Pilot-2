# Pending Transactions Feature

## Overview

This feature allows users to start submitting a transaction request (uploading receipt, selecting brand, entering amount) before authentication. The data is temporarily stored in the database and then claimed after successful login/signup.

## Architecture

### Database

**Table: `pending_transactions`**
- Stores temporary transaction data before user authentication
- Automatically expires after 24 hours
- Includes a `sessionId` to track user sessions across devices

### API Endpoints

#### 1. Create Pending Transaction (Unauthenticated)
```
POST /api/v1/transactions/pending
Body: {
  sessionId: string,
  brandId: string,
  billAmount: number,
  receiptUrl: string,
  fileName?: string
}
```

Creates a temporary transaction that expires in 24 hours. If a pending transaction with the same `sessionId` already exists, it updates that record instead.

#### 2. Claim Pending Transaction (Authenticated)
```
POST /api/v1/transactions/pending/claim
Authorization: Bearer <token>
Body: {
  sessionId: string
}
```

After successful authentication, this endpoint:
1. Retrieves the pending transaction by sessionId
2. Creates an actual reward request with the stored data
3. Marks the pending transaction as claimed
4. Returns both the pending transaction and created reward request

### Webapp Flow

1. **User starts upload** (`/upload`)
   - Session ID is generated and stored in localStorage
   - User selects brand, uploads receipt, enters amount
   - Clicking "Continue" creates a pending transaction in the backend

2. **User authenticates** (`/upload/phone` or `/login`)
   - After OTP verification, the webapp automatically claims the pending transaction
   - The pending transaction is converted to an actual reward request
   - Session ID is cleared from localStorage

3. **Success** (`/upload/success` or `/dashboard`)
   - User is redirected to appropriate page
   - Reward request is now in their transaction history

## Cleanup

### Automated Cleanup Script

Run the cleanup script to remove expired/old pending transactions:

```bash
cd apps/api
npx ts-node src/scripts/cleanup-pending-transactions.ts
```

This script:
- Deletes pending transactions older than 24 hours
- Deletes claimed pending transactions older than 7 days

### Recommended Cron Schedule

Add to your crontab to run daily at 2 AM:
```
0 2 * * * cd /path/to/apps/api && npx ts-node src/scripts/cleanup-pending-transactions.ts
```

Or use a task scheduler in your deployment environment (AWS EventBridge, Google Cloud Scheduler, etc.)

## Benefits Over localStorage-Only Approach

1. **Cross-device support**: Session ID can be shared via URL or QR code
2. **Server-side validation**: Brand existence and data integrity checked before storage
3. **Reliability**: Data persists even if browser is closed or localStorage is cleared
4. **Audit trail**: Complete record of pending transactions for debugging
5. **Scalability**: Can handle high volume of unauthenticated users

## Security Considerations

1. **Session ID generation**: Uses timestamp + random string for uniqueness
2. **Expiration**: Auto-expires after 24 hours to prevent database bloat
3. **No PII stored**: Only stores transaction data, no user information
4. **Rate limiting**: Consider adding rate limiting on the create endpoint to prevent abuse
5. **Validation**: Brand ID is validated before creating pending transaction

## Migration

To set up the database table, run:

```bash
cd apps/api
npm run migration:run
```

This will create the `pending_transactions` table with all necessary indexes.

## Testing

Manual test flow:
1. Go to `/upload` (not logged in)
2. Upload receipt and fill form
3. Click Continue
4. Verify pending transaction created in database
5. Complete phone verification
6. Verify pending transaction claimed and reward request created
7. Check that session ID is cleared from localStorage

## Troubleshooting

**Issue**: Pending transaction not claimed after login
- Check browser console for errors
- Verify sessionId exists in localStorage before login
- Check backend logs for claim endpoint errors
- Verify pending transaction exists and hasn't expired

**Issue**: Multiple pending transactions for same session
- This is expected behavior - newer transactions update existing ones
- Only the latest data is kept for each sessionId

**Issue**: Database filling up with pending transactions
- Ensure cleanup script is running regularly
- Check expiration logic is working correctly
- Consider reducing expiration time if needed

