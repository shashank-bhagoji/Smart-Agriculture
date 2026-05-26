import { useEffect, useState } from "react";
import API from "../services/api";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [pendingOwners, setPendingOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, []);

  const fetchData = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [statsRes, usersRes, pendingRes] = await Promise.all([
        API.get("/admin/stats", { headers }),
        API.get("/admin/users", { headers }),
        API.get("/admin/pending-owners", { headers })
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setPendingOwners(pendingRes.data);
    } catch (err) {
      console.error("Admin fetch failed", err);
    } finally {
      setLoading(false);
    }
  };

  const updateRole = async (userId, newRole) => {
    try {
      await API.patch(`/admin/users/${userId}/role`, { role: newRole }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch (err) {
      alert("Failed to update role");
    }
  };

  const handleOwnerApproval = async (ownerId, status) => {
    try {
      await API.patch(`/admin/owners/${ownerId}/approve`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(`Owner registration ${status}!`);
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Failed to process approval");
    }
  };

  if (loading) return <div className="container loading-text">Loading Admin Panel...</div>;

  const chartData = stats ? [
    { name: 'Users', value: stats.users, color: '#10b981' },
    { name: 'Equipment', value: stats.equipment, color: '#3b82f6' },
    { name: 'Services', value: stats.services, color: '#f59e0b' },
    { name: 'Bookings', value: stats.totalBookings, color: '#8b5cf6' },
  ] : [];

  return (
    <div className="container">
      <h2 className="page-title">Admin Command Center</h2>
      <p className="page-subtitle">Monitor platform growth, manage user roles, and analyze revenue trends.</p>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">₹{stats?.totalRevenue.toLocaleString()}</div>
          <div className="stat-label">Total Revenue</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats?.pendingBookings}</div>
          <div className="stat-label">Pending Bookings</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats?.users}</div>
          <div className="stat-label">Total Users</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats?.equipment}</div>
          <div className="stat-label">Listings</div>
        </div>
      </div>

      {/* NEW: Pending Owner Approvals */}
      {pendingOwners.length > 0 && (
        <div className="card" style={{ marginTop: "2rem", border: "1px solid var(--primary-color)" }}>
          <h3 style={{ color: "var(--primary-color)" }}>⚠️ Pending Owner Approvals ({pendingOwners.length})</h3>
          <p className="page-subtitle">New equipment owners waiting for registration approval.</p>
          <div className="grid" style={{ marginTop: "1rem" }}>
            {pendingOwners.map(owner => (
              <div key={owner._id} className="card" style={{ background: "rgba(255,255,255,0.02)", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.2rem" }}>
                <div>
                  <h4 style={{ margin: 0 }}>{owner.name}</h4>
                  <p style={{ margin: "4px 0 0 0", fontSize: "0.85rem", opacity: 0.7 }}>{owner.email}</p>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button 
                    className="btn-primary" 
                    style={{ background: "#22c55e", padding: "0.5rem 1rem", fontSize: "0.85rem" }}
                    onClick={() => handleOwnerApproval(owner._id, 'accepted')}
                  >
                    Accept
                  </button>
                  <button 
                    className="btn-primary" 
                    style={{ background: "#ef4444", padding: "0.5rem 1rem", fontSize: "0.85rem" }}
                    onClick={() => handleOwnerApproval(owner._id, 'rejected')}
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", marginTop: "3rem" }}>
        {/* Chart */}
        <div className="card">
          <h3>Platform Overview</h3>
          <div style={{ width: '100%', height: 300, marginTop: "1.5rem" }}>
            <ResponsiveContainer>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Bar dataKey="value">
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* User Management */}
        <div className="card" style={{ maxHeight: "450px", overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <h3>User Management</h3>
          <div style={{ overflowY: "auto", marginTop: "1rem", flex: 1 }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ textAlign: "left", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                  <th style={{ padding: "0.75rem" }}>Name</th>
                  <th style={{ padding: "0.75rem" }}>Role</th>
                  <th style={{ padding: "0.75rem" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id} style={{ borderTop: "1px solid var(--border-color)" }}>
                    <td style={{ padding: "0.75rem", fontSize: "0.9rem" }}>{u.name}<br/><small style={{ opacity: 0.5 }}>{u.email}</small></td>
                    <td style={{ padding: "0.75rem" }}>
                      <span className={`status-badge ${u.role}`} style={{ margin: 0 }}>{u.role}</span>
                    </td>
                    <td style={{ padding: "0.75rem" }}>
                      <select 
                        value={u.role} 
                        onChange={(e) => updateRole(u._id, e.target.value)}
                        style={{ background: "transparent", color: "#fff", border: "1px solid var(--border-color)", borderRadius: "4px", fontSize: "0.8rem" }}
                      >
                        <option value="farmer">Farmer</option>
                        <option value="owner">Owner</option>
                        <option value="service_provider">Provider</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Moderation Section */}
      <div className="card" style={{ marginTop: "2rem" }}>
        <h3>Content Moderation</h3>
        <p className="page-subtitle" style={{ margin: 0 }}>Review and remove listings that violate platform policies.</p>
        
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", marginTop: "1.5rem" }}>
           <div>
             <h4>Active Equipment</h4>
             <div className="moderation-list">
                <p style={{ opacity: 0.5, fontSize: "0.85rem" }}>Equipment listings are moderated here.</p>
                <button className="btn-secondary" onClick={() => alert("Logic to list all equipment with delete buttons goes here")}>Load Equipment</button>
             </div>
           </div>
           <div>
             <h4>Farm Services</h4>
             <div className="moderation-list">
                <p style={{ opacity: 0.5, fontSize: "0.85rem" }}>Service listings are moderated here.</p>
                <button className="btn-secondary" onClick={() => alert("Logic to list all services with delete buttons goes here")}>Load Services</button>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;