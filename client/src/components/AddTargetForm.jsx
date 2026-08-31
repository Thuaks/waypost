import { useState } from "react";

export default function AddTargetForm({ onAdd }) {
  const [name, setName] = useState("");
  const [pathPrefix, setPathPrefix] = useState("");
  const [url, setUrl] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await onAdd({ name, pathPrefix, url });
      setName("");
      setPathPrefix("");
      setUrl("");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="add-target-form" onSubmit={handleSubmit}>
      <input
        className="input"
        placeholder="Name (e.g. payments-service)"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <input
        className="input"
        placeholder="Path prefix (e.g. /api/payments)"
        value={pathPrefix}
        onChange={(e) => setPathPrefix(e.target.value)}
        required
      />
      <input
        className="input"
        placeholder="Target URL (e.g. http://localhost:4003)"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        required
      />
      <button className="btn-primary" type="submit" disabled={submitting}>
        {submitting ? "Adding…" : "Add target"}
      </button>
      {error && <div className="form-error">{error}</div>}
    </form>
  );
}
