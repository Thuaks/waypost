import { useState } from "react";

export default function AddTargetForm({ onAdd }) {
  const [name, setName] = useState("");
  const [pathPrefix, setPathPrefix] = useState("");
  const [instancesInput, setInstancesInput] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const instances = instancesInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      if (instances.length === 0) {
        throw new Error("Enter at least one instance URL");
      }
      await onAdd({ name, pathPrefix, instances });
      setName("");
      setPathPrefix("");
      setInstancesInput("");
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
        placeholder="Instance URLs, comma-separated (e.g. http://localhost:4003, http://localhost:4004)"
        value={instancesInput}
        onChange={(e) => setInstancesInput(e.target.value)}
        required
      />
      <button className="btn-primary" type="submit" disabled={submitting}>
        {submitting ? "Adding…" : "Add target"}
      </button>
      {error && <div className="form-error">{error}</div>}
    </form>
  );
}
