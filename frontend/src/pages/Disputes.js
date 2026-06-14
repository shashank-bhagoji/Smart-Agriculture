import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import API from "../services/api";

function Disputes() {
  const { t } = useTranslation();
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      <h2 className="page-title">{t("Dispute Resolution", "Dispute Resolution")}</h2>
      <p className="page-subtitle">{t("Report issues with rentals, damages, or service quality.", "Report issues with rentals, damages, or service quality.")}</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", alignItems: "start" }}>
        {/* Raise Dispute Form */}
        <div className="card form-card" style={{ maxWidth: "100%" }}>
          <h3>{t("Raise a New Dispute", "Raise a New Dispute")}</h3>
          <form onSubmit={handleSubmit} className="auth-form" style={{ gap: "1rem", marginTop: "1rem" }}>
            <div className="input-group">
              <label>{t("Select Booking", "Select Booking")}</label>
              <select 
                value={form.booking} 
                onChange={(e) => setForm({ ...form, booking: e.target.value })}
                required
              >
                <option value="">{t("Choose booking...", "Choose booking...")}</option>
                {bookings.map(b => (
                  <option key={b._id} value={b._id}>{t("Booking ID", "Booking ID")}: {b._id.slice(-6)}</option>
                ))}
              </select>
            </div>
            <div className="input-group">
              <label>{t("Reason", "Reason")}</label>
              <select 
                value={form.reason} 
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                required
              >
                <option value="Damage">{t("Damage", "Damage")}</option>
                <option value="Late Return">{t("Late Return", "Late Return")}</option>
                <option value="Incorrect Specifications">{t("Incorrect Specifications", "Incorrect Specifications")}</option>
                <option value="Non-payment">{t("Non-payment", "Non-payment")}</option>
                <option value="Other">{t("Other", "Other")}</option>
              </select>
            </div>
            <div className="input-group">
              <label>{t("Description", "Description")}</label>
              <textarea 
                rows={4}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder={t("Describe the issue in detail...", "Describe the issue in detail...")}
                required
                style={{ background: "transparent", color: "#fff", border: "1px solid var(--border-color)", padding: "0.5rem", borderRadius: "8px" }}
              />
            </div>
            {msg && <p className={msg.includes("success") ? "success-msg" : "error-msg"}>{msg}</p>}
            <button type="submit" className="btn-primary">{t("Submit Dispute", "Submit Dispute")}</button>
          </form>
        </div>

        {/* List of Disputes */}
        <div>
          <h3>{t("My Disputes", "My Disputes")}</h3>
          {loading && <p className="loading-text">{t("Loading disputes...", "Loading disputes...")}</p>}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem" }}>
            {disputes.map((d) => (
              <div key={d._id} className="card">
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <strong>{t(d.reason, d.reason)}</strong>
                  <span className={`status-badge ${d.status}`}>{t(d.status, d.status)}</span>
                </div>
                <p style={{ fontSize: "0.9rem", marginTop: "0.5rem" }}>{d.description}</p>
                {d.resolution && (
                  <div style={{ marginTop: "1rem", padding: "0.5rem", background: "rgba(16,185,129,0.1)", borderRadius: "6px" }}>
                    <small><strong>{t("Resolution", "Resolution")}:</strong> {d.resolution}</small>
                  </div>
                )}
              </div>
            ))}
            {!loading && disputes.length === 0 && <p className="empty-state">{t("No disputes raised yet.", "No disputes raised yet.")}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Disputes;