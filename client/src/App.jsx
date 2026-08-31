import { useEffect, useState } from "react";
import StatCard from "./components/StatCard.jsx";
import TargetsTable from "./components/TargetsTable.jsx";
import TrafficChart from "./components/TrafficChart.jsx";
import RequestLog from "./components/RequestLog.jsx";
import AddTargetForm from "./components/AddTargetForm.jsx";
import { placeholderStats, placeholderTargets, placeholderLog, placeholderTraffic } from "./data/placeholder.js";
import "./App.css";

// Traffic chart still uses placeholder time-series data — historical
// bucketing of real traffic over time is a later milestone (needs the
// server to store timestamps in buckets, not just a rolling recent list).
const POLL_INTERVAL_MS = 3000;

export default function App() {
  const [stats, setStats] = useState(placeholderStats);
  const [targets, setTargets] = useState(placeholderTargets);
  const [log, setLog] = useState(placeholderLog);
  const [connected, setConnected] = useState(false);

  async function fetchLiveData() {
    try {
      const [statsRes, targetsRes, logRes] = await Promise.all([
        fetch("/api/stats"),
        fetch("/api/targets"),
        fetch("/api/logs"),
      ]);
      const [statsData, targetsData, logData] = await Promise.all([
        statsRes.json(),
        targetsRes.json(),
        logRes.json(),
      ]);
      setStats(statsData);
      setTargets(targetsData);
      setLog(logData);
      setConnected(true);
    } catch (err) {
      setConnected(false);
      console.error("[waypost dashboard] failed to fetch live data:", err);
    }
  }

  async function handleAddTarget({ name, pathPrefix, url }) {
    const res = await fetch("/api/targets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, pathPrefix, url }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to add target");
    await fetchLiveData();
  }

  async function handleRemoveTarget(name) {
    const res = await fetch(`/api/targets/${encodeURIComponent(name)}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      console.error("[waypost dashboard] failed to remove target:", data.error);
      return;
    }
    await fetchLiveData();
  }

  useEffect(() => {
    fetchLiveData();
    const interval = setInterval(fetchLiveData, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar__logo">
          <span className="logo-mark">⤬</span>
          <span className="logo-text">Waypost</span>
        </div>
        <nav className="sidebar__nav">
          <a className="nav-item nav-item--active" href="#">Dashboard</a>
          <a className="nav-item" href="#">Targets</a>
          <a className="nav-item" href="#">Routes</a>
          <a className="nav-item" href="#">Logs</a>
        </nav>
      </aside>

      <main className="main">
        <header className="main__header">
          <h1>Dashboard</h1>
          <p className="main__subtitle">
            Reverse proxy overview — live status of registered targets
            <span className={`conn-indicator ${connected ? "conn-indicator--live" : "conn-indicator--offline"}`}>
              {connected ? "● live" : "○ waiting for gateway…"}
            </span>
          </p>
        </header>

        <section className="stat-grid">
          <StatCard label="Active Targets" value={stats.activeTargets} />
          <StatCard label="Success Rate" value={stats.successRate} />
          <StatCard label="Avg Response" value={`${stats.avgResponseMs}ms`} />
          <StatCard label="Total Requests" value={stats.totalRequests} />
        </section>

        <section className="content-grid">
          <TrafficChart data={placeholderTraffic} />
          <div className="stack">
            <div className="panel">
              <h2 className="panel__title">Add a Target</h2>
              <AddTargetForm onAdd={handleAddTarget} />
            </div>
            <TargetsTable targets={targets} onRemove={handleRemoveTarget} />
          </div>
        </section>

        <section>
          <RequestLog entries={log} />
        </section>
      </main>
    </div>
  );
}
