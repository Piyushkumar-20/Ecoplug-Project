# Ecoplug Backend

## Company → Admin → Employees flow

### 1. Register a company

`POST /api/companies/register`

```json
{
  "name": "ABC Energy",
  "adminName": "Rahul Kumar",
  "adminEmail": "rahul@abc.com",
  "adminPassword": "Admin@123",
  "confirmPassword": "Admin@123"
}
```

The backend creates:
- one row in `companies`
- one row in `company_users` with `role = ADMIN`
- a bcrypt password hash

The operation uses a MySQL transaction, so company and admin creation succeed or fail together.

### 2. Login

`POST /api/auth/login`

```json
{
  "email": "rahul@abc.com",
  "password": "Admin@123"
}
```

The JWT contains the authenticated user's:
- `userId`
- `companyId`
- `role`

### 3. Admin creates employees

`POST /api/users`

Header:

`Authorization: Bearer <admin-token>`

Body:

```json
{
  "name": "Employee One",
  "email": "employee@abc.com",
  "password": "Employee@123"
}
```

The frontend does **not** send `company_id`. The backend takes the company ID from the authenticated admin's JWT and always creates the employee inside that company.

Employees use the same `/api/auth/login` endpoint with their email/password. Their `role` is `EMPLOYEE`.

### 4. Admin lists employees

`GET /api/users`

Header:

`Authorization: Bearer <admin-token>`

Only an authenticated `ADMIN` can use this endpoint, and results are limited to the admin's company.

## Existing database requirement

This backend expects the existing MySQL `company_users` table with at least:

- `id`
- `company_id`
- `name`
- `email`
- `password_hash`
- `role`
- `created_at`
- `updated_at`

No separate employee authentication table is required.
