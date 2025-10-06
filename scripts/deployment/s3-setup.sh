#!/bin/bash

# S3 Setup Script for Club Corra Receipt Images
# This script configures the S3 bucket with proper CORS and bucket policy

set -e

# Configuration
BUCKET_NAME="clubcorrarecieptsbucket"
REGION="eu-north-1"
CLOUDFRONT_DISTRIBUTION_ID="E3APIJ49DZECLM"  # From your environment

echo "🚀 Setting up S3 bucket: $BUCKET_NAME in region: $REGION"

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is not installed. Please install it first."
    exit 1
fi

# Check if bucket exists, create if it doesn't
if ! aws s3api head-bucket --bucket "$BUCKET_NAME" --region "$REGION" 2>/dev/null; then
    echo "📦 Creating S3 bucket: $BUCKET_NAME"
    aws s3api create-bucket \
        --bucket "$BUCKET_NAME" \
        --region "$REGION" \
        --create-bucket-configuration LocationConstraint="$REGION"
    
    echo "✅ Bucket created successfully"
else
    echo "✅ Bucket already exists"
fi

# Configure CORS for the bucket
echo "🔧 Configuring CORS policy..."
cat > cors-policy.json << EOF
{
    "CORSRules": [
        {
            "AllowedHeaders": ["*"],
            "AllowedMethods": ["GET", "HEAD"],
            "AllowedOrigins": [
                "https://admin.clubcorra.com",
                "https://clubcorra.com",
                "https://*.clubcorra.com",
                "https://*.vercel.app",
                "https://club-corra-pilot-admin-*.vercel.app",
                "http://localhost:3000",
                "http://localhost:3001"
            ],
            "ExposeHeaders": ["ETag"],
            "MaxAgeSeconds": 3000
        }
    ]
}
EOF

aws s3api put-bucket-cors --bucket "$BUCKET_NAME" --cors-configuration file://cors-policy.json
echo "✅ CORS policy configured"

# Configure bucket policy for public read access to receipt images
echo "🔐 Configuring bucket policy..."
cat > bucket-policy.json << EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadForReceiptImages",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::$BUCKET_NAME/uploads/*",
            "Condition": {
                "StringEquals": {
                    "aws:PrincipalOrgID": "o-xxxxxxxxxx"
                }
            }
        },
        {
            "Sid": "PublicReadForReceiptImagesNoOrg",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::$BUCKET_NAME/uploads/*"
        }
    ]
}
EOF

aws s3api put-bucket-policy --bucket "$BUCKET_NAME" --policy file://bucket-policy.json
echo "✅ Bucket policy configured"

# Enable public access block settings (allow public read)
echo "🌐 Configuring public access settings..."
aws s3api put-public-access-block \
    --bucket "$BUCKET_NAME" \
    --public-access-block-configuration \
    "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false"

echo "✅ Public access configured"

# Set bucket ownership controls
echo "👑 Setting bucket ownership controls..."
aws s3api put-bucket-ownership-controls \
    --bucket "$BUCKET_NAME" \
    --ownership-controls Rules='[{ObjectOwnership="BucketOwnerPreferred"}]'

echo "✅ Ownership controls set"

# Create a test file to verify access
echo "🧪 Creating test file to verify configuration..."
echo "This is a test receipt image" > test-receipt.txt

aws s3 cp test-receipt.txt "s3://$BUCKET_NAME/uploads/test/test-receipt.txt" \
    --region "$REGION" \
    --content-type "text/plain"

echo "✅ Test file uploaded"

# Test public access
echo "🔍 Testing public access..."
TEST_URL="https://$BUCKET_NAME.s3.$REGION.amazonaws.com/uploads/test/test-receipt.txt"
echo "Test URL: $TEST_URL"

if curl -s -o /dev/null -w "%{http_code}" "$TEST_URL" | grep -q "200"; then
    echo "✅ Public access test successful"
else
    echo "⚠️  Public access test failed. You may need to wait a few minutes for changes to propagate."
fi

# Clean up test files
rm -f test-receipt.txt cors-policy.json bucket-policy.json
aws s3 rm "s3://$BUCKET_NAME/uploads/test/test-receipt.txt" --region "$REGION"

echo ""
echo "🎉 S3 bucket setup complete!"
echo ""
echo "Next steps:"
echo "1. Update your environment variables with the correct S3 configuration"
echo "2. Test image upload and retrieval in your admin app"
echo "3. Consider setting up CloudFront for better performance and security"
echo ""
echo "Bucket: $BUCKET_NAME"
echo "Region: $REGION"
echo "CORS: Configured for admin app domains"
echo "Policy: Public read access for uploads/*"
