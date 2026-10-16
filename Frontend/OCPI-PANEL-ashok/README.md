# EcoPlug Operations Dashboard — Frontend

**Proprietary and Confidential | Internal Use Only**

The EcoPlug Operations Dashboard is the web-based frontend for EcoPlug Energy Limited's EV charging operations platform. It provides a unified interface for viewing operational summaries, locations, charging equipment, tariffs, charging sessions, complaints, and company profile information.

This repository is private and proprietary. It is not an open-source project. Access and use are restricted to personnel and contractors authorized by EcoPlug Energy Limited. Do not publish, redistribute, sublicense, or share the source code, assets, or documentation outside authorized company channels without written permission.

## Table of Contents

- [Project Overview](#project-overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Application Structure](#application-structure)
- [Application Navigation](#application-navigation)
- [Architecture and Data Flow](#architecture-and-data-flow)
- [Prerequisites](#prerequisites)
- [Environment Configuration](#environment-configuration)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [Production Build and Preview](#production-build-and-preview)
- [Authentication and Protected Routes](#authentication-and-protected-routes)
- [API Integration](#api-integration)
- [Page and Component Guide](#page-and-component-guide)
- [Styling and UI](#styling-and-ui)
- [Troubleshooting](#troubleshooting)
- [Development Guidelines](#development-guidelines)
- [Security and Confidentiality](#security-and-confidentiality)
- [Ownership and Usage](#ownership-and-usage)

## Project Overview

The frontend is a single-page application built with React and Vite. React Router manages navigation, and a shared API helper communicates with the Node.js/Express backend using JSON over HTTP.

The application includes an authenticated operations workspace with a collapsible sidebar, a shared header, and dedicated views for key operational areas. Company-specific records are supplied by the backend API. Some dashboard visualizations and complaint records are currently represented by frontend-side demonstration data; consult the relevant component before assuming that every displayed metric or workflow is connected to live backend data.

## Key Features

- **Authentication screen:** Sign-in form with password visibility control, loading feedback, and error display.
- **Protected application routes:** Dashboard pages are available through the protected route wrapper.
- **Session-aware navigation:** The application checks the locally stored token expiry and redirects to login when the local expiry is reached.
- **Operations dashboard:** Summary cards, chart-style visualizations, operational highlights, and session-oriented dashboard content.
- **Company profile:** Retrieves company profile information from the backend.
- **Locations:** Loads location records from the API and supports frontend search and pagination.
- **Chargers:** Loads charger records from the API and provides search, pagination, and a filter interface.
- **Tariffs:** Loads tariff plans from the API and provides search, pagination, and a filter interface.
- **Charging sessions:** Loads paginated session records from the API and provides a search field and pagination controls.
- **Complaints workspace:** Presents a complaint-management interface using the data defined in the frontend component.
- **Responsive navigation:** Sidebar and header controls support the dashboard layout across screen sizes.
- **Reusable API utility:** Centralizes API requests and attaches the saved bearer token when available.

Feature behavior depends on the current component and backend implementation. A visible control should not be assumed to be operational unless its event handler and API integration are implemented.

## Technology Stack

| Category | Technology |
|---|---|
| UI library | React 19 |
| Build tool and development server | Vite |
| Routing | React Router |
| Styling | Tailwind CSS 4 |
| Vite/Tailwind integration | `@tailwindcss/vite` |
| Icons | Lucide React |
| HTTP communication | Browser Fetch API |
| Code quality | Oxlint |
| Package manager | pnpm recommended; npm can also be used |

## Application Structure

```text
Frontend/
└── OCPI-PANEL-ashok/
    ├── public/                    # Public static assets, if present
    ├── src/
    │   ├── components/
    │   │   ├── ChargersView.jsx   # Charger list and filters
    │   │   ├── ComplaintsView.jsx # Complaints workspace
    │   │   ├── DashboardView.jsx  # Dashboard summary and visualizations
    │   │   ├── Header.jsx         # Shared top navigation
    │   │   ├── LocationsView.jsx  # Location list
    │   │   ├── ProfileView.jsx    # Company profile
    │   │   ├── ProtectedRoute.jsx # Route access guard
    │   │   ├── SessionsView.jsx   # Charging sessions
    │   │   ├── Sidebar.jsx        # Main application navigation
    │   │   └── TariffsView.jsx    # Tariff plan list and filters
    │   ├── pages/
    │   │   └── Login.jsx          # Login page
    │   ├── services/
    │   │   └── api.js             # Shared backend request helper
    │   ├── App.jsx                # App layout and route definitions
    │   ├── App.css                # Application-specific styles
    │   ├── index.css              # Global styles and Tailwind imports
    │   └── main.jsx               # React application entry point
    ├── .env                       # Local environment file; do not commit
    ├── index.html                 # Vite HTML entry point
    ├── package.json               # Scripts and dependencies
    ├── pnpm-lock.yaml             # pnpm dependency lockfile
    ├── package-lock.json          # npm dependency lockfile, if retained
    └── vite.config.js             # Vite configuration
```

Files and folders shown as conditional may vary by checkout. Do not commit generated output such as `dist/` or installed dependencies.

## Application Navigation

| Route | View | Purpose |
|---|---|---|
| `/login` | Login | Authenticate a user |
| `/` | Dashboard | View operational summaries |
| `/dashboard` | Redirect | Redirects to `/` |
| `/profile` | Profile | View company profile details |
| `/locations` | Locations | View location records |
| `/chargers` | Chargers | View charger records |
| `/tariffs` | Tariffs | View tariff plans |
| `/session` | Session | View charging sessions |
| `/sessions` | Redirect | Redirects to `/session` |
| `/complaints` | Complaints | View the complaints workspace |
| `/complanis` | Redirect | Legacy misspelled route redirected to `/complaints` |

All dashboard routes are nested beneath the protected route wrapper. Unknown protected routes redirect to the dashboard.

## Architecture and Data Flow

The frontend follows a component-and-service structure:

1. `main.jsx` mounts the React application and router.
2. `App.jsx` defines the shared application shell and route map.
3. `Sidebar.jsx` and `Header.jsx` provide common navigation and account controls.
4. Page components render the selected feature.
5. Components that need backend data call `apiRequest` from `src/services/api.js`.
6. The API helper sends HTTP requests to the configured backend origin and includes a bearer token from browser local storage when available.
7. The Express backend authenticates the request, authorizes access, and returns JSON.
8. The component handles the response and renders loading, error, empty, or populated states where implemented.

The frontend is not the security boundary. The backend must verify authentication and enforce company-level authorization for every protected resource.

## Prerequisites

Install the following before starting development:

- Node.js version compatible with the installed Vite release.
- pnpm (recommended) or npm.
- Access to the running backend API.
- An authorized development account and access to the approved development environment.

Check versions:

```bash
node --version
pnpm --version
```

## Environment Configuration

Create a `.env` file in `Frontend/OCPI-PANEL-ashok/`:

```env
VITE_API_URL=http://localhost:5000
```

`VITE_API_URL` is the base URL of the backend server. For example, if the API is hosted at `http://localhost:5000`, the API helper can request `/api/auth/login` and `/api/sessions` by appending those paths.

### Environment variable rules

- Set `VITE_API_URL` to the correct backend origin for the selected environment.
- Restart the Vite development server after changing environment variables.
- Do not add database credentials, JWT signing secrets, private API keys, or other server-side secrets to frontend environment variables.
- Vite variables prefixed with `VITE_` are exposed to browser-side code.
- Use HTTPS for deployed environments and configure the backend CORS policy for approved frontend origins.

## Installation

Open a terminal in the frontend directory:

```bash
cd Frontend/OCPI-PANEL-ashok
```

Install dependencies with pnpm:

```bash
pnpm install
```

Alternatively, if the project workflow uses npm:

```bash
npm install
```

Use one package manager consistently for a given working copy to avoid unnecessary lockfile changes.

## Running the Application

Start the Vite development server:

```bash
pnpm dev
```

Or with npm:

```bash
npm run dev
```

Vite prints the local development URL in the terminal, commonly `http://localhost:5173`.

The backend must be running separately and must be reachable at the URL configured in `VITE_API_URL`. A successful frontend start does not guarantee that API requests or database operations are working.

## Production Build and Preview

Create a production build:

```bash
pnpm build
```

Or:

```bash
npm run build
```

The generated static application is written to `dist/`.

Preview the production build locally:

```bash
pnpm preview
```

Run the code-quality check:

```bash
pnpm lint
```

Deployment should serve the generated frontend assets and route API requests to the correct backend. Configure the hosting platform, environment variables, HTTPS, and SPA fallback behavior according to the company's deployment environment.

## Authentication and Protected Routes

The login view calls `POST /api/auth/login`. On successful authentication, the frontend stores the returned token, user object, and a locally calculated expiry timestamp in browser local storage. The application checks this expiry and redirects to `/login` when the local expiry has elapsed.

Protected dashboard pages are wrapped by `ProtectedRoute.jsx`. The shared API helper reads the token from local storage and adds it to requests in the following header format:

```http
Authorization: Bearer <access-token>
```

The frontend's local expiry timestamp is a client-side convenience, not proof that a token is valid. The backend must verify the token on every protected request. Do not treat frontend route guards as a replacement for backend authorization.

The API logout endpoint and frontend logout behavior should be kept aligned: the frontend should clear stored authentication state, and any server-side token revocation behavior must be explicitly implemented by the backend if required.

## API Integration

The shared request helper is located at `src/services/api.js`. It:

- Reads `VITE_API_URL` from the Vite environment.
- Reads the token from local storage.
- Sends JSON requests and adds the bearer token when available.
- Parses the JSON response.
- Throws an error using the response message when the request is unsuccessful.

The frontend integrates with these backend endpoint families:

| Endpoint | Frontend usage |
|---|---|
| `POST /api/auth/login` | Login |
| `GET /api/companies/profile` | Company profile |
| `GET /api/locations` | Locations |
| `GET /api/chargers` | Chargers |
| `GET /api/tariffs` | Tariffs |
| `GET /api/sessions` | Charging sessions |

The dashboard may also display component-defined summary data, and the complaints view contains component-defined complaint records. Verify each component before treating those values as live backend data.

### Session list API example

The session view requests paginated data from the backend. A representative request is:

```http
GET /api/sessions?page=1&limit=25&search=LOC-201
Authorization: Bearer <access-token>
```

The backend is responsible for company scoping and any server-side filters. If a filter is implemented only against the current page in the browser, it will not reliably filter the complete result set. For filters that must work across all pages, send the selected values to the API and apply them on the server before pagination and total-count calculation.

## Page and Component Guide

### Login — `src/pages/Login.jsx`

Provides the sign-in form, email and password inputs, password visibility toggle, loading state, error display, and navigation after successful authentication.

### Dashboard — `src/components/DashboardView.jsx`

Provides the main operational overview, including summary cards and dashboard visualizations. Review the component data sources before using displayed totals as production reporting values.

### Locations — `src/components/LocationsView.jsx`

Retrieves locations from the backend and renders a searchable, paginated table/list with loading and error handling.

### Chargers — `src/components/ChargersView.jsx`

Retrieves charger data from the backend and presents search, pagination, and filter controls for charger-related attributes.

### Tariffs — `src/components/TariffsView.jsx`

Retrieves tariff data from the backend and presents tariff search, pagination, and filter controls.

### Sessions — `src/components/SessionsView.jsx`

Retrieves charging session data from the backend and presents a searchable, paginated sessions view. Additional filters should be connected to server-side query parameters to remain accurate across pages.

### Complaints — `src/components/ComplaintsView.jsx`

Provides the complaints workspace and related interface controls. Complaint records are defined in the frontend component in the current codebase; backend persistence and live synchronization should not be assumed.

### Profile — `src/components/ProfileView.jsx`

Retrieves company profile data from the backend and presents loading, error, and profile states.

### Header and Sidebar

- `Header.jsx` provides shared top-bar controls, account actions, and notifications/menu interactions.
- `Sidebar.jsx` provides the primary navigation links and responsive sidebar behavior.

### ProtectedRoute — `src/components/ProtectedRoute.jsx`

Provides the frontend route guard for authenticated areas. It complements, but does not replace, backend authorization.

### API service — `src/services/api.js`

Centralizes request configuration, token attachment, response parsing, and API error handling.

## Styling and UI

Global styling and Tailwind integration are defined in `src/index.css` and `src/App.css`. The interface uses Tailwind CSS utility classes and Lucide React icons. Shared navigation is maintained in the header and sidebar components, while feature-specific markup and interactions are maintained in each view component.

When changing the UI:

- Preserve consistent spacing, typography, colors, and interaction patterns.
- Include loading, error, empty, and populated states for API-driven views.
- Keep responsive layouts usable at desktop and mobile widths.
- Ensure controls have real handlers and clear feedback.
- Avoid placing server secrets or authorization logic in client-side code.

## Troubleshooting

### API requests fail or return network errors

- Confirm the backend is running.
- Check `VITE_API_URL` and restart Vite after editing `.env`.
- Inspect the browser Network panel and console for the failed URL and response.
- Confirm the backend CORS configuration allows the frontend origin.

### API responds with `401 Unauthorized`

- Sign in again to obtain a valid token.
- Check that the request includes the bearer token.
- Confirm the token has not expired and that backend signing and verification configuration is consistent.
- Never copy live tokens into documentation or shared logs.

### A page shows no records

- Verify that the selected environment points to the intended backend.
- Confirm that the authenticated account has access to the expected company data.
- Check the API response in the browser Network panel.
- Verify that records exist and have the required relationships in the configured database.

### Changes to `.env` do not take effect

- Confirm the `.env` file is in the frontend project directory.
- Ensure the variable begins with `VITE_` if it must be available to Vite client code.
- Restart the development server.

### Build or lint fails

- Confirm the Node.js version is compatible with the installed Vite version.
- Install dependencies using the selected package manager.
- Review the terminal output for the first underlying error.
- Do not commit generated build output or local dependency folders.

## Development Guidelines

- Keep API calls in the shared service or follow the existing service pattern.
- Use parameterized server-side queries through the backend; never connect directly to MySQL from the browser.
- Keep company-level access enforcement on the backend.
- Validate and normalize filter input before sending it to the API and again on the server.
- Keep pagination state and active filter state synchronized.
- Display useful error messages without exposing secrets or internal stack traces.
- Add or update tests when adding substantial behavior.
- Run `pnpm lint` and `pnpm build` before submitting frontend changes.
- Review changes to package manifests and lockfiles before committing.

## Security and Confidentiality

- Never commit `.env` files, credentials, access tokens, database exports, or private keys.
- Never expose backend signing secrets or database connection details in `VITE_*` variables.
- Do not log authentication tokens or sensitive customer information.
- Use approved development and production environments.
- Ensure all protected data is authorized and scoped by the backend.
- Restrict deployment access and source-code access to authorized personnel.

## Ownership and Usage

This frontend, its source code, assets, and documentation are proprietary and confidential to EcoPlug Energy Limited, subject to applicable company agreements and policies.

This repository is **not open source**. This README does not grant permission to publish, redistribute, sublicense, or use the software outside authorized company work. Do not add an open-source license or publish the repository publicly unless formally authorized by the company.
