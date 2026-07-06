// metrics.js — simple in-memory tracking of proxied requests.
// This is intentionally minimal (no database, no persistence) since
// Waypost is a demo/learning project, not production infrastructure.
// Data resets whenever the server restarts.

const MAX_LOG_ENTRIES = 50;
const requestLog = [];
const targetStats = {}; // name -> { count, totalLatency, errorCount }

export function recordRequest({ method, path, targetName, status, latencyMs }) {
  const entry = {
    time: new Date().toLocaleTimeString(),
    method,
    path,
    target: targetName,
    status,
  };
  requestLog.unshift(entry);
  if (requestLog.length > MAX_LOG_ENTRIES) requestLog.pop();

  if (!targetStats[targetName]) {
    targetStats[targetName] = { count: 0, totalLatency: 0, errorCount: 0 };
  }
  const t = targetStats[targetName];
  t.count += 1;
  t.totalLatency += latencyMs;
  if (status >= 400) t.errorCount += 1;
}

export function getRecentLogs(limit = 10) {
  return requestLog.slice(0, limit);
}

export function getOverallStats() {
  const names = Object.keys(targetStats);
  const totalRequests = names.reduce((sum, n) => sum + targetStats[n].count, 0);
  const totalErrors = names.reduce((sum, n) => sum + targetStats[n].errorCount, 0);
  const totalLatency = names.reduce((sum, n) => sum + targetStats[n].totalLatency, 0);

  const successRate = totalRequests === 0 ? 100 : ((totalRequests - totalErrors) / totalRequests) * 100;
  const avgResponseMs = totalRequests === 0 ? 0 : Math.round(totalLatency / totalRequests);

  return {
    activeTargets: names.length,
    successRate: `${successRate.toFixed(1)}%`,
    avgResponseMs,
    totalRequests,
  };
}

export function getStatsForTarget(name) {
  const t = targetStats[name];
  if (!t || t.count === 0) return { status: "healthy", latencyMs: 0 };
  return {
    status: t.errorCount > 0 ? "warning" : "healthy",
    latencyMs: Math.round(t.totalLatency / t.count),
  };
}
