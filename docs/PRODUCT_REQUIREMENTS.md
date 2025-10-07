# Product Requirements

Here is the entire product that we are implementing in this monorepo: 
Always remember 1 corra coin is 1 rupee!

## Business Rules

1. **Whole Numbers Only**: All amounts (transaction values, corra coins, redemption amounts) must be stored and processed as whole numbers only. No decimal values are allowed.
2. **Coin Reversion on Rejection**: When a transaction request is rejected, any corra coins that were added or removed from the user's account during the approval process must be reverted back to their previous state.
3. **No Negative Balances**: A transaction request cannot be approved if the user's total corra coins would become negative after the redemption. The system must validate that `user_balance >= redemption_amount` before allowing approval.

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
1.  Make sure to change the entire DBs of the user as per only the details that we are taking at this point should be mandatory fields ie only Mobile number! Rest will be filled later! But this should be sufficient enough!
2.  **Data Types**: All coin-related fields (balance, earned, redeemed, transaction amounts) must be stored as integers to ensure whole number handling.
3.  **Transaction History**: Maintain a complete audit trail of all coin balance changes to enable proper reversion on rejection.
