# Development Guide

## Local Development Setup

### Prerequisites

- Node.js 18+
- Python 3.11+
- Git
- Code editor (VS Code recommended)

### Initial Setup

```bash
# Clone repository
git clone <repository-url>
cd ecfr-regulation-analyzer

# Install dependencies
npm run setup

# This runs:
# - npm install (frontend)
# - python -m venv .venv (backend)
# - pip install -r requirements.txt (backend)
```

### Frontend Development

**Start Dev Server:**

```bash
npm run dev
# or
cd frontend
npm run dev
```

**Access:** http://localhost:5173

**Features:**

- Hot module replacement (HMR)
- Fast refresh for React components
- TypeScript type checking
- ESLint on save

**Build for Production:**

```bash
npm run build:frontend
# Output: frontend/dist/
```

**Preview Production Build:**

```bash
cd frontend
npm run preview
```

### Backend Development

**Activate Virtual Environment:**

```bash
# macOS/Linux
source .venv/bin/activate

# Windows
.venv\Scripts\activate
```

**Run Tests Locally:**

```python
# Test individual functions
python -c "from services.data_processor import count_words; print(count_words('hello world'))"
```

**Test Lambda Handler:**

```python
from handlers.ecfr.get_agencies import lambda_handler

event = {}
context = None
response = lambda_handler(event, context)
print(response)
```

**Note:** Local testing requires AWS credentials and S3 data.

## Project Structure

### Frontend

```
frontend/
├── src/
│   ├── components/          # React components
│   │   ├── AgencyTable.tsx
│   │   ├── HistoryChart.tsx
│   │   ├── InfoTooltip.tsx
│   │   ├── IngestDataButton.tsx
│   │   └── SummaryBar.tsx
│   ├── models/
│   │   └── types.ts         # TypeScript interfaces
│   ├── services/
│   │   └── api.ts           # API client
│   ├── styles/              # Component CSS
│   ├── App.tsx              # Main app component
│   ├── main.tsx             # Entry point
│   └── index.css            # Global styles
├── public/                  # Static assets
├── index.html               # HTML template
├── package.json
├── tsconfig.json            # TypeScript config
├── vite.config.ts           # Vite config
└── .eslintrc.cjs            # ESLint config
```

### Backend

```
backend/
├── src/
│   ├── handlers/            # Lambda entry points
│   │   └── ecfr/
│   │       ├── get_agencies.py
│   │       ├── get_history.py
│   │       ├── get_summary.py
│   │       └── ingest.py
│   ├── services/            # Business logic
│   │   ├── data_processor.py
│   │   ├── ecfr_client.py
│   │   ├── ingest.py
│   │   └── s3_store.py
│   ├── utils/               # Helpers
│   │   ├── error_handler.py
│   │   ├── helper.py
│   │   └── responses.py
│   └── requirements.txt
├── terraform/               # Infrastructure
├── makefile                 # Build automation
└── README.md
```

## Code Style

### TypeScript/React

**Naming Conventions:**

- Components: PascalCase (`AgencyTable.tsx`)
- Functions: camelCase (`loadData()`)
- Constants: UPPER_SNAKE_CASE (`API_BASE`)
- Types/Interfaces: PascalCase (`AgencyMetric`)

**Component Pattern:**

```typescript
const ComponentName = ({ prop1, prop2 }: Props) => {
  // Hooks at top
  const [state, setState] = useState();

  // Effects
  useEffect(() => {}, []);

  // Handlers
  const handleClick = () => {};

  // Render
  return <div>...</div>;
};

export default ComponentName;
```

**Formatting:**

- 2 spaces indentation
- Single quotes for strings
- Semicolons required
- Trailing commas in multiline

**Run Linter:**

```bash
cd frontend
npm run lint
npm run format
```

### Python

**Naming Conventions:**

- Functions: snake_case (`calculate_burden_score()`)
- Classes: PascalCase (`ECFRClient`)
- Constants: UPPER_SNAKE_CASE (`BASE_URL`)
- Private: \_leading_underscore (`_get_json()`)

**Function Pattern:**

```python
def function_name(param1: str, param2: int) -> dict:
    """
    Brief description.

    Args:
        param1: Description
        param2: Description

    Returns:
        Description of return value
    """
    # Implementation
    return result
```

**Formatting:**

- 4 spaces indentation
- Double quotes for strings
- Type hints for function signatures
- Docstrings for public functions

## Testing

### Frontend Testing

**Install Dependencies:**

```bash
cd frontend
npm install
```

**Run Tests:**

```bash
# Run all tests
npm test

# Watch mode
npm test -- --watch

# With UI
npm run test:ui

# With coverage
npm run test:coverage
```

**Test Structure:**

```
frontend/src/
├── components/
│   ├── AgencyTable.test.tsx
│   ├── InfoTooltip.test.tsx
│   └── SummaryBar.test.tsx
├── services/
│   └── api.test.ts
└── test/
    ├── setup.ts
    └── README.md
```

**Test Coverage:**

- ✅ Component rendering
- ✅ User interactions (search, sort, click)
- ✅ Loading states
- ✅ Error handling
- ✅ Accessibility
- ✅ API service calls

**Example Test:**

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

**Framework:** Vitest + React Testing Library

### Backend Testing

**Install Test Dependencies:**

```bash
cd backend
source ../.venv/bin/activate
pip install -r requirements-dev.txt
```

**Run Tests:**

```bash
# Using test script
./run_tests.sh

# Or directly with pytest
pytest tests/ -v

# With coverage
pytest tests/ --cov=src --cov-report=term-missing

# Run specific test file
pytest tests/test_data_processor.py -v
```

**Test Structure:**

```
backend/tests/
├── __init__.py
├── test_data_processor.py  # Data processing functions
└── test_helper.py          # Utility functions
```

**Test Coverage:**

- ✅ Word counting
- ✅ XML text extraction
- ✅ SHA-256 hashing
- ✅ Regulatory burden score calculation
- ✅ Agency-title mapping
- ✅ Snake case to camel case conversion
- ✅ Recursive dictionary key conversion

**Example Test:**

```python
class TestCountWords:
    def test_count_words_simple(self):
        assert count_words("hello world") == 2

    def test_count_words_empty(self):
        assert count_words("") == 0
```

### Integration Testing

**Manual Testing:**

1. Deploy to dev environment
2. Trigger ingestion via UI
3. Verify data appears correctly
4. Check CloudWatch logs for errors

**Automated Testing (Recommended):**

- Postman/Newman for API tests
- Cypress for E2E frontend tests
- AWS SDK for infrastructure tests

## Debugging

### Frontend Debugging

**Browser DevTools:**

- React DevTools extension
- Network tab for API calls
- Console for errors

**VS Code Debugging:**

```json
// .vscode/launch.json
{
  "type": "chrome",
  "request": "launch",
  "name": "Launch Chrome",
  "url": "http://localhost:5173",
  "webRoot": "${workspaceFolder}/frontend/src"
}
```

### Backend Debugging

**CloudWatch Logs:**

```bash
# Tail logs in real-time
aws logs tail /aws/lambda/ecfr-ingest-dev --follow

# Filter for errors
aws logs filter-pattern /aws/lambda/ecfr-ingest-dev --filter-pattern "ERROR"
```

**Local Debugging:**

```python
import logging
logging.basicConfig(level=logging.DEBUG)

# Add debug statements
logger.debug(f"Processing title {num}")
```

**VS Code Debugging:**

```json
// .vscode/launch.json
{
  "type": "python",
  "request": "launch",
  "name": "Python: Current File",
  "program": "${file}",
  "console": "integratedTerminal"
}
```

## Common Development Tasks

### Add New API Endpoint

1. **Create Lambda Handler:**

```python
# backend/src/handlers/ecfr/new_endpoint.py
from utils.error_handler import lambda_handler_with_errors
from utils.responses import success_response

@lambda_handler_with_errors("new_endpoint")
def lambda_handler(event, context):
    # Implementation
    return success_response(body={"data": "value"})
```

2. **Add to Terraform:**

```hcl
# backend/terraform/modules/lambda/main.tf
module "new_endpoint" {
  source = "./function"
  # ... configuration
}
```

3. **Add API Route:**

```hcl
# backend/terraform/modules/api/main.tf
resource "aws_api_gateway_resource" "new_endpoint" {
  # ... configuration
}
```

4. **Update Frontend API Client:**

```typescript
// frontend/src/services/api.ts
export const getNewData = () => fetchJson<NewType>("/new-endpoint");
```

### Add New Component

1. **Create Component File:**

```typescript
// frontend/src/components/NewComponent.tsx
const NewComponent = ({ prop }: Props) => {
  return <div>...</div>;
};

export default NewComponent;
```

2. **Create CSS File:**

```css
/* frontend/src/styles/NewComponent.css */
.new-component {
  /* styles */
}
```

3. **Import in App:**

```typescript
// frontend/src/App.tsx
import NewComponent from "@/components/NewComponent";
```

### Add New Metric

1. **Update Data Processor:**

```python
# backend/src/services/data_processor.py
def calculate_new_metric(data):
    # Calculation logic
    return result
```

2. **Update Ingest Pipeline:**

```python
# backend/src/services/ingest.py
new_metric = calculate_new_metric(data)
agency_metrics.append({
    # ... existing fields
    "new_metric": new_metric
})
```

3. **Update TypeScript Types:**

```typescript
// frontend/src/models/types.ts
export interface AgencyMetric {
  // ... existing fields
  newMetric: number;
}
```

4. **Display in UI:**

```typescript
// frontend/src/components/AgencyTable.tsx
<td>{agency.newMetric}</td>
```

## Environment Variables

### Frontend

**Development:**

```bash
# frontend/.env.development
VITE_API_URL=http://localhost:3000
```

**Production:**

```bash
# frontend/.env.production
VITE_API_URL=https://api.example.com
```

**Access in Code:**

```typescript
const apiUrl = import.meta.env.VITE_API_URL;
```

### Backend

**Local Development:**

```bash
export DATA_BUCKET=ecfr-data-bucket-dev
export ENVIRONMENT=dev
```

**Lambda (Set by Terraform):**

- `DATA_BUCKET`
- `ENVIRONMENT`

## Git Workflow

### Branch Strategy

```
main (production)
  └── dev (development)
       └── feature/new-feature
```

### Commit Messages

**Format:**

```
<type>: <subject>

<body>
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance

**Example:**

```
feat: add regulatory burden score metric

- Implement calculation in data_processor.py
- Add to agency metrics output
- Display in frontend table
- Add tooltip explanation
```

### Pull Request Process

1. Create feature branch
2. Make changes
3. Test locally
4. Push to remote
5. Create PR to `dev`
6. Code review
7. Merge to `dev`
8. Deploy to dev environment
9. Test in dev
10. Merge to `main`
11. Deploy to production

## Performance Optimization

### Frontend

**Code Splitting:**

```typescript
const HeavyComponent = lazy(() => import("./HeavyComponent"));
```

**Memoization:**

```typescript
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);
```

**Debouncing:**

```typescript
const debouncedSearch = useMemo(
  () => debounce((value) => setSearch(value), 300),
  [],
);
```

### Backend

**Reduce Lambda Cold Starts:**

- Keep functions small
- Minimize dependencies
- Use Lambda layers

**Optimize S3 Access:**

- Batch operations
- Use appropriate storage class
- Enable transfer acceleration

**Cache API Responses:**

- Add CloudFront caching
- Set appropriate TTL
- Invalidate on data changes

## Troubleshooting

### Frontend Issues

**Build Fails:**

```bash
# Clear cache
rm -rf node_modules frontend/dist
npm run setup:frontend
```

**Type Errors:**

```bash
# Check TypeScript
cd frontend
npx tsc --noEmit
```

### Backend Issues

**Import Errors:**

```bash
# Reinstall dependencies
rm -rf .venv
python -m venv .venv
source .venv/bin/activate
pip install -r backend/src/requirements.txt
```

**Lambda Deployment Fails:**

```bash
# Force rebuild
cd backend
make clean
make deploy ENV=dev
```

## Resources

### Documentation

- [React Docs](https://react.dev)
- [TypeScript Docs](https://www.typescriptlang.org/docs/)
- [AWS Lambda Docs](https://docs.aws.amazon.com/lambda/)
- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)

### Tools

- [VS Code](https://code.visualstudio.com/)
- [React DevTools](https://react.dev/learn/react-developer-tools)
- [AWS CLI](https://aws.amazon.com/cli/)
- [Postman](https://www.postman.com/)
