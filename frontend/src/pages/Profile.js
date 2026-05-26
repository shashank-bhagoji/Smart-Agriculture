import { useState, useEffect } from "react";
import API from "../services/api";

function Profile() {
  const [user, setUser] = useState(null);
  const [equipmentList, setEquipmentList] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [myService, setMyService] = useState(null);
  const [historyTab, setHistoryTab] = useState("equipment");
  const [favorites, setFavorites] = useState({ equipment: [], services: [] });
  const [newEquipment, setNewEquipment] = useState({ name: "", pricePerDay: "", image: "" });
  const [selectedFile, setSelectedFile] = useState(null);
  const [ratingForm, setRatingForm] = useState({ bookingId: null, rating: 5, comment: "" });
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [pendingOwners, setPendingOwners] = useState([]);
  const [activeOwners, setActiveOwners] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [notifications, setNotifications] = useState([]); // removed unused variable
  const token = localStorage.getItem("token");
  const isLoggedIn = !!token;

  useEffect(() => {
    if (!isLoggedIn) return;
    
    const fetchNotifs = () => {
      API.get("/notifications", { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => setNotifications(res.data))
        .catch(() => {});
    };

    fetchNotifs();
    const interval = setInterval(fetchNotifs, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, [isLoggedIn, token]);

  useEffect(() => {
    if (token) {
      API.get("/users/me", { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => {
          setUser(res.data);
          if (res.data.role === "owner") {
            fetchOwnerEquipment();
            fetchBookings("owner");
          } else if (res.data.role === "farmer") {
            fetchBookings("farmer");
            fetchFavorites();
          } else if (res.data.role === "service_provider") {
            fetchMyService(res.data._id);
            fetchBookings("provider");
          } else if (res.data.role === "admin") {
            fetchAdminData();
          }
        })
        .catch((err) => {
          console.error("Profile fetch error:", err);
          if (err.response?.status === 401 || err.response?.status === 403) {
            localStorage.removeItem("token");
            window.location.href = "/login";
          }
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const fetchOwnerEquipment = () => {
    API.get("/equipment/owner", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setEquipmentList(res.data))
      .catch(console.error);
  };

  const fetchMyService = (userId) => {
    API.get("/services", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        const svc = res.data.find(s => s.provider?._id === userId || s.provider === userId);
        if (svc) setMyService(svc);
      })
      .catch(console.error);
  };

  const fetchFavorites = () => {
    API.get("/users/favorites", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setFavorites(res.data))
      .catch(console.error);
  };

  const fetchAdminData = async () => {
    try {
      const [pendingRes, allUsersRes] = await Promise.all([
        API.get("/admin/pending-owners", { headers: { Authorization: `Bearer ${token}` } }),
        API.get("/admin/users", { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setPendingOwners(pendingRes.data);
      setActiveOwners(allUsersRes.data.filter(u => u.role === 'owner' && u.isApproved));
    } catch (err) {
      console.error(err);
    }
  };

  const handleOwnerApproval = async (ownerId, status) => {
    try {
      await API.patch(`/admin/owners/${ownerId}/approve`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(`Owner registration ${status}!`);
      fetchAdminData();
    } catch (err) {
      console.error(err);
      alert("Failed to process approval");
    }
  };

  const handleDeleteOwner = async (ownerId) => {
    if (!window.confirm("Are you sure you want to delete this owner account? All their equipment listings will also be removed.")) return;
    try {
      await API.delete(`/admin/users/${ownerId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Owner account and listings deleted successfully!");
      fetchAdminData();
    } catch (err) {
      console.error(err);
      alert("Failed to delete owner");
    }
  };

  const fetchBookings = (role) => {
    let endpoint = "";
    if (role === "owner") endpoint = "/bookings/owner";
    else if (role === "provider") endpoint = "/bookings/provider";
    else endpoint = "/bookings/farmer";

    API.get(endpoint, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setBookings(res.data))
      .catch(console.error);
  };

  const handleBookingStatus = async (bookingId, status) => {
    try {
      const booking = bookings.find(b => b._id === bookingId);
      await API.patch("/bookings/status", { bookingId, status }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (status === 'accepted' && booking) {
        // Automatic background sync is now handled by the backend
        // when the owner accepts the booking. No tab will open.
      }

      fetchBookings(user?.role === "service_provider" ? "provider" : "owner");
      alert(`Booking has been ${status}!`);
    } catch (err) {
      console.error(err);
      alert("Failed to update booking status");
    }
  };

  const handleUpdateServicePrice = async (e) => {
    e.preventDefault();
    if (!myService) return;
    try {
      await API.put(`/services/${myService._id}`, { price: myService.price }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Service price updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to update price");
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    try {
      let imagePath = "";
      if (selectedFile) {
        const formData = new FormData();
        formData.append("image", selectedFile);
        const uploadRes = await API.post("/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        imagePath = uploadRes.data;
      }

      await API.post("/equipment", { ...newEquipment, image: imagePath }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Equipment added successfully!");
      setNewEquipment({ name: "", pricePerDay: "", image: "" });
      setSelectedFile(null);
      fetchOwnerEquipment();
    } catch (err) {
      console.error(err);
      alert("Failed to add equipment");
    }
  };

  const handleSubmitRating = async (e) => {
    e.preventDefault();
    try {
      await API.post("/reviews", ratingForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Feedback submitted successfully!");
      setShowRatingModal(false);
      setRatingForm({ bookingId: null, rating: 5, comment: "" });
      fetchBookings("farmer");
    } catch (err) {
      console.error(err);
      alert("Failed to submit feedback");
    }
  };

  if (!user) return <div className="container"><p>Loading profile...</p></div>;

  return (
    <div className="container">
      <h2 className="page-title">Profile ({user.role})</h2>
      <div className="card">
        <p><strong>Name:</strong> {user.name}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Role:</strong> {user.role}</p>
      </div>

      {user.role === "owner" && (
        <div className="owner-section" style={{ marginTop: "2rem" }}>
          <h3>Upload New Equipment</h3>
          <form onSubmit={handleUpload} className="auth-form" style={{ maxWidth: "500px", margin: "1rem 0" }}>
            <div className="input-group">
              <input
                placeholder="Equipment Name"
                required
                value={newEquipment.name}
                onChange={(e) => setNewEquipment({ ...newEquipment, name: e.target.value })}
              />
            </div>

            <div className="input-group">
              <input
                type="number"
                placeholder="Price Per Day (₹)"
                required
                value={newEquipment.pricePerDay}
                onChange={(e) => setNewEquipment({ ...newEquipment, pricePerDay: e.target.value })}
              />
            </div>
            <div className="input-group">
              <label style={{ display: "block", marginBottom: "0.5rem" }}>Upload Photo</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setSelectedFile(e.target.files[0])}
              />
            </div>
            <button type="submit" className="btn-primary" style={{ width: "100%" }}>Upload Equipment</button>
          </form>

          <h3 style={{ marginTop: "2rem" }}>Booking Requests</h3>
          <div className="grid" style={{ marginBottom: "2rem" }}>
            {bookings.filter(b => b.status === 'pending').length === 0 ? (
              <p>No new booking requests.</p>
            ) : (
              bookings.filter(b => b.status === 'pending').map((booking) => (
                <div key={booking._id} className="card equipment-card" style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column", gap: 0 }}>
                  {booking.equipment?.image && (
                    <img 
                      src={`http://localhost:5000${booking.equipment.image}`} 
                      alt={booking.equipment.name} 
                      style={{ width: "100%", height: "200px", objectFit: "cover", display: "block" }} 
                    />
                  )}
                  <div style={{ padding: "0.8rem 1rem", display: "flex", flexDirection: "column" }}>
                    <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1.2rem" }}>{booking.equipment?.name}</h3>
                    <p style={{ fontSize: "0.85rem", opacity: 0.8, marginBottom: "0.5rem", marginTop: 0 }}><strong>Requested by:</strong> {booking.farmer?.name}</p>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "0.25rem 0" }}>
                      <p style={{ margin: 0 }}><strong>Status:</strong> <span className={`status-badge ${booking.status}`}>{booking.status}</span></p>
                    </div>
                    <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                      <button className="btn-primary" style={{ background: "#22c55e", flex: 1, padding: "0.6rem" }} onClick={() => handleBookingStatus(booking._id, 'accepted')}>Accept</button>
                      <button className="btn-primary" style={{ background: "#ef4444", flex: 1, padding: "0.6rem" }} onClick={() => handleBookingStatus(booking._id, 'rejected')}>Reject</button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <h3 style={{ marginTop: "2rem" }}>Booking History</h3>
          <div className="grid" style={{ marginBottom: "2rem" }}>
            {bookings.filter(b => b.status !== 'pending').length === 0 ? (
              <p>No past bookings.</p>
            ) : (
              bookings.filter(b => b.status !== 'pending').map((booking) => (
                <div key={booking._id} className="card" style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "1rem", padding: "1rem", width: "100%", maxWidth: "400px" }}>
                  {booking.equipment?.image ? (
                    <img 
                      src={`http://localhost:5000${booking.equipment.image}`} 
                      alt={booking.equipment.name} 
                      style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "8px" }} 
                    />
                  ) : (
                    <div style={{ width: "80px", height: "80px", backgroundColor: "#eee", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>🚜</div>
                  )}
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: "0 0 0.25rem 0" }}>{booking.equipment?.name}</h4>
                    <p style={{ margin: "0 0 0.25rem 0", fontSize: "0.85rem", opacity: 0.8 }}>Requested by: {booking.farmer?.name}</p>
                  </div>
                  <div>
                    <span className={`status-badge ${booking.status}`}>{booking.status}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          <h3 style={{ marginTop: "2rem" }}>Your Uploaded Equipment</h3>
          <div className="grid">
            {equipmentList.length === 0 ? (
              <p>You haven't uploaded any equipment yet.</p>
            ) : (
              equipmentList.map((item) => (
                <div key={item._id} className="card equipment-card" style={{ display: "flex", flexDirection: "column" }}>
                  {item.image && (
                    <img 
                      src={`http://localhost:5000${item.image}`} 
                      alt={item.name} 
                      style={{ width: "100%", height: "200px", objectFit: "cover", borderRadius: "8px 8px 0 0" }} 
                    />
                  )}
                  <div style={{ padding: "1rem" }}>
                    <h4>{item.name}</h4>

                    <p className="price">₹{item.pricePerDay} / day</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {user.role === "farmer" && (
        <div className="farmer-section" style={{ marginTop: "2rem" }}>
          <div className="filter-tabs" style={{ marginBottom: "2rem", display: "flex", flexDirection: "row", flexWrap: "wrap", gap: "1rem", justifyContent: "center" }}>
            <button 
              className={`tab-btn ${historyTab === "equipment" ? "active" : ""}`}
              onClick={() => setHistoryTab("equipment")} 
            >
              Equipment Orders
            </button>
            <button 
              className={`tab-btn ${historyTab === "services" ? "active" : ""}`}
              onClick={() => setHistoryTab("services")} 
            >
              Service History
            </button>
            <button 
              className={`tab-btn ${historyTab === "favorites" ? "active" : ""}`}
              onClick={() => setHistoryTab("favorites")} 
            >
              ❤️ Favorites
            </button>
          </div>

          {historyTab === "favorites" ? (
            <div className="favorites-section">
              <h4 style={{ marginBottom: "1rem" }}>Your Saved Equipment</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "2rem" }}>
                {favorites.equipment.length === 0 ? (
                  <p>No favorites saved yet.</p>
                ) : (
                  favorites.equipment.map(item => (
                    <div key={item._id} className="card" style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "1rem", padding: "1rem", width: "100%", maxWidth: "400px" }}>
                      {item.image ? (
                        <img 
                          src={`http://localhost:5000${item.image}`} 
                          alt={item.name} 
                          style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "8px" }} 
                        />
                      ) : (
                        <div style={{ width: "80px", height: "80px", backgroundColor: "rgba(255,255,255,0.05)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem" }}>
                          🚜
                        </div>
                      )}
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: "0 0 0.25rem 0", fontSize: "1.1rem" }}>{item.name}</h4>
                        <p style={{ margin: "0 0 0.25rem 0", fontSize: "0.95rem", color: "var(--primary-color)", fontWeight: "bold" }}>
                          ₹{item.pricePerDay} / day
                        </p>
                        <p style={{ margin: "0", fontSize: "0.85rem", opacity: 0.8 }}>
                          Owner: {item.owner?.name || "Verified Owner"}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "2rem" }}>
              {bookings.filter(b => historyTab === "equipment" ? b.equipment : b.service).length === 0 ? (
                <div className="empty-state">
                  <p>You haven't made any {historyTab} bookings yet.</p>
                </div>
              ) : (
                bookings
                  .filter(b => historyTab === "equipment" ? b.equipment : b.service)
                  .map((booking) => {
                    const isService = !!booking.service;
                    const item = isService ? booking.service : booking.equipment;
                    if (!item) return null;

                    return (
                      <div key={booking._id} className="card" style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "1rem", padding: "1rem", width: "100%", maxWidth: "400px" }}>
                        {!isService && (
                          item.image ? (
                            <img 
                              src={`http://localhost:5000${item.image}`} 
                              alt={item.name} 
                              style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "8px" }} 
                            />
                          ) : (
                            <div style={{ width: "80px", height: "80px", backgroundColor: "rgba(255,255,255,0.05)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem" }}>
                              🚜
                            </div>
                          )
                        )}
                        
                        <div style={{ flex: 1 }}>
                          <h4 style={{ margin: "0 0 0.25rem 0", fontSize: "1.1rem" }}>{item.name}</h4>
                          <p style={{ margin: "0 0 0.25rem 0", fontSize: "0.95rem", color: "var(--primary-color)", fontWeight: "bold" }}>
                            ₹{isService ? item.price : item.pricePerDay} / day
                          </p>
                          <p style={{ margin: "0", fontSize: "0.85rem", opacity: 0.8 }}>
                            {isService ? "Provider" : "Owner"}: {isService ? item.provider?.name : item.owner?.name}
                          </p>
                        </div>
                        
                        <div style={{ textAlign: "right", minWidth: "100px" }}>
                          <span 
                            className={`status-badge ${booking.status}`}
                            style={booking.status === 'accepted' ? { cursor: "pointer", border: "1px solid var(--primary-color)", display: "inline-flex", alignItems: "center", gap: "0.4rem" } : {}}
                            onClick={() => {
                              if (booking.status === 'accepted') {
                                setRatingForm({ ...ratingForm, bookingId: booking._id });
                                setShowRatingModal(true);
                              }
                            }}
                          >
                            {booking.status}
                            {booking.status === 'accepted' && <span style={{ fontSize: "0.8rem" }}>⭐</span>}
                          </span>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          )}

          {showRatingModal && (
            <div className="modal-overlay" style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
              <div className="card" style={{ maxWidth: "400px", width: "90%", padding: "2rem" }}>
                <h3>Rate your Experience</h3>
                <form onSubmit={handleSubmitRating} style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem" }}>
                  <div>
                    <label style={{ display: "block", marginBottom: "0.5rem" }}>Rating (1-5 Stars)</label>
                    <div style={{ display: "flex", gap: "0.5rem", fontSize: "1.5rem" }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span 
                          key={star} 
                          style={{ cursor: "pointer", color: star <= ratingForm.rating ? "#fbbf24" : "#4b5563" }}
                          onClick={() => setRatingForm({ ...ratingForm, rating: star })}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="input-group">
                    <label style={{ display: "block", marginBottom: "0.5rem" }}>Comments</label>
                    <textarea 
                      placeholder="Share your feedback..."
                      style={{ width: "100%", padding: "0.8rem", background: "var(--bg-glass)", border: "1px solid var(--border-color)", borderRadius: "8px", color: "var(--text-main)", minHeight: "100px" }}
                      value={ratingForm.comment}
                      onChange={(e) => setRatingForm({ ...ratingForm, comment: e.target.value })}
                    />
                  </div>
                  <div style={{ display: "flex", gap: "1rem" }}>
                    <button type="submit" className="btn-primary" style={{ flex: 1 }}>Submit Feedback</button>
                    <button type="button" className="btn-primary" style={{ flex: 1, background: "#4b5563" }} onClick={() => setShowRatingModal(false)}>Cancel</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {user.role === "service_provider" && (
        <div className="provider-section" style={{ marginTop: "2rem" }}>
          <h3>Update Your Service Details</h3>
          {myService ? (
            <form onSubmit={handleUpdateServicePrice} className="auth-form" style={{ maxWidth: "500px", margin: "1rem 0" }}>
              <p><strong>Service Type:</strong> {myService.category}</p>
              <div className="input-group" style={{ marginTop: "1rem" }}>
                <label style={{ display: "block", marginBottom: "0.5rem" }}>Daily Rate (₹)</label>
                <input
                  type="number"
                  required
                  value={myService.price}
                  onChange={(e) => setMyService({ ...myService, price: e.target.value })}
                />
              </div>
              <button type="submit" className="btn-primary" style={{ width: "100%" }}>Update Rate</button>
            </form>
          ) : (
            <p>Loading your service profile...</p>
          )}

          <h3 style={{ marginTop: "2rem" }}>Service Requests</h3>
          <div className="grid" style={{ marginBottom: "2rem" }}>
            {bookings.filter(b => b.status === 'pending').length === 0 ? (
              <p>No new service requests.</p>
            ) : (
              bookings.filter(b => b.status === 'pending').map((booking) => (
                <div key={booking._id} className="card equipment-card" style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column", gap: 0 }}>
                  <div style={{ padding: "0.8rem 1rem", display: "flex", flexDirection: "column" }}>
                    <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1.2rem" }}>{booking.service?.name}</h3>
                    <p style={{ fontSize: "0.85rem", opacity: 0.8, marginBottom: "0.5rem", marginTop: 0 }}><strong>Requested by:</strong> {booking.farmer?.name}</p>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "0.25rem 0" }}>
                      <p style={{ margin: 0 }}><strong>Status:</strong> <span className={`status-badge ${booking.status}`}>{booking.status}</span></p>
                    </div>
                    <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                      <button className="btn-primary" style={{ background: "#22c55e", flex: 1, padding: "0.6rem" }} onClick={() => handleBookingStatus(booking._id, 'accepted')}>Accept</button>
                      <button className="btn-primary" style={{ background: "#ef4444", flex: 1, padding: "0.6rem" }} onClick={() => handleBookingStatus(booking._id, 'rejected')}>Reject</button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <h3 style={{ marginTop: "2rem" }}>Service History</h3>
          <div className="grid" style={{ marginBottom: "2rem" }}>
            {bookings.filter(b => b.status !== 'pending').length === 0 ? (
              <p>No past services.</p>
            ) : (
              bookings.filter(b => b.status !== 'pending').map((booking) => (
                <div key={booking._id} className="card" style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "1rem", padding: "1rem", width: "100%", maxWidth: "400px" }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: "0 0 0.25rem 0" }}>{booking.service?.name}</h4>
                    <p style={{ margin: "0 0 0.25rem 0", fontSize: "0.85rem", opacity: 0.8 }}>Requested by: {booking.farmer?.name}</p>
                  </div>
                  <div>
                    <span className={`status-badge ${booking.status}`}>{booking.status}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
      {user.role === "admin" && (
        <div className="admin-profile-section" style={{ marginTop: "2rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
            
            {/* Left Side: Pending Requests */}
            <div>
              <h3 style={{ color: "var(--primary-color)", marginBottom: "1.5rem" }}>🔔 Registration Requests</h3>
              {pendingOwners.length === 0 ? (
                <p style={{ opacity: 0.6 }}>No pending registration requests.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {pendingOwners.map(owner => (
                    <div key={owner._id} className="card" style={{ display: "flex", flexDirection: "column", gap: "1rem", padding: "1rem", width: "100%", maxWidth: "400px" }}>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: "0 0 0.25rem 0" }}>{owner.name}</h4>
                        <p style={{ margin: "0", fontSize: "0.85rem", opacity: 0.7 }}>{owner.email}</p>
                      </div>
                      <div style={{ display: "flex", gap: "10px" }}>
                        <button 
                          className="btn-primary" 
                          style={{ background: "#22c55e", flex: 1, padding: "0.5rem", fontSize: "0.85rem" }}
                          onClick={() => handleOwnerApproval(owner._id, 'accepted')}
                        >
                          Accept
                        </button>
                        <button 
                          className="btn-primary" 
                          style={{ background: "#ef4444", flex: 1, padding: "0.5rem", fontSize: "0.85rem" }}
                          onClick={() => handleOwnerApproval(owner._id, 'rejected')}
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Side: Active Equipment Owners */}
            <div>
              <h3 style={{ marginBottom: "1.5rem" }}>👥 Active Equipment Owners</h3>
              {activeOwners.length === 0 ? (
                <p style={{ opacity: 0.6 }}>No active owners found.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {activeOwners.map(owner => (
                    <div key={owner._id} className="card" style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "1rem", padding: "1rem", width: "100%", maxWidth: "400px" }}>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: "0 0 0.25rem 0" }}>{owner.name}</h4>
                        <p style={{ margin: "0", fontSize: "0.85rem", opacity: 0.7 }}>{owner.email}</p>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span className="status-badge owner" style={{ margin: 0, background: "rgba(34, 197, 94, 0.1)", color: "#22c55e" }}>Active</span>
                        <button 
                          onClick={() => handleDeleteOwner(owner._id)}
                          style={{ 
                            background: "rgba(239, 68, 68, 0.1)", 
                            color: "#ef4444", 
                            border: "none", 
                            borderRadius: "4px", 
                            padding: "4px 8px", 
                            cursor: "pointer",
                            fontSize: "0.8rem"
                          }}
                          title="Delete Owner"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;