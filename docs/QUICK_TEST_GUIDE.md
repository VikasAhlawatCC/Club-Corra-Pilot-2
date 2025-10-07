# Quick Testing Guide - Club Corra Webapp

This guide provides step-by-step instructions to manually test all webapp functionality against the PRD requirements.

---

## Prerequisites

### 1. Start Backend API
```bash
cd /Users/vikasahlawat/Documents/Club-Corra-Pilot-2/apps/api
npm run dev
```
**Expected Output**: `Server running on port 3001`

### 2. Start Webapp
```bash
cd /Users/vikasahlawat/Documents/Club-Corra-Pilot-2/apps/webapp
npm run dev
```
**Expected Output**: `Ready on http://localhost:3003`

### 3. Verify Backend is Running
Open browser and check: `http://localhost:3001/api/v1/health` (if health endpoint exists)
Or check the terminal logs for successful startup.

---

## Test Checklist - Quick Version

### ✅ **Phase 1: Home Page Tests** (5 minutes)

1. **Open Home Page**
   - URL: `http://localhost:3003/`
   - ✅ Page loads without errors
   - ✅ Corra logo displays
   - ✅ Brand carousel with real brands from API

2. **"Get Cashback Now" Button**
   - Click the green button
   - ✅ Smooth scroll to "How to Earn Corra Coins?" section

3. **"Get Early Access" Form**
   - Enter email: `test@example.com`
   - Click "Get Early Access"
   - ✅ Success toast appears
   - ✅ Check admin panel `/responses` to verify email saved

4. **Brand Selection & Calculation**
   - Select a brand (e.g., Adidas)
   - Select ₹1000
   - ✅ Verify coins earned displays as whole number (e.g., 100 for 10% earn rate)
   - ✅ Test brand carousel navigation (< > arrows)
   - ✅ Test "View all brands" dropdown

5. **"Already Earned? Convert To Cash" Button**
   - Click the button
   - ✅ Redirects to `/login?redirect=dashboard` or `/verify?redirect=dashboard`

6. **"Earn Coins Now" Button**
   - Select brand and amount
   - Click "Earn Coins Now"
   - ✅ Redirects to `/upload?brand=<id>&amount=<value>`
   - ✅ Verify brand and amount are pre-filled

7. **"Log-In" Button (Top Right)**
   - Click login button
   - ✅ Redirects to `/login?redirect=dashboard`

---

### ✅ **Phase 2: Authentication Flow** (5 minutes)

1. **Login Page - Phone Entry**
   - Navigate to `/login`
   - Enter phone: `9876543210` (use test number)
   - Click "Send OTP"
   - ✅ Success toast appears
   - ✅ OTP input screen appears
   - ✅ 30-second resend timer starts

2. **OTP Verification**
   - Check backend logs for OTP (or use configured test OTP)
   - Enter 6-digit OTP
   - Click "Verify & Continue"
   - ✅ Success toast appears
   - ✅ Redirects to `/dashboard`
   - ✅ Check `localStorage` for `auth_token` and `auth_user`

3. **Resend OTP**
   - On OTP screen, wait 30 seconds
   - Click "Resend OTP"
   - ✅ New OTP is sent

---

### ✅ **Phase 3: Upload Flow (Unauthenticated)** (10 minutes)

1. **Navigate to Upload Page**
   - Clear cookies/localStorage (logout if logged in)
   - Navigate to `/upload` or click "Earn Coins Now" from home

2. **Brand Selection**
   - ✅ Brands load from API
   - ✅ Select a brand using carousel
   - ✅ Verify brand selection updates

3. **Receipt Upload**
   - Click upload area or drag-drop an image
   - ✅ Image preview appears
   - ✅ "Uploading..." indicator shows
   - ✅ Success toast after upload
   - ✅ File uploaded to S3 (check browser network tab for S3 PUT request)

4. **Transaction Amount - Integer Validation**
   - Try entering `100.50` in amount field
   - ✅ Should only accept `100` (no decimals)
   - ✅ Verify input pattern blocks non-integers

5. **Continue to Phone Verification**
   - Upload receipt
   - Enter amount: `1000`
   - Click "Continue"
   - ✅ Redirects to `/upload/phone?brand=<id>&amount=1000`
   - ✅ Check `localStorage` for `pendingUpload` data

6. **Phone Verification & Reward Request Creation**
   - Enter phone number and OTP
   - ✅ Success toast appears
   - ✅ Reward request is created (check backend logs or dashboard)
   - ✅ `pendingUpload` removed from localStorage
   - ✅ Redirects to `/upload/success`

7. **Success Page Buttons**
   - ✅ "Go To Dashboard" → redirects to `/dashboard`
   - ✅ "Upload Another" → redirects to `/rewards`

---

### ✅ **Phase 4: Dashboard (Authenticated)** (5 minutes)

1. **Protected Route Check**
   - Logout (clear localStorage)
   - Try accessing `/dashboard` directly
   - ✅ Redirects to `/login?redirect=dashboard`

2. **Login and Access Dashboard**
   - Login as authenticated user
   - Navigate to `/dashboard`
   - ✅ Dashboard loads successfully
   - ✅ Displays total coins (whole number, e.g., `500` not `500.00`)
   - ✅ Displays total earned and redeemed
   - ✅ Shows transaction history with:
     - Brand name
     - Coins earned/redeemed (₹ symbol, whole numbers)
     - Status (PENDING, APPROVED, etc.)
     - Date

3. **"Get more rewards" Button**
   - Click the button
   - ✅ Redirects to `/rewards`

4. **No Back Button Verification**
   - ✅ Verify no back button to home page is visible

---

### ✅ **Phase 5: Rewards Page (Authenticated)** (10 minutes)

1. **Protected Route Check**
   - Logout (clear localStorage)
   - Try accessing `/rewards` directly
   - ✅ Redirects to `/login?redirect=rewards`

2. **Login and Access Rewards**
   - Login as authenticated user
   - Navigate to `/rewards`
   - ✅ Page loads successfully

3. **Brand Selection**
   - ✅ Select a brand
   - ✅ Verify brand details display correctly

4. **Bill Amount Entry**
   - Enter various amounts
   - ✅ Only integers accepted (no decimals)
   - ✅ Preset buttons (₹500, ₹1000, ₹2500) work

5. **Receipt Upload**
   - Upload receipt image
   - ✅ Upload works with S3 presigned URL
   - ✅ Success toast appears

6. **Redemption Slider**
   - Set bill amount to ₹1000
   - Assume user has 200 coins
   - Assume brand has 5% redemption rate
   - Max redeemable = `min(200, 1000 * 0.05, maxCap)` = `min(200, 50, ∞)` = `50`
   - ✅ Slider max is 50
   - ✅ Slider only allows whole numbers
   - ✅ Coins redeemed updates as slider moves

7. **UPI ID Conditional Logic**
   - Set redemption to 0
   - ✅ UPI ID field is disabled/grayed out
   - Set redemption to 50
   - ✅ UPI ID field is enabled
   - ✅ If previously set, UPI ID is auto-filled

8. **Earning Calculation**
   - Bill: ₹1000
   - Redeem: ₹100
   - Earn rate: 10%
   - Expected earned: `10% × (1000 - 100) = 90`
   - ✅ Verify calculation displays `₹90` (whole number)

9. **Submit Request**
   - Fill all fields
   - Click "Submit Request"
   - ✅ Success toast appears
   - ✅ Redirects to `/dashboard`
   - ✅ New transaction appears in dashboard

---

### ✅ **Phase 6: Routing & Middleware** (5 minutes)

1. **Logged-in User Home Redirect**
   - Login as authenticated user
   - Navigate to `http://localhost:3003/`
   - ✅ Automatically redirects to `/dashboard`

2. **Protected Routes**
   - Logout
   - Try accessing:
     - `/dashboard` ✅ → redirects to login
     - `/rewards` ✅ → redirects to login
     - `/redeem` ✅ → redirects to login

3. **Logout Functionality**
   - Login
   - Logout (clear localStorage manually or use logout button if exists)
   - ✅ `auth_token` removed
   - ✅ `auth_user` removed
   - ✅ Redirect to home or login
   - ✅ Accessing `/dashboard` redirects to login

---

### ✅ **Phase 7: Backend API Integration** (10 minutes)

Test API endpoints using browser console or Postman:

1. **GET /api/v1/public/transactions/brands**
   ```javascript
   fetch('http://localhost:3001/api/v1/public/transactions/brands')
     .then(r => r.json())
     .then(console.log)
   ```
   ✅ Returns array of active brands

2. **POST /api/v1/waitlist**
   ```javascript
   fetch('http://localhost:3001/api/v1/waitlist', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ email: 'test@test.com', source: 'webapp' })
   }).then(r => r.json()).then(console.log)
   ```
   ✅ Returns success response

3. **POST /api/v1/auth/login-signup**
   ```javascript
   fetch('http://localhost:3001/api/v1/auth/login-signup', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ mobileNumber: '+919876543210' })
   }).then(r => r.json()).then(console.log)
   ```
   ✅ Returns success, OTP sent

4. **POST /api/v1/auth/verify-otp**
   ```javascript
   fetch('http://localhost:3001/api/v1/auth/verify-otp', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ mobileNumber: '+919876543210', otp: '123456' })
   }).then(r => r.json()).then(console.log)
   ```
   ✅ Returns JWT token and user data

5. **GET /api/v1/transactions/user** (with auth)
   ```javascript
   const token = localStorage.getItem('auth_token');
   fetch('http://localhost:3001/api/v1/transactions/user', {
     headers: { 'Authorization': `Bearer ${token}` }
   }).then(r => r.json()).then(console.log)
   ```
   ✅ Returns user's transactions

6. **POST /api/v1/public/transactions/upload-url**
   ```javascript
   fetch('http://localhost:3001/api/v1/public/transactions/upload-url', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ fileName: 'test.jpg', mimeType: 'image/jpeg' })
   }).then(r => r.json()).then(console.log)
   ```
   ✅ Returns presigned S3 upload URL

7. **POST /api/v1/public/transactions/reward-request** (with auth)
   ```javascript
   const token = localStorage.getItem('auth_token');
   fetch('http://localhost:3001/api/v1/public/transactions/reward-request', {
     method: 'POST',
     headers: { 
       'Authorization': `Bearer ${token}`,
       'Content-Type': 'application/json'
     },
     body: JSON.stringify({
       brandId: 'some-brand-id',
       billAmount: 1000,
       billDate: new Date().toISOString(),
       receiptUrl: 'https://s3.amazonaws.com/...',
       coinsToRedeem: 0
     })
   }).then(r => r.json()).then(console.log)
   ```
   ✅ Returns created transaction

---

### ✅ **Phase 8: Additional Checks** (5 minutes)

1. **Whole Number Validation**
   - Test all amount inputs across the app
   - ✅ No decimal values accepted
   - ✅ All displayed amounts show as integers (₹500, not ₹500.00)

2. **Error Handling**
   - Stop backend API
   - Try various actions
   - ✅ Toast error messages appear
   - ✅ Fallback data used where appropriate
   - ✅ No app crashes

3. **Responsive Design**
   - Test on mobile view (DevTools)
   - ✅ All layouts adapt properly
   - ✅ Buttons clickable
   - ✅ Forms usable

4. **S3 Upload Performance**
   - Upload a 3-5MB image
   - ✅ Upload completes quickly
   - ✅ Progress indicator shown
   - ✅ Direct S3 upload (check network tab)

---

## Quick Verification Script

Run this in browser console on home page to check if APIs are working:

```javascript
// Test Brands API
fetch('http://localhost:3001/api/v1/public/transactions/brands')
  .then(r => r.json())
  .then(data => {
    console.log('✅ Brands API:', data.success ? 'WORKING' : 'FAILED');
    console.log('   Brands loaded:', data.data?.length || 0);
  })
  .catch(e => console.error('❌ Brands API FAILED:', e));

// Test Waitlist API
fetch('http://localhost:3001/api/v1/waitlist', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: `test-${Date.now()}@test.com`, source: 'test' })
}).then(r => r.json())
  .then(data => console.log('✅ Waitlist API:', data.success ? 'WORKING' : 'FAILED'))
  .catch(e => console.error('❌ Waitlist API FAILED:', e));

// Check if user is logged in
const token = localStorage.getItem('auth_token');
console.log('🔐 Auth Status:', token ? 'LOGGED IN' : 'LOGGED OUT');
if (token) {
  console.log('   Token length:', token.length);
}

// Check Auth Context
console.log('📱 Auth Data in localStorage:', {
  token: !!localStorage.getItem('auth_token'),
  user: !!localStorage.getItem('auth_user')
});
```

---

## Common Issues & Fixes

### Issue 1: Brands not loading
- **Symptom**: Empty brand list or fallback brands shown
- **Fix**: 
  1. Check backend is running
  2. Check API endpoint: `http://localhost:3001/api/v1/public/transactions/brands`
  3. Verify brands exist in database
  4. Run seed script if needed

### Issue 2: OTP not sending
- **Symptom**: Error toast on "Send OTP"
- **Fix**:
  1. Check backend logs for errors
  2. Verify OTP service is configured (Twilio, etc.)
  3. Use development/test OTP if configured

### Issue 3: File upload fails
- **Symptom**: Upload hangs or error toast
- **Fix**:
  1. Check S3 bucket configuration
  2. Verify S3 credentials in backend `.env`
  3. Check CORS policy on S3 bucket
  4. Verify presigned URL generation

### Issue 4: Middleware not redirecting
- **Symptom**: Can access `/dashboard` when logged out
- **Fix**:
  1. Check `middleware.ts` is present in `src/`
  2. Verify token is stored in localStorage (not cookies)
  3. Update middleware to check localStorage if needed

### Issue 5: Integer validation not working
- **Symptom**: Can enter decimals in amount fields
- **Fix**:
  1. Check input `pattern="[0-9]*"` and `inputMode="numeric"`
  2. Verify `onChange` handler uses `/^\d+$/` regex
  3. Add validation in backend DTOs with `@IsInt()`

---

## Final Checklist

Before marking testing complete, ensure:

- [ ] All 35+ tests in WEBAPP_TESTING_REPORT.md are completed
- [ ] All issues found are documented
- [ ] Critical issues are fixed
- [ ] Backend API is stable and responding
- [ ] S3 uploads working correctly
- [ ] Authentication flow is smooth
- [ ] All amounts display as whole numbers (integers)
- [ ] Routing and middleware working correctly
- [ ] Error handling is user-friendly
- [ ] No console errors in browser
- [ ] Responsive design tested on mobile

---

## Ready for Production?

✅ **Yes** - All tests passed, no critical issues  
⚠️ **Not Yet** - Some issues found, needs fixes  
❌ **No** - Major issues, requires significant work

---

**Testing Completed By**: _________________  
**Date**: _________________  
**Sign-off**: _________________

