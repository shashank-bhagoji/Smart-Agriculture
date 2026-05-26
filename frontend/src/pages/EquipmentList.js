import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import API from "../services/api";

function EquipmentList() {
  const { t } = useTranslation();
  const [equipment, setEquipment] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [search, setSearch] = useState("");
  const [user, setUser] = useState(null);
  
  // Booking Modal State
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [bookingDetails, setBookingDetails] = useState({ startDate: "", days: 1 });

  // Review Modal State
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedReviews, setSelectedReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  const token = localStorage.getItem("token");

  // Load equipment (with optional filters)
  const fetchEquipment = () => {
    let query = `/equipment?`;
    if (search) query += `name=${search}&`;
    API.get(query).then((res) => setEquipment(res.data)).catch(console.error);
  };

  // Load user details & favorites
  const fetchUserData = () => {
    if (!token) return;
    API.get("/users/me", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        setUser(res.data);
        setFavorites(res.data.favoriteEquipment || []);
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetchEquipment();
    fetchUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleFavorite = async (equipmentId) => {
    if (!token) { alert("Please log in to save favorites."); return; }
    try {
      const res = await API.post("/users/favorites", { 
        itemId: equipmentId, 
        itemType: 'equipment' 
      }, { headers: { Authorization: `Bearer ${token}` } });
      setFavorites(res.data.favorites);
    } catch (err) {
      console.error("Failed to update favorites:", err);
    }
  };

  const fetchReviews = async (itemId) => {
    setLoadingReviews(true);
    setShowReviewModal(true);
    try {
      const res = await API.get(`/reviews/equipment/${itemId}`);
      // Filter for last 3 months (approx 90 days)
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

  const handleBookClick = (item) => {
    if (!token || !user) { alert("Please log in to book equipment."); return; }
    setSelectedItem(item);
    setShowBookingModal(true);
  };

  const confirmBooking = async (e) => {
    e.preventDefault();
    if (!bookingDetails.startDate || bookingDetails.days < 1) {
      alert("Please provide valid date and duration.");
      return;
    }

    try {
      const start = new Date(bookingDetails.startDate);
      // Ensure we treat the date as local midnight to avoid timezone shifts
      const end = new Date(start.getTime() + bookingDetails.days * 86400000);
      
      await API.post("/bookings", {
        equipment: selectedItem._id,
        farmer: user._id,
        startDate: start,
        endDate: end
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      alert(`Successfully sent booking request for ${selectedItem.name}! (From ${start.toLocaleDateString()} to ${new Date(end.getTime() - 1).toLocaleDateString()})`);
      setShowBookingModal(false);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to send booking request.");
    }
  };

  return (
    <div className="container">
      <h2 className="page-title">{t('available_equipment_title')}</h2>

      {/* Search & Filter Bar */}
      <div className="filter-bar">
        <input
          className="filter-input"
          placeholder={t('search_placeholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="btn-primary" onClick={fetchEquipment} style={{ width: "auto" }}>{t('search')}</button>
      </div>

      <div className="grid">
        {equipment.map((item) => {
          const isFav = favorites.includes(item._id);
          return (
            <div 
              key={item._id} 
              className="card equipment-card" 
              style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column", gap: 0, cursor: "pointer" }}
              onClick={(e) => {
                if (e.target.closest('button')) return;
                fetchReviews(item._id);
              }}
            >
              {/* Image Header */}
              {item.image ? (
                <img 
                  src={`http://localhost:5000${item.image}`} 
                  alt={item.name} 
                  style={{ width: "100%", height: "150px", objectFit: "cover", display: "block" }} 
                />
              ) : (
                <div style={{ width: "100%", height: "150px", backgroundColor: "var(--bg-dark)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ color: "var(--text-muted)" }}>{t('no_image')}</span>
                </div>
              )}

              <div style={{ padding: "0.8rem 1rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                <h3 style={{ margin: 0, fontSize: "1.25rem", color: "var(--text-main)" }}>{item.name}</h3>
                <div style={{ fontSize: "0.9rem", color: "#fbbf24", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <span>{"★".repeat(Math.round(item.rating || 0)) + "☆".repeat(5 - Math.round(item.rating || 0))}</span>
                  <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>({item.reviewsCount || 0} {t('reviews')})</span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "0.5rem 0" }}>
                  <h2 className="price" style={{ color: "var(--primary)", margin: 0, fontSize: "1.3rem", fontWeight: "700" }}>
                    ₹{item.pricePerDay} <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: "400" }}>/ {t('per_day')}</span>
                  </h2>
                  <button
                    className={`fav-btn ${isFav ? "fav-active" : ""}`}
                    onClick={() => toggleFavorite(item._id)}
                    title={isFav ? "Remove from favorites" : "Add to favorites"}
                    style={{ position: "static", background: "transparent", border: "none", fontSize: "1.5rem", cursor: "pointer", padding: 0 }}
                  >
                    {isFav ? "❤️" : "🤍"}
                  </button>
                </div>
                
                {item.owner?.name && (
                  <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: 0 }}>{t('owner')}: <span style={{ color: "var(--text-main)", fontWeight: "500" }}>{item.owner.name}</span></p>
                )}
                
                <button className="btn-primary" style={{ width: "100%", padding: "0.6rem", marginTop: "0.25rem", borderRadius: "10px", fontSize: "0.95rem" }} onClick={() => handleBookClick(item)}>
                  {t('book_item')}
                </button>
              </div>
            </div>
          );
        })}
        {equipment.length === 0 && (
          <p className="empty-state">{t('no_equipment_found')}</p>
        )}
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="modal-overlay" style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div className="card" style={{ maxWidth: "420px", width: "90%", padding: "2.5rem", borderRadius: "24px", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)" }}>
            <h3 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>{t('book_item')} {selectedItem?.name}</h3>
            <form onSubmit={confirmBooking} style={{ display: "flex", flexDirection: "column", gap: "1.2rem", marginTop: "1.5rem" }}>
              <div className="input-group">
                <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", color: "var(--text-muted)" }}>{t('start_date')}</label>
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
                <p style={{ margin: "0.8rem 0 0 0", color: "var(--primary)", fontWeight: "700", fontSize: "1.1rem" }}>{t('total_cost')}: ₹{selectedItem?.pricePerDay * bookingDetails.days}</p>
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

export default EquipmentList;