// src/App.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Layout from "./components/Layout";
import Home from "./pages/Home";
import AddClient from "./pages/AddClient";
import ClientList from "./pages/ClientList";
import EditClient from "./pages/EditClient";
import Profile from "./pages/Profile";
import ChangePassword from "./pages/ChangePassword";
import Login from "./components/Login";

function isAuthed() {
  return Boolean(localStorage.getItem("token"));
}

function ProtectedRoute({ children }) {
  return isAuthed() ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout>
              <Home />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/client-app-details"
        element={
          <ProtectedRoute>
            <Layout>
              <AddClient />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/client-list"
        element={
          <ProtectedRoute>
            <Layout>
              <ClientList />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/edit-client/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <EditClient />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Layout>
              <Profile />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/change-password"
        element={
          <ProtectedRoute>
            <Layout>
              <ChangePassword />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
