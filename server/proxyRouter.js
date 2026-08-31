// proxyRouter.js — looks up the target dynamically per request, and now
// also picks WHICH instance of that target should handle the request,
// rotating through them round-robin.

import { createProxyMiddleware } from "http-proxy-middleware";
import { getTargets } from "./targetsStore.js";
import { recordRequest } from "./metrics.js";

const proxyCache = new Map(); // target name -> { instancesKey, middleware }
const robinIndex = new Map(); // target name -> next instance index to use

// Picks the next instance for a target in round-robin order and
// advances the counter for next time.
function pickInstance(target) {
  const i = robinIndex.get(target.name) || 0;
  const instance = target.instances[i % target.instances.length];
  robinIndex.set(target.name, i + 1);
  return instance;
}

function getOrCreateProxy(target) {
  const instancesKey = target.instances.join(",");
  const cached = proxyCache.get(target.name);
  if (cached && cached.instancesKey === instancesKey) {
    return cached.middleware;
  }

  const middleware = createProxyMiddleware({
    // `router` is called fresh for every incoming request, which is what
    // lets us pick a different instance each time instead of always
    // hitting the same fixed target.
    router: (req) => {
      const instance = pickInstance(target);
      req._chosenInstance = instance;
      return instance;
    },
    changeOrigin: true,
    pathRewrite: { [`^${target.pathPrefix}`]: "" },
    on: {
      proxyReq: (proxyReq, req) => {
        console.log(`[waypost] ${req.method} ${req.originalUrl} -> ${target.name} (${req._chosenInstance || "?"})`);
      },
      proxyRes: (proxyRes, req) => {
        const latencyMs = Date.now() - req._startTime;
        recordRequest({
          method: req.method,
          path: req.originalUrl,
          targetName: target.name,
          status: proxyRes.statusCode,
          latencyMs,
        });
      },
      error: (err, req, res) => {
        const latencyMs = Date.now() - (req._startTime || Date.now());
        recordRequest({
          method: req.method,
          path: req.originalUrl,
          targetName: target.name,
          status: 502,
          latencyMs,
        });
        console.error(`[waypost] error forwarding to ${target.name}:`, err.message);
        res.status(502).json({ error: "Bad Gateway", target: target.name });
      },
    },
  });

  proxyCache.set(target.name, { instancesKey, middleware });
  return middleware;
}

function findMatchingTarget(requestPath) {
  const matches = getTargets().filter((t) => requestPath.startsWith(t.pathPrefix));
  if (matches.length === 0) return null;
  return matches.reduce((longest, t) => (t.pathPrefix.length > longest.pathPrefix.length ? t : longest));
}

export function dynamicProxyMiddleware(req, res, next) {
  const target = findMatchingTarget(req.path);
  if (!target) return next();
  return getOrCreateProxy(target)(req, res, next);
}
