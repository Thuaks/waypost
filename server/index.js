import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { dynamicProxyMiddleware } from "./proxyRouter.js";
import { getTargets, addTarget, removeTarget } from "./targetsStore.js";
import { startMockServices } from "./mockServices.js";
import { recordRequest, getRecentLogs, getOverallStats, getStatsForTarget, getTrafficSeries } from "./metrics.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json());
const PORT = process.env.PORT || 4000;

// Stamp every request with a start time so we can compute real latency
// once the response comes back from the target.
app.use((req, res, next) => {
  req._startTime = Date.now();
  next();
});

// --- Management endpoints ---
// These are registered BEFORE the dynamic proxy catch-all further down,
// so exact matches like /api/targets are handled here rather than being
// mistaken for a proxied route.

app.get("/health", (req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

app.get("/api/targets", (req, res) => {
  res.json(
    getTargets().map(({ name, pathPrefix, instances }) => ({
      name,
      pathPrefix,
      instances,
      ...getStatsForTarget(name),
    }))
  );
});

app.post("/api/targets", (req, res) => {
  const { name, pathPrefix, instances } = req.body || {};
  if (!name || !pathPrefix || !Array.isArray(instances) || instances.length === 0) {
    return res.status(400).json({ error: "name, pathPrefix, and at least one instance URL are required" });
  }
  if (!pathPrefix.startsWith("/")) {
    return res.status(400).json({ error: "pathPrefix must start with /" });
  }
  try {
    const updated = addTarget({ name, pathPrefix, instances });
    res.status(201).json(updated);
  } catch (err) {
    res.status(409).json({ error: err.message });
  }
});

app.delete("/api/targets/:name", (req, res) => {
  try {
    const updated = removeTarget(req.params.name);
    res.json(updated);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

app.get("/api/stats", (req, res) => {
  res.json(getOverallStats());
});

app.get("/api/logs", (req, res) => {
  res.json(getRecentLogs(10));
});

app.get("/api/traffic", (req, res) => {
  res.json(getTrafficSeries(15));
});

// --- Dynamic proxy ---
// Handles everything else by checking the current target list on every
// request, so add/remove takes effect immediately without a restart.
app.use(dynamicProxyMiddleware);

// --- Serve the built dashboard (production only) ---
// Locally, the dashboard runs separately via Vite (npm run dev, port 5173),
// so client/dist won't exist and this block simply does nothing. In
// production (Render), the build step creates client/dist, and this lets
// one Express server serve both the API and the dashboard from one URL.
const clientDist = path.join(__dirname, "../client/dist");
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get("*", (req, res) => {
    res.sendFile(path.join(clientDist, "index.html"));
  });
  console.log("[waypost] serving built dashboard from client/dist");
}

app.listen(PORT, () => {
  console.log(`\nWaypost gateway running on http://localhost:${PORT}`);
  console.log("Registered routes:");
  getTargets().forEach((t) => console.log(`  ${t.pathPrefix} -> ${t.name} (${t.instances.join(", ")})`));
  console.log("");
});

// Diagnostic: log exactly why/how the process ever exits, since we've
// seen it disappear with zero output in the past. This will tell us
// whether it's an uncaught exception, an external signal (e.g. killed
// by another program), or something else entirely.
process.on("SIGTERM", () => console.log("[waypost] received SIGTERM"));
process.on("SIGINT", () => console.log("[waypost] received SIGINT"));
process.on("uncaughtException", (err) => console.log("[waypost] uncaughtException:", err));
process.on("unhandledRejection", (err) => console.log("[waypost] unhandledRejection:", err));
process.on("exit", (code) => console.log(`[waypost] process exiting with code ${code}`));

// Spin up fake backend services locally so this is provable end-to-end
// without needing real external services. In a real deployment, these
// would be separate, independently running services.
startMockServices();
