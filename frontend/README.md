# eCFR Regulation Analyzer - Frontend

React + TypeScript + Vite frontend for the eCFR Regulation Analyzer.

## Tech Stack

- React 19
- TypeScript 5.9
- Vite 5
- Recharts (data visualization)
- ESLint + Prettier

## Project Structure

```
src/
├── components/        # React components
│   ├── AgencyTable.tsx
│   ├── HistoryChart.tsx
│   ├── InfoTooltip.tsx
│   ├── IngestDataButton.tsx
│   └── SummaryBar.tsx
├── models/           # TypeScript interfaces
│   └── types.ts
├── services/         # API client
│   └── api.ts
├── styles/           # Component-specific CSS
│   ├── AgencyTable.css
│   ├── InfoTooltip.css
│   ├── IngestDataButton.css
│   └── SummaryBar.css
├── test/             # Test setup
│   └── setup.ts
├── App.tsx           # Main app component
├── main.tsx          # Entry point
└── index.css         # Global styles
```

## Local Development

```bash
npm install
npm run dev
```

The app will run on `http://localhost:5173` and use the hardcoded API URL for development.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run preview` - Preview production build locally
- `npm test` - Run unit tests
- `npm run test:ui` - Run tests with UI
- `npm run test:coverage` - Run tests with coverage report

## Testing

The frontend uses Vitest and React Testing Library for unit tests.

### Running Tests

```bash
# Run all tests
npm test

# Run with UI
npm run test:ui

# Run with coverage
npm run test:coverage
```

### Test Coverage

Current test coverage includes:

- Component rendering and props
- User interactions (search, sort, pagination)
- Loading and error states
- API service calls
- Accessibility attributes

### Test Files

- `src/components/InfoTooltip.test.tsx` - Tooltip component tests
- `src/components/SummaryBar.test.tsx` - Summary statistics tests
- `src/components/AgencyTable.test.tsx` - Table functionality tests
- `src/services/api.test.ts` - API client tests

### Writing Tests

Tests follow React Testing Library best practices:

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent prop="value" />);
    expect(screen.getByText('value')).toBeInTheDocument();
  });
});
```

Configuration files:

- `vitest.config.ts` - Vitest configuration
- `src/test/setup.ts` - Test setup and global imports

## Code Organization

### Path Aliases

The project uses TypeScript path aliases for cleaner imports:

```typescript
import { api } from "@/services/api";
import type { AgencyMetric } from "@/models/types";
import "@/styles/Table.css";
```

Configured aliases:

- `@/*` → `src/*`
- `@components/*` → `src/components/*`
- `@models/*` → `src/models/*`
- `@styles/*` → `src/styles/*`

### Component Structure

Each component imports its own CSS:

- `AgencyTable` → `AgencyTable.css`
- `SummaryBar` → `SummaryBar.css`
- `InfoTooltip` → `InfoTooltip.css`
- `IngestDataButton` → `IngestDataButton.css`

### API Client

All API calls go through `services/api.ts`:

- `getAgencies()` - Fetch agency metrics
- `getHistory()` - Fetch amendment history
- `getSummary()` - Fetch ingestion summary
- `triggerIngest()` - Trigger data refresh

### Type Safety

TypeScript interfaces in `models/types.ts`:

- `AgencyMetric` - Agency data structure
- `ChangeRecord` - Historical amendment data
- `Summary` - Ingestion summary data

All API responses use camelCase (converted from backend snake_case).

## Environment Variables

- `VITE_API_URL` - Backend API URL (set automatically during deployment)

## Production Deployment

The frontend is deployed to AWS S3 + CloudFront. To deploy:

```bash
cd ../backend
make deploy-frontend ENV=dev
```

Or from the root:

```bash
npm run deploy:frontend
```

This will:

1. Build the production bundle with the correct API URL
2. Upload to S3
3. Invalidate CloudFront cache

## Build Output

```bash
npm run build
```

Output goes to `dist/` directory, optimized for production.
