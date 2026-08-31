import express from "express";
import { dynamicProxyMiddleware } from "./proxyRouter.js";
import { getTargets, addTarget, removeTarget } from "./targetsStore.js";
import { startMockServices } from "./mockServices.js";
import { recordRequest, getRecentLogs, getOverallStats, getStatsForTarget } from "./metrics.js";

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
    getTargets().map(({ name, pathPrefix, url }) => ({
      name,
      pathPrefix,
      url,
      ...getStatsForTarget(name),
    }))
  );
});

app.post("/api/targets", (req, res) => {
  const { name, pathPrefix, url } = req.body || {};
  if (!name || !pathPrefix || !url) {
    return res.status(400).json({ error: "name, pathPrefix, and url are all required" });
  }
  if (!pathPrefix.startsWith("/")) {
    return res.status(400).json({ error: "pathPrefix must start with /" });
  }
  try {
    const updated = addTarget({ name, pathPrefix, url });
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

// --- Dynamic proxy ---
// Handles everything else by checking the current target list on every
// request, so add/remove takes effect immediately without a restart.
app.use(dynamicProxyMiddleware);

app.listen(PORT, () => {
  console.log(`\nWaypost gateway running on http://localhost:${PORT}`);
  console.log("Registered routes:");
  getTargets().forEach((t) => console.log(`  ${t.pathPrefix} -> ${t.name} (${t.url})`));
  console.log("");
});

// Spin up fake backend services locally so this is provable end-to-end
// without needing real external services. In a real deployment, these
// would be separate, independently running services.
startMockServices();
