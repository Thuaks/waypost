# Waypost

A self-hosted reverse proxy / API gateway with a live monitoring dashboard, built to
demonstrate networking and systems-design skills.

**Live demo:** _(add your Render URL here once deployed)_

## What it does

Waypost sits in front of one or more backend services and routes incoming requests to
the correct one based on the request path. It also load-balances across multiple
instances of the same service using round-robin, and exposes a real-time dashboard
showing traffic, latency, and target health.

- **Path-based routing** — `/api/users` → the users service, `/api/orders` → the
  orders service, and so on, based on a configurable routing table
- **Round-robin load balancing** — register more than one instance URL for a
  service and Waypost rotates requests across them automatically
- **Live dashboard** — active targets, success rate, average response time, request
  volume over time, and a rolling request log, all polling real data from the gateway
- **Dynamic target management** — add or remove backend targets through the UI, no
  restart required; changes persist to disk

## Architecture

```
┌─────────────┐      ┌──────────────────┐      ┌─────────────────┐
│  Dashboard   │─────▶│  Waypost Gateway │─────▶│  Backend targets │
│  (React)     │ poll │  (Express)       │proxy │  (your services) │
└─────────────┘      └──────────────────┘      └─────────────────┘
```

The gateway inspects each request's path, finds the matching target in its routing
table, and forwards the request to one of that target's registered instances
(round-robin if there's more than one). Metrics (latency, status, timing) are recorded
in-memory and exposed via a small set of introspection endpoints that the dashboard
polls every few seconds.

## Tech stack

- **Backend:** Node.js, Express, [http-proxy-middleware](https://github.com/chimurai/http-proxy-middleware)
- **Frontend:** React, Vite, [Recharts](https://recharts.org/)
- **Styling:** hand-written CSS against a small design-token system (see `DESIGN.md`)
- **Deployment:** Render

## Running locally

Requires [Node.js](https://nodejs.org) (LTS).

```bash
# Terminal 1 — the gateway
cd server
npm install
npm start
# Gateway running on http://localhost:4000

# Terminal 2 — the dashboard
cd client
npm install
npm run dev
# Dashboard running on http://localhost:5173
```

Open `http://localhost:5173`. The gateway ships with two demo backend services
(`users-service`, `orders-service`) built in for local testing, plus a second instance
of `users-service` on a different port to demonstrate load balancing out of the box.

## Project docs

- [`CONTEXT.md`](./CONTEXT.md) — project facts, scope, and phased build plan
- [`DESIGN.md`](./DESIGN.md) — color palette, typography, and component conventions

## Roadmap / explicitly out of scope

See `CONTEXT.md` for what this project intentionally does *not* do (auth, IP rotation,
production-scale traffic handling) — it's a learning and portfolio project, not
production infrastructure.
