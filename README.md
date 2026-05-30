# Product Intelligence Dashboard — Frontend

React + Vite frontend for the **Product Intelligence Dashboard for E-commerce Sellers**
(Quantacus intern assignment).

A Flipkart seller can upload a product video (or CSV), review extracted/entered product data,
see listing-quality issues and an overall quality score, generate enhanced titles, compare
competitor prices, and track processing jobs and alerts — all from a clean dashboard UI.

> **Backend repo:** https://github.com/SaxenaAarohi/Quantcus_backend
> The frontend is a pure SPA that talks to the backend REST API over `fetch`.

---

## Table of Contents
- [Tech Stack](#tech-stack)
- [Screens](#screens)
- [How to Run Locally](#how-to-run-locally)
- [Environment Variables](#environment-variables)
- [How to Use the Deployed App](#how-to-use-the-deployed-app)
- [Project Structure](#project-structure)
- [API It Consumes](#api-it-consumes)
- [What is Real vs Mocked](#what-is-real-vs-mocked)
- [Assumptions](#assumptions)
- [Trade-offs & Limitations](#trade-offs--limitations)
- [What I Would Improve With More Time](#what-i-would-improve-with-more-time)
- [Deployment](#deployment)
- [Deployment Links](#deployment-links)

---

## Tech Stack

| Concern | Tech |
|---------|------|
| Framework | React 18 |
| Build tool | Vite 5 |
| Routing | React Router DOM v6 |
| Styling | Tailwind CSS 3 (custom component classes + a CSS shimmer) |
| Charts | Recharts |
| Icons | Hand-written inline SVG (no icon library) |
| Data fetching | Native `fetch` (thin wrapper in `src/services/api.js`) |

No Next.js, Redux, or component libraries — kept minimal and readable.

---

## Screens

| Route | Screen | What it shows |
|-------|--------|---------------|
| `/` | **Quality Dashboard** | Catalog quality score, total SKUs, fault counts, category & severity charts, flagged-listings table. Shimmer skeleton while loading. |
| `/upload` | **Import Listings** | Video upload + title-enhancement toggle, fallback product CSV, competitor-price CSV. Auto-scrolls to the result. |
| `/products` | **Ecomm Inventory** | Product table with search + category / severity / stock filters. Shimmer skeleton while loading. |
| `/products/:skuId` | **Product Detail** | Editable product data, listing issues, enhanced title generator, competitor-price comparison + refresh. |
| `/alerts` | **Seller Alerts** | Alert history with severity filter and acknowledge/snooze. |
| `/jobs` | **Job History** | Job list with status, progress bar, timestamps, and error details. Auto-polls every 3s. |

---

## How to Run Locally

**Prerequisites:** Node.js 18+ and the backend running (see the backend repo).

```bash
cd client
npm install
cp .env.example .env          # set VITE_API_URL if your API isn't on localhost:5000
npm run dev                   # starts the UI on http://localhost:5173
```

Open http://localhost:5173. If the backend was seeded, the dashboard is populated immediately.

### npm scripts
| Script | Action |
|--------|--------|
| `npm run dev` | Start the Vite dev server (HMR) |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview the production build locally |

---

## Environment Variables

`client/.env` (see `.env.example`):

```
VITE_API_URL=http://localhost:5000/api
```

- Defaults to `http://localhost:5000/api` if unset.
- For a deployed build, set it to your backend URL, e.g.
  `VITE_API_URL=https://your-backend.onrender.com/api`.
- Vite inlines `VITE_*` vars at **build time**, so set it before `npm run build` / in your host's env.

---

## How to Use the Deployed App

1. Open the deployed frontend URL.
2. Go to **Import Listings** → upload a short video (creates a draft to complete) **or** import
   the sample product CSV from the backend repo's `sample-data/`.
3. Open **Ecomm Inventory** → click **Inspect** on a product to edit details, view issues,
   generate an enhanced title, and compare competitor prices (use **Refresh Prices**).
4. Check **Seller Alerts** and **Job History** to see alerts and job progress.
5. Use **Audit Market Prices** (sidebar) to refresh competitor prices across all products.

---

## Project Structure

```
client/
├── index.html
├── vite.config.js  tailwind.config.js  postcss.config.js
├── .env.example
└── src/
    ├── main.jsx
    ├── App.jsx                 # routes
    ├── index.css               # Tailwind + component classes + .shimmer keyframe
    ├── components/             # Layout (sidebar), Badge, StatCard, Spinner (+ shimmer skeletons), icons
    ├── pages/                  # Dashboard, Upload, Products, ProductDetail, Alerts, Jobs
    ├── services/api.js         # fetch wrapper + endpoint map
    └── utils/format.js         # price/date/colour helpers
```

---

## API It Consumes

All calls go through `src/services/api.js` (base URL = `VITE_API_URL`). Key endpoints:
`/upload-video`, `/upload-products-csv`, `/jobs`, `/products`, `/products/:skuId`,
`/products/:skuId/enhance-title`, `/products/:skuId/competitor-prices`,
`/competitor-prices/upload`, `/competitor-prices/refresh`, `/dashboard/summary`, `/alerts`.
See the backend repo for full API documentation.

---

## What is Real vs Mocked

The UI is fully real; the mocking lives in the backend:
- **Video extraction** is mocked — uploading a video creates a **blank draft** product that you
  complete on the detail page (no OCR/AI).
- **Competitor prices** are mocked (generated) or uploaded via CSV.
- Everything else (validation, scoring, jobs, alerts, comparison) reflects real backend logic.

---

## Assumptions

- The seller's own platform is **Flipkart**; other platforms are competitors.
- One backend instance, single seller — no auth or multi-tenant UI.
- Alert acknowledge/snooze is a **client-side** convenience (local state), not persisted.
- The UI expects the backend's response shapes documented in the backend repo.

---

## Trade-offs & Limitations

- `VITE_API_URL` is baked in at build time, so changing the backend URL needs a rebuild.
- Loading states use lightweight **shimmer skeletons**; there's no global error boundary.
- Acknowledging an alert hides it locally but does not change server state.
- No authentication or route guards (demo app).

---

## What I Would Improve With More Time

- Persist alert acknowledge/resolve to the backend.
- Add an "alert status" filter and surface missing-image / invalid-price counts on the dashboard.
- Code-split the bundle and lazy-load charts to shrink the initial JS.
- Add a competitor **price-history** chart and a downloadable quality report.
- Authentication and per-seller views.

---

## Deployment

Deploy as a static site (Vercel / Netlify):
- **Build command:** `npm run build`
- **Output directory:** `dist`
- **Env var:** `VITE_API_URL = https://<your-backend>/api`
- Add an SPA rewrite (all routes → `/index.html`) so client-side routing works on refresh.

---

## Deployment Links

- **Frontend (this repo):** `https://<your-frontend>.vercel.app`  _(update after deploy)_
- **Backend:** `https://<your-backend>.onrender.com`  _(update after deploy)_
