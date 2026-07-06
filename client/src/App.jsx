import StatCard from "./components/StatCard.jsx";
import TargetsTable from "./components/TargetsTable.jsx";
import TrafficChart from "./components/TrafficChart.jsx";
import RequestLog from "./components/RequestLog.jsx";
import {
  placeholderTargets,
  placeholderStats,
  placeholderTraffic,
  placeholderLog,
} from "./data/placeholder.js";
import "./App.css";

export default function App() {
  const stats = placeholderStats;

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
          <p className="main__subtitle">Reverse proxy overview — live status of registered targets</p>
        </header>

        <section className="stat-grid">
          <StatCard label="Active Targets" value={stats.activeTargets} />
          <StatCard label="Success Rate" value={stats.successRate} />
          <StatCard label="Avg Response" value={`${stats.avgResponseMs}ms`} />
          <StatCard label="Total Requests" value={stats.totalRequests} />
        </section>

        <section className="content-grid">
          <TrafficChart data={placeholderTraffic} />
          <TargetsTable targets={placeholderTargets} />
        </section>

        <section>
          <RequestLog entries={placeholderLog} />
        </section>
      </main>
    </div>
  );
}
