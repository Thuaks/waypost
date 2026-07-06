const statusColor = {
  healthy: "var(--status-healthy)",
  warning: "var(--status-warning)",
  error: "var(--status-error)",
};

export default function TargetsTable({ targets }) {
  return (
    <div className="panel">
      <h2 className="panel__title">Registered Targets</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Path</th>
            <th>Status</th>
            <th className="numeric">Latency</th>
          </tr>
        </thead>
        <tbody>
          {targets.map((t) => (
            <tr key={t.name}>
              <td>{t.name}</td>
              <td className="mono-ish">{t.pathPrefix}</td>
              <td>
                <span className="status-dot" style={{ background: statusColor[t.status] }} />
                {t.status}
              </td>
              <td className="numeric">{t.latencyMs} ms</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
