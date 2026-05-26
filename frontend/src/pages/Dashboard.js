import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

function Dashboard() {
  const { t, i18n } = useTranslation();

  return (
    <div className="dashboard-container">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            {i18n.language === 'en' ? (
              <><span className="text-gradient">Modernize</span> Your Farming with Smart Equipment</>
            ) : (
              t('hero_title')
            )}
          </h1>
          <p className="hero-text">
            {t('hero_subtitle')}
          </p>
          <div className="hero-btns">
            <Link to="/equipment" className="btn-primary hero-btn" style={{ width: "auto" }}>{t('browse_btn')}</Link>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">500+</div>
          <div className="stat-label">{t('stats_machines')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">1.2k+</div>
          <div className="stat-label">{t('stats_farmers')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">₹2M+</div>
          <div className="stat-label">{t('stats_earnings')}</div>
        </div>
        <div className="stat-card">
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
          <Link to="/equipment" className="nav-link" style={{ color: 'var(--primary)', marginTop: '1rem', display: 'block' }}>{t('learn_more')} →</Link>
        </div>
        <div className="card service-feature">
          <div className="service-icon">👨‍🌾</div>
          <h3>{t('expert_operators_title')}</h3>
          <p>{t('expert_operators_desc')}</p>
          <Link to="/operator-hiring" className="nav-link" style={{ color: 'var(--primary)', marginTop: '1rem', display: 'block' }}>{t('learn_more')} →</Link>
        </div>
        <div className="card service-feature">
          <div className="service-icon">🌦️</div>
          <h3>{t('weather_insights_title')}</h3>
          <p>{t('weather_insights_desc')}</p>
          <Link to="/weather" className="nav-link" style={{ color: 'var(--primary)', marginTop: '1rem', display: 'block' }}>{t('learn_more')} →</Link>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;