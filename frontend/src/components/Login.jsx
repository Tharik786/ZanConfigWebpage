// src/pages/Login.jsx
import React, { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import "../styles/Login.css";
import { API_BASE } from "../api";

export default function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [signupForm, setSignupForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [forgotForm, setForgotForm] = useState({ email: "" });

  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [showSignup, setShowSignup] = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  if (token) return <Navigate to="/" replace />;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSignupChange = (e) => {
    setSignupForm({ ...signupForm, [e.target.name]: e.target.value });
    setError("");
  };

  const handleForgotChange = (e) => {
    setForgotForm({ ...forgotForm, [e.target.name]: e.target.value });
    setError("");
  };

  /* LOGIN */
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!data.ok) {
        setError(data.error || "Username or password incorrect");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      navigate("/", { replace: true });
    } catch {
      setError("Network error. Try again.");
    }
  };

  /* SIGNUP */
  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (signupForm.password !== signupForm.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signupForm),
      });

      const data = await res.json();
      if (!data.ok) return setError(data.error);

      setSuccessMsg("Account created! Please login");
      setShowSignup(false);
    } catch {
      setError("Registration failed. Try again.");
    }
  };

  /* FORGOT PASSWORD */
  const handleForgotSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(forgotForm),
      });

      const data = await res.json();
      if (!data.ok) return setError(data.error);

      setSuccessMsg("Reset link sent!");
      setShowForgot(false);
    } catch {
      setError("Network error. Try again.");
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-bg-gradient"></div>
      <div className="login-bg-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>

      <div className="login-container">
        {successMsg && <div className="success-message">{successMsg}</div>}
        {error && <div className="error-alert">{error}</div>}

        {/* LOGIN FORM */}
        {!showSignup && !showForgot && (
          <form className="login-form" onSubmit={handleLoginSubmit}>
            <h2 className="form-title">Welcome Back</h2>
            <p className="form-subtitle">Sign in to your account</p>

            <label className="form-label">Username or Email</label>
            <input
              className="form-input"
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="Enter username or email"
            />

            <label className="form-label">Password</label>
            <input
              className="form-input"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter password"
            />

            <button type="submit" className="login-btn">
              SIGN IN
            </button>

            <div className="form-divider"><span>Or</span></div>

            <div className="auth-links">
              <button
                type="button"
                className="link-btn"
                onClick={() => setShowForgot(true)}
              >
                Forgot Password?
              </button>
              <button
                type="button"
                className="link-btn"
                onClick={() => setShowSignup(true)}
              >
                Create Account
              </button>
            </div>
          </form>
        )}

        {/* SIGNUP FORM */}
        {showSignup && (
          <form className="login-form" onSubmit={handleSignupSubmit}>
            <h2 className="form-title">Create Account</h2>

            <input
              className="form-input"
              type="text"
              name="username"
              placeholder="Username"
              value={signupForm.username}
              onChange={handleSignupChange}
            />

            <input
              className="form-input"
              type="email"
              name="email"
              placeholder="Email"
              value={signupForm.email}
              onChange={handleSignupChange}
            />

            <input
              className="form-input"
              type="password"
              name="password"
              placeholder="Password"
              value={signupForm.password}
              onChange={handleSignupChange}
            />

            <input
              className="form-input"
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={signupForm.confirmPassword}
              onChange={handleSignupChange}
            />

            <button className="login-btn" type="submit">
              Create Account
            </button>

            <button
              type="button"
              className="back-btn"
              onClick={() => setShowSignup(false)}
            >
              ← Back to Login
            </button>
          </form>
        )}

        {/* FORGOT PASSWORD FORM */}
        {showForgot && (
          <form className="login-form" onSubmit={handleForgotSubmit}>
            <h2 className="form-title">Reset Password</h2>

            <input
              className="form-input"
              type="email"
              name="email"
              placeholder="Enter your email"
              value={forgotForm.email}
              onChange={handleForgotChange}
            />

            <button className="login-btn" type="submit">
              Send Reset Link
            </button>

            <button
              type="button"
              className="back-btn"
              onClick={() => setShowForgot(false)}
            >
              ← Back to Login
            </button>
          </form>
        )}
      </div>

      <footer className="login-footer">
        © 2025 ZanConfig. All rights reserved.
      </footer>
    </div>
  );
}
