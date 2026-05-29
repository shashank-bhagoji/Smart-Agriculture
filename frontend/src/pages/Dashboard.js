import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

function Dashboard() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const handleAiAdvisorClick = (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    if (!token) {
      // Redirect to login if not authenticated
      navigate("/login");
      return;
    }

    try {
      // Decode JWT token payload
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userRole = payload.role;

      if (userRole === "farmer" || userRole === "admin") {
        // Direct to Recommendations page
        navigate("/recommendations");
      } else {
        // If not farmer or admin, redirect to login page
        alert("Access Restricted: Only Farmers and Admins have access to the AI Advisor. Redirecting to Login...");
        navigate("/login");
      }
    } catch (err) {
      navigate("/login");
    }
  };

  return (
    <div className="dashboard-container">
      {/* Hero Section */}
      <div className="hero-section">
        {/* Farm sunset background with perfect brightness filters */}
        <div 
          className="hero-bg" 
          style={{ 
            backgroundImage: "url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1600&q=80')" 
          }} 
        />
        <div className="hero-content">
          {/* Glassmorphic Pill capsule badge */}
          <div className="hero-badge">Built for Karnataka Farmers</div>
          
          <h1 className="hero-title">
            {i18n.language === 'en' ? (
              <><span className="text-gradient">Modernize</span> Your Farming with Smart Equipment</>
            ) : (
              t('hero_title')
            )}
          </h1>
          
          <p className="hero-text">
            {t('hero_subtitle') || "Connect with local equipment owners, hire expert operators, and access professional farm services — all in one powerful platform."}
          </p>
          
          <div className="hero-btns">
            <Link 
              to="/equipment" 
              className="btn-primary hero-btn" 
              style={{ width: "auto", display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
            >
              {t('browse_btn') || "Browse Equipment"} →
            </Link>
            <button 
              onClick={handleAiAdvisorClick}
              className="btn-secondary hero-btn" 
              style={{ width: "auto", display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "transparent" }}
            >
              AI ADVISOR
            </button>
          </div>
        </div>
      </div>

      {/* Stats Section with Curated Icons */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🚜</div>
          <div className="stat-value">500+</div>
          <div className="stat-label">{t('stats_machines')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-value">1.2k+</div>
          <div className="stat-label">{t('stats_farmers')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-value">₹2M+</div>
          <div className="stat-label">{t('stats_earnings')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-value">4.9/5</div>
          <div className="stat-label">{t('stats_rating')}</div>
        </div>
      </div>

      {/* Quick Services */}
      <h2 className="section-title">{t('explore_services')}</h2>
      <div className="grid">
        <div className="card service-feature">
          <div className="service-icon">🚜</div>
          <h3>{t('equip_rental_title')}</h3>
          <p>{t('equip_rental_desc')}</p>
          <Link to="/equipment" className="nav-link" style={{ color: 'var(--primary)', marginTop: 'auto', display: 'block', fontWeight: "700" }}>{t('learn_more')} →</Link>
        </div>
        <div className="card service-feature">
          <div className="service-icon">👨‍🌾</div>
          <h3>{t('expert_operators_title')}</h3>
          <p>{t('expert_operators_desc')}</p>
          <Link to="/operator-hiring" className="nav-link" style={{ color: 'var(--primary)', marginTop: 'auto', display: 'block', fontWeight: "700" }}>{t('learn_more')} →</Link>
        </div>
        <div className="card service-feature">
          <div className="service-icon">🌦️</div>
          <h3>{t('weather_insights_title')}</h3>
          <p>{t('weather_insights_desc')}</p>
          <Link to="/weather" className="nav-link" style={{ color: 'var(--primary)', marginTop: 'auto', display: 'block', fontWeight: "700" }}>{t('learn_more')} →</Link>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;