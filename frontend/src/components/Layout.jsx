// src/layout/Layout.jsx
import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { API_BASE } from "../api";
import "../styles/Layout.css";

import logo from "../assets/logo.jpeg";  

export default function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();

  const [showMenu, setShowMenu] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      setUser(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    setShowMenu(false);
  }, [location.pathname]);

  const handleLogout = () => {
    const token = localStorage.getItem("token");

    if (token) {
      fetch(`${API_BASE}/auth/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      }).catch(() => {});
    }

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  const initials = (user?.username || "U")[0].toUpperCase();

  const isActive = (path) =>
    location.pathname === path ? "nav-link active" : "nav-link";

  return (
    <div className="layout-wrapper">
      <header className="layout-header">
        <div className="header-container">

          {/* ⭐ ADDED LOGO + TITLE ROW ⭐ */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <img
              src={logo}
              alt="ZanCompute Logo"
              style={{
                height: 45,
                width: "auto",
                objectFit: "contain",
                borderRadius: 6,
              }}
            />
            <h2 className="brand-name">ZanConfig Client App</h2>
          </div>

          {/* NAVIGATION */}
          <nav className="desktop-nav">
            <Link to="/" className={isActive("/")}>Home</Link>
            <Link to="/client-app-details" className={isActive("/client-app-details")}>Add Client</Link>
            <Link to="/client-list" className={isActive("/client-list")}>Client List</Link>
          </nav>

          {/* USER MENU */}
          <div className="user-menu" style={{ position: "relative", zIndex: 20000 }}>
            <div className="user-box" onClick={() => setShowMenu(!showMenu)}>
              <div className="user-avatar">{initials}</div>
              <div className="user-details">
                <span className="user-name">{user?.username}</span>
                <span className="user-email">{user?.email}</span>
              </div>
              <span className="arrow">{showMenu ? "▲" : "▼"}</span>
            </div>

            {showMenu && (
              <div className="user-dropdown">
                <div className="dropdown-header">
                  <div className="avatar-big">{initials}</div>
                  <div>
                    <div className="dropdown-name">{user?.username}</div>
                    <div className="dropdown-email">{user?.email}</div>
                  </div>
                </div>

                <div className="dropdown-item" onClick={() => navigate("/profile")}>
                  👤 Profile
                </div>

                <div className="dropdown-item" onClick={() => navigate("/change-password")}>
                  🔐 Change Password
                </div>

                <div className="dropdown-item logout" onClick={handleLogout}>
                  🚪 Logout
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="layout-main">
        <div className="layout-container">{children}</div>
      </main>

      {/* FOOTER */}
      <footer className="layout-footer">
        <p>© 2025 ZanConfig. Client Configuration Manager.</p>
      </footer>
    </div>
  );
}
