## Officio – Architecture & Functional Specification

**Last updated**: 2026-03-04  
**Stack**: Next.js (App Router) • MongoDB • Mongoose • Chakra UI • Axios

---

## High-Level Overview

- **Application type**: Full-stack Next.js app (App Router) with API routes.
- **Frontend + Backend**: Single Next.js codebase.
- **Database**: MongoDB accessed via Mongoose.
- **Auth**: Custom username/password with JWT stored in HTTP-only cookies.
- **Roles**:
  - `ADMIN`
  - `EMPLOYEE`

### Auth & Role Flow

1. Admin logs in.
2. Admin creates employees (no public signup).
3. Admin manually shares credentials with employees.
4. Employee logs in using provided credentials.
5. Server issues a JWT and stores it in an HTTP-only cookie.
6. Middleware inspects JWT and enforces:
   - Authentication (must be logged in).
   - Authorization (must have required role).

Protected routes can be specified as:

- **Admin-only**: e.g. employee management, leave approvals, holiday management.
- **Employee-only**: e.g. submit leave, view own balances and requests.

---

## Database Design (MongoDB + Mongoose)

All collections are modeled with Mongoose schemas and accessed through repository classes for separation of concerns.

### User

- **Collection**: `users`
- **Purpose**: Store login and role information.

Fields:

- `name: string`
- `email: string` (unique)
- `password: string` (hashed)
- `role: "ADMIN" | "EMPLOYEE"`
- `isActive: boolean`
- `createdAt: Date`
- `updatedAt: Date`

### Holiday

- **Collection**: `holidays`
- **Purpose**: Central list of company holidays.

Fields:

- `title: string`
- `date: Date`
- `description: string`
- `createdBy: ObjectId` (references `User`, admin who created it)
- `createdAt: Date`

### LeaveBalance

- **Collection**: `leave_balances`
- **Purpose**: Track remaining credits per user and leave type.

Fields:

- `userId: ObjectId` (references `User`)
- `sickLeave: number` (e.g. 10)
- `personalLeave: number` (e.g. 12)
- `updatedAt: Date`

Behavior:

- Admin operations **increment** balances (e.g. `+2 sick`, `+1 personal`), not overwrite.
- Future extension: add more leave types as new fields or a generic structure.

### LeaveRequest

- **Collection**: `leave_requests`
- **Purpose**: Capture all leave requests and their lifecycle.

Fields:

- `userId: ObjectId` (references `User`)
- `leaveType: "SICK" | "PERSONAL"`
- `startDate: Date`
- `endDate: Date`
- `isHalfDay: boolean`
- `halfDaySession: "FIRST_HALF" | "SECOND_HALF" | null`
- `totalDays: number` (can be `0.5`)
- `reason: string`
- `status: "PENDING" | "APPROVED" | "REJECTED"`
- `adminMessage: string` (optional)
- `reviewedBy: ObjectId | null` (references `User`, admin)
- `reviewedAt: Date | null`
- `createdAt: Date`

Advantages:

- Easy to add new leave types by extending the enum.
- Full audit history for approvals and rejections.
- Straightforward for reporting/analytics.

---

## Backend Architecture & Folder Structure

Targeted high-level structure:

```text
/app
  /api
    /auth
    /admin
    /employee

/src
  /modules
    /auth
    /users
    /leave
    /holiday
    /dashboard

  /models
  /repositories
  /services
  /controllers
  /dtos
  /validators

/lib
  mongoose.ts
  auth.ts
  roleMiddleware.ts
```

### Responsibilities

- **`/app/api`**: Next.js Route Handlers (request/response only). They call controllers/services.
- **`/src/models`**: Mongoose schema definitions.
- **`/src/repositories`**: Data-access layer (CRUD and query abstractions).
- **`/src/services`**: Business logic (leave calculations, validations, workflows).
- **`/src/controllers`**: Map HTTP to service calls, handle status codes and response structure.
- **`/src/dtos`**: Input/output shapes for API (request/response contracts).
- **`/src/validators`**: Validation logic (e.g. Zod/Yup or custom).
- **`/lib/mongoose.ts`**: Connection and initialization for MongoDB/Mongoose.
- **`/lib/auth.ts`**: JWT generation, verification, hashing helpers.
- **`/lib/roleMiddleware.ts`**: Role-based guard functions for API routes and pages.

This layout supports SOLID principles and future growth.

---

## Core Features

### Authentication

- **Login API**:
  - Accepts email + password.
  - Verifies hashed password against stored hash.
  - Issues JWT (user id + role).
  - Stores JWT in HTTP-only cookie.
- **Role-Based Middleware**:
  - Validates JWT on each request.
  - Attaches user context to request.
  - Enforces required role (e.g. `ADMIN` only).
- **No public signup**:
  - Only admins can create employee accounts.

### Admin Features

- **Create Employee**
  - Input: name, email, temporary password, default leave credits.
  - Side effects:
    - Create `User` with role `EMPLOYEE`.
    - Create initial `LeaveBalance` record.
  - Admin is responsible for sharing credentials out of band.

- **Manage Holidays**
  - Create holiday: title, date, description.
  - Only admins can create/edit/delete holidays.
  - Employees get read-only access to holiday list.

- **Manage Leave Credits**
  - Adjust existing balances:
    - e.g. `+2` sick, `+1` personal.
  - Implementation: repository performs `increment` operations, not overwrite.

- **Approve / Reject Leave**
  - Admin views list of pending requests.
  - For each request:
    - Approve:
      - Check sufficient balance.
      - Deduct `totalDays` from appropriate leave type.
      - Set status to `APPROVED`.
      - Save `reviewedBy`, `reviewedAt`, `adminMessage`.
    - Reject:
      - Set status to `REJECTED`.
      - Save `reviewedBy`, `reviewedAt`, `adminMessage`.

- **Admin Dashboard**
  - Metrics:
    - Total employees.
    - Total holidays.
    - Pending leave requests.
    - Leaves approved this month.
  - Table:
    - Recent leave requests with status and type.

### Employee Features

- **View Leave Balance**
  - Display current `sickLeave` and `personalLeave` from `LeaveBalance`.

- **Request Leave**
  - Inputs:
    - `leaveType` (`SICK` or `PERSONAL`).
    - `startDate`, `endDate`.
    - `isHalfDay` (boolean).
    - `halfDaySession` (`FIRST_HALF` | `SECOND_HALF`) when `isHalfDay = true`.
    - `reason` (text).

- **Track Request Status**
  - List of own leave requests:
    - Status: `PENDING`, `APPROVED`, `REJECTED`.
    - Admin message (if any).

- **View Holidays**
  - Read-only view of all upcoming holidays.

- **Employee Dashboard**
  - Metrics:
    - Remaining sick leave.
    - Remaining personal leave.
    - Pending requests count.
  - Tables:
    - Recent leave requests.
    - Upcoming holidays.

---

## Leave Calculation Logic

### Cases

1. **Single-Day Full Leave**
   - `startDate = endDate`
   - `totalDays = 1`

2. **Half-Day Leave**
   - Additional fields:
     - `isHalfDay: boolean`
     - `halfDaySession: "FIRST_HALF" | "SECOND_HALF"`
   - If `isHalfDay` is `true`:
     - `totalDays = 0.5`
     - `startDate = endDate` (half-day is always a single date).

3. **Multi-Day Leave (Simple Version)**
   - `totalDays = (endDate - startDate) + 1`
   - For now:
     - No weekend exclusion.
     - No holiday exclusion.
   - Future enhancement:
     - Deduct weekends/holidays via calendar-aware algorithm.

### Leave Deduction Rules

- Performed **only on approval** by an admin.
- Pseudocode:

```ts
if (leaveType === "SICK") {
  if (balance.sickLeave < totalDays) {
    throw InsufficientBalanceError;
  }
  balance.sickLeave -= totalDays;
}

if (leaveType === "PERSONAL") {
  if (balance.personalLeave < totalDays) {
    throw InsufficientBalanceError;
  }
  balance.personalLeave -= totalDays;
}
```

- If balance is insufficient:
  - Reject approval with helpful error ("Insufficient sick leave balance").
  - Request remains `PENDING` or changes to `REJECTED` depending on UX decision (recommended: `REJECTED` with message).

---

## Dashboards

### Admin Dashboard

- **Cards (KPI tiles)**:
  - Total Employees.
  - Total Holidays.
  - Pending Requests.
  - Leaves Approved This Month.

- **Table**:
  - Recent Leave Requests:
    - Employee name.
    - Leave type.
    - Dates.
    - Status.
    - Actions (View / Approve / Reject).

### Employee Dashboard

- **Cards**:
  - Sick Leave Remaining.
  - Personal Leave Remaining.
  - Pending Requests.

- **Tables**:
  - Recent My Leave Requests.
  - Upcoming Holidays.

---

## UI / UX – Chakra UI

### Design Principles

- **Default theme**: Dark mode.
- **Light mode**: Available via toggle.
- **Responsive**:
  - Desktop: Sidebar with main content area.
  - Mobile: Optional bottom navigation and collapsible menu.

### Layout

- **Sidebar (desktop)**:
  - Dashboard.
  - Leaves.
  - Holidays.
  - (Admin only) Employees / Admin tools.
  - Logout.

- **Main Content**:
  - Dashboard metrics.
  - Tables (requests, holidays, employees).
  - Forms (login, create employee, request leave).

### Theming

- **Dark Mode**
  - Background: `gray.900`
  - Surface/cards: `gray.800`
  - Accent: `teal` or `blue` (consistent across buttons/links).

- **Light Mode**
  - Background: `gray.50`
  - Surface/cards: `white`

Chakra UI color mode manager will be configured to:

- Default to dark mode for first-time visitors.
- Store preference (local storage or cookie).

---

## Phase-Wise Development Plan

### Phase 1 – Project & Infrastructure Setup

- Initialize Next.js (App Router).
- Configure TypeScript and ESLint.
- Configure MongoDB connection via `lib/mongoose.ts`.
- Integrate Chakra UI with custom theme and dark-mode default.
- Implement basic auth utilities and role middleware.

### Phase 2 – Core Models & Repositories

- Implement Mongoose models for:
  - `User`
  - `LeaveBalance`
  - `LeaveRequest`
  - `Holiday`
- Implement repository classes for each model.

### Phase 3 – Admin Panel

- APIs and pages for:
  - Creating employees (with default leave balances).
  - Managing holidays.
  - Viewing all leave requests.
  - Approving/rejecting requests with balance deduction.

### Phase 4 – Employee Panel

- APIs and pages for:
  - Viewing leave balance.
  - Requesting leave (including half day).
  - Viewing holidays.
  - Tracking own request statuses.

### Phase 5 – Dashboard Metrics

- Implement aggregation queries for:
  - Admin dashboard metrics and tables.
  - Employee dashboard metrics and tables.

### Phase 6 – Refinement & Hardening

- Add validation layer (`/validators`, `/dtos`).
- Standardize API responses.
- Improve error handling and logging.
- Add tests around calculation logic and approvals.

---

## SOLID Principles in Practice

- **Single Responsibility Principle (SRP)**:
  - Controllers only orchestrate HTTP details.
  - Services encapsulate business rules (e.g. leave calculation, approval workflow).
  - Repositories wrap all DB access for each aggregate.

- **Open/Closed Principle (OCP)**:
  - Leave types are modeled through enums/config; adding new types primarily affects configuration and validation, not core deduction algorithms.
  - Services can be extended with new strategies without modifying existing code paths where possible.

- **Liskov Substitution Principle (LSP)**:
  - Repository interfaces can be replaced with alternative implementations (e.g. mocks in tests) without affecting service correctness.

- **Interface Segregation Principle (ISP)**:
  - Each module (`auth`, `leave`, `holiday`, `users`, `dashboard`) exposes minimal interfaces tailored to its clients.

- **Dependency Inversion Principle (DIP)**:
  - Services depend on repository interfaces, not concrete Mongoose models.
  - Makes it easier to swap out persistence or mock for tests.

---

## Future Scalability Ideas

Planned extensions that the current architecture supports:

- **Monthly Leave Accrual**
  - Scheduled jobs to increment `LeaveBalance` per month.
  - Policy-based accrual rules (e.g. tenure-based).

- **Holiday Import & Sync**
  - Integration with external calendars or public holiday APIs.
  - Per-region/office holiday sets in multi-tenant scenarios.

- **Notifications**
  - Email notifications for approvals, rejections, and upcoming leaves.
  - Optional in-app notifications.

- **Multi-Tenant Support**
  - Introduce `companyId` on all core entities (`User`, `LeaveBalance`, `LeaveRequest`, `Holiday`).
  - Company-level leave policies and holiday calendars.

- **Policy Engine**
  - Configurable rules for:
    - Max consecutive days.
    - Blackout dates.
    - Approval chains (multi-level approvals).

This document should be kept in sync as implementation evolves (especially models, APIs, and dashboards).

