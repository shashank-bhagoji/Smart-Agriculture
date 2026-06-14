import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import API from "../services/api";

function GroupBooking() {
  const { t } = useTranslation();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = () => {
    API.get("/group-bookings")
      .then((res) => setGroups(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const joinGroup = async (groupId) => {
    if (!token) {
      alert("Please login to join a group.");
      return;
    }
    try {
      await API.patch(`/group-bookings/${groupId}/join`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMsg("Successfully joined the group!");
      fetchGroups();
    } catch (err) {
      setMsg(err.response?.data?.message || "Failed to join group.");
    }
  };

  return (
    <div className="container">
      <h2 className="page-title">{t("Communal Group Bookings", "Communal Group Bookings")}</h2>
      <p className="page-subtitle">{t("Join forces with other farmers to share equipment costs and resources.", "Join forces with other farmers to share equipment costs and resources.")}</p>

      {msg && <p className={msg.includes("Success") ? "success-msg" : "error-msg"} style={{ marginBottom: "1rem" }}>{msg}</p>}

      {loading && <p className="loading-text">{t("Loading groups...", "Loading groups...")}</p>}

      <div className="grid">
        {groups.map((group) => (
          <div key={group._id} className="card group-card">
            <div className="group-badge">{t("Group", "Group")}: {group.equipment?.name ? t(group.equipment.name, group.equipment.name) : ""}</div>
            <h3>{t("Organized by", "Organized by")}: {group.leader?.name}</h3>
            <p><strong>{t("Total Price", "Total Price")}:</strong> ₹{group.totalPrice}</p>
            <p><strong>{t("Split Price", "Split Price")}:</strong> <span className="price">₹{(group.totalPrice / group.members.length).toFixed(2)}</span> / {t("person", "person")}</p>
            
            <div className="members-list" style={{ marginTop: "1rem" }}>
              <strong>{t("Members", "Members")} ({group.members.length}):</strong>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
                {group.members.map((m) => (
                  <span key={m._id} className="badge" style={{ background: "rgba(255,255,255,0.1)", color: "#fff" }}>{m.name}</span>
                ))}
              </div>
            </div>

            <div style={{ marginTop: "1.5rem" }}>
               <span className={`status-badge ${group.status}`}>{t(group.status, group.status)}</span>
            </div>

            <button 
              className="btn-primary" 
              style={{ marginTop: "1rem", width: "100%" }}
              disabled={group.status !== 'forming'}
              onClick={() => joinGroup(group._id)}
            >
              {group.status === 'forming' ? t('Join Group', 'Join Group') : t('Full / Closed', 'Full / Closed')}
            </button>
          </div>
        ))}

        {!loading && groups.length === 0 && (
          <p className="empty-state">{t("No active groups found. Be the first to start one!", "No active groups found. Be the first to start one!")}</p>
        )}
      </div>

      <div className="card" style={{ marginTop: "3rem", background: "linear-gradient(135deg, var(--bg-surface), rgba(16,185,129,0.05))" }}>
        <h3>{t("Start a New Group?", "Start a New Group?")}</h3>
        <p>{t("Book equipment and let others join you to split the costs.", "Book equipment and let others join you to split the costs.")}</p>
        <button className="btn-secondary" style={{ marginTop: "1rem" }} onClick={() => window.location.href = '/equipment'}>
          {t("Go to Equipment", "Go to Equipment")}
        </button>
      </div>
    </div>
  );
}

export default GroupBooking;