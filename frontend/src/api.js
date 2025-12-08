// ===============================================
// src/api.js  (FINAL UPDATED VERSION WITH DEFAULTS API)
// ===============================================

// Loads backend URL from .env → VITE_API_BASE
// Fallback for local dev → http://127.0.0.1:5000/api
export const API_BASE =
  import.meta.env.VITE_API_BASE || "http://127.0.0.1:5000/api";

// -----------------------------------------------
// SAFE REQUEST WRAPPER
// -----------------------------------------------
async function safeRequest(path, options = {}) {
  try {
    const url = `${API_BASE}${path}`;

    const fetchOptions = {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    };

    // For GET → backend MUST NOT receive a body
    if (fetchOptions.method === "GET") {
      delete fetchOptions.body;
    }

    const res = await fetch(url, fetchOptions);

    const text = await res.text();
    const data = text ? JSON.parse(text) : null;

    if (!res.ok) {
      throw new Error(data?.error || "Request failed");
    }

    return data;
  } catch (err) {
    console.error("API ERROR:", err);
    throw err;
  }
}

// =========================================================
// AUTH APIs
// =========================================================

export const loginUser = (body) =>
  safeRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify(body),
  });

export const registerUser = (body) =>
  safeRequest("/auth/register", {
    method: "POST",
    body: JSON.stringify(body),
  });

export const forgotPassword = (body) =>
  safeRequest("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify(body),
  });

// =========================================================
// PROFILE APIs
// =========================================================

export const getProfile = () =>
  safeRequest("/user/profile", {
    method: "GET",
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });

export const updateProfile = (body) =>
  safeRequest("/user/profile", {
    method: "PUT",
    body: JSON.stringify(body),
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });

export const changePassword = (body) =>
  safeRequest("/user/change-password", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });

// =========================================================
// CLIENT CONFIG APIs (ALL 3 TABLES)
// =========================================================

// Joined client list → all tables combined
export const fetchClients = () => safeRequest("/clients");

// Raw tables
export const fetchClientDetails = () => safeRequest("/client-details");
export const fetchNotificationConfigs = () =>
  safeRequest("/notification-configs");

// ⭐ BACKEND DEFAULT VALUES for AddClient / EditClient
export const fetchClientDefaults = () => safeRequest("/client-defaults");

// Single client for EditClient
export const getClient = (id) => safeRequest(`/client/${id}`);

// Create (all 3 tables)
export const createClient = (data) =>
  safeRequest("/create-client", {
    method: "POST",
    body: JSON.stringify(data),
  });

// Update (all 3 tables)
export const updateClient = (id, data) =>
  safeRequest(`/update-client/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

// Delete (all 3 tables)
export const deleteClient = (id) =>
  safeRequest(`/delete-client/${id}`, {
    method: "DELETE",
  });
