// src/pages/Login.jsx
import React, { useState } from "react";
import { useNavigate, Navigate, Link } from "react-router-dom";
import "../styles/Login.css";

const API_BASE =
  import.meta.env.VITE_API_BASE || "/api";

export default function Login() {
  const navigate = useNavigate();
  const [isPanelActive, setIsPanelActive] = useState(false);

  // LOGIN FORM
  const [loginForm, setLoginForm] = useState({
    username: "",
    password: "",
  });

  // SIGNUP FORM
  const [signupForm, setSignupForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // If token exists → redirect
  if (localStorage.getItem("token")) {
    return <Navigate to="/" replace />;
  }

  // ---------------- LOGIN ----------------
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!loginForm.username || !loginForm.password) {
      setError("Please enter both username and password.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginForm),
      });

      const data = await res.json();

      if (!res.ok || data.ok === false) {
        setError(data.error || "Invalid username or password!");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/", { replace: true });
    } catch {
      setError("Network error. Please try again.");
    }
  };

  // ---------------- SIGNUP ----------------
  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const { username, email, password, confirmPassword } = signupForm;

    if (!username || !email || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signupForm),
      });

      const data = await res.json();

      if (!res.ok || data.ok === false) {
        if (data.error?.includes("username")) {
          setError("Username already exists!");
        } else if (data.error?.includes("email")) {
          setError("Email already exists!");
        } else {
          setError(data.error || "Registration failed.");
        }
        return;
      }

      setSuccess("Account created successfully! Please sign in.");
      setIsPanelActive(false);

      setSignupForm({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
    } catch {
      setError("Registration failed. Please try again.");
    }
  };

  return (
    <div className="login-page-global">
      <div className={`auth-wrapper ${isPanelActive ? "panel-active" : ""}`}>

        {/* ALERTS */}
        {error && <div className="alert error-alert">{error}</div>}
        {success && <div className="alert success-alert">{success}</div>}

        {/* SIGNUP */}
        <div className="auth-form-box register-form-box">
          <form onSubmit={handleSignupSubmit}>
            <h1>Create Account</h1>

            <div className="social-links">
              <a><i className="fab fa-facebook-f" /></a>
              <a><i className="fab fa-google" /></a>
              <a><i className="fab fa-linkedin-in" /></a>
            </div>

            <span>or use your email for registration</span>

            <input
              type="text"
              name="username"
              placeholder="Full Name"
              value={signupForm.username}
              onChange={(e) =>
                setSignupForm({ ...signupForm, [e.target.name]: e.target.value })
              }
              required
            />

            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={signupForm.email}
              onChange={(e) =>
                setSignupForm({ ...signupForm, [e.target.name]: e.target.value })
              }
              required
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={signupForm.password}
              onChange={(e) =>
                setSignupForm({ ...signupForm, [e.target.name]: e.target.value })
              }
              required
            />

            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={signupForm.confirmPassword}
              onChange={(e) =>
                setSignupForm({ ...signupForm, [e.target.name]: e.target.value })
              }
              required
            />

            <button type="submit">Sign Up</button>
          </form>
        </div>

        {/* LOGIN */}
        <div className="auth-form-box login-form-box">
          <form onSubmit={handleLoginSubmit}>
            <h1>Sign In</h1>

            <div className="social-links">
              <a><i className="fab fa-facebook-f" /></a>
              <a><i className="fab fa-google" /></a>
              <a><i className="fab fa-linkedin-in" /></a>
            </div>

            <span>or use your account</span>

            <input
              type="text"
              name="username"
              placeholder="Email Address"
              value={loginForm.username}
              onChange={(e) =>
                setLoginForm({ ...loginForm, [e.target.name]: e.target.value })
              }
              required
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={loginForm.password}
              onChange={(e) =>
                setLoginForm({ ...loginForm, [e.target.name]: e.target.value })
              }
              required
            />

            {/* Correct Forgot Password Route */}
            <Link to="/forgot-password">Forgot your password?</Link>

            <button type="submit">Sign In</button>
          </form>
        </div>

        {/* SLIDE PANELS */}
        <div className="slide-panel-wrapper">
          <div className="slide-panel">
            <div className="panel-content panel-content-left">
              <h1>Welcome Back!</h1>
              <p>Stay connected by logging in with your credentials.</p>
              <button
                className="transparent-btn"
                onClick={() => setIsPanelActive(false)}
              >
                Sign In
              </button>
            </div>

            <div className="panel-content panel-content-right">
              <h1>Hey There!</h1>
              <p>Begin your amazing journey by creating an account today.</p>
              <button
                className="transparent-btn"
                onClick={() => setIsPanelActive(true)}
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
