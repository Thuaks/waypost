// mockServices.js
// Fake "backend services" that Waypost proxies to, for local development
// and demoing. These stand in for real microservices — in a real deployment,
// these would not exist here; the routing table in targets.js would point
// at actual independently-running services.

import express from "express";

export function startMockServices() {
  const usersService = express();
  usersService.get("/", (req, res) => {
    res.json({ service: "users-service", message: "Hello from the users service" });
  });
  usersService.get("/:id", (req, res) => {
    res.json({ service: "users-service", id: req.params.id, name: "Jane Doe" });
  });
  usersService.listen(4001, () => {
    console.log("[mock] users-service listening on http://localhost:4001");
  });

  const ordersService = express();
  ordersService.get("/", (req, res) => {
    res.json({ service: "orders-service", message: "Hello from the orders service" });
  });
  ordersService.get("/:id", (req, res) => {
    res.json({ service: "orders-service", id: req.params.id, total: 42.5 });
  });
  ordersService.listen(4002, () => {
    console.log("[mock] orders-service listening on http://localhost:4002");
  });
}
