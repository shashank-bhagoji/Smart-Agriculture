import { useEffect, useState } from "react";
import API from "../services/api";

const STATUS_COLORS = { pending: "#f59e0b", in_progress: "#3b82f6", completed: "#22c55e" };

function Maintenance() {
  const [form, setForm] = useState({ equipment: "", description: "" });
  const [requests, setRequests] = useState([]);
  const [equipmentList, setEquipmentList] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState("");

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    API.get("/equipment/owner", { headers }).then((res) => setEquipmentList(res.data)).catch(console.error);
    API.get("/maintenance", { headers }).then((res) => setRequests(res.data)).catch(console.error);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMsg("");
    try {
      await API.post("/maintenance", form, { headers });
      setMsg("Maintenance request submitted!");
      setForm({ equipment: "", description: "" });
      const res = await API.get("/maintenance", { headers });
      setRequests(res.data);
    } catch (err) {
      setMsg(err.response?.data?.message || "Failed to submit.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container">
      <h2 className="page-title">Maintenance & Repair Requests</h2>
      <p className="page-subtitle">Submit and track maintenance or repair requests for your equipment.</p>

      {/* New Request Form */}
      <div className="card form-card">
        <h3>New Maintenance Request</h3>
        <form onSubmit={handleSubmit} className="auth-form" style={{ gap: "1rem" }}>
          <div className="input-group">
            <select
              value={form.equipment}
              onChange={(e) => setForm({ ...form, equipment: e.target.value })}
              required
            >
              <option value="">Select Your Equipment</option>
              {equipmentList.map((eq) => (
                <option key={eq._id} value={eq._id}>{eq.name}</option>
              ))}
            </select>
          </div>
          <div className="input-group">
            <textarea
              placeholder="Describe the issue or maintenance needed..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4}
              required
              style={{ background: "rgba(255, 255, 255, 0.03)", color: "var(--text-main)", border: "1px solid var(--border-color)", borderRadius: "8px", padding: "0.75rem", width: "100%", resize: "vertical" }}
            />
          </div>
          {msg && <p className={msg.includes("submitted") ? "success-msg" : "error-msg"}>{msg}</p>}
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Request"}
          </button>
        </form>
      </div>

      {/* Existing Requests */}
      <h3 style={{ marginTop: "2rem" }}>My Requests</h3>
      <div className="grid">
        {requests.map((r) => (
          <div key={r._id} className="card">
            <h4>{r.equipment?.name || "Equipment"}</h4>
            <p>{r.description}</p>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.5rem" }}>
              <span
                className="status-badge"
                style={{ background: STATUS_COLORS[r.status] || "#64748b" }}
              >
                {r.status}
              </span>
              <span style={{ fontSize: "0.75rem", opacity: 0.6 }}>
                {new Date(r.requestedAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
        {requests.length === 0 && <p className="empty-state">No maintenance requests yet.</p>}
      </div>
    </div>
  );
}

export default Maintenance;