# 0004: Full Product Implementation Plan

entire product:
"""
Always remember 1 corra coin is 1 rupee!
1. On the Main home page of the web app ie: http://localhost:3010/
    1. First button is: Get Cashback Now: It should scroll down to this section: How to Earn Corra Coins? And earn coins now form!
    2. The second section is Get Early Access where a user will enter a valid email ID and it should be stored in the db and the admin can see all the waitlist containing only the email ID In the Responses tab/page!
    3. Then there is Select a brand form beside “How to Earn Corra Coins?”, Here a user can select any of the brands from the list or by viewing all the brands in the form and select a Transaction Value from the 3 options within the current frontend The Corra Coins earned will be the earn percentage of the selected brand of the selected transaction value. Make sure that actual brands are being used here from the DB along with actual earn percentage, Logo links etc. 
    4. Now There is a button at the end of the form Namely: “Already Earned? Convert To Cash” text on it, it will have the same landing page as the Login button on the top right of the home page ie: http://localhost:3003/login?redirect=dashboard and the further flow!
    5. Now There is a button at the end of the form Namely: “Earn Coins Now” text on it. It will land the user on: http://localhost:3003/upload?brand=adidas&amount=1000 (or use a better routing logic and default values). Here user will select a brand, upload a receipt (to S3 in the backend, use the best industrial practices to reduce the lag), Enter a transaction amount! Then at the end it will show the earn percentage (of the brand) of the Transaction Value ie MRP! This page is same as the actual rewards request page ie current route: http://localhost:3003/redeem?amount=100 but fix the routing naming as rewards and other best practices! On this page a user will select a brand, upload a receipt, Enter the transaction value and then Use the slider (by default 0, if the user only wants to earn on the request and not redeem)! The user can slide the cashback slider from 0 to min(total corra coins he has, redeem percentage of the MRP, Max redeem cap) And the total earning on that request will be earn percentage of (MRP - redeem amount). Now It also has UPI ID field that will only enable when the redeeming amount is non 0, and it will be auto filled if the user has already set his UPI ID in the past but he can update it now! Also add the functionality to take the photo if possible! But this flow: http://localhost:3003/upload?brand=adidas&amount=1000 will not contain the slider or the UPI ID and internally the redeem value will be 0 as that is for a new user who hasn’t signed in yet but he will first upload the receipt fill the form and then land after entering continue he will land on the details page: http://localhost:3003/upload/phone?brand=adidas&amount=1000 which will be internally be the login page! Followed by the OTP page! Then success page: http://localhost:3003/upload/success?brand=adidas&amount=1000 it contains these two buttons: Go To Dashboard (it will land to the dashboard: http://localhost:3003/dashboard) and Upload another which currently lands on http://localhost:3003/upload but should land on: http://localhost:3003/redeem?amount=100 or whatever route name it will be updated to!
    6. The dashboard page will contain the total corra coins the user actually has along with transaction history and a button namely: “Get more rewards” instead of “Get 100 Cashback”
    7. Keep a good state of the user after he signs in using JWT tokens same as the admin implementation! Also make sure once the user is logged in he will not land on the home page: http://localhost:3003/ but the default fall back will be to the dashboard page and there is no back button on the dashboard page! Use the best industrial practices to manage the routes and routings!
2. Now on the admin side:
    1. Transactions page will show all the list of transaction request submitted by the user (latest first by default) Where the status will be Pending, rejected, Approved, unpaid and paid! A request with redeem amount 0 will be by default set to paid if approved!
        1. Make sure that all the functionality on the request form will work correctly. Also an admin can navigate back and forth using the <> arrow keys from the oldest to the latest request of that perticular user whose request is currently opened! Also let’s force the admin to first check the older request which has the status as pending and then only allow him to approve or reject a newer request!
    2. Brands page is fine right now:
    3. Coins should show the actual recent transaction and total coins, etc. on the page!
    4. Responses should contain the list of all the email ids filled on the homepage of the web app!
3. Make sure to change the entire DBs of the user as per only the details that we are taking at this point should be mandatory fields ie only Mobile number! Rest will be filled later! But this should be sufficient enough!
"""

## 1. Introduction

This document outlines the technical plan to implement the full product specifications for the Club Corra web application and admin panel. The plan is divided into three phases: backend API changes, web app feature implementation, and admin panel enhancements.

## 2. Phase 1: Backend API & Database Changes

This phase focuses on updating the database schema and exposing the necessary API endpoints to support the new features.

### Task 1.1: Enhance `CoinTransaction` Entity

-   **File**: `apps/api/src/coins/entities/coin-transaction.entity.ts`
-   **Change**: Add `'UNPAID'` to the `CoinTransactionStatus` type.
    -   `export type CoinTransactionStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'PROCESSED' | 'PAID' | 'UNPAID' | 'COMPLETED' | 'FAILED'`
-   **Rationale**: To accommodate the transaction lifecycle where an approved request with a redemption amount is pending payment.

### Task 1.2: Implement User Authentication

-   **Files**:
    -   Create `apps/api/src/auth/auth.controller.ts` (or modify if a user-facing one exists).
    -   Modify `apps/api/src/auth/auth.service.ts`.
    -   Modify `apps/api/src/users/users.service.ts`.
-   **Changes**:
    1.  Create a new public endpoint (e.g., `/auth/login-signup`) that accepts a `mobileNumber`.
    2.  Implement OTP generation (e.g., using `twilio` or a similar service) and sending logic. For now, a mock OTP service can be used for development.
    3.  Create an endpoint to verify the OTP and `mobileNumber`.
    4.  On successful verification, find an existing user or create a new one.
    5.  Generate a JWT token for the user, similar to the existing `adminLogin` flow but for the user entity.
-   **Rationale**: The current auth is admin-only. This task creates the core authentication flow for web app users.

### Task 1.3: Implement "Early Access" Waitlist Endpoints

-   **Files**:
    -   Create `apps/api/src/waitlist/waitlist.controller.ts`.
    -   Create `apps/api/src/waitlist/waitlist.service.ts`.
-   **Changes**:
    1.  Create a new public POST endpoint (e.g., `/waitlist`) that accepts an `email`.
    2.  The service will save the email into the `waitlist_entries` table. The existing entity and admin endpoints can be leveraged.
    3.  Add an endpoint in `apps/api/src/admin/form-submissions.controller.ts` to fetch all waitlist entries for the new "Responses" page in the admin panel.
-   **Rationale**: To support the "Get Early Access" feature.

### Task 1.4: Update Reward Request (Transaction) Endpoints

-   **Files**:
    -   Modify `apps/api/src/coins/controllers/coin.controller.ts` (or create if not present).
    -   Modify `apps/api/src/coins/coins.service.ts`.
    -   Modify `apps/api/src/files/files.service.ts` (or similar).
-   **Changes**:
    1.  Create an endpoint to generate a pre-signed S3 URL for uploading the receipt. This endpoint will be called by the client before the file upload.
    2.  Create an endpoint to submit a reward request. This endpoint will handle two cases:
        -   **Unauthenticated user**: The request will be stored temporarily. After user logs in/signs up, associate the transaction with the user. A temporary ID could be used.
        -   **Authenticated user**: The request is directly associated with the logged-in user.
    3.  The endpoint will take `brandId`, `billAmount`, `coinsRedeemed`, `receiptUrl` and `upiId` (optional).
    4.  The service logic will calculate `coinsEarned` based on the brand's `earnPercentage`.
    5.  The `status` will be set to `PENDING`.

### Task 1.5: Enhance Admin Transaction Endpoints

-   **File**: `apps/api/src/coins/controllers/coin-admin.controller.ts`
-   **Changes**:
    1.  When an admin fetches a user's pending transactions for review, the API should enforce that the oldest pending transaction is returned first. Add a query parameter to allow fetching a specific transaction by ID for navigation.
    2.  Add logic that prevents an admin from approving/rejecting a transaction if an older pending transaction exists for the same user.
    3.  When a transaction with `coinsRedeemed: 0` is approved, automatically set its status to `PAID`. If `coinsRedeemed > 0`, set status to `UNPAID`.
-   **Rationale**: To implement the specific business rules for the admin transaction review process.

## 3. Phase 2: Web App Implementation (`apps/webapp`)

This phase involves building the user interface and connecting it to the backend API.

### Task 2.1: Home Page (`/`)

-   **File**: `apps/webapp/src/app/page.tsx`
-   **Changes**:
    1.  Implement "Get Cashback Now" button with scroll-to-section behavior.
    2.  Implement "Get Early Access" form, calling the new `/waitlist` API endpoint.
    3.  Implement "Select a brand" form:
        -   Fetch brands from the API to populate the dropdown.
        -   Calculate and display potential earnings dynamically.
    4.  Link "Already Earned?" button to the `/login` page.
    5.  Link "Earn Coins Now" button to the unauthenticated reward request page (`/upload`).

### Task 2.2: Authentication Flow

-   **Files**:
    -   `apps/webapp/src/app/login/page.tsx`
    -   Create `apps/webapp/src/app/verify-otp/page.tsx`
-   **Changes**:
    1.  Build the UI for mobile number submission and OTP verification.
    2.  Integrate with the new user auth API endpoints.
    3.  Upon successful login, store the JWT in `localStorage` or a secure cookie.
    4.  Implement a global state (e.g., React Context) to manage user authentication status.

### Task 2.3: Routing and Protected Routes

-   **Files**:
    -   Create a middleware file `apps/webapp/src/middleware.ts`.
    -   Modify `apps/webapp/src/app/layout.tsx`.
-   **Changes**:
    1.  Implement logic in middleware to redirect logged-in users from `/` to `/dashboard`.
    2.  Protect routes like `/dashboard` and the authenticated rewards page, redirecting unauthenticated users to `/login`.

### Task 2.4: Reward Request Flow

-   **Unauthenticated (`/upload`)**:
    -   **File**: `apps/webapp/src/app/upload/page.tsx`
    -   **Changes**: Build a form to select a brand, enter amount, and upload a receipt. The file upload will use the pre-signed S3 URL from the API. On submission, redirect to the login/signup flow.
-   **Authenticated (`/rewards` or rename `/redeem`)**:
    -   **File**: `apps/webapp/src/app/redeem/page.tsx`
    -   **Changes**: Enhance the form with the redemption slider and UPI ID field. The slider's max value will be calculated based on user's coin balance and brand's redemption rules fetched from the API.
-   **Success Page**:
    -   **File**: `apps/webapp/src/app/upload/success/page.tsx`
    -   **Changes**: Update buttons: "Go to Dashboard" to `/dashboard`, and "Upload another" to the authenticated rewards page.

### Task 2.5: Dashboard (`/dashboard`)

-   **File**: `apps/webapp/src/app/dashboard/page.tsx`
-   **Changes**:
    1.  Fetch and display the user's total coin balance.
    2.  Fetch and display the user's transaction history.
    3.  Update the call-to-action button to "Get more rewards", linking to the authenticated rewards page.

## 4. Phase 3: Admin Panel Enhancements (`apps/admin`)

This phase involves updating the admin panel to manage the new data and workflows.

### Task 3.1: Create "Responses" Page

-   **File**: Create `apps/admin/src/app/responses/page.tsx`.
-   **Changes**:
    1.  Create a new page to display the list of emails from the waitlist.
    2.  Fetch data from the corresponding admin API endpoint.
    3.  Display emails in a simple table.

### Task 3.2: Update Transactions Page

-   **File**: `apps/admin/src/app/transactions/page.tsx` (or similar).
-   **Changes**:
    1.  Update the transaction list to show the new `UNPAID` status.
    2.  Ensure the default sorting is by creation date, latest first.
    3.  In the transaction detail view, implement the `< >` arrow key navigation between a single user's requests. This will involve fetching the next/previous transaction ID from the API.
    4.  Display a warning or disable the approve/reject buttons if an older pending transaction exists for the user.

### Task 3.3: Update Coins Page

-   **File**: `apps/admin/src/app/coins/page.tsx` (or similar).
-   **Changes**:
    1.  Ensure the page accurately reflects recent transactions and total coin statistics based on the new, more frequent user activity. Review and potentially optimize the queries if performance issues arise.
