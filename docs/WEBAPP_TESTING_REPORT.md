# Webapp Testing Report - Club Corra

**Date**: October 7, 2025  
**Testing Scope**: Full webapp functionality, navigation, and backend integration  
**Reference Documents**: 
- [PRODUCT_REQUIREMENTS.md](./PRODUCT_REQUIREMENTS.md)
- [0004_PRODUCT_IMPLEMENTATION_PLAN.md](./features/0004_PRODUCT_IMPLEMENTATION_PLAN.md)

---

## Testing Environment Setup

### Prerequisites
1. **Backend API** running at `http://localhost:3001`
2. **Webapp** running at `http://localhost:3003`
3. **Database** properly seeded with brands and test data
4. **S3 Bucket** configured for file uploads

### How to Start Services
```bash
# Terminal 1: Start Backend API
cd apps/api
npm run dev

# Terminal 2: Start Webapp
cd apps/webapp
npm run dev
```

---

## Test Suite 1: Home Page (`/`)

### ✅ Test 1.1: "Get Cashback Now" Button
**Expected Behavior**: Clicking should smoothly scroll down to the "How to Earn Corra Coins?" section with brand selection form.

**Steps**:
1. Navigate to `http://localhost:3003/`
2. Click the "Get Cashback Now" button
3. Verify smooth scroll animation to the action section

**Status**: ⏳ PENDING

---

### ✅ Test 1.2: "Get Early Access" Email Submission
**Expected Behavior**: Email should be saved to waitlist, visible in admin panel "Responses" page.

**Steps**:
1. Navigate to `http://localhost:3003/`
2. Enter a valid email in the "Get Early Access" input field
3. Click "Get Early Access" button
4. Verify success toast message appears
5. Check Admin panel at `http://localhost:3000/responses` to confirm email is listed

**API Endpoint Used**: `POST /api/v1/waitlist`

**Status**: ⏳ PENDING

---

### ✅ Test 1.3: Brand Selection Form with Real Data
**Expected Behavior**: Form should display actual brands from database with correct logos, earn percentages, and calculate coins properly.

**Steps**:
1. Navigate to `http://localhost:3003/`
2. Scroll to the brand selection carousel
3. Verify brands are loaded from API (not hardcoded data)
4. Select different brands and verify:
   - Brand logos display correctly
   - Earn percentage is accurate
   - Transaction value options (₹500, ₹1000, ₹2500) work
   - Coins earned calculation = `amount × brand.earnPercentage` (whole numbers only)
5. Test carousel pagination (left/right arrows)
6. Test "View all brands" dropdown

**API Endpoint Used**: `GET /api/v1/public/transactions/brands`

**Validation Rules**:
- All amounts must be whole numbers (integers)
- No decimal places in coin calculations

**Status**: ⏳ PENDING

---

### ✅ Test 1.4: "Already Earned? Convert To Cash" Button
**Expected Behavior**: Should redirect to login page with dashboard redirect parameter.

**Steps**:
1. Navigate to `http://localhost:3003/`
2. Scroll to the brand selection form
3. Click "Already Earned? Convert To Cash" button
4. Verify redirect to `/login?redirect=dashboard` or `/verify?redirect=dashboard`

**Status**: ⏳ PENDING

---

### ✅ Test 1.5: "Earn Coins Now" Button
**Expected Behavior**: Should navigate to `/upload` with brand and amount pre-filled.

**Steps**:
1. Navigate to `http://localhost:3003/`
2. Select a brand (e.g., Adidas) and amount (e.g., ₹1000)
3. Click "Earn Coins Now" button
4. Verify redirect to `/upload?brand=<brand_id>&amount=1000`
5. Verify selected brand and amount are pre-filled on upload page

**Status**: ⏳ PENDING

---

### ✅ Test 1.6: Login Button (Top Right)
**Expected Behavior**: Should redirect to login page with dashboard redirect parameter.

**Steps**:
1. Navigate to `http://localhost:3003/`
2. Click "Log-In" button in top right corner
3. Verify redirect to `/login?redirect=dashboard`

**Status**: ⏳ PENDING

---

## Test Suite 2: Authentication Flow

### ✅ Test 2.1: Login Page - Phone Number Entry
**Expected Behavior**: User can enter 10-digit mobile number and request OTP.

**Steps**:
1. Navigate to `/login`
2. Enter a 10-digit mobile number (e.g., `9876543210`)
3. Click "Send OTP"
4. Verify:
   - Success toast appears
   - OTP stage is displayed
   - Backend API call succeeds

**API Endpoint Used**: `POST /api/v1/auth/login-signup`

**Status**: ⏳ PENDING

---

### ✅ Test 2.2: OTP Verification
**Expected Behavior**: User enters OTP, gets verified, JWT token is stored, redirected to dashboard.

**Steps**:
1. Complete Test 2.1
2. Check backend logs or use development OTP (if configured)
3. Enter the 6-digit OTP
4. Click "Verify & Continue"
5. Verify:
   - Success toast appears
   - JWT token is stored in `localStorage` as `auth_token`
   - User data is stored in `localStorage` as `auth_user`
   - Redirect to `/dashboard` occurs

**API Endpoint Used**: `POST /api/v1/auth/verify-otp`

**Status**: ⏳ PENDING

---

### ✅ Test 2.3: Resend OTP Functionality
**Expected Behavior**: User can resend OTP after 30-second timer.

**Steps**:
1. Complete Test 2.1
2. Wait for 30 seconds or check if timer is working
3. Click "Resend OTP"
4. Verify new OTP is sent

**Status**: ⏳ PENDING

---

### ✅ Test 2.4: JWT Token Persistence
**Expected Behavior**: Logged-in user remains authenticated after page refresh.

**Steps**:
1. Complete Test 2.2 (login successfully)
2. Refresh the page
3. Verify user remains logged in (check `localStorage` for token)
4. Verify redirect to `/dashboard` occurs (middleware working)

**Status**: ⏳ PENDING

---

## Test Suite 3: Upload Flow (Unauthenticated Users)

### ✅ Test 3.1: Upload Page - Brand Selection
**Expected Behavior**: User can select a brand from carousel with API-loaded brands.

**Steps**:
1. Navigate to `/upload` (or click "Earn Coins Now" from home)
2. Verify brands are loaded from API
3. Select different brands using carousel
4. Verify brand selection updates the form

**API Endpoint Used**: `GET /api/v1/public/transactions/brands`

**Status**: ⏳ PENDING

---

### ✅ Test 3.2: Receipt Upload with S3
**Expected Behavior**: User can upload receipt image to S3 using presigned URL.

**Steps**:
1. Navigate to `/upload`
2. Click the upload area or drag-and-drop an image file
3. Verify:
   - Loading state appears
   - Image preview is displayed
   - Success toast appears after upload
   - File is uploaded to S3 (check S3 bucket or logs)

**API Endpoint Used**: `POST /api/v1/public/transactions/upload-url`

**Status**: ⏳ PENDING

---

### ✅ Test 3.3: Transaction Amount - Integer Validation
**Expected Behavior**: Amount input only accepts whole numbers (integers), no decimals.

**Steps**:
1. Navigate to `/upload`
2. Try entering decimal values (e.g., `100.50`)
3. Verify:
   - Only integers are accepted
   - Decimal point is not allowed
   - Input validation shows error or prevents entry

**Validation Rule**: `/^\d+$/` (only digits, no decimals)

**Status**: ⏳ PENDING

---

### ✅ Test 3.4: Continue to Phone Verification
**Expected Behavior**: After uploading receipt and entering amount, user can continue to phone verification.

**Steps**:
1. Complete Test 3.2 (upload receipt)
2. Enter transaction amount (e.g., `1000`)
3. Click "Continue" button
4. Verify:
   - Upload data is stored in `localStorage` as `pendingUpload`
   - Redirect to `/upload/phone?brand=<brand>&amount=<amount>` occurs

**Status**: ⏳ PENDING

---

### ✅ Test 3.5: Phone Verification After Upload
**Expected Behavior**: User completes phone verification, reward request is created, and redirected to success page.

**Steps**:
1. Complete Test 3.4
2. Enter mobile number and verify OTP
3. Verify:
   - User is authenticated (JWT stored)
   - Pending upload data is used to create reward request
   - `pendingUpload` is removed from `localStorage`
   - Redirect to `/upload/success` occurs

**API Endpoints Used**:
- `POST /api/v1/auth/login-signup`
- `POST /api/v1/auth/verify-otp`
- `POST /api/v1/public/transactions/reward-request`

**Status**: ⏳ PENDING

---

### ✅ Test 3.6: Success Page Button Routing
**Expected Behavior**: "Go To Dashboard" redirects to `/dashboard`, "Upload Another" redirects to `/rewards`.

**Steps**:
1. Complete Test 3.5 (reach success page)
2. Verify two buttons are displayed:
   - "Go To Dashboard" button
   - "Upload Another" button
3. Test "Go To Dashboard" button → should redirect to `/dashboard`
4. Navigate back to success page
5. Test "Upload Another" button → should redirect to `/rewards`

**Status**: ⏳ PENDING

---

## Test Suite 4: Dashboard (Authenticated Users)

### ✅ Test 4.1: Protected Route - Authentication Check
**Expected Behavior**: Unauthenticated users are redirected to login when accessing dashboard.

**Steps**:
1. Clear `localStorage` (logout)
2. Navigate to `/dashboard` directly
3. Verify redirect to `/login?redirect=dashboard` occurs

**Status**: ⏳ PENDING

---

### ✅ Test 4.2: Dashboard Display - Total Coins & Transactions
**Expected Behavior**: Dashboard shows total corra coins (whole numbers) and transaction history.

**Steps**:
1. Login as authenticated user
2. Navigate to `/dashboard`
3. Verify display shows:
   - Total Corra Coins (as whole number, no decimals)
   - Total Earned coins
   - Total Redeemed coins
   - Transaction history list with:
     - Brand name
     - Coins earned/redeemed (whole numbers with ₹ symbol)
     - Status (PENDING, APPROVED, etc.)
     - Date

**API Endpoint Used**: `GET /api/v1/transactions/user`

**Validation Rules**:
- All coin amounts must display as whole numbers (no decimal places)
- Use `₹` symbol for currency
- Display format: `₹500` (not `₹500.00`)

**Status**: ⏳ PENDING

---

### ✅ Test 4.3: "Get More Rewards" Button
**Expected Behavior**: Button redirects to `/rewards` page.

**Steps**:
1. Login and navigate to `/dashboard`
2. Click "Get more rewards" button
3. Verify redirect to `/rewards` occurs

**Status**: ⏳ PENDING

---

### ✅ Test 4.4: No Back Button on Dashboard
**Expected Behavior**: Dashboard should not have a back button to home page.

**Steps**:
1. Navigate to `/dashboard`
2. Verify no visible back button or navigation to home page
3. Verify browser back button behavior (optional: should redirect back to dashboard if middleware is configured)

**Status**: ⏳ PENDING

---

## Test Suite 5: Rewards Page (Authenticated Users)

### ✅ Test 5.1: Protected Route - Authentication Check
**Expected Behavior**: Unauthenticated users are redirected to login.

**Steps**:
1. Clear `localStorage` (logout)
2. Navigate to `/rewards` directly
3. Verify redirect to `/login?redirect=rewards` occurs

**Status**: ⏳ PENDING

---

### ✅ Test 5.2: Brand Selection & Receipt Upload
**Expected Behavior**: Authenticated user can select brand, upload receipt to S3.

**Steps**:
1. Login and navigate to `/rewards`
2. Select a brand
3. Upload receipt image
4. Verify same behavior as Test 3.2 (S3 upload with presigned URL)

**API Endpoint Used**: `POST /api/v1/public/transactions/upload-url` (with auth token)

**Status**: ⏳ PENDING

---

### ✅ Test 5.3: Redemption Slider with Max Calculation
**Expected Behavior**: Slider allows redemption from 0 to `min(user.totalCoins, brand.redeemPercentage × billAmount, maxRedeemCap)`.

**Steps**:
1. Login and navigate to `/rewards`
2. Select a brand with redemption percentage (e.g., 5%)
3. Enter bill amount (e.g., ₹1000)
4. Verify redemption slider:
   - Min value: 0
   - Max value: `min(user.totalCoins, ₹50, maxRedeemCap)`
   - Slider only allows whole numbers (no decimals)
5. Test sliding and verify coins redeemed updates correctly

**Calculation Logic**:
```javascript
maxRedeemable = Math.min(
  user.totalCoins,
  Math.round(billAmount * brand.redemptionPercentage / 100),
  brand.maxRedeemCap || Infinity
)
```

**Validation Rules**:
- All redemption values must be whole numbers (integers)
- Slider should snap to integer values

**Status**: ⏳ PENDING

---

### ✅ Test 5.4: UPI ID Field Conditional Logic
**Expected Behavior**: UPI ID field is only enabled when redemption amount > 0, auto-filled if previously set.

**Steps**:
1. Login and navigate to `/rewards`
2. Set redemption slider to 0
3. Verify UPI ID field is disabled/grayed out
4. Move slider to > 0 (e.g., ₹50)
5. Verify UPI ID field is enabled
6. If user has previously set UPI ID, verify it's auto-filled
7. Verify user can update UPI ID

**Status**: ⏳ PENDING

---

### ✅ Test 5.5: Earning Calculation
**Expected Behavior**: Coins earned = `earnPercentage × (billAmount - coinsRedeemed)`.

**Steps**:
1. Login and navigate to `/rewards`
2. Select a brand with 10% earn rate
3. Enter bill amount: ₹1000
4. Set redemption: ₹100
5. Verify coins earned displays: `10% × (1000 - 100) = 90` (whole number)

**Validation Rules**:
- Result must be a whole number (use `Math.round()`)
- Display without decimal places

**Status**: ⏳ PENDING

---

### ✅ Test 5.6: Submit Reward Request
**Expected Behavior**: Request is submitted to backend, user redirected to dashboard or success page.

**Steps**:
1. Complete all fields on `/rewards` page
2. Click "Submit Request" button
3. Verify:
   - Success toast appears
   - Request is created in backend
   - Redirect to `/dashboard` occurs
   - New transaction appears in dashboard history

**API Endpoint Used**: `POST /api/v1/public/transactions/reward-request`

**Request Payload**:
```json
{
  "brandId": "string",
  "billAmount": "integer",
  "billDate": "ISO date",
  "receiptUrl": "string",
  "coinsToRedeem": "integer",
  "upiId": "string (optional)"
}
```

**Status**: ⏳ PENDING

---

## Test Suite 6: Routing & Navigation

### ✅ Test 6.1: Middleware - Logged-in User Redirect from Home
**Expected Behavior**: Authenticated users accessing `/` are redirected to `/dashboard`.

**Steps**:
1. Login as authenticated user
2. Navigate to `http://localhost:3003/`
3. Verify automatic redirect to `/dashboard` occurs
4. Verify middleware is working

**Status**: ⏳ PENDING

---

### ✅ Test 6.2: Middleware - Protected Routes
**Expected Behavior**: Unauthenticated users cannot access protected routes.

**Steps**:
1. Logout (clear `localStorage`)
2. Try accessing each protected route:
   - `/dashboard` → should redirect to `/login?redirect=dashboard`
   - `/rewards` → should redirect to `/login?redirect=rewards`
   - `/redeem` → should redirect to `/login?redirect=redeem`

**Status**: ⏳ PENDING

---

### ✅ Test 6.3: Logout Functionality
**Expected Behavior**: User can logout, token is cleared, redirected to home page.

**Steps**:
1. Login as authenticated user
2. Logout (if logout button exists, or manually clear `localStorage`)
3. Verify:
   - `auth_token` removed from `localStorage`
   - `auth_user` removed from `localStorage`
   - Redirect to `/` or `/login` occurs
   - Accessing `/dashboard` redirects to login

**Status**: ⏳ PENDING

---

## Test Suite 7: Backend Integration

### ✅ Test 7.1: API Endpoints Health Check
**Expected Behavior**: All API endpoints respond correctly.

**Endpoints to Test**:
- `GET /api/v1/public/transactions/brands` → Returns active brands
- `POST /api/v1/waitlist` → Adds email to waitlist
- `POST /api/v1/auth/login-signup` → Sends OTP
- `POST /api/v1/auth/verify-otp` → Verifies OTP and returns JWT
- `POST /api/v1/auth/user/verify` → Verifies JWT token
- `GET /api/v1/transactions/user` → Returns user transactions (auth required)
- `POST /api/v1/public/transactions/upload-url` → Returns S3 presigned URL
- `POST /api/v1/public/transactions/reward-request` → Creates reward request

**Status**: ⏳ PENDING

---

### ✅ Test 7.2: Whole Number Validation
**Expected Behavior**: Backend enforces integer-only values for all amounts.

**Steps**:
1. Test API endpoints with decimal values
2. Verify backend rejects or rounds decimal values
3. Test fields:
   - `billAmount`
   - `coinsEarned`
   - `coinsRedeemed`
   - `user.totalCoins`

**API Validation**:
- All amount fields should be `@IsInt()` in DTOs
- Database columns should be `INT` type

**Status**: ⏳ PENDING

---

### ✅ Test 7.3: Error Handling
**Expected Behavior**: Frontend displays user-friendly error messages for API failures.

**Steps**:
1. Disconnect backend API
2. Test various actions (brand loading, OTP sending, file upload)
3. Verify:
   - Toast error messages appear
   - Fallback data is used where appropriate
   - No console errors crash the app

**Status**: ⏳ PENDING

---

## Test Suite 8: Additional PRD Requirements

### ✅ Test 8.1: S3 File Upload - Industrial Practices
**Expected Behavior**: File upload uses presigned URLs, no lag, progress indicator shown.

**Steps**:
1. Upload a large image file (e.g., 5MB)
2. Verify:
   - Loading/uploading indicator appears
   - Upload completes without timeout
   - No server-side proxy (direct S3 upload)

**Status**: ⏳ PENDING

---

### ✅ Test 8.2: Camera/Photo Capture (if implemented)
**Expected Behavior**: User can take a photo directly if device supports camera.

**Steps**:
1. Access `/upload` on mobile device or desktop with webcam
2. Click "Take Photo" button
3. Verify camera access is requested (if implemented)

**Note**: This feature may be optional/future enhancement.

**Status**: ⏳ PENDING

---

### ✅ Test 8.3: Responsive Design
**Expected Behavior**: All pages work correctly on mobile, tablet, and desktop.

**Steps**:
1. Test all pages at different screen sizes:
   - Mobile (320px - 480px)
   - Tablet (768px - 1024px)
   - Desktop (1280px+)
2. Verify:
   - Layouts adapt properly
   - Buttons are clickable
   - Text is readable
   - Forms are usable

**Status**: ⏳ PENDING

---

## Summary Report

### Test Results Overview

| Category | Total Tests | Passed | Failed | Pending |
|----------|-------------|--------|--------|---------|
| Home Page | 6 | 0 | 0 | 6 |
| Authentication | 4 | 0 | 0 | 4 |
| Upload Flow | 6 | 0 | 0 | 6 |
| Dashboard | 4 | 0 | 0 | 4 |
| Rewards Page | 6 | 0 | 0 | 6 |
| Routing & Navigation | 3 | 0 | 0 | 3 |
| Backend Integration | 3 | 0 | 0 | 3 |
| Additional | 3 | 0 | 0 | 3 |
| **TOTAL** | **35** | **0** | **0** | **35** |

---

## Issues Found

_Document all issues found during testing here:_

| Issue ID | Severity | Description | Status | Fix Required |
|----------|----------|-------------|--------|--------------|
| | | | | |

---

## Recommendations

_Add recommendations for improvements or fixes:_

1. 
2. 
3. 

---

## Sign-off

- **Tester**: _________________
- **Date**: _________________
- **Status**: ☐ All Tests Passed ☐ Issues Found ☐ In Progress

---

## Next Steps

1. Run backend API: `cd apps/api && npm run dev`
2. Run webapp: `cd apps/webapp && npm run dev`
3. Execute all tests systematically
4. Document results in this report
5. Fix any issues found
6. Re-test failed scenarios
7. Get sign-off for production deployment

