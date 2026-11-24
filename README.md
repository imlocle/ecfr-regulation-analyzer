# eCFR Regulation Analyzer

A full-stack application for analyzing federal regulations from the Electronic Code of Federal Regulations (eCFR). This tool provides analytics on agency-specific regulation metrics, historical amendment trends, and data ingestion capabilities.

## Architecture

- **Frontend**: React + TypeScript + Vite
- **Backend**: Python Lambda functions on AWS
- **Infrastructure**: Terraform (API Gateway, Lambda, S3, CloudFront)
- **Data Source**: eCFR API (https://www.ecfr.gov)

## Project Structure

```
.
├── frontend/               # React application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── models/        # TypeScript interfaces
│   │   ├── services/      # API client
│   │   ├── styles/        # Component-specific CSS
│   │   └── test/          # Test setup
│   └── package.json
│
├── backend/               # Python Lambda handlers
│   ├── src/
│   │   ├── handlers/      # Lambda entry points
│   │   ├── services/      # Business logic
│   │   └── utils/         # Helper functions
│   ├── tests/             # Unit tests
│   ├── terraform/         # Infrastructure as code
│   └── requirements.txt
│
├── docs/                  # Documentation
│   ├── ARCHITECTURE.md
│   ├── API.md
│   ├── DEPLOYMENT.md
│   ├── DEVELOPMENT.md
│   ├── METRICS.md
│   ├── SECURITY.md
│   ├── SUBMISSION.md
│   └── README.md
│
└── README.md
```

## Features

### Core Analytics

- **Agency Metrics**: View word counts, CFR titles, and checksums per agency
- **Regulatory Burden Score**: Custom composite metric combining complexity, instability, and scope ([learn more](docs/METRICS.md))
- **Historical Trends**: Visualize amendment counts over time
- **Responsive Design**: Clean, accessible UI with sorting and pagination

### User Experience

- **Auto-Ingestion**: Automatically detects missing data and triggers ingestion
- **Interactive Tooltips**: Hover over any metric to understand what it means
- **Real-time Updates**: Polls for data completion during ingestion
- **Search & Filter**: Find agencies quickly with instant search

## Getting Started

### Prerequisites

- Node.js 18+ (for frontend)
- Python 3.13+ (for backend)
- Docker (for building Lambda layers)
- AWS CLI configured (for deployment)
- Terraform (for infrastructure)

### AWS Setup

Before deploying, you need to configure AWS credentials and create the Terraform state bucket.

#### 1. Configure AWS Credentials

**Option A: AWS CLI Configuration**

```bash
aws configure
```

Enter your:

- AWS Access Key ID
- AWS Secret Access Key
- Default region: any region (deployment region is configurable via `REGION` variable)
- Default output format: `json`

**Option B: Environment Variables**

```bash
export AWS_ACCESS_KEY_ID="your-access-key"
export AWS_SECRET_ACCESS_KEY="your-secret-key"
export AWS_DEFAULT_REGION="us-west-1"
```

**Option C: AWS Profile**

```bash
export AWS_PROFILE="your-profile-name"
```

#### 2. Create Terraform State Bucket

The backend uses S3 for Terraform state storage. Create the bucket in your desired region:

```bash
# Default region (us-west-1)
aws s3 mb s3://ecfr-terraform-state-bucket --region us-west-1

# Or specify a different region
aws s3 mb s3://ecfr-terraform-state-bucket --region us-east-1
```

Enable versioning (recommended):

```bash
aws s3api put-bucket-versioning \
  --bucket ecfr-terraform-state-bucket \
  --region us-west-1 \
  --versioning-configuration Status=Enabled
```

**Note:** The state bucket region should match your deployment region. When deploying, use `REGION=<your-region>` to ensure consistency.

#### 3. Verify AWS Access

```bash
# Check your AWS identity
aws sts get-caller-identity

# Verify region
aws configure get region
```

### Environment Configuration

The project supports multiple environments (dev, prod) and regions. Set them when deploying:

```bash
# Development in us-west-1 (default)
make deploy ENV=dev

# Production in us-east-1
make deploy ENV=prod REGION=us-east-1

# Or set as environment variable
export REGION=eu-west-1
make deploy ENV=dev
```

Each environment gets its own:

- Lambda functions (e.g., `ecfr-ingest-dev`, `ecfr-ingest-prod`)
- S3 data bucket
- API Gateway stage
- Terraform state file

**Default Region:** `us-west-1` (can be overridden with `REGION=<region>`)

### Quick Setup

From the root directory:

```bash
# Install all dependencies (frontend + backend)
npm run setup

# Start frontend development server
npm run dev

# Build frontend for production
npm run build:frontend
```

### Individual Setup

**Frontend:**

```bash
npm run setup:frontend
# or manually:
cd frontend
npm install
npm run dev
```

**Backend:**

```bash
npm run setup:backend
# or manually:
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

The frontend dev server will be available at `http://localhost:5173`

## Available Scripts

From the root directory:

**Setup:**

- `npm run setup` - Install all dependencies (frontend + backend)
- `npm run setup:frontend` - Install frontend dependencies only
- `npm run setup:backend` - Setup Python virtual environment and install backend dependencies

**Development:**

- `npm run dev` - Start frontend dev server (alias for `dev:frontend`)
- `npm run dev:frontend` - Start frontend dev server at http://localhost:5173
- `npm run build:frontend` - Build frontend for production

**Deployment:**

- `npm run deploy` - Deploy both backend and frontend (alias for `deploy:all`)
- `npm run deploy:all` - Deploy both backend infrastructure and frontend
- `npm run deploy:backend` - Deploy backend infrastructure only (default: dev, us-west-1)
- `npm run deploy:frontend` - Deploy frontend to S3/CloudFront only

**Maintenance:**

- `npm run clean` - Clean backend build artifacts
- `npm run clean:all` - Clean all build artifacts and dependencies

**Deployment with custom environment/region:**

```bash
# Deploy everything to production in us-east-1
ENV=prod REGION=us-east-1 npm run deploy

# Deploy only backend to dev in eu-west-1
ENV=dev REGION=eu-west-1 npm run deploy:backend

# Deploy only frontend
npm run deploy:frontend

# Or set as environment variables
export ENV=prod
export REGION=ap-southeast-1
npm run deploy:all
```

### Frontend Scripts

```bash
cd frontend
npm run dev          # Start dev server
npm run build        # Build for production
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
npm run format:check # Check formatting
npm test             # Run unit tests
npm run test:ui      # Run tests with UI
npm run test:coverage # Run tests with coverage
```

### Backend Scripts

```bash
cd backend

# Testing
./run_tests.sh          # Run unit tests
pytest tests/ -v        # Run tests with pytest directly

# Deployment
make deploy             # Deploy infrastructure
make deploy-frontend    # Deploy frontend only
make clean             # Clean build artifacts
```

### Deployment

**Full deployment:**

```bash
# Default (dev environment, us-west-1)
npm run deploy

# Production in us-east-1
ENV=prod REGION=us-east-1 npm run deploy:all

# Or using make directly
cd backend
make deploy ENV=prod REGION=us-east-1
```

This will:

1. Build the frontend
2. Package Lambda functions
3. Deploy infrastructure via Terraform
4. Upload frontend to S3/CloudFront

## API Endpoints

- `GET /agencies` - List all agencies with metrics
- `GET /history` - Amendment timeline data
- `GET /summary` - Ingestion summary statistics
- `POST /ingest` - Trigger data refresh

## Code Organization

### Frontend

- Path aliases configured (`@/` for `src/`)
- Component-specific CSS modules
- TypeScript strict mode enabled
- Prettier + ESLint configured

### Backend

- Lambda handlers with error decorators
- S3-based data storage
- Async ingestion pattern
- camelCase API responses

## Technologies

**Frontend:**

- React 19
- TypeScript 5.9
- Vite 5
- Recharts (data visualization)

**Backend:**

- Python 3.13
- boto3 (AWS SDK)
- requests (HTTP client)

**Infrastructure:**

- AWS Lambda
- API Gateway
- S3 + CloudFront
- Terraform

## Common Issues

### AWS Credentials

**Error: "Unable to locate credentials"**

```bash
# Solution: Configure AWS CLI
aws configure
```

**Error: "Access Denied"**

- Ensure your IAM user has permissions for:
  - Lambda (create, update, invoke)
  - API Gateway (create, deploy)
  - S3 (create bucket, put/get objects)
  - CloudFront (create distribution)
  - IAM (create roles, attach policies)

### Terraform State

**Error: "Error loading state: NoSuchBucket"**

```bash
# Solution: Create the state bucket
aws s3 mb s3://ecfr-terraform-state-bucket --region us-west-1
```

**Error: "Error acquiring the state lock"**

- Another deployment is in progress
- Wait for it to complete or force unlock (use with caution):

```bash
cd backend/terraform
terraform force-unlock <lock-id>
```

### Docker Issues

**Error: "Cannot connect to Docker daemon"**

- Ensure Docker Desktop is running
- Or start Docker daemon: `sudo systemctl start docker`

### Deployment

**Lambda not updating after code changes:**

```bash
# Force rebuild
cd backend
make rebuild-zips ENV=dev
make deploy ENV=dev
```

**Frontend not updating:**

```bash
# Redeploy and invalidate CloudFront cache
npm run deploy:frontend
```

## Documentation

Comprehensive documentation is available in the `/docs` directory:

- **[Architecture](docs/ARCHITECTURE.md)** - System design, components, data flow, and scalability
- **[API Reference](docs/API.md)** - Complete API documentation with examples
- **[Deployment Guide](docs/DEPLOYMENT.md)** - Step-by-step deployment instructions
- **[Development Guide](docs/DEVELOPMENT.md)** - Local setup, coding standards, and workflows
- **[Custom Metrics](docs/METRICS.md)** - Detailed explanation of the Regulatory Burden Index
- **[Security](docs/SECURITY.md)** - Security considerations and production recommendations
