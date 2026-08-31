// mockServices.js
// Fake "backend services" that Waypost proxies to, for local development
// and demoing. These stand in for real microservices — in a real deployment,
// these would not exist here; the routing table in targets.js would point
// at actual independently-running services.

import express from "express";

export function startMockServices() {
  const usersService = express();
  usersService.get("/", (req, res) => {
    res.json({ service: "users-service", instancePort: 4001, message: "Hello from the users service" });
  });
  usersService.get("/:id", (req, res) => {
    res.json({ service: "users-service", instancePort: 4001, id: req.params.id, name: "Jane Doe" });
  });
  usersService.listen(4001, () => {
    console.log("[mock] users-service (instance A) listening on http://localhost:4001");
  });

  // A second instance of the SAME service, on a different port — this is
  // what round-robin load balancing rotates across. In a real deployment
  // these would be independent, identically-deployed copies of one service.
  const usersServiceB = express();
  usersServiceB.get("/", (req, res) => {
    res.json({ service: "users-service", instancePort: 4006, message: "Hello from the users service" });
  });
  usersServiceB.get("/:id", (req, res) => {
    res.json({ service: "users-service", instancePort: 4006, id: req.params.id, name: "Jane Doe" });
  });
  usersServiceB.listen(4006, () => {
    console.log("[mock] users-service (instance B) listening on http://localhost:4006");
  });

  const ordersService = express();
  ordersService.get("/", (req, res) => {
    res.json({ service: "orders-service", instancePort: 4002, message: "Hello from the orders service" });
  });
  ordersService.get("/:id", (req, res) => {
    res.json({ service: "orders-service", instancePort: 4002, id: req.params.id, total: 42.5 });
  });
  ordersService.listen(4002, () => {
    console.log("[mock] orders-service listening on http://localhost:4002");
  });
}
