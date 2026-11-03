# EcoPlug EV Charging Management System

**Internal Project Handover Documentation**  
**Classification:** Proprietary and Confidential — EcoPlug Energy Limited

> This repository is an internship project handover package for authorized EcoPlug personnel. It is not an open-source project. Do not publish, redistribute, sublicense, or share the source code, database dump, API specification, credentials, or screenshots outside approved recipients without written authorization from EcoPlug Energy Limited.

## 1. Project purpose

EcoPlug is a company-scoped web application for viewing and managing EV charging operations. It combines a React dashboard, a Node.js/Express REST API, a MySQL database, and Socket.IO notifications.

The application includes company/user authentication, dashboard data, locations, chargers, tariffs, charging sessions, complaints, notifications, and PREPAID/POSTPAID billing-related workflows.

## 2. Main modules

| Module | What it does |
|---|---|
| Authentication and company users | Company registration, login, access-token verification, refresh-token session handling, and ADMIN-managed employee accounts. |
| Dashboard | Company-scoped dashboard information. |
| Locations, chargers and tariffs | Retrieves charging infrastructure and tariff data for the authenticated company. |
| Charging sessions | Lists and displays session records with pagination and filters. |
| Complaints | Lists complaints, provides complaint details and notes. |
| Notifications | Stores company notifications, marks them as read, and emits real-time notification events through Socket.IO. |
| PREPAID wallet | Stores company wallet balances and wallet transaction history. |
| POSTPAID billing | Records completed charging-session usage and outstanding balances; exposes usage history. |
| CMS billing callback | Receives a trusted callback after the CMS has committed a completed charging session and processes billing idempotently. |

## 3. Technology stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 8, React Router, Tailwind CSS 4, Lucide React |
| Backend | Node.js 22, Express 5 (ES modules) |
| Database | MySQL 8, `mysql2/promise` connection pool |
| Authentication | JWT access tokens, HttpOnly refresh-token cookie, bcryptjs password hashing |
| Real-time | Socket.IO 4 |
| API documentation | OpenAPI 3.0.3, Scalar API Reference |
| Containerization | Docker, Docker Compose, MySQL container, phpMyAdmin |

## 4. Repository structure

```text
Ecoplug-Project-main/
├── README.md                         # This handover guide
├── EcoPlug.openapi.json              # Importable OpenAPI specification
├── docker-compose.yml                # MySQL + backend + phpMyAdmin
├── copy_eeil_ocpp.sql                # Required approved DB dump (obtain separately)
├── Backend/
│   ├── .env.example                  # Local backend environment template
│   ├── Dockerfile
│   ├── openapi.json                  # API spec served by Scalar at /api-docs
│   ├── package.json
│   └── src/
│       ├── app.js                    # Express app and route mounting
│       ├── server.js                 # HTTP + Socket.IO + startup/shutdown
│       ├── config/                   # MySQL connection pool
│       ├── controllers/              # HTTP request/response handling
│       ├── middleware/               # Auth, role, validation, CMS key checks
│       ├── models/                   # SQL queries
│       ├── routes/                   # API route definitions
│       ├── services/                 # Business logic
│       └── utils/                    # API errors/responses
└── Frontend/
    └── OCPI-PANEL-ashok/
        ├── .env.example
        ├── package.json
        ├── vite.config.js
        └── src/
            ├── components/
            ├── pages/
            ├── services/             # REST API and Socket.IO clients
            └── App.jsx
```

The `Frontend/` directory itself is a container folder; run frontend package commands inside `Frontend/OCPI-PANEL-ashok/`.

## 5. Prerequisites

For the recommended Docker-based backend/database setup:

- Windows 10/11, macOS or Linux.
- Docker Desktop (or Docker Engine) with Docker Compose v2.
- Node.js 22 LTS-compatible runtime and pnpm for the frontend.
- The approved EcoPlug MySQL SQL dump (`copy_eeil_ocpp.sql`) supplied through the company's authorized handover channel.
- Authorized development credentials and environment values supplied by the project owner.

Do not use production credentials in a local development environment.

## 6. First-time setup — Docker backend and database

### Step 1 — Obtain the database dump

The SQL dump is intentionally not embedded in this source archive. Obtain the approved `copy_eeil_ocpp.sql` file from the authorized project owner and place it in the repository root, next to `docker-compose.yml`.

The Compose configuration mounts this file at `/docker-entrypoint-initdb.d/01-ecoplug.sql`. MySQL executes initialization scripts only when its data directory is first initialized. If the named MySQL volume already contains a database, adding or replacing the SQL file does **not** automatically import it again.

### Step 2 — Create `.env.docker`

Create a file named `.env.docker` in the repository root (same folder as `docker-compose.yml`). Use unique local development values; do not commit this file.

```env
# MySQL database and application user
DB_NAME=copy_eeil_ocpp
DB_USER=ecoplug_app
DB_PASSWORD=replace_with_a_strong_local_password
MYSQL_ROOT_PASSWORD=replace_with_a_different_strong_root_password

# Backend security and session settings
JWT_SECRET=replace_with_a_long_random_secret_at_least_32_bytes
CMS_BILLING_API_KEY=replace_with_a_separate_long_random_secret
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_DAYS=7
MAX_SESSION_DAYS=30
BCRYPT_ROUNDS=10
REFRESH_COOKIE_NAME=ecoplug_refresh

# Optional complaint notification polling interval in milliseconds
COMPLAINT_NOTIFICATION_POLL_INTERVAL_MS=30000

# Frontend origin allowed by the backend
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

`JWT_SECRET` and `CMS_BILLING_API_KEY` must be different high-entropy secrets. The Compose file currently sets `FRONTEND_URL` to `http://localhost:5173` for the backend container. If the frontend is served from another origin, update the Compose environment value and restart the backend.

### Step 3 — Start MySQL, backend and phpMyAdmin

From the repository root:

```bash
docker compose --env-file .env.docker up -d --build
```

Check service status:

```bash
docker compose --env-file .env.docker ps
```

View backend logs:

```bash
docker compose --env-file .env.docker logs -f backend
```

View MySQL logs:

```bash
docker compose --env-file .env.docker logs -f mysql
```

Expected backend startup messages include successful MySQL connection and the server listening on port `5000`.

### Step 4 — Verify backend and database

Open these URLs in a browser or API client:

```text
http://localhost:5000/api/health
http://localhost:5000/api/health/db
```

The first checks the API process; the second checks the MySQL connection.

### Step 5 — Database administration

| Service | Address | Notes |
|---|---|---|
| Backend API | `http://localhost:5000` | REST API base URL |
| Scalar API docs | `http://localhost:5000/api-docs` | Interactive API reference |
| OpenAPI JSON | `http://localhost:5000/openapi.json` | Specification served by backend |
| phpMyAdmin | `http://localhost:8080` | Server/host: `mysql` inside Compose; log in with configured DB user or root credentials |
| MySQL from host tools | `127.0.0.1:3307` | Use the configured database username/password |

Do not expose phpMyAdmin or the MySQL port to untrusted networks.

## 7. Start the frontend locally

Open a second terminal:

```bash
cd Frontend/OCPI-PANEL-ashok
pnpm install
```

Create `.env` in `Frontend/OCPI-PANEL-ashok/`:

```env
VITE_API_URL=http://localhost:5000
```

Start the Vite development server:

```bash
pnpm dev
```

Vite normally serves the application at `http://localhost:5173`. If the URL or port differs, update `FRONTEND_URL` in the backend environment and restart the backend. Restart Vite after changing frontend environment variables.

Build and lint checks:

```bash
pnpm build
pnpm lint
```

The supplied Compose file starts MySQL, backend and phpMyAdmin; it does not start the React frontend. The frontend is run locally using Vite as described above.

## 8. Optional — run the backend directly on the host

Use this only when the MySQL Docker container is already running and port `3307` is published to the host. Create `Backend/.env`:

```env
PORT=5000
DB_HOST=127.0.0.1
DB_PORT=3307
DB_USER=ecoplug_app
DB_PASSWORD=replace_with_the_same_local_db_password
DB_NAME=copy_eeil_ocpp
JWT_SECRET=replace_with_the_same_long_random_secret
FRONTEND_URL=http://localhost:5173
CMS_BILLING_API_KEY=replace_with_the_same_cms_secret
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_DAYS=7
MAX_SESSION_DAYS=30
BCRYPT_ROUNDS=10
REFRESH_COOKIE_NAME=ecoplug_refresh
NODE_ENV=development
```

Then:

```bash
cd Backend
pnpm install
pnpm dev
```

When the backend runs inside Docker, its database host must be `mysql` and database port `3306` (the Compose service name and internal port). Do not use `127.0.0.1:3307` from inside the backend container.

## 9. Authentication and tenant isolation

1. Register a company using `POST /api/companies/register` with `billingType` set to `PREPAID` or `POSTPAID`.
2. Sign in using `POST /api/auth/login`.
3. The response contains an access token. The refresh token is set as an HttpOnly cookie and is not exposed to frontend JavaScript.
4. Send the access token as `Authorization: Bearer <access-token>` to protected endpoints.
5. When an access token expires, the frontend calls `POST /api/auth/refresh` with credentials/cookies enabled to obtain a new access token.
6. On logout, call `POST /api/auth/logout` and clear the in-memory access token in the client.

Protected database operations use `companyId` from the verified token. Do not trust a company ID supplied by the browser to select tenant data. User-management endpoints require the `ADMIN` role.

## 10. API documentation and endpoint coverage

The maintained OpenAPI file is `Backend/openapi.json`. The backend serves it at `/openapi.json` and Scalar renders it at `/api-docs`. A root copy, `EcoPlug.openapi.json`, is included for importing into an API client or reviewing outside the running application.

The specification covers health, company registration/profile, login/refresh/logout/current user, employee management, dashboard, locations, chargers, tariffs, sessions and session details, CMS billing callback, complaints and complaint details, notifications/read operations, wallet balance/transactions/credit/debit, and POSTPAID usage history.

Use the interactive docs for request parameters, request bodies, authentication requirements and response envelope examples. The actual implementation is authoritative if an API client collection or older exported specification differs from the backend routes.

## 11. Real-time notifications (Socket.IO)

The backend hosts Socket.IO on the same origin/port as the REST API. The client authenticates the socket handshake with the current access token:

```js
io("http://localhost:5000", {
  autoConnect: false,
  withCredentials: true,
  transports: ["websocket"],
  auth: (callback) => callback({ token: accessToken }),
});
```

After authentication, the server joins the socket to `company:<companyId>`. New company notifications are emitted using the event name `notification:new`. The server derives the company room from the verified JWT; clients must not choose another company's room.

## 12. PREPAID / POSTPAID billing integration

After the CMS has saved a charging session with status `COMPLETED` and committed its database transaction, it calls:

```http
POST /api/sessions/billing-completed
Content-Type: application/json
x-cms-billing-key: <CMS_BILLING_API_KEY>

{"sessionId": 1449}
```

`sessionId` is the internal numeric `ocpi_sessions.id`, not an external OCPI session string.

- **PREPAID:** the completed session amount is deducted from the company's available wallet balance and a wallet transaction is recorded.
- **POSTPAID:** a `postpaid_usage` row is created and the company's outstanding balance is increased.
- Repeated callbacks are designed to be idempotent so the same session is not billed twice.
- The current billing flow supports INR session amounts. POSTPAID usage is rejected if the company is not POSTPAID, the session is not COMPLETED, required end/cost fields are missing, or the credit limit would be exceeded.

POSTPAID usage history is available through `GET /api/wallet/postpaid/usage`. Company users can view only their own company's records and outstanding balance.

## 13. Important operational and security notes

- **Protect wallet mutation endpoints before production exposure.** In the supplied backend route file, `POST /api/wallet/admin/credit` and `POST /api/wallet/debit` do not currently attach authentication middleware. Treat them as development/internal-only endpoints and restrict them at the application/network layer until proper internal-admin or trusted-service authentication is implemented.
- The CMS billing callback is protected by `x-cms-billing-key`; keep the key secret and rotate it if exposed.
- Public company registration is enabled in the current route configuration. Confirm whether that is intended for the target deployment; otherwise restrict or disable it.
- JWT signing secrets, DB passwords and CMS keys must never be committed to source control or placed in `VITE_` frontend variables.
- The database dump contains operational/project data. Handle it as confidential company data.
- Docker initialization SQL runs only for a newly initialized MySQL data directory. Do not run `docker compose down -v` on a database containing data you need; `-v` deletes the named volume.
- This repository does not contain a versioned migration system. For future schema changes, preserve a backup and use reviewed, version-controlled migration scripts rather than repeatedly overwriting a shared database dump.

## 14. Troubleshooting

| Symptom | Checks |
|---|---|
| Backend exits before listening | Check backend logs, required environment variables, MySQL health and DB credentials. The server tests `SELECT 1` before listening. |
| `ECONNREFUSED` to MySQL | From Docker backend use host `mysql`, port `3306`. From host use `127.0.0.1`, port `3307`. |
| Database is empty after startup | Confirm `copy_eeil_ocpp.sql` was in the repository root before the MySQL volume was first created. Existing volumes do not rerun initialization scripts. |
| Frontend API requests fail | Confirm backend is running, `VITE_API_URL` is correct, CORS `FRONTEND_URL` matches the browser origin, and restart Vite after env changes. |
| API returns `401` | Sign in again, verify bearer header, check JWT secret consistency, and ensure cookies are sent for refresh/logout. |
| Refresh does not work | Check browser cookie settings, `REFRESH_COOKIE_NAME`, CORS credentials, frontend `credentials: include`, and matching frontend origin. |
| Socket connection rejected | Confirm the client sends a current access token in the Socket.IO `auth.token` handshake field. |
| Port already in use | Stop the conflicting process or change the published port and update frontend/API URLs accordingly. |

Useful Docker commands:

```bash
# Stop containers but preserve the database volume
docker compose --env-file .env.docker down

# Restart services
docker compose --env-file .env.docker up -d

# Rebuild backend after code changes
docker compose --env-file .env.docker up -d --build backend

# Follow backend logs
docker compose --env-file .env.docker logs -f backend
```

## 15. Handover checklist

Before handing this project to another developer, provide through the company's approved secure channel:

- This source repository/archive.
- The approved `copy_eeil_ocpp.sql` database dump (if the recipient is authorized to use it).
- Environment variable values via a secure secret-sharing method; do not send `.env.docker` in an ordinary source archive.
- Access to the required development systems/services and test accounts.
- Confirmation of the intended frontend origin and deployment environment.
- Confirmation of whether public company registration and the current wallet mutation routes are allowed in the recipient's environment.

**Project ownership and support:** EcoPlug Energy Limited. This document describes the supplied internship project snapshot; deployment-specific configuration and access must be confirmed with the authorized project owner.
