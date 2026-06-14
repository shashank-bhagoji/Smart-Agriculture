import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import API from "../services/api";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, AreaChart, Area, XAxis, CartesianGrid } from 'recharts';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6'];

function Analytics() {
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    API.get("/admin/stats", { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setStats(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return <div className="container">{t("Loading Analytics...", "Loading Analytics...")}</div>;

  const distributionData = [
    { name: t('Equipment', 'Equipment'), value: stats?.equipment || 0 },
    { name: t('Services', 'Services'), value: stats?.services || 0 },
  ];

  // Dummy trend data for visualization
  const trendData = [
    { name: t('Jan', 'Jan'), rev: 4000 },
    { name: t('Feb', 'Feb'), rev: 3000 },
    { name: t('Mar', 'Mar'), rev: 5000 },
    { name: t('Apr', 'Apr'), rev: 4500 },
    { name: t('May', 'May'), rev: stats?.totalRevenue || 6000 },
  ];

  return (
    <div className="container">
      <h2 className="page-title">{t("Platform Analytics", "Platform Analytics")}</h2>
      
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", marginTop: "2rem" }}>
        {/* Revenue Area Chart */}
        <div className="card">
          <h3>{t("Revenue Growth (₹)", "Revenue Growth (₹)")}</h3>
          <div style={{ width: '100%', height: 300, marginTop: "1rem" }}>
            <ResponsiveContainer>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="rev" stroke="#10b981" fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distribution Pie Chart */}
        <div className="card">
          <h3>{t("Listings Distribution", "Listings Distribution")}</h3>
          <div style={{ width: '100%', height: 300, marginTop: "1rem" }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={distributionData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Analytics;