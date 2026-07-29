# Siddha Healthcare - Project Documentation

## Overview

Full-featured MERN e-commerce platform for Siddha/herbal medicine with admin panel, staff management (RBAC), review moderation, medicine reminder system, analytics dashboard, and unlisted product visibility.

---

## Project Structure

```
├── backend/               # Express + Mongoose API
│   ├── models/            # Mongoose schemas
│   ├── controllers/       # Route handlers
│   ├── services/          # Business logic
│   ├── routes/            # Express routes
│   ├── Auth/              # Auth middleware (JWT, passport, permissions)
│   └── config/            # Passport config
├── frontend/              # React + TypeScript + Vite
│   └── src/
│       ├── api/           # API client & endpoint functions
│       ├── components/    # UI components
│       ├── context/       # React context providers
│       ├── hooks/         # Custom hooks
│       └── pages/         # Page components
└── DOCUMENTATION.md       # This file
```

---

## Features Built

### 1. Staff Management & RBAC

**Backend:**
- `backend/models/User.js` — Extended with `role` (SUPER_ADMIN/STAFF), `isActive`, `permissions` map, `lastLogin`
- `backend/Auth/permissionMiddleware.js` — `requirePermission(moduleName)` middleware checks user.role & user.permissions
- `backend/services/staffService.js` — CRUD with password hashing, permission merging
- `backend/controllers/staffController.js` — 7 handlers (list, create, update, toggleStatus, resetPassword, delete, getById)
- `backend/routes/staffRoutes.js` — All protected with `verifyAdmin` + `requirePermission("staffManagement")`
- `backend/config/passport.js` — Checks `isActive` for STAFF login
- `backend/routes/authRoutes.js` — JWT includes `role`; response includes `role`, `permissions`, `isActive`, `lastLogin`

**Frontend:**
- `frontend/src/components/admin/StaffTab.tsx` — Full CRUD with permission checkboxes, status toggle, password reset, delete
- `frontend/src/api/staff.ts` — API functions
- `frontend/src/components/admin/Sidebar.tsx` — Filters sidebar tabs by user permissions
- `frontend/src/pages/Admin.tsx` — Auto-redirects STAFF to first permitted tab

**Permissions map:**
```typescript
dashboard | products | categories | orders | customers | batches
reminders | reviews | coupons | carousel | consultations | shipping | staffManagement
```

### 2. Review Moderation

**Backend:**
- `backend/models/Review.js` — Extended with `adminReply` object (`message`, `repliedBy`, `repliedAt`)
- `backend/services/reviewService.js` — Added: `getAllReviews`, `getReviewUsers`, `getReviewsByUser`, `rejectReview`, `replyToReview`
- `backend/controllers/reviewController.js` — 6 admin endpoints
- `backend/routes/reviewRoutes.js` — Admin routes protected with `requirePermission("reviews")`

**Frontend:**
- `frontend/src/components/admin/ReviewTab.tsx` — Pending reviews table, review users two-page view, Approve/Reject/Reply actions
- Review card shows "Official Reply" blue box

### 3. Medicine Reminder System

**Backend:**
- `backend/models/Reminder.js` — Schema: customerId, orderId, productId, quantity, reminderDays, purchaseDate, reminderDate, whatsappStatus, callStatus, status
- `backend/services/reminderService.js` — `createOrderReminders()` creates reminders **only after delivery** (shippingStatus=DELIVERED)
- Formula: `reminderDate = deliveryDate + (product.reminderDays × quantity)`
- Triggers at: admin status update, Shiprocket webhook, trackShipment polling
- `backend/controllers/reminderController.js` — GET list, GET stats, GET /today, PATCH /:id/complete, PATCH /:id/whatsapp, GET /:id
- `backend/routes/reminderRoutes.js` — Protected with `requirePermission("reminders")`

**Frontend:**
- `frontend/src/components/admin/ReminderTab.tsx` — Stats cards, filters, list, detail view, "Complete Call" dialog with reason/notes
- `frontend/src/api/reminders.ts` — Rewritten to use shared client

### 4. Analytics Dashboard

**Backend:**
- `backend/services/analyticsService.js` — 15+ aggregation functions:
  - `getOverview` — Revenue, orders, customers, products, growth %
  - `getRevenueAnalytics` — Gross/net revenue, daily revenue trend
  - `getOrderAnalytics` — Status/payment method charts, orders by day
  - `getCustomerAnalytics` — New vs returning, LTV, top customers, registration trend
  - `getProductAnalytics` — Top/least selling, products with/without sales
  - `getCategoryAnalytics` — Revenue by category
  - `getInventoryAnalytics` — Stock levels, low stock, out of stock, movement
  - `getBatchAnalytics` — Active/expired/hold batches, status chart
  - `getReminderAnalytics` — Today/pending/whatsapp/call/completed/conversion
  - `getReviewAnalytics` — Total/pending/approved, rating distribution, trend
  - `getPaymentAnalytics` — Success/fail counts, payment method breakdown
  - `getShippingAnalytics` — Delivered/in-transit/RTO/cancelled counts
  - `getStaffAnalytics` — Total/active staff list
  - `getRecentActivities` — Recent order/review/customer activities
  - `getNotifications` — Low stock, pending reminders, pending reviews alerts
- `backend/controllers/analyticsController.js` — 15 endpoint handlers
- `backend/routes/analyticsRoutes.js` — All at `/api/admin/dashboard/*`, permission-aware

**Frontend:**
- `frontend/src/components/admin/AnalyticsTab.tsx` — Fully rebuilt with:
  - Global date filter (10 presets + custom)
  - KPI cards for each section
  - Recharts: Area (revenue trend), Bar (orders by day), Pie (status/method), Line (registration)
  - Top customer/product tables
  - Activity feed & notifications
  - Permission-aware section visibility
- `frontend/src/api/dashboard.ts` — 15 API functions
- `frontend/src/types.ts` — All analytics interfaces

### 5. Unlisted Product Visibility (New - July 28, 2026)

**Backend:**
- `backend/models/Product.js` — Added `visibility` field (`PUBLIC`/`UNLISTED`, default `PUBLIC`)
- `backend/services/reviewService.js` — Public product listing filters `visibility: "PUBLIC"` (or missing field for legacy products). Admin uses `scope=all` to bypass filter
- `backend/controllers/productController.js` — `getProductById` returns 404 if `isActive === false` (applies to both PUBLIC and UNLISTED). Removed `.populate("category")` to avoid CastError
- `backend/controllers/productController.js` — `createProduct` handles `visibility` field

**Frontend:**
- `frontend/src/types.ts` — Added `visibility?: "PUBLIC" | "UNLISTED"` to Product interface
- `frontend/src/api/products.ts` — Added `fetchAllProductsApi` with `scope=all` parameter for admin
- `frontend/src/pages/Admin.tsx` — Fetches all products (including UNLISTED) separately for admin panel
- `frontend/src/pages/ProductDetails.tsx` — Adds `<meta name="robots" content="noindex,nofollow">` for UNLISTED products; Related products filter excludes UNLISTED
- `frontend/src/components/admin/ProductForm.tsx` — Added Visibility dropdown (Public/Unlisted) to create/edit form
- `frontend/src/components/admin/ProductsTab.tsx` — Added Visibility column with badge (green/amber), visibility filter dropdown (All/Public/Unlisted)

**Behavior:**
- Public storefront → Only PUBLIC products appear (shop, homepage, search, categories, featured, etc.)
- Direct URL `/products/:id` → Both PUBLIC and UNLISTED work (404 if `isActive=false`)
- Admin panel → Sees all products with visibility column and filter
- Related products → Never include UNLISTED
- SEO → UNLISTED pages get `noindex,nofollow`
- Cart/Checkout → Unchanged — UNLISTED products flow through normally

---

## API Routes

### Public
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/products` | List products (PUBLIC only) |
| GET | `/api/products/:id` | Product detail (PUBLIC or UNLISTED) |
| POST | `/api/reviews/:id` | Submit review |
| GET | `/api/reviews/:id/stats` | Review stats |
| GET | `/api/reviews/:id/reviews` | Product reviews |

### Admin - Staff Management
| Method | Route | Permission |
|--------|-------|------------|
| GET | `/api/admin/staff` | staffManagement |
| POST | `/api/admin/staff` | staffManagement |
| PUT | `/api/admin/staff/:id` | staffManagement |
| PATCH | `/api/admin/staff/:id/toggle-status` | staffManagement |
| PATCH | `/api/admin/staff/:id/reset-password` | staffManagement |
| DELETE | `/api/admin/staff/:id` | staffManagement |

### Admin - Reviews
| Method | Route | Permission |
|--------|-------|------------|
| GET | `/api/admin/reviews` | reviews |
| GET | `/api/admin/reviews/users` | reviews |
| GET | `/api/admin/reviews/user/:userId` | reviews |
| PATCH | `/api/admin/reviews/:id/approve` | reviews |
| PATCH | `/api/admin/reviews/:id/reject` | reviews |
| POST | `/api/admin/reviews/:id/reply` | reviews |

### Admin - Reminders
| Method | Route | Permission |
|--------|-------|------------|
| GET | `/api/admin/reminders` | reminders |
| GET | `/api/admin/reminders/today` | reminders |
| GET | `/api/admin/reminders/stats` | reminders |
| GET | `/api/admin/reminders/:id` | reminders |
| PATCH | `/api/admin/reminders/:id/complete` | reminders |
| PATCH | `/api/admin/reminders/:id/whatsapp` | reminders |

### Admin - Dashboard
| Method | Route | Permission |
|--------|-------|------------|
| GET | `/api/admin/dashboard/overview` | (none) |
| GET | `/api/admin/dashboard/revenue` | dashboard |
| GET | `/api/admin/dashboard/orders` | dashboard |
| GET | `/api/admin/dashboard/customers` | dashboard |
| GET | `/api/admin/dashboard/products` | products |
| GET | `/api/admin/dashboard/categories` | categories |
| GET | `/api/admin/dashboard/inventory` | (none) |
| GET | `/api/admin/dashboard/batches` | batches |
| GET | `/api/admin/dashboard/reminders` | reminders |
| GET | `/api/admin/dashboard/reviews` | reviews |
| GET | `/api/admin/dashboard/payments` | (none) |
| GET | `/api/admin/dashboard/shipping` | shipping |
| GET | `/api/admin/dashboard/staff` | staffManagement |
| GET | `/api/admin/dashboard/activities` | (none) |
| GET | `/api/admin/dashboard/notifications` | (none) |

### Admin - Products
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/products/manage` | Create product (admin) |
| PUT | `/api/products/manage/:id` | Update product (admin) |
| DELETE | `/api/products/manage/:id` | Delete product (admin) |

### Webhooks
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/webhooks/shiprocket` | Shiprocket status updates + auto reminder creation |

---

## Admin Account

- **Email:** `admin@siddha.com`
- **Password:** `Admin@123`
- **Role:** SUPER_ADMIN (all permissions)

---

## Running the Project

```bash
# Backend (port 5000)
cd backend
npm run dev

# Frontend (port 5173)
cd frontend
npm run dev
```

---

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Recharts, Lucide React, react-i18next, Axios
- **Backend:** Node.js, Express, Mongoose, Passport (local + Google OAuth), JWT, bcrypt, Razorpay, Cloudinary, Shiprocket, Nodemailer
- **Database:** MongoDB (Atlas)
