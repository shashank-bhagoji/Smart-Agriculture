import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import API, { getImageUrl } from "../services/api";

const fetchRoadDistance = async (lat1, lon1, lat2, lon2, locName1, locName2) => {
  if (locName1 && locName2) {
    const clean1 = locName1.split(",")[0].trim().toLowerCase();
    const clean2 = locName2.split(",")[0].trim().toLowerCase();
    if (clean1 === clean2) return 0;
  }
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;

  try {
    const res = await fetch(`http://router.project-osrm.org/route/v1/driving/${lon1},${lat1};${lon2},${lat2}?overview=false`);
    const data = await res.json();
    if (data.routes && data.routes[0]) {
      const distanceMeters = data.routes[0].distance;
      return Math.round((distanceMeters / 1000) * 10) / 10;
    }
  } catch (err) {
    console.error("OSRM road distance fetch failed, falling back to Haversine:", err);
  }

  // Fallback to straight-line distance
  const R = 6371; // Radius of the earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return Math.round(d * 10) / 10; // 1 decimal place
};

const getTransportPrice = (dist, loc1, loc2) => {
  const name1 = (loc1 || "Katkol").split(",")[0].trim().toLowerCase();
  const name2 = (loc2 || "Katkol").split(",")[0].trim().toLowerCase();
  if (name1 === name2 || dist === 0) return 100;
  return dist ? Math.max(150, Math.round(dist * 15)) : 150;
};

const cleanLocationName = (fullName) => {
  if (!fullName) return "";
  return fullName.split(",")[0].trim();
};

function EquipmentList() {
  const { t } = useTranslation();
  const [equipment, setEquipment] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [search, setSearch] = useState("");
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Booking Modal State
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [bookingDetails, setBookingDetails] = useState({ startDate: "", days: 1 });
  const [isGroupBooking, setIsGroupBooking] = useState(false);
  const [requestTransport, setRequestTransport] = useState(false);
  const [distances, setDistances] = useState({});

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

  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [navigate, token]);

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

  useEffect(() => {
    if (!user || equipment.length === 0) return;

    const loadDistances = async () => {
      const newDistances = { ...distances };
      let updated = false;
      for (const item of equipment) {
        if (item.owner?.location && newDistances[item._id] === undefined) {
          const dist = await fetchRoadDistance(
            user.location?.lat,
            user.location?.lon,
            item.owner.location.lat,
            item.owner.location.lon,
            user.location?.name,
            item.owner.location.name
          );
          newDistances[item._id] = dist;
          updated = true;
        }
      }
      if (updated) {
        setDistances(newDistances);
      }
    };

    loadDistances();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [equipment, user]);

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

  const handleBookClick = (item, reqTransport = false) => {
    if (!token || !user) { alert("Please log in to book equipment."); return; }
    setSelectedItem(item);
    setIsGroupBooking(false);
    setRequestTransport(reqTransport);
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
      const totalPrice = selectedItem.pricePerDay * bookingDetails.days;

      if (isGroupBooking) {
        await API.post("/group-bookings", {
          equipment: selectedItem._id,
          startDate: start,
          endDate: end,
          totalPrice
        }, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        await API.post("/bookings", {
          equipment: selectedItem._id,
          farmer: user._id,
          startDate: start,
          endDate: end
        }, { headers: { Authorization: `Bearer ${token}` } });
      }

      let transportMsg = "";
      if (requestTransport && !isGroupBooking) {
        const dist = distances[selectedItem._id] !== undefined ? distances[selectedItem._id] : null;
        const fromLoc = selectedItem.owner?.location?.name ? cleanLocationName(selectedItem.owner.location.name) : "Katkol";
        const toLoc = user?.location?.name ? cleanLocationName(user.location.name) : "Katkol";
        const transportPrice = getTransportPrice(dist, selectedItem.owner?.location?.name, user?.location?.name);

        await API.post("/transport", {
          equipment: selectedItem._id,
          fromLocation: fromLoc,
          toLocation: toLoc,
          price: transportPrice
        }, { headers: { Authorization: `Bearer ${token}` } });
        transportMsg = ` and transport request submitted for ₹${transportPrice} (${dist !== null ? dist : 0} km)`;
      }

      if (isGroupBooking) {
        alert(`Successfully created group booking for ${selectedItem.name}!`);
      } else {
        alert(`Successfully sent booking request for ${selectedItem.name}${transportMsg}!`);
      }

      setShowBookingModal(false);
      setRequestTransport(false);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to send booking request.");
    }
  };

  return (
    <div className="container">
      <h2 className="page-title">{t('available_equipment_title')}</h2>

      {/* Search & Filter Bar */}
      <div className="filter-bar" style={{ maxWidth: "600px", margin: "0 auto 2rem" }}>
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
                  src={getImageUrl(item.image)}
                  alt={item.name}
                  style={{ width: "100%", height: "150px", objectFit: "cover", display: "block" }}
                  onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                />
              ) : null}
              <div style={{ width: "100%", height: "150px", backgroundColor: "var(--bg-dark)", display: item.image ? 'none' : 'flex', alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "var(--text-muted)", fontSize: "2.5rem" }}>🚜</span>
              </div>

              <div style={{ padding: "0.8rem 1rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                <h3 style={{ margin: 0, fontSize: "1.25rem", color: "var(--text-main)" }}>{t(item.name, item.name)}</h3>
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
                  >
                    {isFav ? "❤️" : "🤍"}
                  </button>
                </div>

                {item.owner?.name && (
                  <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: 0 }}>
                    {t('owner')}: <span style={{ color: "var(--text-main)", fontWeight: "500" }}>{t(item.owner.name.trim(), item.owner.name.trim())}</span>
                    {item.owner?.location?.name && (
                      <span style={{ display: "block", fontSize: "0.8rem", marginTop: "0.2rem" }}>
                        📍 {cleanLocationName(item.owner.location.name)}
                        {distances[item._id] !== undefined && distances[item._id] !== null ? ` (${distances[item._id]} km)` : ""}
                      </span>
                    )}
                  </p>
                )}

                <div style={{ marginTop: "0.5rem" }}>
                  <button
                    className="btn-primary"
                    style={{ width: "100%", padding: "0.6rem", borderRadius: "10px", fontSize: "0.9rem" }}
                    onClick={() => handleBookClick(item)}
                  >
                    {t('book_item')}
                  </button>
                </div>
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
          <div className="card" style={{ maxWidth: "420px", width: "90%", padding: "1.5rem", borderRadius: "20px", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)", position: "relative" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.2rem" }}>
              <h3 style={{ fontSize: "1.5rem", margin: 0 }}>{isGroupBooking ? "Start Group Booking:" : t('book_item')} {selectedItem?.name ? t(selectedItem.name, selectedItem.name) : ''}</h3>
              <button
                type="button"
                onClick={() => setShowBookingModal(false)}
                style={{
                  background: "rgba(239, 68, 68, 0.1)",
                  border: "none",
                  color: "#ef4444",
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.1rem",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  marginLeft: "1rem",
                  flexShrink: 0
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'; e.currentTarget.style.transform = 'scale(1.08)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; e.currentTarget.style.transform = 'scale(1)'; }}
              >
                &times;
              </button>
            </div>
            <form onSubmit={confirmBooking} style={{ display: "flex", flexDirection: "column", gap: "0.8rem", marginTop: "1rem" }}>
              <div className="input-group" style={{ marginBottom: "0.2rem" }}>
                <label style={{ display: "block", marginBottom: "0.3rem", fontSize: "0.9rem", color: "var(--text-muted)" }}>{t('booking_type')}</label>
                <div style={{ display: "flex", gap: "1.5rem" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", cursor: "pointer", color: "var(--text-main)", fontSize: "0.95rem" }}>
                    <input type="radio" name="bookingType" checked={!isGroupBooking} onChange={() => setIsGroupBooking(false)} />
                    {t('individual_booking')}
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", cursor: "pointer", color: "var(--text-main)", fontSize: "0.95rem" }}>
                    <input type="radio" name="bookingType" checked={isGroupBooking} onChange={() => setIsGroupBooking(true)} />
                    {t('group_booking')}
                  </label>
                </div>
              </div>
              <div className="input-group">
                <label style={{ display: "block", marginBottom: "0.3rem", fontSize: "0.9rem", color: "var(--text-muted)" }}>{t('start_date')}</label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={bookingDetails.startDate}
                  onChange={(e) => setBookingDetails({ ...bookingDetails, startDate: e.target.value })}
                  style={{ padding: "0.5rem" }}
                />
              </div>
              <div className="input-group">
                <label style={{ display: "block", marginBottom: "0.3rem", fontSize: "0.9rem", color: "var(--text-muted)" }}>{t('num_days')}</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={bookingDetails.days}
                  onChange={(e) => setBookingDetails({ ...bookingDetails, days: e.target.value })}
                  style={{ padding: "0.5rem" }}
                />
              </div>
              {!isGroupBooking && (
                <div style={{ marginBottom: "0.5rem", marginTop: "0.2rem" }}>
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => setRequestTransport(!requestTransport)}
                    onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); setRequestTransport(!requestTransport); } }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "0.75rem 1rem",
                      background: requestTransport ? "rgba(128, 96, 168, 0.08)" : "rgba(255, 255, 255, 0.02)",
                      borderRadius: "14px",
                      border: `1.5px solid ${requestTransport ? "var(--primary)" : "var(--border-color)"}`,
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      marginTop: "0.5rem",
                      outline: "none"
                    }}
                    onMouseEnter={(e) => {
                      if (!requestTransport) e.currentTarget.style.borderColor = "var(--primary)";
                    }}
                    onMouseLeave={(e) => {
                      if (!requestTransport) e.currentTarget.style.borderColor = "var(--border-color)";
                    }}
                  >
                    <span style={{ display: "flex", alignItems: "center", gap: "0.6rem", fontSize: "0.95rem", color: "var(--text-main)", fontWeight: "500" }}>
                      🚚 {t('book_transport', 'Request Transport')}
                    </span>
                    <div style={{
                      width: "44px",
                      height: "24px",
                      background: requestTransport ? "var(--primary)" : "rgba(100, 116, 139, 0.2)",
                      borderRadius: "12px",
                      position: "relative",
                      transition: "background 0.2s"
                    }}>
                      <div style={{
                        width: "18px",
                        height: "18px",
                        background: "#fff",
                        borderRadius: "50%",
                        position: "absolute",
                        top: "3px",
                        left: requestTransport ? "23px" : "3px",
                        transition: "left 0.2s ease",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.2)"
                      }} />
                    </div>
                  </div>

                  {requestTransport && (() => {
                    const dist = distances[selectedItem?._id] !== undefined ? distances[selectedItem._id] : null;
                    const fromLoc = selectedItem?.owner?.location?.name ? cleanLocationName(selectedItem.owner.location.name) : "Katkol";
                    const toLoc = user?.location?.name ? cleanLocationName(user.location.name) : "Katkol";
                    const transportPrice = getTransportPrice(dist, selectedItem?.owner?.location?.name, user?.location?.name);
                    return (
                      <div style={{ marginTop: "0.5rem", padding: "0.6rem", background: "rgba(128, 96, 168, 0.05)", borderRadius: "12px", border: "1px solid rgba(128, 96, 168, 0.15)", fontSize: "0.85rem" }}>
                        <p style={{ margin: "0 0 0.2rem 0", color: "var(--text-muted)" }}>
                          <strong>Route:</strong> {fromLoc} → {toLoc}
                        </p>
                        <p style={{ margin: "0 0 0.2rem 0", color: "var(--text-muted)" }}>
                          <strong>Distance:</strong> {dist !== null ? `${dist} km` : "Not available"}
                        </p>
                        <p style={{ margin: 0, color: "var(--primary)", fontWeight: "600" }}>
                          <strong>Transport Cost:</strong> ₹{transportPrice}
                        </p>
                      </div>
                    );
                  })()}
                </div>
              )}

              <div style={{ padding: "0.8rem", background: "rgba(16, 185, 129, 0.08)", borderRadius: "10px", border: "1px solid rgba(16, 185, 129, 0.1)", fontSize: "0.9rem" }}>
                <p style={{ margin: "0 0 0.3rem 0", color: "var(--text-muted)" }}><strong>{t('reservation_period')}:</strong></p>
                <p style={{ margin: 0, color: "var(--text-main)", fontWeight: "500" }}>
                  {bookingDetails.startDate ? new Date(bookingDetails.startDate).toLocaleDateString() : "---"}
                  {" to "}
                  {bookingDetails.startDate ? new Date(new Date(bookingDetails.startDate).getTime() + (bookingDetails.days - 1) * 86400000).toLocaleDateString() : "---"}
                </p>
                <p style={{ margin: "0.5rem 0 0 0", color: "var(--primary)", fontWeight: "700", fontSize: "1.05rem" }}>
                  {t('total_cost')}: ₹{(() => {
                    const equipPrice = (selectedItem?.pricePerDay || 0) * bookingDetails.days;
                    if (requestTransport && !isGroupBooking) {
                      const dist = distances[selectedItem?._id] !== undefined ? distances[selectedItem._id] : null;
                      const transportPrice = getTransportPrice(dist, selectedItem?.owner?.location?.name, user?.location?.name);
                      return equipPrice + transportPrice;
                    }
                    return equipPrice;
                  })()}
                  {requestTransport && !isGroupBooking && (
                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: "normal", marginLeft: "0.5rem" }}>
                      (includes transport)
                    </span>
                  )}
                </p>
              </div>
              <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem" }}>
                <button type="submit" className="btn-primary" style={{ flex: 1, padding: "0.6rem" }}>{t('confirm_request')}</button>
                <button type="button" className="btn-primary" style={{ flex: 1, padding: "0.6rem", background: "rgba(100, 116, 139, 0.1)", color: "var(--text-main)", border: "1px solid var(--border-color)" }} onClick={() => setShowBookingModal(false)}>{t('cancel')}</button>
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
              <button
                onClick={() => setShowReviewModal(false)}
                style={{
                  background: "rgba(239, 68, 68, 0.1)",
                  border: "none",
                  color: "#ef4444",
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.1rem",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  flexShrink: 0
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'; e.currentTarget.style.transform = 'scale(1.08)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; e.currentTarget.style.transform = 'scale(1)'; }}
              >
                &times;
              </button>
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