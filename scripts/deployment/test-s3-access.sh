#!/bin/bash

# Test S3 Access Script for Club Corra
# Run this after applying the S3 fixes to verify they work

set -e

BUCKET_NAME="clubcorrarecieptsbucket"
REGION="eu-north-1"

echo "🧪 Testing S3 access for $BUCKET_NAME"

# Test 1: Check if bucket exists and is accessible
echo "1️⃣ Testing bucket access..."
if aws s3api head-bucket --bucket "$BUCKET_NAME" --region "$REGION" 2>/dev/null; then
    echo "✅ Bucket is accessible"
else
    echo "❌ Bucket is not accessible"
    exit 1
fi

# Test 2: Check bucket policy
echo "2️⃣ Testing bucket policy..."
POLICY=$(aws s3api get-bucket-policy --bucket "$BUCKET_NAME" --region "$REGION" 2>/dev/null || echo "No policy")
if echo "$POLICY" | grep -q "PublicReadForReceiptImages"; then
    echo "✅ Bucket policy is configured correctly"
else
    echo "❌ Bucket policy is not configured correctly"
fi

# Test 3: Check CORS configuration
echo "3️⃣ Testing CORS configuration..."
CORS=$(aws s3api get-bucket-cors --bucket "$BUCKET_NAME" --region "$REGION" 2>/dev/null || echo "No CORS")
if echo "$CORS" | grep -q "admin.clubcorra.com"; then
    echo "✅ CORS is configured correctly"
else
    echo "❌ CORS is not configured correctly"
fi

# Test 4: Check public access blocks
echo "4️⃣ Testing public access settings..."
BLOCKS=$(aws s3api get-public-access-block --bucket "$BUCKET_NAME" --region "$REGION" 2>/dev/null || echo "No blocks")
if echo "$BLOCKS" | grep -q '"BlockPublicAcls": false'; then
    echo "✅ Public access is configured correctly"
else
    echo "❌ Public access is not configured correctly"
fi

# Test 5: Test file upload and access
echo "5️⃣ Testing file upload and access..."
TEST_FILE="test-receipt-$(date +%s).txt"
TEST_CONTENT="Test receipt content - $(date)"

echo "$TEST_CONTENT" > "$TEST_FILE"

# Upload test file
aws s3 cp "$TEST_FILE" "s3://$BUCKET_NAME/uploads/test/$TEST_FILE" \
    --region "$REGION" \
    --content-type "text/plain"

echo "✅ Test file uploaded"

# Test direct access
TEST_URL="https://$BUCKET_NAME.s3.$REGION.amazonaws.com/uploads/test/$TEST_FILE"
echo "🔍 Testing direct access to: $TEST_URL"

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$TEST_URL")
if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Direct access successful (HTTP $HTTP_CODE)"
else
    echo "❌ Direct access failed (HTTP $HTTP_CODE)"
fi

# Test CORS headers
echo "🔍 Testing CORS headers..."
CORS_HEADERS=$(curl -s -H "Origin: https://admin.clubcorra.com" \
    -H "Access-Control-Request-Method: GET" \
    -H "Access-Control-Request-Headers: X-Requested-With" \
    -X OPTIONS \
    "$TEST_URL" -w "%{http_code}")

if echo "$CORS_HEADERS" | grep -q "200"; then
    echo "✅ CORS preflight successful"
else
    echo "❌ CORS preflight failed"
fi

# Clean up test file
echo "🧹 Cleaning up test file..."
aws s3 rm "s3://$BUCKET_NAME/uploads/test/$TEST_FILE" --region "$REGION"
rm -f "$TEST_FILE"

echo ""
echo "🎯 Test Results Summary:"
echo "========================"
echo "Bucket Access: ✅"
echo "Bucket Policy: $(if echo "$POLICY" | grep -q "PublicReadForReceiptImages"; then echo "✅"; else echo "❌"; fi)"
echo "CORS Config: $(if echo "$CORS" | grep -q "admin.clubcorra.com"; then echo "✅"; else echo "❌"; fi)"
echo "Public Access: $(if echo "$BLOCKS" | grep -q '"BlockPublicAcls": false'; then echo "✅"; else echo "❌"; fi)"
echo "File Access: $(if [ "$HTTP_CODE" = "200" ]; then echo "✅"; else echo "❌"; fi)"
echo "CORS Headers: $(if echo "$CORS_HEADERS" | grep -q "200"; then echo "✅"; else echo "❌"; fi)"

echo ""
if [ "$HTTP_CODE" = "200" ]; then
    echo "🎉 S3 configuration is working correctly!"
    echo "Receipt images should now be accessible in your admin app."
else
    echo "⚠️  Some issues remain. Please check the configuration and try again."
fi
