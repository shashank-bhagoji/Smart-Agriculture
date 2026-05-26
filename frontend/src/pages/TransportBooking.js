import { useEffect, useState } from "react";
import API from "../services/api";

function TransportBooking() {
  const [form, setForm] = useState({ equipment: "", fromLocation: "", toLocation: "", price: "" });
  const [myBookings, setMyBookings] = useState([]);
  const [equipmentList, setEquipmentList] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    // Load available equipment for the dropdown
    API.get("/equipment").then((res) => setEquipmentList(res.data)).catch(console.error);

    // Load user's existing transport requests
    const token = localStorage.getItem("token");
    if (token) {
      API.get("/transport", { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => setMyBookings(res.data))
        .catch(console.error);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMsg("");
    try {
      const token = localStorage.getItem("token");
      await API.post("/transport", form, { headers: { Authorization: `Bearer ${token}` } });
      setMsg("Transport request submitted successfully!");
      setForm({ equipment: "", fromLocation: "", toLocation: "", price: "" });
      // Refresh list
      const res = await API.get("/transport", { headers: { Authorization: `Bearer ${token}` } });
      setMyBookings(res.data);
    } catch (err) {
      setMsg(err.response?.data?.message || "Failed to submit request.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container">
      <h2 className="page-title">Equipment Transport Booking</h2>
      <p className="page-subtitle">Request transportation to move machinery directly to your farm.</p>

      {/* Request Form */}
      <div className="card form-card">
        <h3>New Transport Request</h3>
        <form onSubmit={handleSubmit} className="auth-form" style={{ gap: "1rem" }}>
          <div className="input-group">
            <select
              value={form.equipment}
              onChange={(e) => setForm({ ...form, equipment: e.target.value })}
              required
            >
              <option value="">Select Equipment</option>
              {equipmentList.map((eq) => (
                <option key={eq._id} value={eq._id}>{eq.name}</option>
              ))}
            </select>
          </div>
          <div className="input-group">
            <input
              placeholder="From Location"
              value={form.fromLocation}
              onChange={(e) => setForm({ ...form, fromLocation: e.target.value })}
              required
            />
          </div>
          <div className="input-group">
            <input
              placeholder="To Location (Your Farm)"
              value={form.toLocation}
              onChange={(e) => setForm({ ...form, toLocation: e.target.value })}
              required
            />
          </div>
          <div className="input-group">
            <input
              type="number"
              placeholder="Agreed Price (₹)"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              required
            />
          </div>
          {msg && <p className={msg.includes("success") ? "success-msg" : "error-msg"}>{msg}</p>}
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? "Submitting..." : "Request Transport"}
          </button>
        </form>
      </div>

      {/* Existing bookings */}
      <h3 style={{ marginTop: "2rem" }}>My Transport Requests</h3>
      <div className="grid">
        {myBookings.map((b) => (
          <div key={b._id} className="card">
            <h4>{b.equipment?.name || "Equipment"}</h4>
            <p>📍 {b.fromLocation} → {b.toLocation}</p>
            <p className="price">₹{b.price}</p>
            <span className={`status-badge ${b.status}`}>{b.status}</span>
          </div>
        ))}
        {myBookings.length === 0 && <p className="empty-state">No transport requests yet.</p>}
      </div>
    </div>
  );
}

export default TransportBooking;