// =====================================================
// src/api.js
// FINAL – DYNAMIC YEAR/MONTH + AUTH + CRUD (PRODUCTION)
// =====================================================

export const API_BASE =
  import.meta.env.VITE_API_BASE || "/api";

// =====================================================
// SAFE REQUEST HELPER (JSON + AUTH SAFE)
// =====================================================
async function safeRequest(path, options = {}) {
  const url = `${API_BASE}${path}`;

  const fetchOptions = {
    credentials: "same-origin",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  };

  // 🚫 GET must not send body
  if (!fetchOptions.method || fetchOptions.method === "GET") {
    delete fetchOptions.body;
  }

  const res = await fetch(url, fetchOptions);
  const text = await res.text();

  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    throw new Error(data?.error || "Request failed");
  }

  return data;
}

// =====================================================
// AUTH
// =====================================================
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

// =====================================================
// PROFILE
// =====================================================
export const getProfile = () =>
  safeRequest("/user/profile", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

export const updateProfile = (body) =>
  safeRequest("/user/profile", {
    method: "PUT",
    body: JSON.stringify(body),
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

export const changePassword = (body) =>
  safeRequest("/user/change-password", {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

// =====================================================
// DASHBOARD – LAST UPDATED (PHL + PIT MONTHLY TABLES)
// =====================================================
export const fetchLastUpdated = (year, month) =>
  safeRequest(`/lastupdated?year=${year}&month=${month}`);

// =====================================================
// CLIENT LIST / DETAILS
// =====================================================
export const fetchClients = () =>
  safeRequest("/clients");

export const fetchClientDetails = () =>
  safeRequest("/client-details");

export const fetchNotificationConfigs = () =>
  safeRequest("/notification-configs");

export const fetchClientDefaults = () =>
  safeRequest("/client-defaults");

// =====================================================
// CLIENT CRUD
// =====================================================
export const getClient = (id) =>
  safeRequest(`/client/${id}`);

export const createClient = (data) =>
  safeRequest("/create-client", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const updateClient = (id, data) =>
  safeRequest(`/update-client/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const deleteClient = (id) =>
  safeRequest(`/delete-client/${id}`, {
    method: "DELETE",
  });

// =====================================================
// HEALTH CHECK
// =====================================================
export const apiHealth = () =>
  safeRequest("/health");
