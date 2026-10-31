# EcoPlug Backend

**Internal Documentation — Proprietary and Confidential**

The backend is a Node.js/Express REST API for company-scoped EV charging dashboard data backed by MySQL.

> This is a private, proprietary project for authorized internal use only. Do not redistribute or publish externally without written authorization.

## Responsibilities

- Authenticate users and issue/verify JWT access tokens.
- Resolve user, company, and role context from verified tokens.
- Expose company profile, user, dashboard, location, charger, tariff, and session endpoints.
- Apply company scoping to protected queries.
- Connect to the existing MySQL schema using `mysql2/promise`.

## Requirements and setup

Requirements: Node.js LTS compatible with the dependencies, pnpm, and access to the approved MySQL database and its existing schema.

```bash
pnpm install
```

Create `.env` in `Backend/`:

```env
PORT=5000
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=your_existing_database
JWT_SECRET=replace_with_a_long_random_secret
```

Do not commit `.env` or use production credentials for local development.

Start the API:

```bash
pnpm dev
```

Use `pnpm start` to run without nodemon. The server tests MySQL connectivity before listening. Schema provisioning and seed data are handled separately; a complete migration set is not included in this repository.

## API routes

| Method | Endpoint | Access |
|---|---|---|
| `GET` | `/api/health` | Public |
| `GET` | `/api/health/db` | Public |
| `POST` | `/api/companies/register` | Public registration endpoint |
| `GET` | `/api/companies/profile` | Authenticated |
| `POST` | `/api/auth/login` | Public |
| `GET` | `/api/auth/me` | Authenticated |
| `POST` | `/api/auth/logout` | Authenticated |
| `POST` | `/api/users` | Authenticated; admin access expected |
| `GET` | `/api/users` | Authenticated; admin access expected |
| `GET` | `/api/dashboard` | Authenticated |
| `GET` | `/api/locations` | Authenticated |
| `GET` | `/api/chargers` | Authenticated |
| `GET` | `/api/tariffs` | Authenticated |
| `GET` | `/api/sessions` | Authenticated |
| `GET` | `/api/sessions/:sessionId` | Authenticated |

Protected requests require `Authorization: Bearer <access-token>`.

## Sessions API

`GET /api/sessions` currently accepts `page` (default `1`), `limit` (default `25`, maximum `100`), `search` (row ID, session ID, location name, city, and EVSE ID), and `status` (exact match).

Example:

```http
GET /api/sessions?page=1&limit=25&status=ACTIVE
Authorization: Bearer <access-token>
```

The company ID comes from `req.user.companyId` after JWT verification. The model constrains sessions by `s.company_id` and joins locations within the same company. Preserve this boundary when adding filters.

### Known follow-up work

The frontend's eMSP filter currently filters only the loaded page, and the backend does not yet accept an eMSP parameter. The status and date controls are not fully connected to the API. Add validated parameters such as `emsp`, `startDate`, and `endDate`, apply them before pagination, and reuse the same conditions for the count query.

## Company and user flow

1. Register a company through `POST /api/companies/register`.
2. Sign in through `POST /api/auth/login`.
3. The token represents the authenticated user and contains user, company, and role context.
4. Authorized administrators can create and list company users through `/api/users`.
5. Company-scoped calls derive the company ID from the verified token, not from browser input.

Use approved internal credentials and database records when testing. Do not commit sample passwords or live tokens.

## Proprietary notice

All backend source code and documentation are confidential and proprietary. No permission to redistribute, sublicense, or publish is granted by this document.


## PREPAID / POSTPAID session billing integration

After the CMS saves a charging session as `COMPLETED` and commits its database transaction, it calls:

`POST /api/sessions/billing-completed`

Header: `x-cms-billing-key: <CMS_BILLING_API_KEY>`

Body: `{"sessionId": 1449}` where `sessionId` is the numeric internal `ocpi_sessions.id`.

- PREPAID: the final session amount is deducted from the company's wallet.
- POSTPAID: the session is saved in `postpaid_usage` and added to `company_accounts.outstanding_balance`.
- Repeated callbacks are idempotent; a session is not charged or recorded twice.

POSTPAID companies can view their own records and current outstanding balance through:

`GET /api/wallet/postpaid/usage?page=1&limit=20`

The endpoint returns the usage records, pagination, and `outstandingBalance`.
