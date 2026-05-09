# Electricity Planner (Frontend)

React + Vite frontend for the LANACO practical assignment.

## Requirements

- Node.js + npm
- Backend running (see `Full_Application/backend/ElectricityPlanner.Api`)

## Configure environment

Create `.env` in this `frontend/` folder:

```env
VITE_API_URL=https://localhost:xxxx
# Optional:
VITE_CURRENCY=BAM
```

Restart the dev server after changing `.env`.

## Run locally

```bash
npm install
npm run dev
```

## Pages

- `/` recommendation form + plan comparison
- `/admin/tax-groups` manage tax groups (CRUD)
- `/admin/plans` manage plans (CRUD)

