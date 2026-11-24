# Architecture

## Overview

The eCFR Regulation Analyzer is a serverless full-stack application designed to analyze federal regulations and provide actionable insights for deregulation decision-making.

## System Architecture

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │ HTTPS
       ▼
┌─────────────────┐
│   CloudFront    │ (CDN)
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐ ┌──────────────┐
│   S3   │ │ API Gateway  │
│(Static)│ └──────┬───────┘
└────────┘        │
                  ▼
         ┌────────────────┐
         │ Lambda Functions│
         └────────┬────────┘
                  │
         ┌────────┴────────┐
         │                 │
         ▼                 ▼
    ┌────────┐      ┌──────────┐
    │   S3   │      │ eCFR API │
    │ (Data) │      │(External)│
    └────────┘      └──────────┘
```

## Components

### Frontend (React + TypeScript)

**Technology Stack:**

- React 19 with TypeScript 5.9
- Vite 5 for build tooling
- Recharts for data visualization
- CSS Modules for styling

**Key Features:**

- Server-side rendering ready
- Automatic data ingestion on first load
- Real-time polling for data updates
- Responsive design with accessibility support

**Component Structure:**

```
src/
├── components/
│   ├── AgencyTable.tsx      # Main data table with sorting/filtering
│   ├── HistoryChart.tsx     # Amendment timeline visualization
│   ├── SummaryBar.tsx       # Key metrics display
│   ├── InfoTooltip.tsx      # Reusable tooltip component
│   └── IngestDataButton.tsx # Manual data refresh trigger
├── models/
│   └── types.ts             # TypeScript interfaces
├── services/
│   └── api.ts               # API client
└── App.tsx                  # Main application component
```

### Backend (Python Lambda)

**Technology Stack:**

- Python 3.13
- boto3 for AWS SDK
- requests for HTTP client
- Lambda runtime environment

**Lambda Functions:**

1. **get_agencies** - Returns agency metrics
   - Memory: 128MB
   - Timeout: 30s
   - Trigger: API Gateway GET /agencies

2. **get_history** - Returns amendment timeline
   - Memory: 128MB
   - Timeout: 30s
   - Trigger: API Gateway GET /history

3. **get_summary** - Returns ingestion summary
   - Memory: 128MB
   - Timeout: 30s
   - Trigger: API Gateway GET /summary

4. **ingest** - Processes eCFR data
   - Memory: 1536MB (1.5 GB)
   - Timeout: 900s (15 min)
   - Trigger: API Gateway POST /ingest
   - Async execution via self-invocation

**Service Layer:**

```
services/
├── ecfr_client.py       # eCFR API wrapper with rate limiting
├── data_processor.py    # Data transformation and metrics calculation
├── ingest.py            # Main ingestion pipeline
└── s3_store.py          # S3 storage abstraction
```

### Infrastructure (Terraform)

**AWS Resources:**

- API Gateway (REST API)
- Lambda Functions (4 functions)
- S3 Buckets (2: data storage, frontend hosting)
- CloudFront Distribution (CDN)
- IAM Roles and Policies
- Lambda Layer (Python dependencies)

**Infrastructure as Code:**

```
terraform/
├── modules/
│   ├── api/         # API Gateway configuration
│   ├── lambda/      # Lambda function definitions
│   └── frontend/    # S3 + CloudFront setup
├── main.tf          # Root module
├── variables.tf     # Input variables
└── outputs.tf       # Output values
```

## Data Flow

### Ingestion Pipeline

1. **Trigger**: User clicks "Ingest Data" or auto-triggered on empty data
2. **Metadata Fetch**: Download agencies and titles list from eCFR API
3. **XML Download**: For each CFR title, download full XML content
4. **Processing**: Extract text, count words, compute checksums
5. **Version History**: Fetch amendment history for each title
6. **Aggregation**: Roll up metrics by agency
7. **Calculation**: Compute Regulatory Burden Score
8. **Storage**: Save JSON files to S3
9. **Response**: Return summary to client

### Read Pipeline

1. **Request**: Frontend requests data via API Gateway
2. **Lambda Execution**: Handler reads JSON from S3
3. **Transformation**: Convert snake_case to camelCase
4. **Response**: Return data with CORS headers
5. **Rendering**: Frontend displays data in UI

## Design Decisions

### Serverless Architecture

**Why Lambda?**

- No server management
- Pay-per-use pricing
- Automatic scaling
- Built-in high availability

**Trade-offs:**

- Cold start latency (~1-2s)
- 15-minute execution limit
- Limited to 512MB-10GB memory

### S3 for Data Storage

**Why S3 over Database?**

- Simple data model (JSON files)
- No query complexity needed
- Lower cost for infrequent access
- Easy to version and backup
- Fast for full-dataset reads

**Trade-offs:**

- No partial updates
- No complex queries
- Must read entire file

### Client-Side Polling

**Why Polling vs WebSockets?**

- Simpler implementation
- No persistent connections
- Works with API Gateway REST
- Sufficient for 5-10 minute ingestion

**Trade-offs:**

- Higher latency for updates
- More API calls
- Less real-time

## Scalability Considerations

### Current Limits

- ~150 agencies
- ~50 CFR titles
- ~10MB total data size
- Ingestion: 5-10 minutes

### Scaling Strategy

If data grows 10x:

1. **Parallel Processing**: Process titles concurrently in Lambda
2. **Incremental Updates**: Only fetch changed titles
3. **Caching**: Add CloudFront caching for API responses
4. **Database**: Migrate to DynamoDB for query flexibility

### Cost Optimization

- Lambda: ~$0.20 per ingestion
- S3: ~$0.01/month for storage
- API Gateway: ~$3.50 per million requests
- CloudFront: ~$0.085 per GB transferred

**Total estimated cost: <$10/month for typical usage**

## Security Architecture

### Authentication & Authorization

- Currently: Public read access (demo/assessment)
- Production: Add Cognito or IAM authentication
- API Gateway: Enable API keys or OAuth

### Data Protection

- In-transit: HTTPS/TLS 1.2+
- At-rest: S3 server-side encryption (SSE-S3)
- Secrets: Environment variables (consider Secrets Manager)

### Network Security

- API Gateway: CORS configured
- Lambda: VPC not required (public APIs only)
- S3: Bucket policies restrict access

## Monitoring & Observability

### CloudWatch Logs

- All Lambda invocations logged
- Structured logging with timestamps
- Error tracking with stack traces

### CloudWatch Metrics

- Lambda duration, errors, throttles
- API Gateway request count, latency
- S3 request metrics

### Alarms (Recommended)

- Lambda error rate > 5%
- API Gateway 5xx errors
- Ingestion duration > 15 minutes

## Disaster Recovery

### Backup Strategy

- S3 versioning enabled
- Terraform state in S3 with versioning
- Infrastructure reproducible via Terraform

### Recovery Procedures

1. **Data Loss**: Re-run ingestion from eCFR API
2. **Infrastructure Failure**: `terraform apply` to recreate
3. **Code Rollback**: Deploy previous Lambda zip

**RTO (Recovery Time Objective)**: < 1 hour
**RPO (Recovery Point Objective)**: Last ingestion (max 24 hours)

## Future Enhancements

### Performance

- [ ] Parallel title processing
- [ ] Incremental ingestion
- [ ] API response caching
- [ ] Lambda provisioned concurrency

### Features

- [ ] User authentication
- [ ] Saved searches/filters
- [ ] Export to CSV/PDF
- [ ] Email notifications
- [ ] Historical trend analysis

### Operations

- [ ] Automated testing pipeline
- [ ] Blue-green deployments
- [ ] Canary releases
- [ ] Cost monitoring dashboards
