# Testing Guide - Siddha Healthcare Herbal Store

## Overview
- Total frontend tests: ~498
- Total backend tests: ~533
- Total integration tests: ~154
- Total E2E tests: ~25
- Target coverage: 90%+

## Table of Contents
1. Test Stack
2. Project Structure
3. Running Tests
4. Writing Tests
5. Mocking
6. Coverage
7. CI/CD
8. Best Practices

## 1. Test Stack
- **Frontend**: Vitest, React Testing Library, jsdom/happy-dom, MSW
- **Backend**: Vitest, Supertest, MongoDB Memory Server
- **E2E**: Playwright
- **Coverage**: c8/v8

## 2. Project Structure

```
backend/
  __tests__/
    setup.ts                    # Global test setup (MongoMemoryServer)
    helpers/
      factories.ts              # Test data factories
    unit/
      mocks/                    # Mock files for external services
      controllers/              # Controller unit tests
      middleware/                # Middleware tests
      services/                 # Service tests
      utils/                    # Utility tests
    integration/                # Full API integration tests
    security/                   # Security tests
    performance/                # Performance tests
  vitest.config.ts

frontend/
  src/
    __tests__/
      setup.ts                  # Global test setup (mocks for browser APIs)
      unit/
        components/             # Component tests by category
        pages/                  # Page tests
        hooks/                  # Custom hook tests
        context/                # Context tests
        api/                    # API service tests
        utils/                  # Utility tests
      e2e/                      # Playwright E2E tests
  vitest.config.ts
```

## 3. Running Tests

| Command | Description |
|---------|-------------|
| `npm run test:frontend` | Run all frontend tests |
| `npm run test:backend` | Run all backend tests |
| `npm run test:integration` | Run integration tests |
| `npm run test:security` | Run security tests |
| `npm run test:e2e` | Run Playwright E2E tests |
| `npm run test:all` | Run everything |
| `npm run test:coverage` | Run with coverage report |
| `npm run test:watch` | Watch mode |
| `npm run test:ui` | Vitest UI mode |

## 4. Writing Tests

### Frontend Test Example

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Button } from '@/src/components/ui/Button';

describe('Button', () => {
  it('renders with primary variant', () => {
    render(<Button variant="primary">Click me</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-siddha-gold');
  });

  it('calls onClick when clicked', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click</Button>);
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('renders as disabled', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

### Backend Test Example

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { createTestUser, generateToken } from '../helpers/factories';

describe('Products API', () => {
  it('returns paginated products', async () => {
    const res = await request(app).get('/api/products');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('products');
    expect(res.body).toHaveProperty('total');
    expect(res.body).toHaveProperty('page');
  });

  it('rejects unauthenticated requests', async () => {
    const res = await request(app).get('/api/orders');
    expect(res.status).toBe(401);
  });
});
```

## 5. Mocking

### External Services (Backend)
- Razorpay: `__tests__/unit/mocks/razorpay.ts`
- Shiprocket: `__tests__/unit/mocks/shiprocket.ts`
- Cloudinary: `__tests__/unit/mocks/cloudinary.ts`
- Nodemailer: `__tests__/unit/mocks/mailer.ts`
- JWT: `__tests__/unit/mocks/jwt.ts`

### Browser APIs (Frontend)
- **react-i18next**: mocked in setup.ts
- **react-router-dom**: partially mocked in setup.ts
- **IntersectionObserver**: mocked in setup.ts
- **ResizeObserver**: mocked in setup.ts
- **matchMedia**: mocked in setup.ts

## 6. Coverage

Coverage is configured in `vitest.config.ts` for both frontend and backend with a **90% threshold**. HTML reports are generated in the `coverage/` directory.

Run `npm run test:coverage` in either `frontend/` or `backend/` to generate coverage reports.

## 7. CI/CD

The GitHub Actions workflow at `.github/workflows/test.yml` automates testing:

- **Triggered on**: push or PR to `main`/`develop`
- **Jobs**:
  - Quality checks (lint)
  - Frontend unit tests + coverage threshold check
  - Backend unit tests + coverage threshold check
  - Integration tests (with MongoDB Memory Server)
  - Security tests
  - E2E tests (with MongoDB service container, sequential after unit tests)
  - Notification (aggregate job status)
- **Artifacts**: Coverage reports and Playwright report uploaded
- **Failure**: Build fails if coverage drops below 90%

## 8. Best Practices

1. **Test behavior, not implementation** - Focus on what the code does, not how
2. **Use meaningful assertions** - Test the actual outcome, not mocks
3. **Test error paths** - Every function should have error case tests
4. **Use test factories** - Use `createTestUser()`, `createTestProduct()` etc.
5. **Keep tests isolated** - No shared state between tests
6. **Clean up after tests** - setup.ts handles this with afterEach
7. **Run tests before committing** - `npm run test:all` to verify everything
8. **Update tests when adding features** - Every new route needs tests
9. **Don't mock what you don't own** - Mock external services, not your own code
10. **Use realistic data** - Test with data that mirrors production
