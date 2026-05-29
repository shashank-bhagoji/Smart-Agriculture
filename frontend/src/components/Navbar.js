import { Link, useNavigate, NavLink } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { useTranslation } from 'react-i18next';
import API from "../services/api";

function Navbar() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const isLoggedIn = !!token;

  let userRole = null;
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      userRole = payload.role;
    } catch (e) {}
  }

  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");
  const dropdownRef = useRef(null);
  const langDropdownRef = useRef(null);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === "dark" ? "light" : "dark");
  };

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'kn', name: 'ಕನ್ನಡ' }
  ];

  const unreadCount = notifications.filter((n) => !n.read).length;

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

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
      if (langDropdownRef.current && !langDropdownRef.current.contains(e.target)) {
        setShowLangDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const markAllRead = async () => {
    try {
      await API.patch("/notifications/read-all", {}, { headers: { Authorization: `Bearer ${token}` } });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {}
  };

  const clearAllNotifications = async () => {
    try {
      await API.delete("/notifications", { headers: { Authorization: `Bearer ${token}` } });
      setNotifications([]);
    } catch {}
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <Link to="/" className="nav-brand">
        Smart Agriculture
      </Link>
      <div className="nav-links">
        <NavLink to="/" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>{t('home')}</NavLink>
        {userRole !== "owner" && (
          <NavLink to="/equipment" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>{t('equipment')}</NavLink>
        )}
        {userRole === "farmer" && (
          <NavLink to="/service-marketplace" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>{t('services')}</NavLink>
        )}
        {(userRole === "farmer" || userRole === "admin") && (
          <NavLink to="/recommendations" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>{t('recommendations')}</NavLink>
        )}

        <NavLink to="/weather" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>{t('weather')}</NavLink>


        {/* Theme Toggle */}
        <button className="theme-toggle" onClick={toggleTheme} title="Toggle Theme">
          {theme === "dark" ? "☀️" : "🌙"}
        </button>

        {/* Language Switcher Dropdown */}
        <div className="notif-wrapper" ref={langDropdownRef}>
          <button className="lang-btn" onClick={() => setShowLangDropdown(!showLangDropdown)}>
            🌐 {languages.find(l => l.code === i18n.language)?.name || 'Language'}
          </button>
          {showLangDropdown && (
            <div className="notif-dropdown lang-dropdown">
              {languages.map(l => (
                <div 
                  key={l.code} 
                  className="notif-item lang-item" 
                  onClick={() => { 
                    i18n.changeLanguage(l.code); 
                    setShowLangDropdown(false); 
                  }}
                >
                  {l.name}
                </div>
              ))}
            </div>
          )}
        </div>

        {isLoggedIn ? (
          <>
            <Link to="/profile" className="nav-link">{t('profile')}</Link>

            {/* Notification Bell */}
            <div className="notif-wrapper" ref={dropdownRef}>
              <button className="notif-bell" onClick={() => setShowDropdown(!showDropdown)}>
                🔔
                {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
              </button>
              {showDropdown && (
                <div className="notif-dropdown">
                  <div className="notif-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px" }}>
                    <strong style={{ fontSize: "0.9rem" }}>{t('notifications')}</strong>
                    <div style={{ display: "flex", gap: "8px" }}>
                      {unreadCount > 0 && (
                        <button className="mark-read-btn" onClick={markAllRead} style={{ fontSize: "0.7rem", padding: "2px 6px" }}>{t('mark_all_read')}</button>
                      )}
                      {notifications.length > 0 && (
                        <button className="mark-read-btn" onClick={clearAllNotifications} style={{ fontSize: "0.7rem", padding: "2px 6px", background: "rgba(239, 68, 68, 0.1)", color: "#ef4444" }}>{t('clear_all')}</button>
                      )}
                    </div>
                  </div>
                  {notifications.length === 0 ? (
                    <p className="notif-empty">{t('no_notifications')}</p>
                  ) : (
                    notifications.slice(0, 8).map((n) => (
                      <div key={n._id} className={`notif-item ${n.read ? "" : "unread"}`}>
                        <span className="notif-dot" />
                        <span>{n.message}</span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            <button className="nav-link logout-btn" onClick={handleLogout}>{t('logout')}</button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-link">{t('login')}</Link>
            <Link to="/register" className="nav-link btn-nav">{t('register')}</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;