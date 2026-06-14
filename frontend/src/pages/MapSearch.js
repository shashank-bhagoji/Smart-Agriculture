import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import API from "../services/api";

function MapSearch() {
  const { t } = useTranslation();
  const [equipment, setEquipment] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    API.get("/equipment").then((res) => setEquipment(res.data)).catch(console.error);
  }, []);

  // India-centered demo pin positions for map simulation
  const demoPins = equipment.slice(0, 8).map((eq, i) => ({
    ...eq,
    lat: 20.5 + i * 0.6,
    lng: 78.9 + (i % 3) * 0.8,
  }));

  return (
    <div className="container">
      <h2 className="page-title"> {t("Map-Based Equipment Search", "Map-Based Equipment Search")}</h2>
      <p className="page-subtitle">{t("Find agricultural equipment available near your location.", "Find agricultural equipment available near your location.")}</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "1.5rem", alignItems: "start" }}>
        {/* Simulated map area */}
        <div className="card map-area">
          <div className="map-placeholder">
            <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginBottom: "1rem" }}>
              🗺️ {t("Interactive map — integrate with", "Interactive map — integrate with")} <strong>Leaflet.js</strong> {t("or", "or")} <strong>Google Maps</strong> {t("to show real pins.", "to show real pins.")}
            </p>
            {/* Simulated pin grid */}
            <div className="map-grid">
              {demoPins.map((eq) => (
                <button
                  key={eq._id}
                  className={`map-pin ${selected?._id === eq._id ? "active" : ""}`}
                  onClick={() => setSelected(eq)}
                  title={eq.name}
                >
                  📍
                  <span className="pin-label">{t(eq.name, eq.name)}</span>
                </button>
              ))}
              {demoPins.length === 0 && (
                <p className="empty-state">{t("No equipment data found.", "No equipment data found.")}</p>
              )}
            </div>
          </div>
        </div>

        {/* Equipment detail panel */}
        <div>
          {selected ? (
            <div className="card" style={{ animation: "fadeIn 0.3s ease" }}>
              <h3>{t(selected.name, selected.name)}</h3>
              <p style={{ color: "var(--text-muted)", marginBottom: "0.5rem" }}>{selected.description}</p>
              <p className="price">₹{selected.pricePerDay}/{t("day", "day")}</p>
              {selected.owner?.name && (
                <p style={{ fontSize: "0.8rem", opacity: 0.6, marginTop: "0.25rem" }}>
                  {t("Owner", "Owner")}: {selected.owner.name}
                </p>
              )}
              <button
                className="btn-primary"
                style={{ marginTop: "1rem" }}
                onClick={() => alert(`Booking ${selected.name} – coming in Sprint 2!`)}
              >
                {t("Book This Equipment", "Book This Equipment")}
              </button>
            </div>
          ) : (
            <div className="card" style={{ textAlign: "center", padding: "2rem" }}>
              <p className="empty-state">{t("Click a pin on the map to see equipment details.", "Click a pin on the map to see equipment details.")}</p>
            </div>
          )}

          <div className="card" style={{ marginTop: "1rem" }}>
            <h4 style={{ marginBottom: "0.75rem" }}>📋 {t("All Equipment", "All Equipment")} ({equipment.length})</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxHeight: "300px", overflowY: "auto" }}>
              {equipment.map((eq) => (
                <button
                  key={eq._id}
                  onClick={() => setSelected(eq)}
                  style={{
                    background: selected?._id === eq._id ? "rgba(16,185,129,0.15)" : "transparent",
                    border: "1px solid var(--border-color)",
                    borderRadius: "8px",
                    padding: "0.6rem 0.8rem",
                    color: "var(--text-main)",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "background 0.2s",
                  }}
                >
                  <strong>{t(eq.name, eq.name)}</strong>
                  <span style={{ float: "right", color: "var(--primary)" }}>₹{eq.pricePerDay}/{t("day", "day")}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MapSearch;