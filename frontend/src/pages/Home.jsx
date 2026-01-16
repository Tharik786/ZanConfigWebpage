// =====================================================
// src/pages/Home.jsx
// FINAL – UNION DASHBOARD (PHL + PIT + ALL CLIENTS)
// Highlight RED if date is PAST and >= 2 days old
// =====================================================

import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { fetchLastUpdated } from "../api";
import "../styles/Home.css";

// -----------------------------------------------
// MySQL DATETIME formatter (STRING SAFE)
// -----------------------------------------------
function formatDate(value) {
  if (!value || typeof value !== "string") return "-";

  const parts = value.split(" ");
  if (parts.length !== 2) return "-";

  const [y, m, d] = parts[0].split("-");
  let [hh, mm] = parts[1].split(":");

  hh = parseInt(hh, 10);
  const ampm = hh >= 12 ? "pm" : "am";
  hh = hh % 12 || 12;

  const months = [
    "Jan","Feb","Mar","Apr","May","Jun",
    "Jul","Aug","Sep","Oct","Nov","Dec",
  ];

  return `${d} ${months[m - 1]} ${y}, ${hh
    .toString()
    .padStart(2, "0")}:${mm} ${ampm}`;
}

// -----------------------------------------------
// HIGHLIGHT LOGIC: PAST OR FUTURE DATE >= 2 DAYS
// -----------------------------------------------
function shouldHighlightRed(value) {
  if (!value || typeof value !== "string") return false;

  try {
    const valueDate = new Date(value.split(" ")[0]); // YYYY-MM-DD
    const today = new Date();

    // Normalize both to midnight
    valueDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const diffMs = valueDate - today;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    // 🔴 Highlight if past >= 2 days OR future >= 2 days
    return diffDays <= -2 || diffDays >= 2;
  } catch {
    return false;
  }
}


export default function Home() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedClient, setSelectedClient] = useState("All Clients");

  // ------------------------------------------------
  // LOAD UNION DASHBOARD (YEAR + MONTH ONLY)
  // ------------------------------------------------
  useEffect(() => {
    async function loadData() {
      try {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;

        const data = await fetchLastUpdated(year, month);
        setRows(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // -----------------------------------------------
  // CLIENT FILTER
  // -----------------------------------------------
  const clients = [
    "All Clients",
    ...Array.from(new Set(rows.map(r => r.clientName))),
  ];

  const filteredRows =
    selectedClient === "All Clients"
      ? rows
      : rows.filter(r => r.clientName === selectedClient);

  // -----------------------------------------------
  // EXPORT TO EXCEL
  // -----------------------------------------------
  function handleExportExcel() {
    if (!filteredRows.length) return;

    const excelData = filteredRows.map(r => ({
      ClientName: r.clientName,
      CurrentTime: formatDate(r.currentTime),
      DeviceStatus: formatDate(r.deviceStatusLastUpdated),
      PeopleCount: formatDate(r.peopleLastUpdated),
      Analytics: formatDate(r.analyticsLastUpdated),
      Flight: formatDate(r.flightLastUpdated),
      Traffic: formatDate(r.trafficLastUpdated),
    }));

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Dashboard");

    XLSX.writeFile(
      wb,
      `dashboard_${selectedClient.replace(/\s+/g, "_")}.xlsx`
    );
  }

  // -----------------------------------------------
  // RENDER
  // -----------------------------------------------
  return (
    <div className="layout">
      <main className="content">
        <div className="main-view">

          {/* HEADER */}
          <div className="header-bar">
            <h2>Device Monitoring Status</h2>

            <button
              className="export-btn"
              onClick={handleExportExcel}
              disabled={!filteredRows.length}
            >
              Export Excel
            </button>
          </div>

          {/* CLIENT FILTER */}
          <div className="client-menu-bar">
            <select
              className="client-select"
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
            >
              {clients.map(client => (
                <option key={client} value={client}>
                  {client}
                </option>
              ))}
            </select>
          </div>

          {/* TABLE */}
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Current Time</th>
                  <th>Device Status</th>
                  <th>People Count</th>
                  <th>Analytics</th>
                  <th>Flight</th>
                  <th>Traffic</th>
                </tr>
              </thead>

              <tbody>
                {loading && (
                  <tr>
                    <td colSpan="7">Loading…</td>
                  </tr>
                )}

                {!loading && error && (
                  <tr>
                    <td colSpan="7">{error}</td>
                  </tr>
                )}

                {!loading && !filteredRows.length && (
                  <tr>
                    <td colSpan="7">No data available</td>
                  </tr>
                )}

                {!loading &&
                  filteredRows.map((r, i) => (
                    <tr key={i}>
                      <td>{r.clientName}</td>

                      <td className={shouldHighlightRed(r.currentTime) ? "stale-cell" : ""}>
                        {formatDate(r.currentTime)}
                      </td>

                      <td className={shouldHighlightRed(r.deviceStatusLastUpdated) ? "stale-cell" : ""}>
                        {formatDate(r.deviceStatusLastUpdated)}
                      </td>

                      <td className={shouldHighlightRed(r.peopleLastUpdated) ? "stale-cell" : ""}>
                        {formatDate(r.peopleLastUpdated)}
                      </td>

                      <td className={shouldHighlightRed(r.analyticsLastUpdated) ? "stale-cell" : ""}>
                        {formatDate(r.analyticsLastUpdated)}
                      </td>

                      <td className={shouldHighlightRed(r.flightLastUpdated) ? "stale-cell" : ""}>
                        {formatDate(r.flightLastUpdated)}
                      </td>

                      <td className={shouldHighlightRed(r.trafficLastUpdated) ? "stale-cell" : ""}>
                        {formatDate(r.trafficLastUpdated)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

        </div>
      </main>
    </div>
  );
}
