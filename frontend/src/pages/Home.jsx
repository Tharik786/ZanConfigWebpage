import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="home-hero">
      <p className="hero-box">
        Manage your client-specific configuration
      </p>
      <div style={{ marginTop: 16 }}>
        <Link className="btn primary" to="/client-app-details">
          Add Client
        </Link>
        <Link className="btn hollow" to="/client-list" style={{ marginLeft: 10 }}>
          View Clients
        </Link>
      </div>
    </div>
  );
}
