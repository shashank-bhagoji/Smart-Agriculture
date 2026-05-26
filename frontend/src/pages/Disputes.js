import { useEffect, useState } from "react";
import API from "../services/api";

function Disputes() {
  const [disputes, setDisputes] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [form, setForm] = useState({ booking: "", reason: "Damage", description: "" });
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (token) {
      fetchDisputes();
      fetchBookings();
    }
  }, []);

  const fetchDisputes = () => {
    API.get("/disputes", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setDisputes(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const fetchBookings = () => {
    // For simplicity, fetching all bookings, but in real app would be user's bookings
    API.get("/bookings").then((res) => setBookings(res.data)).catch(console.error);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
      await API.post("/disputes", form, { headers: { Authorization: `Bearer ${token}` } });
      setMsg("Dispute raised successfully. Admin will review it.");
      setForm({ booking: "", reason: "Damage", description: "" });
      fetchDisputes();
    } catch (err) {
      setMsg("Failed to raise dispute.");
    }
  };

  return (
    <div className="container">
      <h2 className="page-title">Dispute Resolution</h2>
      <p className="page-subtitle">Report issues with rentals, damages, or service quality.</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", alignItems: "start" }}>
        {/* Raise Dispute Form */}
        <div className="card form-card" style={{ maxWidth: "100%" }}>
          <h3>Raise a New Dispute</h3>
          <form onSubmit={handleSubmit} className="auth-form" style={{ gap: "1rem", marginTop: "1rem" }}>
            <div className="input-group">
              <label>Select Booking</label>
              <select 
                value={form.booking} 
                onChange={(e) => setForm({ ...form, booking: e.target.value })}
                required
              >
                <option value="">Choose booking...</option>
                {bookings.map(b => (
                  <option key={b._id} value={b._id}>Booking ID: {b._id.slice(-6)}</option>
                ))}
              </select>
            </div>
            <div className="input-group">
              <label>Reason</label>
              <select 
                value={form.reason} 
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                required
              >
                <option value="Damage">Damage</option>
                <option value="Late Return">Late Return</option>
                <option value="Incorrect Specifications">Incorrect Specifications</option>
                <option value="Non-payment">Non-payment</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="input-group">
              <label>Description</label>
              <textarea 
                rows={4}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Describe the issue in detail..."
                required
                style={{ background: "transparent", color: "#fff", border: "1px solid var(--border-color)", padding: "0.5rem", borderRadius: "8px" }}
              />
            </div>
            {msg && <p className={msg.includes("success") ? "success-msg" : "error-msg"}>{msg}</p>}
            <button type="submit" className="btn-primary">Submit Dispute</button>
          </form>
        </div>

        {/* List of Disputes */}
        <div>
          <h3>My Disputes</h3>
          {loading && <p className="loading-text">Loading disputes...</p>}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem" }}>
            {disputes.map((d) => (
              <div key={d._id} className="card">
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <strong>{d.reason}</strong>
                  <span className={`status-badge ${d.status}`}>{d.status}</span>
                </div>
                <p style={{ fontSize: "0.9rem", marginTop: "0.5rem" }}>{d.description}</p>
                {d.resolution && (
                  <div style={{ marginTop: "1rem", padding: "0.5rem", background: "rgba(16,185,129,0.1)", borderRadius: "6px" }}>
                    <small><strong>Resolution:</strong> {d.resolution}</small>
                  </div>
                )}
              </div>
            ))}
            {!loading && disputes.length === 0 && <p className="empty-state">No disputes raised yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Disputes;