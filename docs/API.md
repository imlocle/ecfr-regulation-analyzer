# API Documentation

## Base URL

```
https://{api-id}.execute-api.{region}.amazonaws.com/{stage}
```

Example: `https://aea0hf1q11.execute-api.us-west-1.amazonaws.com/dev`

## Authentication

Currently: None (public access for demo)

Production recommendation: API Gateway API Keys or AWS IAM authentication

## Common Response Format

### Success Response

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

### Error Response

```json
{
  "statusCode": 500,
  "headers": {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*"
  },
  "body": "{\"error\": \"Error message\"}"
}
```

## Endpoints

### GET /agencies

Returns list of all federal agencies with regulatory metrics.

**Request:**

```http
GET /agencies HTTP/1.1
Host: {api-url}
```

**Response:** `200 OK`

```json
[
  {
    "agencyName": "Department of Justice",
    "agencySlug": "department-of-justice",
    "shortName": "DOJ",
    "cfrTitles": [8, 28, 32],
    "wordCount": 31586172,
    "checksum": "32624c8c0d07...",
    "numTitles": 11,
    "avgWordsPerTitle": 2871470.2,
    "totalAmendments": 1847,
    "regulatoryBurdenScore": 53995487104.15
  }
]
```

**Response Fields:**

| Field                   | Type           | Description                           |
| ----------------------- | -------------- | ------------------------------------- |
| `agencyName`            | string         | Full agency name                      |
| `agencySlug`            | string         | URL-safe identifier                   |
| `shortName`             | string \| null | Common abbreviation (e.g., "EPA")     |
| `cfrTitles`             | number[]       | CFR title numbers this agency manages |
| `wordCount`             | number         | Total words across all regulations    |
| `checksum`              | string \| null | SHA-256 hash for change detection     |
| `numTitles`             | number         | Count of CFR titles                   |
| `avgWordsPerTitle`      | number         | Average word count per title          |
| `totalAmendments`       | number         | Total number of amendments            |
| `regulatoryBurdenScore` | number         | Composite burden metric               |

**Status Codes:**

- `200` - Success
- `500` - Server error (check CloudWatch logs)

**Caching:**

- Recommended: Cache for 1 hour
- Invalidate: After POST /ingest completes

---

### GET /history

Returns amendment timeline data showing regulatory activity over time.

**Request:**

```http
GET /history HTTP/1.1
Host: {api-url}
```

**Response:** `200 OK`

```json
[
  {
    "period": "2020-01",
    "amendmentCount": 45
  },
  {
    "period": "2020-02",
    "amendmentCount": 52
  }
]
```

**Response Fields:**

| Field            | Type   | Description                        |
| ---------------- | ------ | ---------------------------------- |
| `period`         | string | Year-month in YYYY-MM format       |
| `amendmentCount` | number | Number of amendments in that month |

**Notes:**

- Data sorted chronologically (oldest first)
- Periods with zero amendments are omitted
- Typical range: 5-10 years of history

**Status Codes:**

- `200` - Success
- `500` - Server error

---

### GET /summary

Returns ingestion summary and metadata.

**Request:**

```http
GET /summary HTTP/1.1
Host: {api-url}
```

**Response:** `200 OK`

```json
{
  "lastUpdated": "2024-03-15",
  "titlesDownloaded": 48,
  "agenciesProcessed": 153,
  "historyPeriods": 120
}
```

**Response Fields:**

| Field               | Type   | Description                          |
| ------------------- | ------ | ------------------------------------ |
| `lastUpdated`       | string | Date of last ingestion (YYYY-MM-DD)  |
| `titlesDownloaded`  | number | Number of CFR titles processed       |
| `agenciesProcessed` | number | Number of agencies with metrics      |
| `historyPeriods`    | number | Number of months with amendment data |

**Use Cases:**

- Display data freshness to users
- Determine if re-ingestion is needed
- Monitor ingestion completeness

**Status Codes:**

- `200` - Success
- `404` - No data ingested yet
- `500` - Server error

---

### POST /ingest

Triggers data ingestion from eCFR API. This is a long-running operation (5-10 minutes).

**Request:**

```http
POST /ingest HTTP/1.1
Host: {api-url}
Content-Type: application/json
```

**Response:** `200 OK`

```json
{
  "message": "Ingestion started asynchronously"
}
```

**Process:**

1. Lambda invokes itself asynchronously
2. Downloads all CFR titles from eCFR API
3. Processes text and computes metrics
4. Stores results in S3
5. Returns immediately (async execution)

**Execution Time:**

- Typical: 5-10 minutes
- Maximum: 15 minutes (Lambda timeout)

**Rate Limiting:**

- Recommended: Max 1 request per 5 minutes
- Concurrent executions: 1 (prevent duplicate work)

**Status Codes:**

- `200` - Ingestion started successfully
- `500` - Failed to start ingestion

**Monitoring:**

- Check CloudWatch Logs for progress
- Poll GET /summary to detect completion
- Frontend auto-polls every 30 seconds

**Error Handling:**

- Partial failures: Some titles may fail, others succeed
- Retry: Safe to re-invoke if ingestion fails
- Idempotent: Multiple calls won't corrupt data

---

## Data Freshness

### Ingestion Frequency

**Recommended:**

- Manual: On-demand via UI button
- Automated: Daily at off-peak hours (e.g., 2 AM)

**Considerations:**

- eCFR updates: Typically daily
- Cost: ~$0.20 per ingestion
- Duration: 5-10 minutes

### Staleness Detection

Check `lastUpdated` field in GET /summary:

```javascript
const summary = await getSummary();
const lastUpdate = new Date(summary.lastUpdated);
const daysSinceUpdate = (Date.now() - lastUpdate) / (1000 * 60 * 60 * 24);

if (daysSinceUpdate > 7) {
  // Data is stale, suggest re-ingestion
}
```

## Error Codes

| Status | Meaning             | Action                                      |
| ------ | ------------------- | ------------------------------------------- |
| 200    | Success             | Process response                            |
| 404    | Not Found           | Data not ingested yet, trigger POST /ingest |
| 500    | Server Error        | Check CloudWatch logs, retry after 1 minute |
| 502    | Bad Gateway         | API Gateway issue, retry                    |
| 503    | Service Unavailable | Lambda throttled, retry with backoff        |
| 504    | Gateway Timeout     | Lambda timeout, check logs                  |

## Rate Limits

**API Gateway:**

- Default: 10,000 requests per second
- Burst: 5,000 requests

**Lambda:**

- Concurrent executions: 1000 (account-level)
- Per-function: Configurable

**eCFR API (External):**

- Rate limit: Unknown (we use 0.5s delay between requests)
- Respectful usage: Don't hammer the API

## CORS Configuration

**Allowed Origins:** `*` (all origins)

**Allowed Methods:**

- GET
- POST
- OPTIONS

**Allowed Headers:**

- Content-Type
- Authorization

**Exposed Headers:**

- Content-Type

## Versioning

**Current Version:** v1 (implicit)

**Future Versioning Strategy:**

- URL path: `/v2/agencies`
- Header: `Accept: application/vnd.ecfr.v2+json`
- Maintain v1 for 6 months after v2 release

## Testing

### Example cURL Commands

**Get Agencies:**

```bash
curl https://your-api-url/dev/agencies
```

**Get History:**

```bash
curl https://your-api-url/dev/history
```

**Get Summary:**

```bash
curl https://your-api-url/dev/summary
```

**Trigger Ingestion:**

```bash
curl -X POST https://your-api-url/dev/ingest \
  -H "Content-Type: application/json"
```

### Example JavaScript Client

```javascript
const API_BASE = "https://your-api-url/dev";

async function getAgencies() {
  const response = await fetch(`${API_BASE}/agencies`);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

async function triggerIngest() {
  const response = await fetch(`${API_BASE}/ingest`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}
```

## Performance

**Typical Response Times:**

- GET /agencies: 100-300ms
- GET /history: 50-150ms
- GET /summary: 50-100ms
- POST /ingest: 200ms (async, actual work takes 5-10 min)

**Optimization Tips:**

- Cache GET responses for 1 hour
- Use compression (gzip)
- Minimize request frequency
- Batch operations when possible

## Security Considerations

### Current State (Demo)

- No authentication required
- Public read access
- CORS allows all origins

### Production Recommendations

1. **API Keys**: Require API key in header
2. **Rate Limiting**: Per-key rate limits
3. **IAM Auth**: Use AWS Signature V4
4. **WAF**: Add AWS WAF for DDoS protection
5. **Logging**: Enable CloudWatch Logs for all requests
6. **Monitoring**: Set up alarms for unusual traffic

### Data Sensitivity

- All data is public (from eCFR.gov)
- No PII or sensitive information
- Safe for public access
