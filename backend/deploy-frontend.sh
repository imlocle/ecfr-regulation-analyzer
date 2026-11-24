#!/bin/bash
set -e

# Deploy frontend to S3 and invalidate CloudFront cache
#
# Usage:
#   ./deploy-frontend.sh [environment]
#
# Example:
#   ./deploy-frontend.sh dev

ENV=${1:-dev}
FRONTEND_DIR="../frontend"

echo "🔍 Getting infrastructure outputs..."
cd terraform

# Get S3 bucket and CloudFront distribution ID from Terraform
BUCKET=$(terraform output -raw frontend_bucket 2>/dev/null || echo "")
DISTRIBUTION_ID=$(terraform output -raw cloudfront_distribution_id 2>/dev/null || echo "")
API_URL=$(terraform output -raw ecfr_api_endpoint 2>/dev/null || echo "")

if [ -z "$BUCKET" ] || [ -z "$DISTRIBUTION_ID" ]; then
  echo "❌ Error: Frontend infrastructure not found. Run 'terraform apply' first."
  exit 1
fi

echo "📦 S3 Bucket: $BUCKET"
echo "🌐 CloudFront Distribution: $DISTRIBUTION_ID"
echo "🔗 API URL: $API_URL"

cd ..

echo ""
echo "🏗️  Building frontend..."
cd "$FRONTEND_DIR"

# Set API URL for production build
export VITE_API_URL="${API_URL}/${ENV}"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "📥 Installing dependencies..."
  npm install
fi

# Build the frontend
npm run build

echo ""
echo "☁️  Uploading to S3..."
aws s3 sync dist/ "s3://${BUCKET}/" --delete

echo ""
echo "🔄 Invalidating CloudFront cache..."
aws cloudfront create-invalidation \
  --distribution-id "$DISTRIBUTION_ID" \
  --paths "/*" \
  --no-cli-pager

echo ""
echo "✅ Frontend deployed successfully!"
echo ""
echo "🌐 Your site will be available at:"
terraform -chdir=../backend/terraform output -raw frontend_url
echo ""
