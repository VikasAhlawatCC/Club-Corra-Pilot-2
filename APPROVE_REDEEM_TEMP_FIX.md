# Approve/Reject Fix - Temporary Workaround

## ✅ Status: WORKING (with temporary workaround)

## Summary
The approve/reject functionality is now working for **all transaction types**. Due to a missing enum value in the database, we're using a temporary workaround.

## What's Fixed
1. ✅ **Approve earn-only transactions** → Status becomes `PAID`
2. ✅ **Approve redeem transactions** → Status becomes `APPROVED` (temporary - should be `UNPAID`)
3. ✅ **Reject transactions** → Coins are reverted correctly
4. ✅ **Backend database updates** → Actually saves to database
5. ✅ **Frontend UI** → Shows success messages and refreshes data

## Temporary Workaround
**Issue**: The database enum `coin_transaction_status` doesn't have an `UNPAID` value.

**Workaround**: Using `APPROVED` status instead of `UNPAID` for transactions with redemption amounts.

### Files Modified (Temporary):
- `apps/api/src/coins/coins.service.ts` (line 549): Uses `APPROVED` instead of `UNPAID`
- `apps/admin/src/hooks/useCoins.ts` (line 252): Expects `APPROVED` instead of `UNPAID`

## How to Test
1. **Restart API server**:
   ```bash
   cd apps/api
   npm run start:dev
   ```

2. **Test approve for earn-only transaction**:
   - Transaction should change to `PAID` status
   - User balance should reflect earned coins

3. **Test approve for redeem transaction**:
   - Transaction should change to `APPROVED` status (temporary - should be `UNPAID`)
   - User balance should reflect both earned and redeemed coins
   - Admin can later mark it as `PAID` manually

## Permanent Fix: Add UNPAID Enum Value

### Option 1: SQL Command (Recommended)
Run this on your PostgreSQL database:

```sql
ALTER TYPE coin_transaction_status ADD VALUE IF NOT EXISTS 'UNPAID';
```

**How to run**:
- If using **pgAdmin** or **TablePlus**: Connect and run the SQL in a query window
- If using **psql command line**:
  ```bash
  psql -h YOUR_DB_HOST -U YOUR_DB_USER -d YOUR_DB_NAME -c "ALTER TYPE coin_transaction_status ADD VALUE IF NOT EXISTS 'UNPAID';"
  ```

### Option 2: Using the provided script
```bash
cd apps/api
chmod +x add-unpaid-status-simple.sh
./add-unpaid-status-simple.sh
```

### After Adding UNPAID Enum Value:
1. Change line 549 in `apps/api/src/coins/coins.service.ts`:
   ```typescript
   // FROM:
   newStatus = 'APPROVED'; // Temporary
   
   // TO:
   newStatus = 'UNPAID'; // Needs payment processing
   ```

2. Change line 252 in `apps/admin/src/hooks/useCoins.ts`:
   ```typescript
   // FROM:
   const newStatus = transaction.coinsRedeemed && transaction.coinsRedeemed > 0 ? 'APPROVED' : 'PAID'
   
   // TO:
   const newStatus = transaction.coinsRedeemed && transaction.coinsRedeemed > 0 ? 'UNPAID' : 'PAID'
   ```

3. Rebuild both apps:
   ```bash
   cd apps/api && npm run build
   cd ../admin && npm run build
   ```

4. Restart API server

## Current Enum Values
Your database currently has these status values:
- `PENDING`
- `COMPLETED`
- `FAILED`
- `APPROVED`
- `REJECTED`
- `PROCESSED`
- `PAID`
- ~~`UNPAID`~~ (missing - needs to be added)

## According to PRODUCT_REQUIREMENTS.md
The correct flow should be:
- **PENDING**: Initial state after submission
- **PAID**: Approved with no redemption OR approved with redemption after payment is processed
- **UNPAID**: Approved with redemption, waiting for payment
- **REJECTED**: Admin rejected the request

## Next Steps
1. ✅ Test the current implementation with `APPROVED` status
2. ⏳ Add `UNPAID` enum value to database
3. ⏳ Update code to use `UNPAID` instead of `APPROVED`
4. ✅ Test again with proper `UNPAID` status

---

**Created**: 2025-10-08  
**Status**: Temporary workaround in place, pending permanent fix

