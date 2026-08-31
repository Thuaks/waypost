// proxyRouter.js — replaces the old startup-time proxy registration.
// Targets can now be added/removed at runtime, so instead of wiring up
// one fixed middleware per target when the server boots, we look up the
// matching target fresh on every incoming request and reuse (or create)
// a cached proxy instance for it.

import { createProxyMiddleware } from "http-proxy-middleware";
import { getTargets } from "./targetsStore.js";
import { recordRequest } from "./metrics.js";

const proxyCache = new Map(); // target name -> { pathPrefix, url, middleware }

function getOrCreateProxy(target) {
  const cached = proxyCache.get(target.name);
  if (cached && cached.pathPrefix === target.pathPrefix && cached.url === target.url) {
    return cached.middleware;
  }

  const middleware = createProxyMiddleware({
    target: target.url,
    changeOrigin: true,
    pathRewrite: { [`^${target.pathPrefix}`]: "" },
    on: {
      proxyReq: (proxyReq, req) => {
        console.log(`[waypost] ${req.method} ${req.originalUrl} -> ${target.name} (${target.url})`);
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

  proxyCache.set(target.name, { pathPrefix: target.pathPrefix, url: target.url, middleware });
  return middleware;
}

function findMatchingTarget(requestPath) {
  const matches = getTargets().filter((t) => requestPath.startsWith(t.pathPrefix));
  if (matches.length === 0) return null;
  // Longest prefix wins, so a more specific route beats a broader one
  // if two targets' prefixes ever overlap.
  return matches.reduce((longest, t) => (t.pathPrefix.length > longest.pathPrefix.length ? t : longest));
}

export function dynamicProxyMiddleware(req, res, next) {
  const target = findMatchingTarget(req.path);
  if (!target) return next();
  return getOrCreateProxy(target)(req, res, next);
}
