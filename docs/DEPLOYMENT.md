# Deployment Guide

## Prerequisites

### Required Tools

- **Node.js** 18+ (frontend)
- **Python** 3.11+ (backend)
- **Docker** (Lambda layer builds)
- **AWS CLI** configured
- **Terraform** 1.0+

### AWS Account Setup

**Required Permissions:**

- Lambda (create, update, invoke)
- API Gateway (create, deploy)
- S3 (create bucket, put/get objects)
- CloudFront (create distribution)
- IAM (create roles, attach policies)

**Configure AWS Credentials:**

```bash
# Option 1: AWS CLI
aws configure

# Option 2: Environment Variables
export AWS_ACCESS_KEY_ID="your-key"
export AWS_SECRET_ACCESS_KEY="your-secret"
export AWS_DEFAULT_REGION="us-west-1"

# Option 3: AWS Profile
export AWS_PROFILE="your-profile"
```

**Verify Access:**

```bash
aws sts get-caller-identity
```

### Create Terraform State Bucket

```bash
# Create bucket
aws s3 mb s3://ecfr-terraform-state-bucket --region us-west-1

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket ecfr-terraform-state-bucket \
  --region us-west-1 \
  --versioning-configuration Status=Enabled
```

## Quick Start

### 1. Install Dependencies

```bash
# From project root
npm run setup
```

This installs both frontend and backend dependencies.

### 2. Deploy Backend

```bash
# Deploy to dev environment (default region: us-west-1)
npm run deploy:backend

# Or specify environment and region
ENV=prod REGION=us-east-1 npm run deploy:backend
```

### 3. Deploy Frontend

```bash
npm run deploy:frontend
```

### 4. Access Application

After deployment, Terraform outputs the CloudFront URL:

```
Outputs:
cloudfront_url = "https://d1234567890.cloudfront.net"
```

## Detailed Deployment

### Backend Deployment

**What It Does:**

1. Builds Lambda layer (Python dependencies)
2. Packages Lambda functions
3. Runs Terraform to create/update infrastructure
4. Deploys to AWS

**Command:**

```bash
cd backend
make deploy ENV=dev REGION=us-west-1
```

**Build Artifacts:**

```
backend/terraform/builds/
├── python.zip                    # Lambda layer
├── ecfr-ingest-dev.zip          # Ingest function
├── ecfr-get-agencies-dev.zip    # Get agencies function
├── ecfr-get-history-dev.zip     # Get history function
└── ecfr-get-summary-dev.zip     # Get summary function
```

**Terraform Resources Created:**

- 4 Lambda functions
- 1 Lambda layer
- 1 API Gateway REST API
- 2 S3 buckets (data, frontend)
- 1 CloudFront distribution
- IAM roles and policies

**Duration:** 3-5 minutes (first deploy), 1-2 minutes (updates)

### Frontend Deployment

**What It Does:**

1. Builds React app for production
2. Uploads to S3 bucket
3. Invalidates CloudFront cache

**Command:**

```bash
cd backend
make deploy-frontend ENV=dev
```

**Build Output:**

```
frontend/dist/
├── index.html
├── assets/
│   ├── index-[hash].js
│   └── index-[hash].css
└── vite.svg
```

**Duration:** 1-2 minutes

## Environment Configuration

### Supported Environments

- **dev** - Development environment
- **prod** - Production environment

Each environment gets isolated resources:

- Separate Lambda functions
- Separate S3 buckets
- Separate API Gateway stages
- Separate Terraform state files

### Environment Variables

**Backend (Lambda):**

```bash
# Set by Terraform automatically
DATA_BUCKET=ecfr-data-bucket-dev
ENVIRONMENT=dev
```

**Frontend (Build-time):**

```bash
# Optional: Override API URL
VITE_API_URL=https://your-api-url.com/dev
```

If not set, frontend uses hardcoded default.

### Region Configuration

**Default:** `us-west-1`

**Change Region:**

```bash
# Deploy to different region
REGION=us-east-1 npm run deploy:backend

# Update all scripts
export REGION=eu-west-1
npm run deploy
```

**Note:** Terraform state bucket must exist in target region.

## Deployment Workflows

### Initial Deployment

```bash
# 1. Setup
npm run setup

# 2. Deploy backend
npm run deploy:backend

# 3. Trigger initial data ingestion
# (Or use UI button after frontend deploys)

# 4. Deploy frontend
npm run deploy:frontend
```

### Update Code

**Backend Only:**

```bash
npm run deploy:backend
```

**Frontend Only:**

```bash
npm run deploy:frontend
```

**Both:**

```bash
npm run deploy
```

### Force Rebuild

**Rebuild Lambda Layer:**

```bash
cd backend
make rebuild-layer ENV=dev
make deploy ENV=dev
```

**Rebuild All Lambda Zips:**

```bash
cd backend
make rebuild-zips ENV=dev
make deploy ENV=dev
```

## Rollback Procedures

### Code Rollback

**Option 1: Git Revert**

```bash
git revert HEAD
npm run deploy
```

**Option 2: Redeploy Previous Version**

```bash
git checkout <previous-commit>
npm run deploy
git checkout main
```

### Infrastructure Rollback

**Terraform State:**

```bash
cd backend/terraform
terraform state list
terraform state pull > backup.tfstate
```

**Restore Previous State:**

```bash
# Manually edit terraform.tfstate in S3
# Or use Terraform workspace
```

### Data Rollback

**S3 Versioning:**

```bash
# List versions
aws s3api list-object-versions \
  --bucket ecfr-data-bucket-dev \
  --prefix agency_metrics.json

# Restore previous version
aws s3api copy-object \
  --bucket ecfr-data-bucket-dev \
  --copy-source ecfr-data-bucket-dev/agency_metrics.json?versionId=<version-id> \
  --key agency_metrics.json
```

## Monitoring Deployment

### Check Lambda Functions

```bash
aws lambda list-functions --query 'Functions[?starts_with(FunctionName, `ecfr-`)]'
```

### Check API Gateway

```bash
aws apigateway get-rest-apis --query 'items[?name==`ecfr-api-dev`]'
```

### Check S3 Buckets

```bash
aws s3 ls | grep ecfr
```

### View Logs

```bash
# Lambda logs
aws logs tail /aws/lambda/ecfr-ingest-dev --follow

# API Gateway logs (if enabled)
aws logs tail API-Gateway-Execution-Logs_<api-id>/dev --follow
```

## Troubleshooting

### Common Issues

**1. Docker Not Running**

```
Error: Cannot connect to Docker daemon
```

**Solution:** Start Docker Desktop or daemon

**2. AWS Credentials Invalid**

```
Error: Unable to locate credentials
```

**Solution:** Run `aws configure` or set environment variables

**3. Terraform State Locked**

```
Error: Error acquiring the state lock
```

**Solution:** Wait for other deployment to finish, or force unlock:

```bash
cd backend/terraform
terraform force-unlock <lock-id>
```

**4. Lambda Not Updating**

```
Code changes not reflected after deployment
```

**Solution:** Force rebuild

```bash
cd backend
make rebuild-zips ENV=dev
make deploy ENV=dev
```

**5. Frontend Not Updating**

```
Old version still showing
```

**Solution:** Invalidate CloudFront cache

```bash
aws cloudfront create-invalidation \
  --distribution-id <dist-id> \
  --paths "/*"
```

## Cost Estimation

### Monthly Costs (Typical Usage)

**Lambda:**

- Requests: 10,000/month
- Duration: 100ms average
- Cost: ~$0.20/month

**API Gateway:**

- Requests: 10,000/month
- Cost: ~$0.035/month

**S3:**

- Storage: 100MB
- Requests: 10,000/month
- Cost: ~$0.01/month

**CloudFront:**

- Data Transfer: 1GB/month
- Requests: 10,000/month
- Cost: ~$0.10/month

**Total: ~$0.35/month** (excluding free tier)

### Cost Optimization

1. **Enable S3 Lifecycle Policies**
   - Move old data to Glacier
   - Delete old versions after 90 days

2. **CloudFront Caching**
   - Cache API responses for 1 hour
   - Reduce Lambda invocations

3. **Lambda Memory Optimization**
   - Right-size memory allocation
   - Monitor CloudWatch metrics

4. **Reserved Capacity**
   - For production, consider provisioned concurrency

## Security Checklist

- [ ] AWS credentials not committed to Git
- [ ] S3 buckets have encryption enabled
- [ ] API Gateway has throttling configured
- [ ] CloudWatch Logs enabled for all functions
- [ ] IAM roles follow least privilege
- [ ] Terraform state bucket has versioning
- [ ] CloudFront uses HTTPS only
- [ ] CORS configured appropriately

## Production Readiness

### Before Going to Production

1. **Enable Monitoring**
   - CloudWatch alarms for errors
   - SNS notifications for alerts
   - Dashboard for key metrics

2. **Enable Logging**
   - API Gateway access logs
   - Lambda detailed logging
   - S3 access logs

3. **Add Authentication**
   - API Gateway API keys
   - Or AWS IAM authentication
   - Or Cognito user pools

4. **Configure Backups**
   - S3 versioning enabled
   - Terraform state backups
   - Regular data exports

5. **Load Testing**
   - Test with expected traffic
   - Verify auto-scaling works
   - Check error rates

6. **Documentation**
   - Update API documentation
   - Document runbooks
   - Create incident response plan

7. **Compliance**
   - Review data retention policies
   - Ensure HTTPS everywhere
   - Audit IAM permissions
