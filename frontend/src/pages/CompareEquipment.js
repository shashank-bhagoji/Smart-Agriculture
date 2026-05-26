import { useEffect, useState } from "react";
import API from "../services/api";

function CompareEquipment() {
  const [equipment, setEquipment] = useState([]);
  const [selected1, setSelected1] = useState(null);
  const [selected2, setSelected2] = useState(null);

  useEffect(() => {
    API.get("/equipment").then((res) => setEquipment(res.data)).catch(console.error);
  }, []);

  const renderSpecs = (eq) => {
    if (!eq) return <div className="card empty-state">Select an equipment to compare</div>;
    return (
      <div className="card comparison-card" style={{ animation: "fadeIn 0.5s" }}>
        <h3>{eq.name}</h3>
        <p className="price">₹{eq.pricePerDay} / day</p>
        <hr style={{ margin: "1rem 0", opacity: 0.1 }} />
        <div className="spec-row"><span>Category</span><strong>{eq.category || 'General'}</strong></div>
        <div className="spec-row"><span>Owner</span><strong>{eq.owner?.name || 'Verified'}</strong></div>
        <div className="spec-row"><span>Availability</span><strong style={{ color: eq.available ? "var(--primary)" : "#ef4444" }}>{eq.available ? "Ready" : "In Use"}</strong></div>
        <div className="spec-row"><span>Description</span><p style={{ fontSize: "0.85rem", textAlign: "right" }}>{eq.description}</p></div>
        <button className="btn-primary" style={{ marginTop: "1.5rem", width: "100%" }}>Book Now</button>
      </div>
    );
  };

  return (
    <div className="container">
      <h2 className="page-title">Compare Equipment</h2>
      <p className="page-subtitle">Compare technical specifications and prices side-by-side to make the best choice.</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", marginBottom: "2rem" }}>
        <div className="input-group">
          <label>First Equipment</label>
          <select onChange={(e) => setSelected1(equipment.find(eq => eq._id === e.target.value))}>
            <option value="">Select equipment...</option>
            {equipment.map(eq => <option key={eq._id} value={eq._id}>{eq.name}</option>)}
          </select>
        </div>
        <div className="input-group">
          <label>Second Equipment</label>
          <select onChange={(e) => setSelected2(equipment.find(eq => eq._id === e.target.value))}>
            <option value="">Select equipment...</option>
            {equipment.map(eq => <option key={eq._id} value={eq._id}>{eq.name}</option>)}
          </select>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
        {renderSpecs(selected1)}
        {renderSpecs(selected2)}
      </div>

      {selected1 && selected2 && (
        <div className="card" style={{ marginTop: "2rem", textAlign: "center", border: "1px dashed var(--primary)" }}>
          <h3 className="text-gradient">Our Verdict</h3>
          <p>
            {selected1.pricePerDay < selected2.pricePerDay 
              ? `${selected1.name} is more economical by ₹${selected2.pricePerDay - selected1.pricePerDay} per day.` 
              : `${selected2.name} is more economical by ₹${selected1.pricePerDay - selected2.pricePerDay} per day.`}
          </p>
        </div>
      )}
    </div>
  );
}

export default CompareEquipment;