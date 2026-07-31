# E2E Tests for Siddha Healthcare

Playwright end-to-end tests covering authentication, shop, cart, checkout, and admin flows.

## Prerequisites

- Node.js 18+
- Dependencies installed: `npm install`

## Install Playwright Browsers

```bash
npx playwright install
```

This downloads Chromium, Firefox, and WebKit browser binaries.

## Running Tests

### Start the Dev Server

```bash
cd frontend
npm run dev
```

The app runs at `http://localhost:5173` by default.

### Run All Tests

```bash
npx playwright test
```

### Run Tests in UI Mode

```bash
npx playwright test --ui
```

Opens the Playwright UI for interactive debugging and step-through.

### Run a Specific Test File

```bash
npx playwright test auth
npx playwright test shop
npx playwright test cart
npx playwright test checkout
npx playwright test admin
```

### Run Tests Headed (visible browser)

```bash
npx playwright test --headed
```

### Run Tests in a Specific Browser

```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=mobile
```

## Viewing Reports

After running tests, view the HTML report:

```bash
npx playwright show-report
```

## Test Structure

| Test File       | Coverage                                       |
|-----------------|------------------------------------------------|
| `auth.spec.ts`  | Login, register, logout, protected routes, Google button |
| `shop.spec.ts`  | Browse, search, filter, sort, product details, pagination |
| `cart.spec.ts`  | Add/remove items, update quantity, coupon, empty state |
| `checkout.spec.ts` | Shipping form, payment methods, order summary, place order |
| `admin.spec.ts` | Admin login, dashboard, tabs, products, orders, staff, sign out |

## Configuration

Edit `playwright.config.ts` to change:
- `baseURL`: Dev server URL
- `projects`: Browser targets
- `retries`: Flaky test retry count
- `workers`: Parallel worker count
