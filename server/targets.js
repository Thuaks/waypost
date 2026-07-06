// targets.js
// The routing table: maps a path prefix to a backend target.
// In Phase 1 (path-based routing), this list is static and hardcoded.
// Later phases will make this dynamic (add/remove via the dashboard) and
// backed by real config, not a hardcoded array.

export const targets = [
  {
    name: "users-service",
    pathPrefix: "/api/users",
    url: "http://localhost:4001",
  },
  {
    name: "orders-service",
    pathPrefix: "/api/orders",
    url: "http://localhost:4002",
  },
];
