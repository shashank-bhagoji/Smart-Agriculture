import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import API from "../services/api";

const CATEGORIES = ["All", "Land Preparation", "Harvesting", "Crop Spraying", "Soil Testing"];

function ServiceMarketplace() {
  const { t } = useTranslation();
  const [services, setServices] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [favorites, setFavorites] = useState([]);

  // Modal States
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [bookingDetails, setBookingDetails] = useState({ startDate: "", days: 1 });

  // Review Modal State
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedReviews, setSelectedReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    API.get("/services")
      .then((res) => {
        setServices(res.data);
        setFiltered(res.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));

    if (token) {
      API.get("/users/me", { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => {
          setUser(res.data);
          setFavorites(res.data.favoriteServices || []);
        })
        .catch(console.error);
    }
  }, [token]);

  const filterByCategory = (cat) => {
    setActiveCategory(cat);
    if (cat === "All") {
      setFiltered(services);
    } else {
      setFiltered(services.filter((s) => s.category?.toLowerCase() === cat.toLowerCase()));
    }
  };

  const fetchReviews = async (itemId) => {
    setLoadingReviews(true);
    setShowReviewModal(true);
    try {
      const res = await API.get(`/reviews/service/${itemId}`);
      // Filter for last 3 months
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      
      const filtered = res.data.filter(rev => new Date(rev.createdAt) >= threeMonthsAgo);
      setSelectedReviews(filtered);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingReviews(false);
    }
  };

  // eslint-disable-next-line no-unused-vars
  const toggleFavorite = async (serviceId) => {
    if (!token) { alert("Please log in to save favorites."); return; }
    try {
      const res = await API.post("/users/favorites", { 
        itemId: serviceId, 
        itemType: 'service' 
      }, { headers: { Authorization: `Bearer ${token}` } });
      setFavorites(res.data.favorites);
    } catch (err) {
      console.error("Failed to update favorites:", err);
    }
  };

  const handleRequestClick = (svc) => {
    if (!token || !user) { alert("Please log in to hire a service."); return; }
    setSelectedItem(svc);
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
        service: selectedItem._id,
        farmer: user._id,
        startDate: start,
        endDate: end
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      alert(`Successfully sent hiring request for ${selectedItem.name}! (Covering ${bookingDetails.days} day(s) from ${start.toLocaleDateString()})`);
      setShowBookingModal(false);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to send hiring request.");
    }
  };

  return (
    <div className="container">
      <h2 className="page-title">{t('service_marketplace_title')}</h2>
      <p className="page-subtitle">{t('service_marketplace_subtitle')}</p>

      {/* Category filter tabs */}
      <div className="filter-tabs">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`tab-btn ${activeCategory === cat ? "active" : ""}`}
            onClick={() => filterByCategory(cat)}
            style={{ padding: "0.5rem 1.2rem", fontSize: "0.9rem" }}
          >
            {cat === "All" ? t('All') || 'All' : cat}
          </button>
        ))}
      </div>

      {loading && <p className="loading-text">{t('loading_services')}</p>}

      <div className="grid">
        {filtered.map((svc) => (
          <div 
            key={svc._id} 
            className="card service-card" 
            style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column", gap: 0, cursor: "pointer" }}
            onClick={(e) => {
              if (e.target.closest('button')) return;
              fetchReviews(svc._id);
            }}
          >
            <div className="service-icon" style={{ 
              height: "150px", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              fontSize: "3.5rem", 
              background: "linear-gradient(135deg, rgba(16, 185, 129, 0.05), rgba(59, 130, 246, 0.05))",
              borderBottom: "1px solid var(--border-color)"
            }}>
              {svc.category === "Harvesting" ? "🌾" :
               svc.category === "Crop Spraying" ? "💧" :
               svc.category === "Soil Testing" ? "🔬" : "🚜"}
            </div>
            
            <div style={{ padding: "0.8rem 1rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              <h3 style={{ margin: 0, fontSize: "1.25rem", color: "var(--text-main)" }}>{svc.name}</h3>
              <div style={{ fontSize: "0.9rem", color: "#fbbf24", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <span>{"★".repeat(Math.round(svc.rating || 0)) + "☆".repeat(5 - Math.round(svc.rating || 0))}</span>
                <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>({svc.reviewsCount || 0})</span>
              </div>
              
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "0.5rem 0" }}>
                <h2 className="price" style={{ color: "var(--primary)", margin: 0, fontSize: "1.3rem", fontWeight: "700" }}>
                  ₹{svc.price} <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: "400" }}>/ {t('per_service')}</span>
                </h2>
                <span className="badge" style={{ margin: 0, fontSize: "0.75rem", padding: "0.2rem 0.6rem", borderRadius: "6px" }}>{svc.category || "General"}</span>
              </div>
              
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: 0 }}>{t('provider')}: <span style={{ color: "var(--text-main)", fontWeight: "500" }}>{svc.provider?.name || "Expert"}</span></p>
              
              <button className="btn-primary" style={{ width: "100%", padding: "0.6rem", marginTop: "0.25rem", borderRadius: "10px", fontSize: "0.95rem" }} onClick={() => handleRequestClick(svc)}>
                {t('request_item_service')}
              </button>
            </div>
          </div>
        ))}

        {!loading && filtered.length === 0 && (
          <div className="empty-state">
            <p>{t('no_services_found')}</p>
          </div>
        )}
      </div>

      {/* Hiring Modal */}
      {showBookingModal && (
        <div className="modal-overlay" style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div className="card" style={{ maxWidth: "420px", width: "90%", padding: "2.5rem", borderRadius: "24px", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)" }}>
            <h3 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>{t('request_item_service')} {selectedItem?.name}</h3>
            <form onSubmit={confirmHiring} style={{ display: "flex", flexDirection: "column", gap: "1.2rem", marginTop: "1.5rem" }}>
              <div className="input-group">
                <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", color: "var(--text-muted)" }}>{t('service_date')}</label>
                <input 
                  type="date" 
                  required 
                  min={new Date().toISOString().split('T')[0]}
                  value={bookingDetails.startDate}
                  onChange={(e) => setBookingDetails({ ...bookingDetails, startDate: e.target.value })}
                />
              </div>
              <div className="input-group">
                <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", color: "var(--text-muted)" }}>{t('num_days')}</label>
                <input 
                  type="number" 
                  required 
                  min="1"
                  value={bookingDetails.days}
                  onChange={(e) => setBookingDetails({ ...bookingDetails, days: e.target.value })}
                />
              </div>
              <div style={{ padding: "1rem", background: "rgba(16, 185, 129, 0.08)", borderRadius: "12px", border: "1px solid rgba(16, 185, 129, 0.1)", fontSize: "0.9rem" }}>
                <p style={{ margin: "0 0 0.5rem 0", color: "var(--text-muted)" }}><strong>{t('reservation_period')}:</strong></p>
                <p style={{ margin: 0, color: "var(--text-main)", fontWeight: "500" }}>
                  {bookingDetails.startDate ? new Date(bookingDetails.startDate).toLocaleDateString() : "---"} 
                  {" to "}
                  {bookingDetails.startDate ? new Date(new Date(bookingDetails.startDate).getTime() + (bookingDetails.days - 1) * 86400000).toLocaleDateString() : "---"}
                </p>
                <p style={{ margin: "0.8rem 0 0 0", color: "var(--primary)", fontWeight: "700", fontSize: "1.1rem" }}>{t('total_cost')}: ₹{selectedItem?.price * bookingDetails.days}</p>
              </div>
              <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>{t('confirm_request')}</button>
                <button type="button" className="btn-primary" style={{ flex: 1, background: "rgba(100, 116, 139, 0.1)", color: "var(--text-main)", border: "1px solid var(--border-color)" }} onClick={() => setShowBookingModal(false)}>{t('cancel')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && (
        <div className="modal-overlay" style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div className="card" style={{ maxWidth: "500px", width: "90%", padding: "2.5rem", borderRadius: "24px", maxHeight: "80vh", overflowY: "auto", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h3 style={{ margin: 0, fontSize: "1.5rem" }}>{t('farmer_feedback')}</h3>
              <button onClick={() => setShowReviewModal(false)} style={{ background: "none", border: "none", color: "var(--text-main)", fontSize: "2rem", cursor: "pointer", padding: "0 0.5rem" }}>&times;</button>
            </div>
            
            {loadingReviews ? (
              <p style={{ textAlign: "center", color: "var(--text-muted)" }}>{t('loading_reviews')}</p>
            ) : selectedReviews.length === 0 ? (
              <p className="empty-state">{t('no_reviews')}</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
                {selectedReviews.map((rev) => (
                  <div key={rev._id} style={{ padding: "1.2rem", background: "rgba(255,255,255,0.03)", borderRadius: "16px", border: "1px solid var(--border-color)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.6rem" }}>
                      <strong style={{ color: "var(--primary)" }}>{rev.farmer?.name}</strong>
                      <span style={{ color: "#fbbf24" }}>{"★".repeat(rev.rating)}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: "0.95rem", color: "var(--text-main)", lineHeight: "1.5" }}>{rev.comment}</p>
                    <small style={{ color: "var(--text-muted)", marginTop: "0.8rem", display: "block", fontSize: "0.8rem" }}>{new Date(rev.createdAt).toLocaleDateString()}</small>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ServiceMarketplace;