# eCFR Regulation Analyzer - Backend

Python Lambda functions and infrastructure for the eCFR Regulation Analyzer.

## Tech Stack

- Python 3.13
- AWS Lambda
- API Gateway
- S3 (data storage)
- CloudFront (frontend CDN)
- Terraform (infrastructure as code)

## Project Structure

```
backend/
├── src/
│   ├── handlers/          # Lambda entry points
│   │   └── ecfr/
│   │       ├── get_agencies.py
│   │       ├── get_history.py
│   │       ├── get_summary.py
│   │       └── ingest.py
│   ├── services/          # Business logic
│   │   ├── data_processor.py
│   │   ├── ecfr_client.py
│   │   ├── ingest.py
│   │   └── s3_store.py
│   └── utils/             # Helper functions
│       ├── error_handler.py
│       ├── helper.py
│       └── responses.py
├── terraform/             # Infrastructure as code
│   ├── modules/
│   │   ├── api/
│   │   ├── frontend/
│   │   └── lambda/
│   ├── main.tf
│   ├── variables.tf
│   └── outputs.tf
├── makefile               # Build and deployment automation
└── requirements.txt       # Python dependencies
```

## Lambda Functions

### GET /agencies

**Handler:** `handlers/ecfr/get_agencies.py`

- Returns list of agencies with metrics:
  - Word count (total words across all regulations)
  - CFR titles (number of titles managed)
  - Checksums (SHA-256 hash for change detection)
  - **Regulatory Burden Score** (composite metric: complexity × instability × scope)
  - Average words per title
  - Total amendments
- Data source: S3 `agency_metrics.json`

### GET /history

**Handler:** `handlers/ecfr/get_history.py`

- Returns amendment timeline data
- Data source: S3 `change_history.json`

### GET /summary

**Handler:** `handlers/ecfr/get_summary.py`

- Returns ingestion summary statistics
- Data source: S3 `summary.json`

### POST /ingest

**Handler:** `handlers/ecfr/ingest.py`

- Triggers async data refresh from eCFR API
- Uses self-invocation pattern for async execution
- Processes all CFR titles and generates analytics

## Architecture Patterns

### Error Handling

All Lambda handlers use the `@lambda_handler_with_errors` decorator:

```python
@lambda_handler_with_errors("operation_name")
def lambda_handler(event: Dict, context):
    # Handler logic
```

This provides:

- Automatic exception catching
- Standardized error responses
- Optional traceback logging (dev environment)

### Response Format

All responses use `success_response()` helper:

```python
return success_response(body=data)
```

Features:

- Automatic snake_case → camelCase conversion
- CORS headers
- JSON serialization

### Data Storage

S3-based storage via `S3Store` class:

```python
store = S3Store(bucket_name)
data = store.get_json("file.json")
store.put_json("file.json", data)
```

## Local Development

### Prerequisites

- Python 3.13+ (Lambda runtime)
- Docker (for building Lambda layers)
- AWS CLI configured
- Terraform

### Setup

```bash
# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Install dev dependencies (for testing)
pip install -r requirements-dev.txt
```

### Testing

**Run Unit Tests:**

```bash
# Using the test script
./run_tests.sh

# Or directly with pytest
pytest tests/ -v

# With coverage report
pytest tests/ --cov=src --cov-report=term-missing
```

**Test Coverage:**

- Data processing functions
- Helper utilities
- Input validation

### Testing Locally

You can test Lambda handlers locally by importing and calling them:

```python
from handlers.ecfr.get_agencies import lambda_handler

event = {}
context = None
response = lambda_handler(event, context)
print(response)
```

## Deployment

### Quick Deploy

```bash
# Deploy everything (backend + infrastructure)
make deploy ENV=dev

# Deploy frontend only
make deploy-frontend ENV=dev
```

### Available Make Commands

**Build:**

- `make zip-all` - Build all Lambda zips and layer
- `make zip-layer` - Build Python dependencies layer
- `make zip-<lambda>` - Build specific Lambda (e.g., `make zip-ingest`)

**Deploy:**

- `make deploy ENV=dev` - Deploy all infrastructure
- `make deploy-<lambda> ENV=dev` - Deploy specific Lambda
- `make deploy-frontend ENV=dev` - Deploy frontend to S3/CloudFront

**Maintenance:**

- `make clean` - Remove build artifacts
- `make nuke` - Remove all Terraform state and artifacts
- `make rebuild-layer` - Force rebuild Python layer
- `make rebuild-zips` - Force rebuild all Lambda zips

### Deployment Process

When you run `make deploy ENV=dev`:

1. **Build Lambda Layer** (Python dependencies)
   - Uses Docker with `public.ecr.aws/sam/build-python3.13`
   - Installs packages from `requirements.txt`
   - Creates `builds/python.zip`

2. **Build Lambda Functions**
   - Zips source code from `src/`
   - Creates separate zips for each Lambda
   - Names: `ecfr-<function>-<env>.zip`

3. **Generate Terraform Backend Config**
   - Creates `backend.auto.hcl`
   - Configures S3 backend for state storage

4. **Terraform Init**
   - Initializes Terraform
   - Downloads AWS provider
   - Configures remote state

5. **Terraform Apply**
   - Creates/updates infrastructure:
     - API Gateway
     - Lambda functions
     - S3 buckets
     - CloudFront distribution
     - IAM roles and policies

## Environment Variables

Lambda functions use these environment variables (set by Terraform):

- `DATA_BUCKET` - S3 bucket for storing processed data
- `ENVIRONMENT` - Environment name (dev/prod)

## Infrastructure

### Terraform Modules

**api/** - API Gateway configuration

- REST API
- Resources and methods
- CORS configuration
- Deployment stages

**lambda/** - Lambda function configuration

- Function definitions
- IAM roles
- Environment variables
- Layer attachments

**frontend/** - Frontend hosting

- S3 bucket for static files
- CloudFront distribution
- Bucket policies

### State Management

Terraform state is stored in S3:

- Bucket: `ecfr-terraform-state-bucket`
- Key: `ecfr/<env>/terraform.tfstate`
- Region: `us-west-1`

## Data Flow

1. **Ingestion** (POST /ingest)
   - Fetch data from eCFR API
   - Process and aggregate metrics
   - Store in S3 as JSON files

2. **Retrieval** (GET endpoints)
   - Read JSON files from S3
   - Convert snake_case → camelCase
   - Return to frontend

## API Response Format

All successful responses:

```json
{
  "statusCode": 200,
  "headers": {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*"
  },
  "body": "{...}"
}
```

Error responses:

```json
{
  "statusCode": 500,
  "headers": {...},
  "body": "{\"error\": \"Error message\"}"
}
```

## Dependencies

- `requests>=2.31.0` - HTTP client for eCFR API
- `boto3>=1.34.0` - AWS SDK for S3 operations

## Troubleshooting

### Build Issues

**Docker not running:**

```bash
# Start Docker Desktop or Docker daemon
```

**AWS credentials not configured:**

```bash
aws configure
# or set AWS_PROFILE environment variable
```

### Deployment Issues

**Terraform state locked:**

```bash
# Wait for other operations to complete
# or force unlock (use with caution)
terraform -chdir=terraform force-unlock <lock-id>
```

**Lambda function not updating:**

```bash
# Force rebuild and redeploy
make rebuild-zips ENV=dev
make deploy ENV=dev
```

## Production Considerations

- Lambda functions use 128MB memory for API endpoints, 1536MB for ingestion (configurable in Terraform)
- Timeout: 30 seconds for API calls, 900 seconds for ingest
- Cold start optimization: Keep functions warm with CloudWatch Events
- Monitoring: CloudWatch Logs for all Lambda invocations
- Cost optimization: S3 lifecycle policies for old data
