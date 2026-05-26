import { useEffect, useState } from "react";
import API from "../services/api";

function OperatorHiring() {
  const [operators, setOperators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  
  // Booking Modal State
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [bookingDetails, setBookingDetails] = useState({ startDate: "", days: 1 });

  const token = localStorage.getItem("token");

  useEffect(() => {
    API.get("/operators")
      .then((res) => setOperators(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));

    if (token) {
      API.get("/users/me", { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => setUser(res.data))
        .catch(console.error);
    }
  }, [token]);

  const handleHireClick = (op) => {
    if (!token || !user) { alert("Please log in to hire an operator."); return; }
    setSelectedItem(op);
    setShowBookingModal(true);
  };

  const confirmHiring = async (e) => {
    e.preventDefault();
    if (!bookingDetails.startDate || bookingDetails.days < 1) {
      alert("Please select a date and duration.");
      return;
    }

    try {
      const start = new Date(bookingDetails.startDate);
      const end = new Date(start.getTime() + bookingDetails.days * 86400000);
      
      await API.post("/bookings", {
        operator: selectedItem._id,
        farmer: user._id,
        startDate: start,
        endDate: end
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      alert(`Successfully sent hire request for ${selectedItem.name}! (Covering ${bookingDetails.days} day(s) from ${start.toLocaleDateString()})`);
      setShowBookingModal(false);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to send hire request.");
    }
  };

  return (
    <div className="container">
      <h2 className="page-title">Hire an Operator</h2>
      <p className="page-subtitle">Find trained machine operators to run rented equipment on your farm.</p>

      {loading && <p className="loading-text">Loading operators...</p>}

      <div className="grid">
        {operators.map((op) => (
          <div key={op._id} className="card operator-card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
            <div className="operator-avatar" style={{ width: "80px", height: "80px", borderRadius: "50%", background: "var(--primary-color)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", marginBottom: "1rem" }}>
              {op.name ? op.name.charAt(0).toUpperCase() : "O"}
            </div>
            <h3 style={{ margin: "0 0 0.5rem 0" }}>{op.name}</h3>
            <p className="badge" style={{ marginBottom: "0.5rem" }}>{op.servicesOffered?.join(", ") || "General Operator"}</p>
            <div className="operator-meta" style={{ display: "flex", gap: "1rem", marginBottom: "1rem", fontSize: "0.9rem" }}>
              <span>⭐ {op.rating?.toFixed(1) || "New"}</span>
              <span className="price" style={{ color: "var(--primary-color)", fontWeight: "bold" }}>₹{op.ratePerDay}/day</span>
            </div>
            <button
              className="btn-primary"
              style={{ width: "100%" }}
              onClick={() => handleHireClick(op)}
            >
              Hire Now
            </button>
          </div>
        ))}

        {!loading && operators.length === 0 && (
          <div className="empty-state">
            <p>No operators available at the moment. Check back soon!</p>
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="modal-overlay" style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div className="card" style={{ maxWidth: "400px", width: "90%", padding: "2rem" }}>
            <h3>Hire {selectedItem?.name}</h3>
            <form onSubmit={confirmHiring} style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1.5rem" }}>
              <div className="input-group">
                <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem" }}>Start Date</label>
                <input 
                  type="date" 
                  required 
                  min={new Date().toISOString().split('T')[0]}
                  value={bookingDetails.startDate}
                  onChange={(e) => setBookingDetails({ ...bookingDetails, startDate: e.target.value })}
                />
              </div>
              <div className="input-group">
                <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem" }}>Number of Days</label>
                <input 
                  type="number" 
                  required 
                  min="1"
                  value={bookingDetails.days}
                  onChange={(e) => setBookingDetails({ ...bookingDetails, days: e.target.value })}
                />
              </div>
              <div style={{ padding: "0.8rem", background: "rgba(16, 185, 129, 0.1)", borderRadius: "8px", fontSize: "0.85rem" }}>
                <p style={{ margin: "0 0 0.4rem 0" }}><strong>Hiring Period:</strong></p>
                <p style={{ margin: 0 }}>
                  {bookingDetails.startDate ? new Date(bookingDetails.startDate).toLocaleDateString() : "---"} 
                  {" to "}
                  {bookingDetails.startDate ? new Date(new Date(bookingDetails.startDate).getTime() + (bookingDetails.days - 1) * 86400000).toLocaleDateString() : "---"}
                </p>
                <p style={{ margin: "0.4rem 0 0 0", color: "var(--primary-color)", fontWeight: "bold" }}>Total Cost: ₹{selectedItem?.ratePerDay * bookingDetails.days}</p>
              </div>
              <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Confirm Request</button>
                <button type="button" className="btn-primary" style={{ flex: 1, background: "#4b5563" }} onClick={() => setShowBookingModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default OperatorHiring;