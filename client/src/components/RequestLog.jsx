export default function RequestLog({ entries }) {
  return (
    <div className="panel">
      <h2 className="panel__title">Recent Requests</h2>
      <table>
        <thead>
          <tr>
            <th>Time</th>
            <th>Method</th>
            <th>Path</th>
            <th>Target</th>
            <th className="numeric">Status</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((e, i) => (
            <tr key={i}>
              <td className="numeric">{e.time}</td>
              <td>{e.method}</td>
              <td className="mono-ish">{e.path}</td>
              <td>{e.target}</td>
              <td className="numeric">{e.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
