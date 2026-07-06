import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { targets } from "./targets.js";
import { startMockServices } from "./mockServices.js";

const app = express();
const PORT = process.env.PORT || 4000;

// --- Phase 1: Path-based routing ---
// Each entry in targets.js maps a path prefix to a backend target.
// The gateway inspects the request path and forwards it to the matching target.
targets.forEach(({ pathPrefix, url, name }) => {
  app.use(
    pathPrefix,
    createProxyMiddleware({
      target: url,
      changeOrigin: true,
      pathRewrite: { [`^${pathPrefix}`]: "" },
      on: {
        proxyReq: (proxyReq, req) => {
          console.log(`[waypost] ${req.method} ${req.originalUrl} -> ${name} (${url})`);
        },
        error: (err, req, res) => {
          console.error(`[waypost] error forwarding to ${name}:`, err.message);
          res.status(502).json({ error: "Bad Gateway", target: name });
        },
      },
    })
  );
});

// --- Introspection endpoints (the future dashboard will call these) ---
app.get("/health", (req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

app.get("/api/targets", (req, res) => {
  res.json(targets.map(({ name, pathPrefix, url }) => ({ name, pathPrefix, url })));
});

app.listen(PORT, () => {
  console.log(`\nWaypost gateway running on http://localhost:${PORT}`);
  console.log("Registered routes:");
  targets.forEach((t) => console.log(`  ${t.pathPrefix} -> ${t.name} (${t.url})`));
  console.log("");
});

// Spin up fake backend services locally so this is provable end-to-end
// without needing real external services. In a real deployment, these
// would be separate, independently running services.
startMockServices();
