// Final rewritten ClientList component with proper export ordering, Excel/CSV fixed, and PDF removed
// (Full code provided as requested)

import React, { useEffect, useState, useCallback } from "react";
import "../sticky.css";
import "../App.css";
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
import * as XLSX from "xlsx";

export default function ClientList() {
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

  // Loaders
  const loadClients = useCallback(async () => {
    try {
      const data = await fetchClients();
      setClients(Array.isArray(data) ? data : []);
    } catch {
      setClients([]);
    }
  }, []);

  const loadClientDetails = useCallback(async () => {
    try {
      const data = await fetchClientDetails();
      setClientDetails(Array.isArray(data) ? data : []);
    } catch {
      setClientDetails([]);
    }
  }, []);

  const loadNotificationConfigs = useCallback(async () => {
    try {
      const data = await fetchNotificationConfigs();
      setNotificationRows(Array.isArray(data) ? data : []);
    } catch {
      setNotificationRows([]);
    }
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([
      loadClients(),
      loadClientDetails(),
      loadNotificationConfigs(),
    ]);
    setLoading(false);
  }, [loadClients, loadClientDetails, loadNotificationConfigs]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // Delete handler
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this client?")) return;
    try {
      await deleteClient(id);
      loadAll();
    } catch (err) {
      alert("Error deleting client");
    }
  };

  // Search handling
  const filterRows = (rows) => {
    const term = searchTerm.toLowerCase();
    if (!term) return rows;
    return rows.filter((r) => JSON.stringify(r).toLowerCase().includes(term));
  };

  // Sorting
  const compareValues = (a, b, numeric) => {
    if (numeric) return Number(a || 0) - Number(b || 0);
    return String(a || "").localeCompare(String(b || ""), undefined, {
      sensitivity: "base",
    });
  };

  const sortRows = (rows) => {
    const primary = sortField;
    const numericPrimary = primary === "id";
    return [...rows].sort((a, b) => {
      const c = compareValues(a[primary], b[primary], numericPrimary);
      return sortDirection === "asc" ? c : -c;
    });
  };

  const handleSort = (field) => {
    setShowExportMenu(false);
    if (sortField === field) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortArrow = (field) =>
    sortField === field ? (sortDirection === "asc" ? "▲" : "▼") : "";

  const filteredClients = sortRows(filterRows(clients));
  const filteredClientDetails = sortRows(filterRows(clientDetails));
  const filteredNotif = sortRows(filterRows(notificationRows));

  const getActiveRows = () =>
    activeTab === "app"
      ? filteredClients
      : activeTab === "details"
      ? filteredClientDetails
      : filteredNotif;

  // Export structure for ordering
  const exportStructure = {
    app: {
      fileName: "client_app_details",
      cols: [
        "id",
        "clientName",
"defaultLanguage",
"listOfLanguage",
"defaultDisplayLanguage",
"listOfDisplayLanguage",
"headerLogo",
"poweredByLogo",
"productLogo",
"homeLauncherLogo",
"menuColor",
"subMenuColor",
"textColor",
"mobileHeaderColor",
"mobileMenuBgColor",
"homeBgColor",
"headerText",
"welcomeText",
"welcomeBody",
      ],
    },
    details: {
  fileName: "client_details",
  cols: [
    "id",
    "clientName",
    "dbName",
    "baseClient",
    "medianFlag",
    "stateMaintainHours",
    "recentAlertHours",
    "notificationListHours",

    "trashEnabled",
    "paperEnabled",
    "hvacEnabled",
    "waterFlowEnabled",
    "feedbackEnabled",
    "soapDispenserEnabled",
    "airFreshenerEnabled",
    "cleanIndexEnabled",
    "heatMapEnabled",
    "schedulerEnabled",
    "peopleCountEnabled",

    "typicalHighValue",
    "cleaningThreshold",
    "analyticsWeekEndRestrictionFlag",
    "trafficSensor",
    "appViewType",
    "feedbackAlertConfig",

    "beaconTimeInterval",
    "soapShots",
    "pumpPercentage",
    "soapPredictionIsEnabled",
    "labelFlag",
    "weatherEnabled",

    "language",
    "occupancyDurationLimit",
    "passwordRotationInterval",
    "mfaFlag",
    "pageReloadInterval",
    "inspectionType",
    "defaultGradingflag",
    "commentsLimit",
    "janitorScheduleFlag",
    "publisherType",
    "availableSensors",

    "feedbackType",
    "feedbackAlertOrder",
    "feedbackDefaultTimeout",
    "overViewStartTime",
    "cannedChartPeriod",
    "dataPostingType"
  ]
},
    notif: {
  fileName: "notification_config",
  cols: [
    "id",
    "clientName",

    "push",
    "timeRestriction",
    "weekendRestriction",
    "alertInterval",
    "janitorIssueInterval",
    "maintenanceIssueInterval",
    "feedbackDuplicateFilterInterval",
    "feedbackFilterCount",
    "deviceEmailFlag",
    "feedbackCombinedFlag",
    "feedbackEmailFlag",
    "feedbackTextFlag",
    "deviceTextFlag",
    "qrJanitorpush",
    "qrJanitorTextFlag",
    "qrJanitorEmailFlag",
    "openAreaTrafficFlag",
    "escalationType",
    "escalationLevel1Interval",
    "escalationLevel2Interval",
    "notCleanEscalationInterval",
    "cleaningScheduleFlag",
    "dispatchedInterval",

    // Thresholds & timers
    "deviceDataTimeInterval",
    "toiletPaperThreshold",
    "paperTowelThreshold",
    "trashThreshold",
    "areaAlertThreshold",

    "trafficAlert"
  ]
}
  };

  // EXPORT FUNCTIONS
  const getExportData = () => {
    const rows = getActiveRows();
    if (!rows.length) return null;

    const structure =
      activeTab === "app"
        ? exportStructure.app
        : activeTab === "details"
        ? exportStructure.details
        : exportStructure.notif;

    return { ...structure, rows };
  };

  const exportCSV = () => {
    const data = getExportData();
    if (!data) return;

    const { cols, rows, fileName } = data;

    const header = cols.join(",");
    const body = rows
      .map((r) => cols.map((c) => `"${String(r?.[c] ?? "").replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([header + "\n" + body], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${fileName}.csv`;
    link.click();
  };

  const exportExcel = () => {
    const data = getExportData();
    if (!data) return;

    const { cols, rows, fileName } = data;

    const aoa = [];
    aoa.push(cols);
    rows.forEach((r) => aoa.push(cols.map((c) => r?.[c] ?? "")));

    const sheet = XLSX.utils.aoa_to_sheet(aoa);
    const book = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(book, sheet, "Data");
    XLSX.writeFile(book, `${fileName}.xlsx`);
  };

  if (loading) {
    return (
      <div className="page1">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="page1">
      {errorMsg && <div className="message-box danger">{errorMsg}</div>}

      <div style={styles.topBar}>
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

        <div style={styles.tabs}>
          <button
            className={`tab-modern-btn ${activeTab === "app" ? "active" : ""}`}
            onClick={() => setActiveTab("app")}
          >
            Client App Details
          </button>

          <button
            className={`tab-modern-btn ${activeTab === "details" ? "active" : ""}`}
            onClick={() => setActiveTab("details")}
          >
            Client Details
          </button>

          <button
            className={`tab-modern-btn ${activeTab === "notif" ? "active" : ""}`}
            onClick={() => setActiveTab("notif")}
          >
            Notification Config
          </button>
        </div>

        {/* EXPORT ONLY (PDF removed) */}
        <div style={{ position: "relative" }}>
          <button
            className="btn primary"
            onClick={() => setShowExportMenu(!showExportMenu)}
          >
            Export ▾
          </button>

          {showExportMenu && (
            <div style={styles.exportMenu}>
              <div
                style={styles.exportItem}
                onClick={() => {
                  exportExcel();
                  setShowExportMenu(false);
                }}
              >
                📘 Export as Excel
              </div>

              <div
                style={styles.exportItem}
                onClick={() => {
                  exportCSV();
                  setShowExportMenu(false);
                }}
              >
                🧾 Export as CSV
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="table-wrapper">
        {activeTab === "app" && (
          <FullClientTable
            clients={filteredClients}
            handleSort={handleSort}
            getSortArrow={getSortArrow}
            onDelete={handleDelete}
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
            rows={filteredNotif}
            handleSort={handleSort}
            getSortArrow={getSortArrow}
          />
        )}
      </div>
    </div>
  );
}

const styles = {
  topBar: {
    display: "flex",
    alignItems: "center",
    gap: 20,
    marginBottom: 20,
  },
  searchWrapper: {
    position: "relative",
    width: 210,
  },
  searchIcon: {
    position: "absolute",
    left: 10,
    top: "50%",
    transform: "translateY(-50%)",
    width: 18,
    opacity: 0.75,
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
  exportMenu: {
    position: "absolute",
    top: "105%",
    right: 0,
    width: 180,
    background: "#fff",
    borderRadius: 8,
    border: "1px solid #e5e7eb",
    boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
    padding: 6,
    zIndex: 999,
  },
  exportItem: {
    padding: "8px 12px",
    cursor: "pointer",
    borderRadius: 6,
  },
};
