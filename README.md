# StockSense

Inventory workspace for products, warehouses, stock operations, and movement history. Frontend and backend are fully separated. The browser never talks to MySQL directly.

## Architecture

```
Browser
  ↓
Vite + React Frontend (:5173)
  ↓ REST + HttpOnly cookie (credentials: include)
Express Backend (:3000)  /api/v1
  ↓ Sequelize
MySQL (:3306)
```

## Auth Model

```
Shared inventory workspace
    ↓
Users
    ↓
Roles: admin | inventory_manager | warehouse_staff
```

Public signup always creates `warehouse_staff`. The client cannot pick a higher role. Middleware reloads the active user from the database and uses the current DB role — it does not trust a role stored in the browser.

| Action | Warehouse Staff | Inventory Manager | Administrator |
| --- | --- | --- | --- |
| Read dashboard, catalog, stock, history | Yes | Yes | Yes |
| Create/edit products, warehouses, categories, locations | No | Yes | Yes |
| Create/edit pending operations, confirm, ready, cancel | Yes | Yes | Yes |
| Validate operations and apply stock changes | No | Yes | Yes |
| Assign staff/manager roles | No | No | Yes |

## Authentication Flow

```
Register / Login / Forgot password
      ↓
Frontend (AuthPage)
      ↓
API client (features/auth/api.js)
      ↓
POST /api/v1/auth/signup | /login | /forgot-password | /reset-password
      ↓
Auth Controller → Auth Service
      ↓
User model (Sequelize)
      ↓
MySQL
      ↓
JWT issued and stored as an HttpOnly cookie
      ↓
sessionStorage keeps only public user fields (id, name, email, role)
      ↓
Redirect to the workspace
```

### Cookie + session flow

```
Cookie: token=<jwt>
      ↓
auth.middleware.js
      ↓
verify JWT, load user from MySQL
      ↓
req.user attached
      ↓
Protected route handler
```

JWT is used only as a signed session token. Passwords and OTPs are never stored in the browser. `GET /auth/me` returns public profile fields only.

### Logout (stateless JWT)

- `POST /api/v1/auth/logout` clears the HttpOnly cookie.
- Frontend also clears `sessionStorage`.
- Without a token blocklist, a leaked JWT stays valid until expiry. That is the trade-off of this setup.

Frontend (`:5173`) and backend (`:3000`) are different origins. CORS is locked to `CLIENT_URL` with `credentials: true` so the cookie can be sent. Production needs matching HTTPS, cookie, and CORS settings.

## Project Structure

```
Odoo_LPU/
├── backend/                 # Express + Sequelize + MySQL
│   ├── src/
│   │   ├── app.js
│   │   ├── server.js
│   │   ├── config/
│   │   ├── database/models/
│   │   ├── middleware/
│   │   ├── modules/         # auth, products, categories, warehouses, stock, operations, dashboard, users
│   │   ├── routes/
│   │   └── utils/
│   └── package.json
├── StockSense/client/       # Vite + React + Tailwind
│   └── src/
│       ├── app/
│       ├── components/
│       ├── features/
│       └── lib/
└── README.md
```

## Prerequisites

- Node.js 20+
- npm
- MySQL with a database (default name: `Stock`)

## Quick Start (Local Development)

### 1. MySQL

Create the `Stock` database. Tables are created/updated on backend start with `sequelize.sync({ alter: true })` in development.

### 2. Backend

```powershell
cd backend
copy .env.example .env   # or create .env from the table below
npm install
npm run dev
```

API: `http://localhost:3000` (set `PORT=3000` in `.env`; if unset the server falls back to `5000`)  
Health: `GET /` → `{ "success": true, "message": "StockSense API is running" }`  
There is no `backend/.env.example` yet — copy the backend table below into `.env`.

### 3. Frontend

```powershell
cd StockSense/client
copy .env.example .env
npm install
npm run dev
```

App: `http://localhost:5173`  
Workspace opens at `/auth/login` until a valid session exists.

Restart Vite after changing frontend env vars.

## Frontend Routes

| Path | Page |
| --- | --- |
| `/auth/login` | Sign in |
| `/auth/signup` | Create account |
| `/auth/reset` | Forgot / reset password |
| `/` | Inventory overview |
| `/products` | Products |
| `/warehouses` | Warehouses and locations |
| `/operations/receipts` | Receipts |
| `/operations/deliveries` | Delivery orders |
| `/operations/transfers` | Internal transfers |
| `/operations/adjustments` | Stock adjustments |
| `/movements` | Movement history |
| `/profile` | My profile and team access (admin) |

## API Endpoints

Base path: `http://localhost:3000/api/v1`

### Auth

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| POST | `/auth/signup` | No | Create user (`warehouse_staff`) |
| POST | `/auth/login` | No | Login, set token cookie |
| POST | `/auth/logout` | No | Clear token cookie |
| POST | `/auth/forgot-password` | No | Send / generate OTP |
| POST | `/auth/reset-password` | No | Reset password with OTP |
| GET | `/auth/me` | Yes | Current user |
| PATCH | `/auth/me` | Yes | Update name/email (`currentPassword` required for email) |
| GET | `/auth/users?email=` | Admin | Find account by exact email |
| PATCH | `/auth/users/:id/role` | Admin | Set `warehouse_staff` or `inventory_manager` |

### Profile (users module)

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| GET | `/users/me` | Yes | Profile |
| PATCH | `/users/me` | Yes | Update profile |
| PATCH | `/users/me/password` | Yes | Change password |

### Catalog and storage

| Method | Endpoint | Roles | Description |
| --- | --- | --- | --- |
| GET | `/products` | Signed-in | List products |
| GET | `/products/:id` | Signed-in | Product detail + inventory |
| POST / PATCH / DELETE | `/products` | Manager, Admin | Create / update / deactivate |
| GET | `/categories` | Signed-in | List categories |
| POST / PATCH / DELETE | `/categories` | Manager, Admin | Manage categories |
| GET | `/warehouses` | Signed-in | List warehouses + locations |
| POST / PATCH / DELETE | `/warehouses` | Manager, Admin | Manage warehouses |
| GET | `/warehouses/:id/locations` | Signed-in | Locations in a warehouse |
| POST | `/warehouses/:id/locations` | Manager, Admin | Add location |
| PATCH / DELETE | `/warehouses/locations/:locationId` | Manager, Admin | Edit / delete location |

### Stock, operations, dashboard

| Method | Endpoint | Roles | Description |
| --- | --- | --- | --- |
| GET | `/stock/inventory` | Signed-in | On-hand balances |
| GET | `/stock/ledger` | Signed-in | Movement history |
| GET | `/stock/low-stock` | Signed-in | Reorder alerts |
| GET | `/operations` | Signed-in | Documents (`type`, `status`, `warehouse_id`) |
| GET | `/operations/:id` | Signed-in | Single document |
| POST | `/operations` | Signed-in | Create draft |
| PATCH | `/operations/:id` | Signed-in | Edit draft / pending lines |
| POST | `/operations/:id/validate` | Manager, Admin | Apply stock |
| POST | `/operations/:id/cancel` | Signed-in | Cancel document |
| GET | `/dashboard/kpis` | Signed-in | Overview counts |
| GET | `/dashboard/documents` | Signed-in | Filtered recent documents |

Document types: `RECEIPT`, `DELIVERY`, `TRANSFER`, `ADJUSTMENT`  
Statuses: `DRAFT`, `WAITING`, `READY`, `DONE`, `CANCELED`

Stock changes only after validation. Drafts do not move inventory.

## Example: Signup

```powershell
curl -X POST http://localhost:3000/api/v1/auth/signup `
  -H "Content-Type: application/json" `
  -d "{\"name\":\"Test User\",\"email\":\"you@company.com\",\"password\":\"password123\"}"
```

## Example: Login

```powershell
curl -X POST http://localhost:3000/api/v1/auth/login `
  -H "Content-Type: application/json" `
  -c cookies.txt `
  -d "{\"email\":\"you@company.com\",\"password\":\"password123\"}"
```

## Example: Current user

```powershell
curl http://localhost:3000/api/v1/auth/me -b cookies.txt
```

## Example: List products

```powershell
curl http://localhost:3000/api/v1/products -b cookies.txt
```

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Example |
| --- | --- | --- |
| `NODE_ENV` | Runtime environment | `development` |
| `PORT` | API port | `3000` |
| `DB_NAME` | MySQL database | `Stock` |
| `DB_USER` | MySQL user | `root` |
| `DB_PASS` | MySQL password | your password |
| `DB_HOST` | MySQL host | `localhost` |
| `DB_PORT` | MySQL port | `3306` |
| `CLIENT_URL` | Allowed frontend origin | `http://localhost:5173` |
| `JWT_SECRET` | JWT signing secret | strong random string |
| `JWT_EXPIRES_IN` | Token expiry | `7d` |
| `SMTP_HOST` | Mail host (optional) | `smtp.gmail.com` |
| `SMTP_PORT` | Mail port | `587` |
| `SMTP_USER` | Mail user | your email |
| `SMTP_PASS` | Mail app password | app password |

If SMTP is not set, forgot-password still saves an OTP and logs it in the backend console.

### Frontend (`StockSense/client/.env`)

| Variable | Description | Example |
| --- | --- | --- |
| `VITE_API_BASE_URL` | Backend API base | `http://localhost:3000/api/v1` |

## Scripts

### Backend

| Command | Description |
| --- | --- |
| `npm run dev` | Dev server with file watch |
| `npm start` | Run `src/server.js` |
| `node scripts/set-user-role.js --email person@example.com --role admin` | Promote an existing user |
| `node scripts/migrate-document-notes.js` | Add `documents.notes` if missing |

Do not expose `set-user-role.js` as a public signup option.

### Frontend

| Command | Description |
| --- | --- |
| `npm run dev` | Vite dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | ESLint |

## Domain Notes

- **Internal transfer** moves stock between locations. Total quantity stays the same.
- **Stock adjustment** sets recorded quantity to the counted quantity. Total stock can go up or down.
- Opening stock on product create is stored as a completed receipt when quantity is positive.
- Completed or canceled documents cannot be edited.
- Warehouse document filters on the backend check the source location; the dashboard also matches the destination in the UI.

## What's Next

- Per-page server queries for large catalogs instead of loading the full workspace
- Warehouse-scoped users (data isolation by location)
- Token blocklist or refresh tokens
- Dedicated category management screens
- Automated browser-to-MySQL test suite
