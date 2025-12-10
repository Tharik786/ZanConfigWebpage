// src/pages/ForgotPassword.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const API_BASE =
    import.meta.env.VITE_API_BASE || "http://127.0.0.1:5000/api";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setMsg("");

    if (!email) {
      setErr("Please enter your email.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok || data.ok === false) {
        setErr(data.error || "Unable to send reset link.");
        return;
      }

      setMsg("Password reset link has been sent to your email.");
      setEmail("");

    } catch {
      setErr("Network error. Try again.");
    }
  };

  // INLINE UI STYLES (Matches Login page UI)
  const styles = {
    wrapper: {
      width: "100%",
      height: "100vh",
      background: "#f2f4ff",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      fontFamily: "Poppins, sans-serif",
      padding: "20px",
    },
    card: {
      width: "420px",
      background: "#fff",
      padding: "40px 45px",
      borderRadius: "20px",
      boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
      textAlign: "center",
    },
    title: {
      fontSize: "28px",
      fontWeight: 700,
      marginBottom: "10px",
      color: "#333",
    },
    description: {
      fontSize: "14px",
      color: "#666",
      marginBottom: "20px",
      lineHeight: "22px",
    },
    input: {
      width: "100%",
      padding: "14px 18px",
      borderRadius: "12px",
      border: "2px solid transparent",
      background: "#f3f4f6",
      fontSize: "14px",
      margin: "10px 0 20px",
      outline: "none",
    },
    button: {
      width: "100%",
      padding: "14px",
      borderRadius: "25px",
      border: "none",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      color: "#fff",
      fontSize: "14px",
      letterSpacing: "1px",
      fontWeight: 600,
      cursor: "pointer",
      textTransform: "uppercase",
      boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
    },
    error: {
      background: "#ffe5e5",
      padding: "10px",
      borderRadius: "8px",
      color: "#c30000",
      fontSize: "14px",
      marginBottom: "12px",
    },
    success: {
      background: "#e6ffe9",
      padding: "10px",
      borderRadius: "8px",
      color: "#0d8a2b",
      fontSize: "14px",
      marginBottom: "12px",
    },
    backLink: {
      marginTop: "18px",
      display: "inline-block",
      fontSize: "14px",
      color: "#667eea",
      textDecoration: "none",
      fontWeight: 500,
    },
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>

        {err && <div style={styles.error}>{err}</div>}
        {msg && <div style={styles.success}>{msg}</div>}

        <h1 style={styles.title}>Forgot Password</h1>
        <p style={styles.description}>
          Enter your registered email and we will send you a password reset link.
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            style={styles.input}
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button type="submit" style={styles.button}>
            Send Reset Link
          </button>
        </form>

        <Link to="/login" style={styles.backLink}>
          ← Back to Login
        </Link>
      </div>
    </div>
  );
}
