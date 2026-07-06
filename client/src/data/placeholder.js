// placeholder.js — fake data so we can build and verify the UI layout
// before wiring it up to the real server in the next milestone.

export const placeholderTargets = [
  { name: "users-service", pathPrefix: "/api/users", status: "healthy", latencyMs: 42 },
  { name: "orders-service", pathPrefix: "/api/orders", status: "healthy", latencyMs: 58 },
];

export const placeholderStats = {
  activeTargets: 2,
  successRate: "99.8%",
  avgResponseMs: 50,
  totalRequests: 1284,
};

export const placeholderTraffic = [
  { time: "00:00", requests: 12 },
  { time: "04:00", requests: 8 },
  { time: "08:00", requests: 34 },
  { time: "12:00", requests: 61 },
  { time: "16:00", requests: 47 },
  { time: "20:00", requests: 29 },
  { time: "24:00", requests: 15 },
];

export const placeholderLog = [
  { time: "14:32:07", method: "GET", path: "/api/users/7", target: "users-service", status: 200 },
  { time: "14:32:05", method: "GET", path: "/api/orders/99", target: "orders-service", status: 200 },
  { time: "14:32:01", method: "GET", path: "/api/users", target: "users-service", status: 200 },
  { time: "14:31:58", method: "GET", path: "/api/orders", target: "orders-service", status: 200 },
];
