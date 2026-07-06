# CONTEXT.md — Waypost

## Project
**Waypost** — a self-hosted reverse proxy / API gateway with a live monitoring dashboard.

## Purpose
A learning and portfolio project built to demonstrate networking and systems-design skills.
Not a commercial product. Not intended for production traffic at scale (yet).

## Core Proxy Behavior (phased build)
- **Phase 1:** Path-based routing — e.g. `/api/users` → Service A, `/api/orders` → Service B
- **Phase 2:** Domain/subdomain-based routing
- **Phase 3:** Load balancing across identical backend instances (round-robin, then least-connections)

## Audience
- Primary: developers and recruiters evaluating systems-design ability
- Secondary: small teams wanting a lightweight, self-hosted alternative to Cloudflare/AWS-style gateways

## Dashboard Capabilities
1. Live view of registered backend targets ("nodes"): status, latency, success rate
2. Add / remove backend targets dynamically through the UI
3. Configure routing rules (path/domain mappings) through the UI
4. Traffic chart — requests over time
5. Request log / recent traffic table

## Tech Stack
- Backend / proxy engine: Node.js + Express (`http-proxy-middleware` or `node-http-proxy`)
- Frontend dashboard: React + Vite
- Deployment: Render (fallback: Railway or Fly.io)

## Visual Identity
- Dark theme, charcoal/slate base
- Amber/copper accent color (not blue)
- Signpost / crossroads motif (not a globe/network-map motif)
- Monospace styling for technical data: IPs, routes, latencies

## Explicitly Out of Scope
- IP rotation or residential proxy pools
- Anything designed to mask identity or evade rate-limiting / anti-bot systems on third-party sites
- Auth/user accounts (single-operator dashboard for now — no login system in v1)

## Build Approach
Small, incremental commits. Each milestone (proxy core, dashboard shell, live stats,
target management, routing rules, load balancing) is its own working, committed step.
