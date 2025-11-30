// src/pages/Profile.jsx
import React, { useEffect, useState } from "react";
import { API_BASE } from "../api";

export default function Profile() {
  const [form, setForm] = useState({ username: "", email: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const token = localStorage.getItem("token");

  // Fetch Logged-in User Profile
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError("");

      try {
        const res = await fetch(`${API_BASE}/user/profile`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (!res.ok || !data.ok) {
          setError(data.error || "Failed to load profile");
        } else {
          setForm({
            username: data.user.username,
            email: data.user.email,
          });

          // keep navbar name in sync
          localStorage.setItem("user", JSON.stringify(data.user));
        }
      } catch (e) {
        setError("Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchProfile();
    } else {
      setError("No token found, please login again.");
      setLoading(false);
    }
  }, [token]);

  // Update profile
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccessMsg("");

    try {
      const res = await fetch(`${API_BASE}/user/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        setError(data.error || "Failed to update profile");
      } else {
        setSuccessMsg("Profile updated successfully");
        localStorage.setItem("user", JSON.stringify(data.user));
      }
    } catch (e) {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Loading profile…</p>;

  return (
    <div style={{ display: "flex", justifyContent: "center", paddingTop: 40 }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        <h2 style={{ marginBottom: 16, textAlign: "center" }}>Profile</h2>

        {error && (
          <div
            style={{
              background: "#fee2e2",
              padding: 10,
              borderRadius: 6,
              marginBottom: 12,
              color: "#b91c1c",
              fontSize: 14,
            }}
          >
            {error}
          </div>
        )}

        {successMsg && (
          <div
            style={{
              background: "#dcfce7",
              padding: 10,
              borderRadius: 6,
              marginBottom: 12,
              color: "#166534",
              fontSize: 14,
            }}
          >
            {successMsg}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <div>
            <label style={{ fontSize: 14 }}>Username</label>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, username: e.target.value }))
              }
              style={{
                width: "100%",
                padding: 10,
                borderRadius: 6,
                border: "1px solid #d1d5db",
                fontSize: 14,
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: 14 }}>Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, email: e.target.value }))
              }
              style={{
                width: "100%",
                padding: 10,
                borderRadius: 6,
                border: "1px solid #d1d5db",
                fontSize: 14,
              }}
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            style={{
              padding: "8px 12px",
              background: "#3246a8",
              color: "#fff",
              border: "none",
              borderRadius: 4,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
