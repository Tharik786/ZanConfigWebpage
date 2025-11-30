// src/api.js

export const API_BASE =
  import.meta.env.VITE_API_BASE || "http://127.0.0.1:5000/api";

async function safeRequest(path, options = {}) {
  try {
    const url = `${API_BASE}${path}`;

    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });

    const text = await res.text();
    let data = text ? JSON.parse(text) : null;

    if (!res.ok) {
      throw new Error(data?.error || "Request failed");
    }
    return data;
  } catch (err) {
    console.error("API ERROR:", err);
    throw err;
  }
}

/* =============================
   AUTH API
============================= */

// LOGIN
export const loginUser = (body) =>
  safeRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify(body),
  });

// REGISTER
export const registerUser = (body) =>
  safeRequest("/auth/register", {
    method: "POST",
    body: JSON.stringify(body),
  });

// FORGOT PASSWORD
export const forgotPassword = (body) =>
  safeRequest("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify(body),
  });

/* =============================
   PROFILE API
============================= */

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

/* =============================
   CLIENT CONFIG API
============================= */

export const fetchClients = () => safeRequest("/clients");
export const fetchClientDetails = () => safeRequest("/client-details");
export const fetchNotificationConfigs = () =>
  safeRequest("/notification-configs");

export const getClient = (id) => safeRequest(`/client/${id}`);

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
