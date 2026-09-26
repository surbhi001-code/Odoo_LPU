# StockSense client

React, React Router, Vite and Tailwind CSS v4 frontend. The existing Express backend is at the repository root in `backend/`.

## Run

```powershell
cd StockSense/client
npm install
npm run dev
```

Set `VITE_API_BASE_URL=http://localhost:3000/api/v1` in the frontend environment. Use `http://localhost:5173` with backend `CLIENT_URL=http://localhost:5173` so CORS and cookie hosts match. Restart Vite after changing environment variables.

All pages now use the backend. `VITE_DATA_SOURCE` is no longer used. Old `stocksense.workspace.v1` localStorage data and `public/data/workspace.json` are not read or migrated automatically. Backend errors never fall back to local inventory.

Login/signup set an HttpOnly token cookie; requests send cookie credentials. Browser sessionStorage holds only user metadata, not a password or JWT. Protected routes verify the server session with `/auth/me`; profile changes refresh the displayed user. Email changes require the current password and cannot change roles. The workspace waits for sign-in before loading, discards canceled requests and isolates data between sessions. A 401 prompts another sign-in. Production requires matching HTTPS/cookie/CORS configuration.

## Connected UI

| UI | Backend source |
| --- | --- |
| Login, signup, forgot/reset password, logout, current user and profile edit | `/auth/*`, `GET/PATCH /auth/me` |
| Dashboard KPIs and document filters | `/dashboard/kpis`, `/dashboard/documents` |
| Products, categories and reorder settings | `/products`, `/categories` |
| Stock totals and per-location quantities | `/stock/inventory` |
| Warehouse create/edit, location list/add/edit/delete | `/warehouses`, `/warehouses/:id/locations`, `/warehouses/locations/:locationId` |
| Receipts, deliveries, transfers, adjustments | `/operations`, `/operations/:id` |
| Confirm/ready, validate, cancel | `PATCH /operations/:id`, `POST /operations/:id/validate`, `POST /operations/:id/cancel` |
| Movement history and export | `/stock/ledger` |
| Shared search, header stock alerts, workspace export | Loaded server records |

Products, operations, inventory and ledger are fetched through every API page before shared filters/search/counts run. This avoids truncating records at the API's default page size. The shared workspace refreshes on page navigation and after successful writes. This approach loads the complete workspace; very large datasets will benefit from per-page server queries later.

Dashboard retains its paginated API list. Its warehouse filter checks both ends of a document in the frontend because the existing backend filter only checks the source. Dashboard mutations also refresh shared data.

Products can include opening stock and a storage location. Product, validated opening receipt, inventory balance and ledger entry are saved atomically. A failure rolls back all of them; later stock changes use receipts or adjustments. Product category text selects an existing category or creates one through the category API. Warehouse addresses and storage locations are separate. Operations explicitly select locations, including same-warehouse transfers between racks. Ledger rows display signed changes and balance after at each location; a transfer has separate outgoing/incoming entries.

Manager/admin controls enable product/warehouse editing and operation validation. Warehouse staff can view catalog/storage and create/process operations until validation; backend permissions are authoritative.

## Profile, locations and operation editing

- `GET /auth/me` returns only public profile fields. `PATCH /auth/me` accepts name/email; email changes require `currentPassword`. Password hashes, OTPs and role updates are never exposed through this route.
- `PATCH /warehouses/locations/:locationId` updates name/code for managers/admins, preserving location identity, warehouse membership, quantities and history.
- `POST /products` accepts `initial_stock` and `location_id` on creation. Positive opening stock is recorded as a completed receipt owned by the signed-in manager. Zero opening stock needs no location or movement.
- Operations store notes and support replacing product lines before completion. Editing lines/locations returns the document to draft. Completed/canceled documents cannot be edited. Updates, cancellation and validation lock the document and use transactions; line replacement failures preserve previous lines. Only validate/cancel endpoints can finalize documents.
- Quantity inputs accept up to two decimal places, matching stored balances. Transfers require distinct locations; duplicate product lines are rejected.

For an existing database, apply the additive, repeatable notes migration before deploying the updated API:

```powershell
node backend/scripts/migrate-document-notes.js
```

The script adds only the nullable `documents.notes` column if absent; existing records are preserved. The local schema was checked successfully.

Remaining existing limitations: the backend warehouse-document filter checks only the source (the frontend compensates for both ends); location deletion rejects any inventory row, including zero balances. These behaviors were not changed in this feature update. Product/category/warehouse delete and category rename routes exist, but separate management screens were not added where the original UI had none.

## Validation

`npm run lint` and `npm run build` run from this directory. Browser checks use temporary intercepted API responses. Real HTTP/MySQL transaction checks verified profile permissions, location rename, opening-stock ledger creation, rollback on failure, line replacement, notes and completed-document protection; all test records were rolled back. A combined browser-to-MySQL run was not performed because automatic approval review rejected it. Live email delivery was not tested.

Styling uses Tailwind utility classes. BrowserRouter deployment needs an SPA fallback to `index.html`.

## Account roles

Public signup always creates `warehouse_staff`, regardless of any role sent by the client. Existing request middleware reloads the active account from the database and enforces the current database role, rather than trusting the JWT role or browser storage.

| Action | Warehouse Staff | Inventory Manager | Administrator |
| --- | --- | --- | --- |
| Read dashboard/catalog/stock/history | Yes | Yes | Yes |
| Create/edit products, warehouses, categories and locations | No | Yes | Yes |
| Create/edit pending operations, confirm, ready, cancel | Yes | Yes | Yes |
| Validate operations and apply stock changes | No | Yes | Yes |
| Assign staff/manager roles | No | No | Yes |

Administrators have a **Team access** section on My profile: find an active account by exact email, review the account and choose Warehouse Staff or Inventory Manager, then save. `GET /auth/users?email=...` and `PATCH /auth/users/:id/role` are admin-only. Self/admin roles cannot be changed through these endpoints, and the ordinary profile endpoint rejects role changes. Users see their role in My profile and the profile menu; permissions refresh when navigating or returning to the tab.

A trusted server operator can provision the first administrator or a named manager account using an explicit email and role. This tool never creates users, updates only the matched active account, and will not demote an administrator:

```powershell
node backend/scripts/set-user-role.js --email person@example.com --role admin
node backend/scripts/set-user-role.js --email person@example.com --role inventory_manager
```

Do not expose this operator command as a public signup option. These roles control actions across the shared inventory; warehouse assignments/data scoping are not implemented.
