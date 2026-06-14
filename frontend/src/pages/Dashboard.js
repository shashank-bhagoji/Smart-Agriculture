import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

function Dashboard() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const handleRestrictedClick = (e, path, serviceName) => {
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
        // Direct to the requested page
        navigate(path);
      } else {
        // If not farmer or admin, redirect to login page
        alert(`Access Restricted: Only Farmers and Admins have access to the ${serviceName}. Redirecting to Login...`);
        navigate("/login");
      }
    } catch (err) {
      navigate("/login");
    }
  };

  const handleAuthClick = (e, path) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    navigate(path);
  };

  const WrenchIcon = ({ color = "#3b82f6", size = 56 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  );

  const ProfileIcon = ({ color = "#6b7280", size = 56 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );

  const MachineIcon = ({ color = "#22c55e", size = 32 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 18h3m15 0h-3m-6 0h-3" />
      <circle cx="7" cy="15" r="4" />
      <circle cx="18" cy="15" r="3" />
      <path d="M11 15h4" />
      <path d="M7 11V7a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M15 11h3l3 4" />
    </svg>
  );

  const FarmerIcon = ({ color = "#f59e0b", size = 32 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="6" r="2.5" />
      <path d="M8 11l8 10" />
      <path d="M16 11l-8 10" />
    </svg>
  );

  const RupeeIcon = ({ color = "#22c55e", size = 32 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 3h12" />
      <path d="M6 8h12" />
      <path d="M6 13h8.5l-5 8" />
      <path d="M6 13h3" />
      <path d="M9 13c6.667 0 6.667-10 0-10" />
    </svg>
  );

  const StarIcon = ({ color = "#eab308", size = 32 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );

  const WeatherIcon = ({ color = "#3b82f6", size = 32 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z" />
      <path d="M12 2v2" />
      <path d="M18.5 5.5l-1.5 1.5" />
      <path d="M22 12h-2" />
    </svg>
  );

  const LeafIcon = ({ color = "#a855f7", size = 32 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
    </svg>
  );

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
          <div className="hero-badge">{t("Built for Karnataka Farmers", "Built for Karnataka Farmers")}</div>
          
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
              onClick={(e) => handleAuthClick(e, "/equipment")}
              className="btn-primary hero-btn" 
              style={{ width: "auto", display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
            >
              {t('browse_btn') || "Browse Equipment"} →
            </Link>
            <button 
              onClick={(e) => handleRestrictedClick(e, "/recommendations", "AI Advisor")}
              className="btn-secondary hero-btn" 
              style={{ width: "auto", display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "transparent" }}
            >
              {t("AI ADVISOR", "AI ADVISOR")}
            </button>
          </div>
        </div>
      </div>

      {/* Stats Section with Curated Icons */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>
            <MachineIcon color="#22c55e" size={36} />
          </div>
          <div className="stat-value">500+</div>
          <div className="stat-label">{t('stats_machines')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>
            <FarmerIcon color="#f59e0b" size={36} />
          </div>
          <div className="stat-value">1.2k+</div>
          <div className="stat-label">{t('stats_farmers')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>
            <RupeeIcon color="#22c55e" size={36} />
          </div>
          <div className="stat-value">₹2M+</div>
          <div className="stat-label">{t('stats_earnings')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>
            <StarIcon color="#eab308" size={36} />
          </div>
          <div className="stat-value">4.9/5</div>
          <div className="stat-label">{t('stats_rating')}</div>
        </div>
      </div>

      {/* Quick Services */}
      <h2 className="section-title">{t('explore_services')}</h2>
      <div className="grid">
        <div className="card service-feature" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div className="service-icon" style={{ background: '#dcfce7', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '56px', height: '56px', borderRadius: '16px', margin: '0 auto 1rem auto' }}>
            <MachineIcon color="#1f2937" size={28} />
          </div>
          <h3>{t('equip_rental_title')}</h3>
          <p>{t('equip_rental_desc')}</p>
          <Link to="/equipment" onClick={(e) => handleAuthClick(e, "/equipment")} className="nav-link" style={{ color: 'var(--primary)', marginTop: 'auto', display: 'block', fontWeight: "700" }}>{t('learn_more')} →</Link>
        </div>
        <div className="card service-feature" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div className="service-icon" style={{ background: '#ffedd5', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '56px', height: '56px', borderRadius: '16px', margin: '0 auto 1rem auto' }}>
            <FarmerIcon color="#1f2937" size={28} />
          </div>
          <h3>{t('expert_operators_title')}</h3>
          <p>{t('expert_operators_desc')}</p>
          <Link to="/operator-hiring" onClick={(e) => handleRestrictedClick(e, "/operator-hiring", "Expert Operators")} className="nav-link" style={{ color: 'var(--primary)', marginTop: 'auto', display: 'block', fontWeight: "700" }}>{t('learn_more')} →</Link>
        </div>
        <div className="card service-feature" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div className="service-icon" style={{ background: '#e0f2fe', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '56px', height: '56px', borderRadius: '16px', margin: '0 auto 1rem auto' }}>
            <WeatherIcon color="#1f2937" size={28} />
          </div>
          <h3>{t('weather_insights_title')}</h3>
          <p>{t('weather_insights_desc')}</p>
          <Link to="/weather" onClick={(e) => handleAuthClick(e, "/weather")} className="nav-link" style={{ color: 'var(--primary)', marginTop: 'auto', display: 'block', fontWeight: "700" }}>{t('learn_more')} →</Link>
        </div>
        <div className="card service-feature" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div className="service-icon" style={{ background: '#f3e8ff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '56px', height: '56px', borderRadius: '16px', margin: '0 auto 1rem auto' }}>
            <LeafIcon color="#1f2937" size={28} />
          </div>
          <h3>{t('ai_advisor_title', 'AI Advisor')}</h3>
          <p>{t('ai_advisor_subtitle', 'AI-powered crop and disease advisory for your farm.')}</p>
          <Link to="/recommendations" onClick={(e) => handleRestrictedClick(e, "/recommendations", "AI Advisor")} className="nav-link" style={{ color: 'var(--primary)', marginTop: 'auto', display: 'block', fontWeight: "700" }}>{t('learn_more')} →</Link>
        </div>
        <div className="card service-feature" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div className="service-icon" style={{ background: '#f1f5f9', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '56px', height: '56px', borderRadius: '16px', margin: '0 auto 1rem auto' }}>
            <WrenchIcon color="#1f2937" size={28} />
          </div>
          <h3>{t('Service Marketplace', 'Service Marketplace')}</h3>
          <p>{t('Browse and request farm services.', 'Browse and request farm services.')}</p>
          <Link to="/services" onClick={(e) => handleRestrictedClick(e, "/services", "Service Marketplace")} className="nav-link" style={{ color: 'var(--primary)', marginTop: 'auto', display: 'block', fontWeight: "700" }}>{t('learn_more')} →</Link>
        </div>
        <div className="card service-feature" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div className="service-icon" style={{ background: '#f1f5f9', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '56px', height: '56px', borderRadius: '16px', margin: '0 auto 1rem auto' }}>
            <ProfileIcon color="#1f2937" size={28} />
          </div>
          <h3>{t('Profile', 'Profile')}</h3>
          <p>{t('Manage your profile and bookings.', 'Manage your profile and bookings.')}</p>
          <Link to="/profile" onClick={(e) => handleAuthClick(e, "/profile")} className="nav-link" style={{ color: 'var(--primary)', marginTop: 'auto', display: 'block', fontWeight: "700" }}>{t('learn_more')} →</Link>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;