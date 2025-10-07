# Product Requirements

Here is the entire product that we are implementing in this monorepo: 
Always remember 1 corra coin is 1 rupee!

## Business Rules

1. **Whole Numbers Only**: All amounts (transaction values, corra coins, redemption amounts) must be stored and processed as whole numbers only. No decimal values are allowed.
2. **Immediate Coin Balance Updates**: When a user submits a transaction request, the total earned amount is immediately added to their corra coin balance, and the total redeemed amount is immediately subtracted from their balance. This ensures users see their updated balance right after submission.
3. **Coin Reversion on Rejection**: When a transaction request is rejected by an admin, only then are the added and subtracted amounts associated with that specific request reverted back to the user's previous balance state.
4. **No Negative Balances**: A transaction request cannot be approved if the user's total corra coins would become negative after the redemption. The system must validate that `user_balance >= redemption_amount` before allowing approval.

## Corra Coins Lifecycle

### How Users Earn Coins
Users **ONLY** earn corra coins through the following method:
- **Transaction Requests (Earning)**: When a user submits a transaction request in the webapp, coins are calculated and immediately added to their balance based on:
  - Formula: `coinsEarned = (billAmount - coinsRedeemed) × brand.earningPercentage / 100`
  - The earning is on the NET bill amount (after redemption is deducted)
  - All calculations result in whole numbers (rounded)

### How Users Burn (Spend) Coins
Users **ONLY** burn corra coins through the following method:
- **Transaction Requests (Redemption/Cashback)**: When a user includes a redemption amount in their transaction request:
  - The `coinsRedeemed` amount is immediately subtracted from their balance
  - Users can redeem up to `min(userBalance, billAmount × brand.redemptionPercentage / 100, brand.maxRedemptionPerTransaction)`
  - Redemption reduces the net bill amount for earning calculation

### Balance Tracking
The system maintains three key values for each user in the `CoinBalance` table:
1. **balance**: Current available coins = totalEarned - totalRedeemed (after accounting for rejections)
2. **totalEarned**: Lifetime total of all coins earned from approved/pending transactions
3. **totalRedeemed**: Lifetime total of all coins redeemed from approved/pending transactions

### Transaction Request Lifecycle
Each transaction request goes through the following states:

1. **PENDING** (Initial State):
   - User submits request via webapp with brand, billAmount, receiptUrl, and optional coinsToRedeem
   - System immediately updates balance: `newBalance = currentBalance + coinsEarned - coinsRedeemed`
   - System updates: `totalEarned += coinsEarned` and `totalRedeemed += coinsToRedeem`
   - Transaction stores: `previousBalance`, `balanceAfterEarn`, `balanceAfterRedeem` for audit trail
   - Status: PENDING

2. **APPROVED** (Admin Action):
   - Admin approves the transaction
   - No balance change (already applied at submission)
   - If `coinsRedeemed > 0`: Status changes to UNPAID (awaits payment processing)
   - If `coinsRedeemed = 0`: Status changes to PAID (auto-completed, no payment needed)

3. **REJECTED** (Admin Action):
   - Admin rejects the transaction
   - Balance is reverted: `balance = previousBalance`
   - Totals are reverted: `totalEarned -= coinsEarned`, `totalRedeemed -= coinsRedeemed`
   - Status: REJECTED

4. **PAID** (Final State):
   - For UNPAID transactions, admin marks as paid after processing UPI payment
   - No balance change
   - Status: PAID (transaction complete)

### Key Validation Rules
1. **Submission Validation**:
   - User must have `balance >= coinsToRedeem` to submit redemption request
   - Cannot submit request that would result in negative balance
   - Must respect brand earning/redemption limits

2. **Approval Validation**:
   - Cannot approve if user currently has older pending transactions (must process oldest first)
   - Must verify user still has sufficient balance if redemption was involved
   - Cannot approve if it would create negative balance

3. **Display Requirements**:
   - Webapp dashboard must show: current `balance`, `totalEarned`, `totalRedeemed` from server
   - Admin interface must show: user's `balance`, transaction details with `coinsEarned` and `coinsRedeemed`
   - All values displayed must be whole numbers
   - No client-side calculation of balances (always use server values)

## 1. Web App (User Facing) - `http://localhost:3010/`

### 1.1. Main Home Page
1.  **First button: Get Cashback Now**: It should scroll down to this section: How to Earn Corra Coins? And earn coins now form!
2.  **Second section: Get Early Access**:
    - A user will enter a valid email ID.
    - It should be stored in the db.
    - The admin can see all the waitlist containing only the email ID In the Responses tab/page!
3.  **Select a brand form beside “How to Earn Corra Coins?”**:
    - A user can select any of the brands from the list or by viewing all the brands in the form.
    - Select a Transaction Value from the 3 options within the current frontend.
    - The Corra Coins earned will be the earn percentage of the selected brand of the selected transaction value.
    - Make sure that actual brands are being used here from the DB along with actual earn percentage, Logo links etc.
4.  **Button: “Already Earned? Convert To Cash”**:
    - It will have the same landing page as the Login button on the top right of the home page ie: `http://localhost:3003/login?redirect=dashboard` and the further flow!
5.  **Button: “Earn Coins Now”**:
    - It will land the user on: `http://localhost:3003/upload?brand=adidas&amount=1000` (or use a better routing logic and default values).
    - Here user will select a brand, upload a receipt (to S3 in the backend, use the best industrial practices to reduce the lag), Enter a transaction amount!
    - At the end it will show the earn percentage (of the brand) of the Transaction Value ie MRP!
    - This page is same as the actual rewards request page ie current route: `http://localhost:3003/redeem?amount=100` but fix the routing naming as rewards and other best practices!
    - On this page a user will select a brand, upload a receipt, Enter the transaction value and then Use the slider (by default 0, if the user only wants to earn on the request and not redeem)!
    - The user can slide the cashback slider from 0 to min(total corra coins he has, redeem percentage of the MRP, Max redeem cap).
    - The total earning on that request will be earn percentage of (MRP - redeem amount).
    - It also has UPI ID field that will only enable when the redeeming amount is non 0, and it will be auto filled if the user has already set his UPI ID in the past but he can update it now!
    - Also add the functionality to take the photo if possible!
    - But this flow: `http://localhost:3003/upload?brand=adidas&amount=1000` will not contain the slider or the UPI ID and internally the redeem value will be 0 as that is for a new user who hasn’t signed in yet but he will first upload the receipt fill the form and then land after entering continue he will land on the details page: `http://localhost:3003/upload/phone?brand=adidas&amount=1000` which will be internally be the login page! Followed by the OTP page!
    - Then success page: `http://localhost:3003/upload/success?brand=adidas&amount=1000` it contains these two buttons: Go To Dashboard (it will land to the dashboard: `http://localhost:3003/dashboard`) and Upload another which currently lands on `http://localhost:3003/upload` but should land on: `http://localhost:3003/redeem?amount=100` or whatever route name it will be updated to!
6.  **Dashboard page**:
    - Will contain the total corra coins the user actually has along with transaction history.
    - A button namely: “Get more rewards” instead of “Get 100 Cashback”.
7.  **Authentication & Routing**:
    - Keep a good state of the user after he signs in using JWT tokens same as the admin implementation!
    - Make sure once the user is logged in he will not land on the home page: `http://localhost:3003/` but the default fall back will be to the dashboard page and there is no back button on the dashboard page!
    - Use the best industrial practices to manage the routes and routings!

## 2. Admin Side

1.  **Transactions page**:
    - Will show all the list of transaction request submitted by the user (latest first by default).
    - Status will be Pending, rejected, Approved, unpaid and paid!
    - A request with redeem amount 0 will be by default set to paid if approved!
    - Make sure that all the functionality on the request form will work correctly.
    - An admin can navigate back and forth using the <> arrow keys from the oldest to the latest request of that particular user whose request is currently opened!
    - Let's force the admin to first check the older request which has the status as pending and then only allow him to approve or reject a newer request!
    - **Validation Rules**:
        - Cannot approve a request if the user's current coin balance is less than the redemption amount (prevents negative balances).
        - When rejecting a request, any coins that were added/removed during approval must be reverted.
        - All amounts displayed and processed must be whole numbers only.
2.  **Brands page**: is fine right now.
3.  **Coins page**: should show the actual recent transaction and total coins, etc. on the page!
4.  **Responses page**: should contain the list of all the email ids filled on the homepage of the web app!

## 3. Database

### 3.1 User Management
1.  Make sure to change the entire DBs of the user as per only the details that we are taking at this point should be mandatory fields ie only Mobile number! Rest will be filled later! But this should be sufficient enough!

### 3.2 Coin Balance Schema
**Table: coin_balances**
- `balance` (INTEGER): Current available coins (can increase or decrease)
- `totalEarned` (INTEGER): Lifetime total of coins earned (only increases, decreases on rejection)
- `totalRedeemed` (INTEGER): Lifetime total of coins redeemed (only increases, decreases on rejection)

All fields must be kept in sync:
- When PENDING request is created: Update all three fields
- When request is REJECTED: Revert all three fields
- When request is APPROVED/PAID: No change (already applied)

### 3.3 Transaction Schema
**Table: coin_transactions**
- `billAmount` (INTEGER): Original bill/transaction amount
- `coinsEarned` (INTEGER): Coins earned from this transaction
- `coinsRedeemed` (INTEGER): Coins redeemed in this transaction
- `previousBalance` (INTEGER): Balance before this transaction (for reversion)
- `balanceAfterEarn` (INTEGER): Balance after earning (for audit)
- `balanceAfterRedeem` (INTEGER): Balance after redemption (for audit)
- `status` (VARCHAR): PENDING | APPROVED | REJECTED | UNPAID | PAID
- `receiptUrl` (VARCHAR): S3 URL to uploaded receipt
- `billDate` (DATE): Date on the receipt
- `adminNotes` (TEXT): Admin comments/rejection reason
- `processedAt` (TIMESTAMP): When admin approved/rejected
- `paymentProcessedAt` (TIMESTAMP): When payment was completed
- `statusUpdatedAt` (TIMESTAMP): Last status change time

### 3.4 Data Integrity Requirements
1. **Data Types**: All coin-related fields (balance, earned, redeemed, transaction amounts) must be stored as integers to ensure whole number handling.
2. **Transaction History**: Maintain a complete audit trail of all coin balance changes to enable proper reversion on rejection.
3. **Atomic Updates**: All balance updates must happen within database transactions to prevent race conditions.
4. **Consistency**: The formula `balance = totalEarned - totalRedeemed` must always hold true (accounting for rejections).
