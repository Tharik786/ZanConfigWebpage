// src/pages/ClientList.jsx
import React, { useEffect, useState, useCallback } from "react";
import {
  fetchClients,
  fetchClientDetails,
  fetchNotificationConfigs,
  deleteClient,
} from "../api";

import FullClientTable from "../components/FullClientTable";
import ClientDetailsTable from "../components/ClientDetailsTable";
import NotificationConfigTable from "../components/NotificationConfigTable";

import searchIcon from "../assets/search.png";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

export default function ClientList() {
  // ------------------------------------------------------------------
  // STATE
  // ------------------------------------------------------------------
  const [clients, setClients] = useState([]);
  const [clientDetails, setClientDetails] = useState([]);
  const [notificationRows, setNotificationRows] = useState([]);

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const [activeTab, setActiveTab] = useState("app");
  const [searchTerm, setSearchTerm] = useState("");

  const [sortField, setSortField] = useState("clientName");
  const [sortDirection, setSortDirection] = useState("asc");

  const [showExportMenu, setShowExportMenu] = useState(false);

  // ------------------------------------------------------------------
  // LOAD DATA
  // ------------------------------------------------------------------
  const loadClients = useCallback(async () => {
    try {
      const data = await fetchClients();
      setClients(Array.isArray(data) ? data : []);
      setErrorMsg("");
    } catch {
      setErrorMsg("Failed to load clients.");
    }
  }, []);

  const loadClientDetails = useCallback(async () => {
    try {
      const data = await fetchClientDetails();
      setClientDetails(Array.isArray(data) ? data : []);
    } catch {}
  }, []);

  const loadNotificationConfigs = useCallback(async () => {
    try {
      const data = await fetchNotificationConfigs();
      setNotificationRows(Array.isArray(data) ? data : []);
    } catch {}
  }, []);

  const reloadAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([
      loadClients(),
      loadClientDetails(),
      loadNotificationConfigs(),
    ]);
    setLoading(false);
  }, [loadClients, loadClientDetails, loadNotificationConfigs]);

  useEffect(() => {
    reloadAll();
    const interval = setInterval(reloadAll, 30000);
    return () => clearInterval(interval);
  }, [reloadAll]);

  // ------------------------------------------------------------------
  // DELETE CLIENT
  // ------------------------------------------------------------------
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this client?")) return;
    await deleteClient(id);
    reloadAll();
  };

  // ------------------------------------------------------------------
  // SEARCH
  // ------------------------------------------------------------------
  const filterRows = (rows) => {
    const term = searchTerm.toLowerCase();
    return rows.filter((r) =>
      JSON.stringify(r).toLowerCase().includes(term)
    );
  };

  // ------------------------------------------------------------------
  // SORTING
  // ------------------------------------------------------------------
  const compareValues = (a, b, numeric = false) => {
    if (numeric) return Number(a || 0) - Number(b || 0);
    return String(a || "").localeCompare(String(b || ""), "en", {
      sensitivity: "base",
    });
  };

  const sortRows = (rows) => {
    const primary = sortField;
    const secondary = sortField === "clientName" ? "id" : "clientName";

    return [...rows].sort((a, b) => {
      const p = compareValues(a[primary], b[primary], primary === "id");
      if (p !== 0) return sortDirection === "asc" ? p : -p;

      const s = compareValues(a[secondary], b[secondary], secondary === "id");
      return sortDirection === "asc" ? s : -s;
    });
  };

  const handleSort = (field) => {
    setSortDirection(field === sortField && sortDirection === "asc" ? "desc" : "asc");
    setSortField(field);
  };

  const getSortArrow = (field) =>
    sortField === field ? (sortDirection === "asc" ? "▲" : "▼") : "";

  const filteredClients = sortRows(filterRows(clients));
  const filteredClientDetails = sortRows(filterRows(clientDetails));
  const filteredNotificationRows = sortRows(filterRows(notificationRows));

  // ------------------------------------------------------------------
  // EXPORT CONFIG
  // ------------------------------------------------------------------
  const exportStructure = {
    app: {
      cols: [
        "id",
        "clientName",
        "defaultLanguage",
        "listOfLanguage",
        "defaultDisplayLanguage",
        "listOfDisplayLanguage",
      ],
      labels: {
        id: "ID",
        clientName: "Client Name",
        defaultLanguage: "Default Language",
        listOfLanguage: "Languages",
        defaultDisplayLanguage: "Display Language",
        listOfDisplayLanguage: "Display Languages",
      },
    },
    details: {
      cols: ["id", "clientName", "baseClient", "dbName"],
      labels: {
        id: "ID",
        clientName: "Client Name",
        baseClient: "Base Client",
        dbName: "DB Name",
      },
    },
    notif: {
      cols: ["id", "clientName", "push", "timeRestriction"],
      labels: {
        id: "ID",
        clientName: "Client Name",
        push: "Push",
        timeRestriction: "Time Restriction",
      },
    },
  };

  const getExportData = () => {
    const rows =
      activeTab === "app"
        ? filteredClients
        : activeTab === "details"
        ? filteredClientDetails
        : filteredNotificationRows;

    if (!rows.length) return null;

    return { ...exportStructure[activeTab], rows, fileName: activeTab };
  };

  // ------------------------------------------------------------------
  // EXPORT FUNCTIONS
  // ------------------------------------------------------------------
  const exportCSV = () => {
    const data = getExportData();
    if (!data) return;

    const header = data.cols.map((c) => data.labels[c]).join(",");
    const body = data.rows
      .map((r) =>
        data.cols.map((c) => `"${String(r[c] ?? "").replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");

    const blob = new Blob([header + "\n" + body], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = data.fileName + ".csv";
    a.click();
  };

  const exportExcel = () => {
    const data = getExportData();
    if (!data) return;

    const rows = [
      data.cols.map((c) => data.labels[c]),
      ...data.rows.map((r) => data.cols.map((c) => r[c] ?? "")),
    ];

    const sheet = XLSX.utils.aoa_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, sheet, "Sheet1");
    XLSX.writeFile(workbook, data.fileName + ".xlsx");
  };

  const exportPDF = () => {
    const data = getExportData();
    if (!data) return;

    const doc = new jsPDF();
    autoTable(doc, {
      head: [data.cols.map((c) => data.labels[c])],
      body: data.rows.map((r) => data.cols.map((c) => r[c] ?? "")),
      styles: { fontSize: 8 },
      margin: { top: 20 },
    });
    doc.save(data.fileName + ".pdf");
  };

  // ------------------------------------------------------------------
  // UI
  // ------------------------------------------------------------------
  if (loading)
    return (
      <div className="page1">
        <div className="spinner"></div>
      </div>
    );

  return (
    <div className="page1" style={{ position: "relative" }}>
      {errorMsg && <div className="message-box danger">{errorMsg}</div>}

      {/* ---------------- TOP BAR ---------------- */}
      <div className="top-bar" style={styles.topBar}>
        {/* Search Bar */}
        <div style={styles.searchWrapper}>
          <img src={searchIcon} alt="search" style={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        {/* Tabs */}
        <div style={styles.tabs}>
          {["app", "details", "notif"].map((tab) => (
            <button
              key={tab}
              className={`tab-modern-btn ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === "app" && "Client App Details"}
              {tab === "details" && "Client Details"}
              {tab === "notif" && "Notification Configuration"}
            </button>
          ))}
        </div>

        {/* Export + Refresh */}
        <div style={{ position: "relative" }}>
          <div style={styles.rightButtons}>
            <button className="btn hollow" onClick={reloadAll}>
              🔄 
            </button>

            <button
              className="btn primary"
              onClick={() => setShowExportMenu((v) => !v)}
            >
              Export ▾
            </button>
          </div>

          {showExportMenu && (
            <div style={styles.exportMenu}>
              <div style={styles.exportItem} onClick={exportExcel}>
                Excel
              </div>
              <div style={styles.exportItem} onClick={exportCSV}>
                CSV
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ---------------- TABLES ---------------- */}
      <div className="table-wrapper">
        {activeTab === "app" && (
          <FullClientTable
            clients={filteredClients}
            handleSort={handleSort}
            getSortArrow={getSortArrow}
          />
        )}

        {activeTab === "details" && (
          <ClientDetailsTable
            rows={filteredClientDetails}
            handleSort={handleSort}
            getSortArrow={getSortArrow}
          />
        )}

        {activeTab === "notif" && (
          <NotificationConfigTable
            rows={filteredNotificationRows}
            handleSort={handleSort}
            getSortArrow={getSortArrow}
          />
        )}
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// STYLES
// ------------------------------------------------------------------
const styles = {
  topBar: {
    display: "flex",
    alignItems: "center",
    gap: 20,
    marginBottom: 20,
    padding: "0 6px",
  },

  searchWrapper: {
    position: "relative",
    width: 210,
  },

  searchIcon: {
    position: "absolute",
    left: 10,
    top: "50%",
    width: 17,
    opacity: 0.75,
    transform: "translateY(-50%)",
  },

  searchInput: {
    width: "100%",
    padding: "8px 10px 8px 36px",
    borderRadius: 8,
    border: "1px solid #ccc",
    fontSize: 14,
  },

  tabs: {
    display: "flex",
    gap: 14,
    flex: 1,
    justifyContent: "center",
  },

  rightButtons: {
    display: "flex",
    gap: 10,
  },

  exportMenu: {
    position: "absolute",
    top: "105%",
    right: 0,
    width: 150,
    background: "#fff",
    borderRadius: 8,
    border: "1px solid #ddd",
    boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
    padding: 4,
    zIndex: 9999,
  },

  exportItem: {
    padding: "8px 12px",
    cursor: "pointer",
    borderRadius: 6,
    fontSize: 14,
  },
};
