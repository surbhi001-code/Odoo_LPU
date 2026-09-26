# StockSense

Inventory management frontend built with React, React Router, Vite, Tailwind CSS v4, and Lucide icons. Frontend code lives directly in `StockSense/client/`. No backend is implemented.

## Styling and sign-in

Component styling lives in JSX as Tailwind utility classes, including responsive, hover, focus, dialog-backdrop, and state styles. `src/styles/index.css` contains only the Tailwind import, the Inter font theme, and shared HTML element defaults; there are no custom component CSS rules. Shared controls use complete literal utility variants so Tailwind can discover them at build time.

Use **Sign in** in the workspace topbar or open `/auth/login`. Sign-up and OTP reset screens are linked from there. Password visibility toggles and native form validation work locally. Authentication itself remains disconnected until the backend is implemented.

## Run locally

```powershell
cd StockSense/client
npm install
npm run dev
```

Open the address printed by Vite. `npm run build` and `npm run lint` work from this project root. `npm run preview` serves a production build.

## Structure

```text
StockSense/
└── client/
    ├── public/data/workspace.json
    ├── src/
    │   ├── app/
    │   ├── components/
    │   │   ├── layout/
    │   │   ├── ui/
    │   │   └── forms/
    │   ├── features/
    │   │   ├── auth/
    │   │   ├── dashboard/
    │   │   ├── products/
    │   │   ├── operations/
    │   │   ├── warehouses/
    │   │   └── movements/
    │   ├── lib/
    │   ├── styles/
    │   └── main.jsx
    ├── package.json
    ├── package-lock.json
    ├── vite.config.js
    ├── README.md
    └── .gitignore
```

Backend implementation is deferred.

## Screens and behavior

- Overview: KPIs, setup checklist, quick actions, filters by type/status/warehouse/category, stock watch, recent movements.
- Products: create/edit, SKU search, category/status filters, reorder levels, per-warehouse availability.
- Warehouses: create/edit names, unique codes, and locations.
- Operations: multi-product receipt, delivery, transfer, and physical-count adjustment forms. Draft → Waiting → Ready → Done; unfinished operations may be canceled. Delivery readiness represents picking/packing.
- Validation updates stock and ledger atomically in the local adapter. Insufficient stock blocks delivery/transfer. Transfers preserve total quantities. Adjustments replace warehouse quantities with physical counts and log differences.
- Move history: search, type/warehouse filters, JSON export. Profile also exports the entire workspace.
- Authentication: sign-in, sign-up, and OTP reset interfaces only. They do not authenticate, send email, save passwords, or create sessions. The workspace is directly accessible during frontend development. Logout requires a real session and is deferred.
- Responsive navigation, native keyboard-accessible dialogs, loading/error states, empty states, and no-result states.

## JSON data without dummy inventory

`public/data/workspace.json` starts with empty collections. No invented business records are shown.

`src/lib/apiClient.js` fetches the initial JSON. User-created records are saved as JSON in browser localStorage under `stocksense.workspace.v1`. Components use a shared provider instead of reading files or storage directly. Browser writes do not modify the source JSON file.

Saved browser data takes precedence over the initial file. Export before clearing storage. To reload an updated initial JSON file, remove only `stocksense.workspace.v1` in browser developer tools and refresh. Local persistence is for frontend development; it does not provide multi-user transactions or server-side security.

## Backend contract

Copy `.env.example` to `.env.local`, set `VITE_DATA_SOURCE=api` and `VITE_API_BASE_URL`, then restart Vite. Endpoints must exist before switching. Requests include cookie credentials; backend CORS/session configuration remains to be implemented.

| Method | Endpoint                     | Request                                                                |
| ------ | ---------------------------- | ---------------------------------------------------------------------- |
| GET    | `/api/workspace`             | Returns complete workspace object                                      |
| POST   | `/api/products`              | name, sku, category, unit, reorderLevel, initialStock, warehouseId     |
| PATCH  | `/api/products/:id`          | id, name, sku, category, unit, reorderLevel                            |
| POST   | `/api/warehouses`            | name, code, location                                                   |
| PATCH  | `/api/warehouses/:id`        | id, name, code, location                                               |
| POST   | `/api/operations`            | type, partner, warehouseId, destinationId, scheduledDate, notes, lines |
| PATCH  | `/api/operations/:id/status` | id, status                                                             |

Mutations return JSON (for example `{ "ok": true }`), then the adapter refreshes the workspace. Non-2xx errors return `{ "message": "Readable error" }`. Pages stay unchanged if the backend follows this contract; otherwise adapt `apiClient.js`. Auth needs a separate integration.

Workspace response:

```json
{
  "version": 1,
  "products": [],
  "warehouses": [],
  "operations": [],
  "movements": []
}
```

Record fields:

- Product: `id`, `name`, `sku`, `category`, `unit`, numeric `reorderLevel`, `stock` object mapping warehouse IDs to numeric quantities.
- Warehouse: `id`, `name`, `code`, `location`.
- Operation: `id`, `reference`, `type` (Receipt/Delivery/Transfer/Adjustment), `status` (Draft/Waiting/Ready/Done/Canceled), `warehouseId`, `destinationId`, `partner`, `scheduledDate` (YYYY-MM-DD), `createdAt` (ISO), `notes`, `lines` (`productId`, numeric `quantity`). Adjustment quantity is the physical count.
- Movement: `id`, `productId`, numeric `quantity`, `from`, `to`, `reference`, `type`, `createdAt` (ISO). Transfer/delivery quantity is the amount moved; adjustment quantity is signed. `from`/`to` are warehouse IDs or external partner labels.

The backend must enforce authentication, authorization, input validation, duplicate-validation protection, and transactional stock/ledger updates independently. The local reducer is not run in API mode. Dashboard values derive from workspace data; dedicated analytics endpoints can be added later.

BrowserRouter deployments require an SPA fallback to `index.html`. Google Fonts is optional; system fonts work offline. The PDF's Excalidraw link was inaccessible, so the visual design follows the written requirements.
