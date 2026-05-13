# Electricity Planner (Frontend)

React + Vite frontend for the LANACO practical assignment.

## Requirements

- Node.js + npm
- Backend running (see `Full_Application/backend/ElectricityPlanner.Api`)

## Configure environment

Create `.env` in this `frontend/` folder:

```env
VITE_API_URL=http://localhost:5226
# Optional:
VITE_CURRENCY=BAM
```

Use the same base URL as your API (no trailing slash). For local `dotnet run`, the API often uses **HTTP** on port **5226** or **HTTPS** on **7184**—check `Properties/launchSettings.json` on the backend.

Restart the dev server after changing `.env`.

## Run locally

```bash
npm install
npm run dev
```

The app is served at **http://localhost:5173** (Vite default). The backend must allow this origin in CORS (already configured in the API for dev).

## Build

```bash
npm run build
npm run preview   # optional: test production build locally
```

## Authentication

- **`/login`** — sign in with a backend user (e.g. seeded `admin` / `user`). The JWT is stored in the browser and sent on API requests that need it.
- **Admin routes** (`/admin/*`) require the **Admin** role; others are redirected to login.

## Pages

| Path | Description |
|------|-------------|
| `/` | Recommendation form, plan comparison, optional **send recommendation by email** (needs SMTP on the API—see backend README). |
| `/login` | Sign in |
| `/admin/tax-groups` | Tax groups (CRUD) |
| `/admin/plans` | Plans (CRUD) |
| `/admin/analytics` | Plan selection analytics (charts; **Admin** only) |

## Localization and theme

- **Language:** English / Serbian (`react-i18next`); switcher in the app menu / header area.
- **Theme:** light / dark / system (`next-themes`).
