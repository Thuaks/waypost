const statusColor = {
  healthy: "var(--status-healthy)",
  warning: "var(--status-warning)",
  error: "var(--status-error)",
};

export default function TargetsTable({ targets, onRemove }) {
  return (
    <div className="panel">
      <h2 className="panel__title">Registered Targets</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Path</th>
            <th>Instances</th>
            <th>Status</th>
            <th className="numeric">Avg Latency</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {targets.map((t) => (
            <tr key={t.name}>
              <td>{t.name}</td>
              <td className="mono-ish">{t.pathPrefix}</td>
              <td className="mono-ish">
                {t.instances.length > 1 ? (
                  <span title={t.instances.join(", ")}>{t.instances.length} (round-robin)</span>
                ) : (
                  t.instances[0]
                )}
              </td>
              <td>
                <span className="status-dot" style={{ background: statusColor[t.status] }} />
                {t.status}
              </td>
              <td className="numeric">{t.latencyMs} ms</td>
              <td>
                <button className="btn-remove" onClick={() => onRemove(t.name)} title={`Remove ${t.name}`}>
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
