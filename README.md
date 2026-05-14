# SOC Alerts Dashboard

A single-user SOC dashboard for monitoring and acting on security alerts. The dashboard surfaces alert volume by severity, category, and status; the alerts list supports filtering, search, sorting, and pagination; the detail page lets an analyst update status, severity, and assignee, or dismiss an alert as a false positive.

## Tech stack

- **Frontend** — React 19, Vite, TypeScript, Tailwind CSS, TanStack Query, Zustand, Recharts
- **Backend** — Node.js, Express 5, TypeScript, better-sqlite3
- **Auth** — JWT (24h) with bearer token in `Authorization` header

## Local setup

Clone the repo and run the following in two terminals:

```bash
# Terminal 1 — backend
cd backend
npm install            # also seeds alerts.db if it doesn't exist
npm run dev            # http://localhost:5000

# Terminal 2 — frontend
cd frontend
npm install
npm run dev            # http://localhost:5173
```

`npm install` in `backend/` automatically runs the seed (1000 sample alerts + the demo user) if `alerts.db` is missing. To force a reseed, delete `backend/alerts.db` and run `npm run seed`.

Create a `.env` file in `backend/` with at least:

```
JWT_SECRET=<any-long-random-string>
```

A reference `backend/.env.example` is included.

## Demo credentials

- Email: `analyst@soc.local`
- Password: `analyst123`

## Deployment

Deployed URL: [SOC ALerts Dashboard](https://soc-alerts-dashboard.onrender.com/)

The repo root `package.json` exposes a single-service `build` + `start` flow suitable for platforms like Render, Railway, or Fly:

```bash
npm run build          # installs and builds frontend + backend
npm start              # serves the compiled backend on $PORT (default 5000)
```

In production (`NODE_ENV=production`), the Express server serves the built frontend from `frontend/dist` and falls through to `index.html` for any non-`/api` route, so client-side routing works on direct URLs.

Required env vars in production:

- `JWT_SECRET` — secret used to sign JWTs
- `NODE_ENV=production`
- `PORT` — optional, defaults to `5000`
