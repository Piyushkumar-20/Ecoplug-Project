# EcoPlug EV Charging Management Platform

**Internal Project Documentation — Proprietary and Confidential**

The EcoPlug EV Charging Management Platform is an internal web application for managing and monitoring EV charging operations. This repository contains a React/Vite operations dashboard and a Node.js/Express REST API backed by MySQL.

> **Confidentiality notice:** This project is proprietary to EcoPlug Energy Limited and is intended only for authorized personnel. It is not an open-source project. Do not redistribute, publish, sublicense, or share this source code externally without written authorization.

## Overview

The application provides a company-scoped dashboard for EV charging operations. The frontend communicates with the backend through JSON REST endpoints. The backend verifies authentication and applies company-level scoping to protected data queries.

The repository does not include a complete database schema or migration history. Use the approved development database and confirm that required tables and columns exist before running the application.

## Current capabilities

- Authentication: login, current-user lookup, and logout acknowledgement.
- Company management: company registration and authenticated company profile lookup.
- User management: user creation and listing endpoints.
- Dashboard summary data.
- Company-scoped locations, chargers, and tariffs.
- Charging sessions with pagination, search, status filtering at the API layer, and session-detail lookup.
- API and database health checks.

The exact data shown depends on records and relationships in the configured MySQL database.

## Technology stack

| Area | Technologies |
|---|---|
| Frontend | React, Vite, React Router, Tailwind CSS, Lucide React |
| Backend | Node.js, Express |
| Database | MySQL, `mysql2` |
| Authentication | JSON Web Tokens (`jsonwebtoken`) |
| Password hashing | `bcryptjs` |
| Validation | Joi |
| Package management | pnpm lockfiles are included; an npm lockfile is also present for the frontend |

## Repository structure

```text
Ecoplug-Project/
├── README.md
├── Backend/
│   ├── .env.example
│   ├── package.json
│   └── src/
│       ├── app.js, server.js
│       ├── config/
│       ├── controllers/
│       ├── middleware/
│       ├── models/
│       ├── routes/
│       └── services/
└── Frontend/
    └── OCPI-PANEL-ashok/
        ├── package.json, vite.config.js
        └── src/
            ├── components/
            ├── pages/
            ├── services/
            └── App.jsx, main.jsx
```

## Architecture

1. Frontend views render dashboard screens and call the shared API helper.
2. API routes expose HTTP endpoints.
3. Authentication middleware verifies bearer tokens and attaches user, company, and role context to the request.
4. Controllers handle HTTP input and response formatting.
5. Services coordinate application-level operations.
6. Models execute parameterized SQL queries against MySQL.

Company identifiers for protected data must come from the verified token on the server. The browser must not be treated as a trusted source for tenant identity.

## Prerequisites

- A Node.js LTS version compatible with the installed dependencies.
- pnpm (recommended because pnpm lockfiles are included), or npm.
- Access to an approved MySQL development database.
- The required schema and seed data provisioned through the company's approved workflow.

## Configuration

### Backend

Create `Backend/.env` using `Backend/.env.example` as a reference:

```env
PORT=5000
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=your_existing_database
JWT_SECRET=replace_with_a_long_random_secret
```

These are examples, not production values. Use a unique, high-entropy JWT secret. Never commit `.env` files or share credentials or live tokens in documentation, tickets, screenshots, or logs.

The backend checks MySQL connectivity at startup. The configured database must already contain the tables and columns referenced by the models.

### Frontend

Create `Frontend/OCPI-PANEL-ashok/.env`:

```env
VITE_API_URL=http://localhost:5000
```

This is the backend origin; the frontend appends `/api/...` paths. Never place database credentials or JWT signing secrets in frontend variables because Vite-exposed values are bundled into client-side code.

## Local development

Run the services in separate terminals.

### Start the backend

```bash
cd Backend
pnpm install
pnpm dev
```

For a standard start without the development watcher, use `pnpm start`. The API defaults to port `5000` unless `PORT` is set.

### Start the frontend

```bash
cd Frontend/OCPI-PANEL-ashok
pnpm install
pnpm dev
```

Vite prints the local development URL, usually `http://localhost:5173`.

### Verify services

```http
GET http://localhost:5000/api/health
GET http://localhost:5000/api/health/db
```

Use an account created through the approved company workflow. Do not use example credentials against a real environment.

## API overview

Local base URL: `http://localhost:5000`

| Method | Endpoint | Authentication | Purpose |
|---|---|---|---|
| `GET` | `/api/health` | Public | API health check |
| `GET` | `/api/health/db` | Public | Database connectivity check |
| `POST` | `/api/companies/register` | Public | Register a company and administrator |
| `GET` | `/api/companies/profile` | Bearer token | Get authenticated company profile |
| `POST` | `/api/auth/login` | Public | Authenticate and receive a token |
| `GET` | `/api/auth/me` | Bearer token | Get current user |
| `POST` | `/api/auth/logout` | Bearer token | Logout acknowledgement |
| `POST` | `/api/users` | Bearer token; admin access expected | Create a company user |
| `GET` | `/api/users` | Bearer token; admin access expected | List company users |
| `GET` | `/api/dashboard` | Bearer token | Fetch company dashboard data |
| `GET` | `/api/locations` | Bearer token | List company locations |
| `GET` | `/api/chargers` | Bearer token | List company chargers |
| `GET` | `/api/tariffs` | Bearer token | List company tariffs |
| `GET` | `/api/sessions` | Bearer token | List sessions with pagination and supported filters |
| `GET` | `/api/sessions/:sessionId` | Bearer token | Get a session belonging to the authenticated company |

Protected requests use:

```http
Authorization: Bearer <access-token>
```

### Current session-list query parameters

| Parameter | Description |
|---|---|
| `page` | Page number; defaults to `1` |
| `limit` | Page size; defaults to `25`, maximum `100` |
| `search` | Searches row ID, session ID, location name, city, and EVSE ID |
| `status` | Exact session status match |

Example:

```http
GET /api/sessions?page=1&limit=25&status=ACTIVE&search=LOC-201
Authorization: Bearer <access-token>
```

## Authentication and company-level access

The backend verifies the bearer token and obtains `userId`, `companyId`, and `role` from the signed payload. Company-scoped queries should use the authenticated `companyId` and must not trust a company ID submitted by the browser.

The logout endpoint currently returns a success acknowledgement. Because the API uses bearer JWTs, the frontend should clear the locally stored token on logout. Server-side token revocation is not implemented by this endpoint.

## Sessions filtering: current gaps and recommended changes

The backend model already applies `s.company_id = ?` using the authenticated company ID and constrains joined location records to that same company. Preserve this server-side tenant boundary.

The current `SessionsView.jsx` has the following gaps:

1. **eMSP filter is page-local.** Options and matching rows are derived only from the loaded page. Add an `emsp` query parameter and filter in the backend before pagination.
2. **Status filter is not wired to the UI.** The backend accepts `status`, but the frontend does not currently send it.
3. **Date-range control is decorative.** The “Last 30 Days” button does not alter the API query.
4. **More Filters is decorative.** It does not open or apply additional controls.
5. **Export CDR is decorative.** No export handler is currently connected.
6. **Search excludes driver and vehicle.** Add these fields to the SQL search only if the corresponding database columns exist.
7. **Filter and pagination state need coordination.** Reset the current page to `1` when an applied filter changes, and show totals returned by the filtered server query.

Recommended next query parameters are `status`, `emsp`, `startDate`, and `endDate`, alongside existing `page`, `limit`, and `search`. Validate incoming values on the server. Apply filters before pagination and use the same filter conditions for the count query.

## Build and quality checks

```bash
cd Frontend/OCPI-PANEL-ashok
pnpm build
pnpm lint
```

The backend currently defines `start` and `dev` scripts but no dedicated test or lint script. Add automated tests and backend linting as part of the release process.

## Troubleshooting

### Backend cannot connect to MySQL

- Verify the database host, port, name, username, and password in `Backend/.env`.
- Confirm MySQL is running and reachable.
- Confirm the database contains the tables and columns expected by the backend.
- Review the backend terminal for connection errors.

### Frontend API requests fail

- Confirm the backend is running.
- Verify `VITE_API_URL` in the frontend `.env` file.
- Restart Vite after changing environment variables.
- Inspect the browser Network panel and backend logs.

### Requests return `401`

- Sign in again to obtain a valid token.
- Confirm requests include the bearer authorization header.
- Verify `JWT_SECRET` is consistent between token issuance and verification.
- Never paste a live token into shared logs or documentation.

### Sessions are missing or filtering seems incomplete

- Confirm the logged-in user belongs to the expected company.
- Verify session rows have the correct `company_id`.
- Check that `location_id` and `evse_uid` values match their location and EVSE records.
- The eMSP filter remains page-local until implemented server-side.

## Security and operational notes

- Keep `.env` files, credentials, database dumps, signing secrets, and access tokens out of source control.
- Use separate credentials and signing secrets for development, staging, and production.
- Use a least-privilege database account instead of a database superuser for application runtime.
- Restrict CORS to approved frontend origins in deployed environments and use HTTPS outside local development.
- Validate request parameters and use parameterized SQL queries.
- Enforce authorization on the server for every company-scoped resource.
- Do not log passwords, bearer tokens, or sensitive customer data.
- Back up and modify shared databases only through approved company procedures.

## Ownership and usage

This codebase and its documentation are proprietary and confidential. Access is limited to personnel and contractors authorized by EcoPlug Energy Limited and subject to applicable company policies and agreements. This README grants no permission to redistribute, sublicense, publish, or use the software outside authorized company work. Do not add an open-source license unless the company formally authorizes it.
