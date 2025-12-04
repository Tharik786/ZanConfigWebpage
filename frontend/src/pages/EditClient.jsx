// ===============================================
// src/pages/EditClient.jsx (FINAL 3-TAB VERSION)
// ===============================================

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getClient,
  fetchClientDetails,
  fetchNotificationConfigs,
  fetchClientDefaults,   // ⭐ important
  updateClient,
} from "../api";
import "../App.css";

// -----------------------------------------------------
// EMPTY BASE FORM (ALL THREE TABLE MAPPED FIELDS)
// (also acts as fallback if /client-defaults fails)
// -----------------------------------------------------
const emptyForm = {
  clientName: "",
  dbName: "",

  // ================= client_details =================
  baseClient: "",
  medianFlag: 0,
  stateMaintainHours: 24,
  recentAlertHours: 6,
  notificationListHours: 24,
  trashEnabled: "True",
  paperEnabled: "True",
  hvacEnabled: "False",
  waterFlowEnabled: "True",
  feedbackEnabled: "True",
  soapDispenserEnabled: "True",
  airFreshenerEnabled: "False",
  cleanIndexEnabled: "True",
  heatMapEnabled: "False",
  schedulerEnabled: "False",
  peopleCountEnabled: "True",
  typicalHighValue: 5,
  cleaningThreshold: 50,
  analyticsWeekEndRestrictionFlag: "True",
  trafficSensor: "PeopleCount",
  appViewType: 1,
  feedbackAlertConfig: "0,1",
  beaconTimeInterval: 2,
  soapShots: 1000,
  pumpPercentage: 75,
  soapPredictionIsEnabled: "False",
  labelFlag: "3",
  weatherEnabled: "False",
  language: "English",
  occupancyDurationLimit: 10,
  passwordRotationInterval: 0,
  mfaFlag: 0,
  pageReloadInterval: 60,
  inspectionType: 1,
  defaultGradingflag: 1,
  commentsLimit: 100,
  janitorScheduleFlag: 0,
  publisherType: "mqtt",
  availableSensors: "",
  feedbackType: 2,
  feedbackAlertOrder: 4,
  feedbackDefaultTimeout: 20,
  overViewStartTime: "12:00 AM",
  cannedChartPeriod: 60,
  dataPostingType: "",

  // ================= clientappdetails =================
  defaultLanguage: "English",
  listOfLanguage: ["English"],          // backend: DEFAULT_LANG_LIST
  defaultDisplayLanguage: "English",
  listOfDisplayLanguage: ["English"],   // backend: DEFAULT_DISPLAY_LIST

  headerLogo:
    "https://zanelbapp.zancompute.com:82/ClientLogos/ANALYTICSPRD/ISS4.png",
  footerLogo: "",
  poweredByLogo:
    "https://zanelbapp.zancompute.com:82/ClientLogos/ANALYTICSPRD/Kiosk-Powered-by-1.png",
  productLogo:
    "https://gcp-image.zancompute.com/ClientLogos/ANALYTICSPRD/Bobrick-BG-Ori.png",
  homeLauncherLogo: "",

  menuColor: "#141b4d",
  subMenuColor: "272f69",
  textColor: "#3d86ea",
  mobileHeaderColor: "",
  mobileMenuBgColor: "",
  homeBgColor: "#f1fdff",

  headerText: "Zanitor",
  welcomeText: "Welcome To Zanitor",
  welcomeBody: "", // backend DEFAULT_WELCOME_BODY (string) – fill from API when needed

  // ================= notificationconfiguration =================
  push: "True",
  timeRestriction: "11:59 PM-12:01 AM",
  weekendRestriction: 0,
  alertInterval: 0,
  janitorIssueInterval: "0,1",
  maintenanceIssueInterval: "0,1",
  feedbackDuplicateFilterInterval: 0,
  feedbackFilterCount: 4,
  deviceEmailFlag: "0,0",
  feedbackCombinedFlag: "True",
  feedbackEmailFlag: "0,0",
  feedbackTextFlag: 0,
  deviceTextFlag: 0,
  qrJanitorpush: "True",
  qrJanitorTextFlag: 0,
  qrJanitorEmailFlag: 0,
  openAreaTrafficFlag: 3,
  escalationType: 0,
  escalationLevel1Interval: 0,
  escalationLevel2Interval: 0,
  notCleanEscalationInterval: 0,
  cleaningScheduleFlag: "False",
  dispatchedInterval: 0,

  deviceDataTimeInterval: "45",
  toiletPaperThreshold: "15",
  paperTowelThreshold: "15",
  trashThreshold: "75",
  areaAlertThreshold: "0",

  trafficAlert: "True",
};

// ===============================================
// MAIN COMPONENT
// ===============================================
export default function EditClient() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [tab, setTab] = useState(1);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  // Language chip inputs
  const [newLang, setNewLang] = useState("");
  const [newDispLang, setNewDispLang] = useState("");

  // -----------------------------------------------------
  // LOAD DATA (DEFAULTS + ALL 3 TABLES)
  // -----------------------------------------------------
  const loadData = useCallback(async () => {
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      // 1) Load backend defaults + DB data in parallel
      const [defaultsRes, base, details, notifs] = await Promise.all([
        fetchClientDefaults(), // { ok, client_details, client_appdetails, notification_config }
        getClient(id),
        fetchClientDetails(),
        fetchNotificationConfigs(),
      ]);

      // ----------------- BACKEND DEFAULTS -----------------
      let defaultMerged = { ...emptyForm };

      if (defaultsRes && defaultsRes.ok) {
        const {
          client_details = {},
          client_appdetails = {},
          notification_config = {},
        } = defaultsRes;

        defaultMerged = {
          ...emptyForm,
          ...client_details,
          ...client_appdetails,
          ...notification_config,
        };
      }

      // ----------------- DB ROWS FOR THIS CLIENT -----------------
      const matchId = String(id);
      const detailRow =
        details?.find((d) => String(d.clientId) === matchId) || {};
      const notifRow =
        notifs?.find((n) => String(n.clientId) === matchId) || {};

      // ----------------- FINAL MERGE ORDER -----------------
      let merged = {
        ...defaultMerged, // backend defaults for ALL fields
        ...detailRow,     // client_details row
        ...notifRow,      // notification_config row
        ...base,          // base client row
      };

      // Normalize listOfLanguage / listOfDisplayLanguage
      const normalizeList = (value) => {
        if (Array.isArray(value)) return value;
        if (typeof value === "string") {
          return value
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
        }
        return [];
      };

      merged.listOfLanguage = normalizeList(merged.listOfLanguage);
      merged.listOfDisplayLanguage = normalizeList(
        merged.listOfDisplayLanguage
      );

      setForm(merged);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "Failed to load client data");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // -----------------------------------------------------
  // HANDLERS
  // -----------------------------------------------------
  const handleInput = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const addLanguage = () => {
    if (!newLang.trim()) return;
    setForm((p) => ({
      ...p,
      listOfLanguage: [...p.listOfLanguage, newLang.trim()],
    }));
    setNewLang("");
  };

  const removeLanguage = (i) => {
    setForm((p) => ({
      ...p,
      listOfLanguage: p.listOfLanguage.filter((_, x) => x !== i),
    }));
  };

  const addDispLanguage = () => {
    if (!newDispLang.trim()) return;
    setForm((p) => ({
      ...p,
      listOfDisplayLanguage: [...p.listOfDisplayLanguage, newDispLang.trim()],
    }));
    setNewDispLang("");
  };

  const removeDispLanguage = (i) => {
    setForm((p) => ({
      ...p,
      listOfDisplayLanguage: p.listOfDisplayLanguage.filter((_, x) => x !== i),
    }));
  };

  const handleSave = async () => {
    if (!form.clientName.trim()) return setErrorMsg("Client Name is required");
    if (!form.dbName.trim()) return setErrorMsg("DB Name is required");

    setSaving(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const payload = {
        ...form,
        listOfLanguage: form.listOfLanguage.join(","),
        listOfDisplayLanguage: form.listOfDisplayLanguage.join(","),
      };

      const res = await updateClient(id, payload);

      if (res?.error) {
        setErrorMsg(res.error);
      } else {
        setSuccessMsg("Client updated successfully!");
        setShowSuccess(true);
        await loadData();
      }
    } catch (err) {
      setErrorMsg(err.message || "Failed to save client");
    } finally {
      setSaving(false);
    }
  };

  // -----------------------------------------------------
  // RENDER
  // -----------------------------------------------------
  if (loading) {
    return (
      <div className="add-client-page">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="add-client-page">
      {/* ERROR / SUCCESS BANNERS */}
      {errorMsg && <div className="error-banner">{errorMsg}</div>}
      {successMsg && !showSuccess && (
        <div className="success-banner">{successMsg}</div>
      )}

      {/* SUCCESS POPUP */}
      {showSuccess && (
        <div className="success-popup">
          <div className="success-box">
            <h2>Client Updated Successfully</h2>
            <div className="popup-actions">
              <button
                className="btn primary"
                onClick={() => navigate("/client-list")}
              >
                View Clients
              </button>
              <button
                className="btn secondary"
                onClick={() => setShowSuccess(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================== TAB HEADER ====================== */}
      <div className="tab-nav-modern">
        <button
          className={`tab-modern-btn ${tab === 1 ? "active" : ""}`}
          onClick={() => setTab(1)}
        >
          Client Details
        </button>

        <button
          className={`tab-modern-btn ${tab === 2 ? "active" : ""}`}
          onClick={() => setTab(2)}
        >
          App Details
        </button>

        <button
          className={`tab-modern-btn ${tab === 3 ? "active" : ""}`}
          onClick={() => setTab(3)}
        >
          Notification Config
        </button>
      </div>

      {/* TAB CONTENT */}
      {tab === 1 && (
        <Tab1 form={form} handleInput={handleInput} setTab={setTab} />
      )}

      {tab === 2 && (
        <Tab2
          form={form}
          handleInput={handleInput}
          newLang={newLang}
          newDispLang={newDispLang}
          addLanguage={addLanguage}
          addDispLanguage={addDispLanguage}
          removeLanguage={removeLanguage}
          removeDispLanguage={removeDispLanguage}
          setNewLang={setNewLang}
          setNewDispLang={setNewDispLang}
          setTab={setTab}
        />
      )}

      {tab === 3 && (
        <Tab3
          form={form}
          handleInput={handleInput}
          setTab={setTab}
          handleSave={handleSave}
          saving={saving}
        />
      )}
    </div>
  );
}

// ===============================================
// TAB 1 — CLIENT DETAILS
// ===============================================
function Tab1({ form, handleInput, setTab }) {
  return (
    <div className="form-step">
      {/* Client Name + DB Name */}
      <div className="grid">
        <div>
          <label className="label">Client Name *</label>
          <input
            className="input"
            name="clientName"
            value={form.clientName}
            onChange={handleInput}
          />
        </div>

        <div>
          <label className="label">DB Name *</label>
          <input
            className="input"
            name="dbName"
            value={form.dbName}
            onChange={handleInput}
          />
        </div>
      </div>

      {/* Base Client + Median Flag */}
      <div className="grid">
        <div>
          <label className="label">Base Client</label>
          <input
            className="input"
            name="baseClient"
            value={form.baseClient}
            onChange={handleInput}
          />
        </div>

        <div>
          <label className="label">Median Flag</label>
          <input
            className="input"
            type="number"
            name="medianFlag"
            value={form.medianFlag}
            onChange={handleInput}
          />
        </div>
      </div>

      {/* State Maintain + Recent Alert */}
      <div className="grid">
        <div>
          <label className="label">State Maintain Hours</label>
          <input
            className="input"
            type="number"
            name="stateMaintainHours"
            value={form.stateMaintainHours}
            onChange={handleInput}
          />
        </div>

        <div>
          <label className="label">Recent Alert Hours</label>
          <input
            className="input"
            type="number"
            name="recentAlertHours"
            value={form.recentAlertHours}
            onChange={handleInput}
          />
        </div>
      </div>

      {/* Notification List Hours + Typical High */}
      <div className="grid">
        <div>
          <label className="label">Notification List Hours</label>
          <input
            className="input"
            type="number"
            name="notificationListHours"
            value={form.notificationListHours}
            onChange={handleInput}
          />
        </div>

        <div>
          <label className="label">Typical High Value</label>
          <input
            className="input"
            type="number"
            name="typicalHighValue"
            value={form.typicalHighValue}
            onChange={handleInput}
          />
        </div>
      </div>

      {/* Cleaning Threshold + Weekend Restriction */}
      <div className="grid">
        <div>
          <label className="label">Cleaning Threshold</label>
          <input
            className="input"
            type="number"
            name="cleaningThreshold"
            value={form.cleaningThreshold}
            onChange={handleInput}
          />
        </div>

        <div>
          <label className="label">Analytics Weekend Restriction</label>
          <input
            className="input"
            name="analyticsWeekEndRestrictionFlag"
            value={form.analyticsWeekEndRestrictionFlag}
            onChange={handleInput}
          />
        </div>
      </div>

      {/* Feature Flags */}
      <div className="grid">
        <div>
          <label className="label">Trash Enabled</label>
          <input
            className="input"
            name="trashEnabled"
            value={form.trashEnabled}
            onChange={handleInput}
          />
        </div>
        <div>
          <label className="label">Paper Enabled</label>
          <input
            className="input"
            name="paperEnabled"
            value={form.paperEnabled}
            onChange={handleInput}
          />
        </div>
      </div>

      <div className="grid">
        <div>
          <label className="label">HVAC Enabled</label>
          <input
            className="input"
            name="hvacEnabled"
            value={form.hvacEnabled}
            onChange={handleInput}
          />
        </div>
        <div>
          <label className="label">Water Flow Enabled</label>
          <input
            className="input"
            name="waterFlowEnabled"
            value={form.waterFlowEnabled}
            onChange={handleInput}
          />
        </div>
      </div>

      <div className="grid">
        <div>
          <label className="label">Feedback Enabled</label>
          <input
            className="input"
            name="feedbackEnabled"
            value={form.feedbackEnabled}
            onChange={handleInput}
          />
        </div>

        <div>
          <label className="label">Soap Dispenser Enabled</label>
          <input
            className="input"
            name="soapDispenserEnabled"
            value={form.soapDispenserEnabled}
            onChange={handleInput}
          />
        </div>
      </div>

      <div className="grid">
        <div>
          <label className="label">Air Freshener Enabled</label>
          <input
            className="input"
            name="airFreshenerEnabled"
            value={form.airFreshenerEnabled}
            onChange={handleInput}
          />
        </div>

        <div>
          <label className="label">Clean Index Enabled</label>
          <input
            className="input"
            name="cleanIndexEnabled"
            value={form.cleanIndexEnabled}
            onChange={handleInput}
          />
        </div>
      </div>

      <div className="grid">
        <div>
          <label className="label">Heat Map Enabled</label>
          <input
            className="input"
            name="heatMapEnabled"
            value={form.heatMapEnabled}
            onChange={handleInput}
          />
        </div>

        <div>
          <label className="label">Scheduler Enabled</label>
          <input
            className="input"
            name="schedulerEnabled"
            value={form.schedulerEnabled}
            onChange={handleInput}
          />
        </div>
      </div>

      <div className="grid">
        <div>
          <label className="label">People Count Enabled</label>
          <input
            className="input"
            name="peopleCountEnabled"
            value={form.peopleCountEnabled}
            onChange={handleInput}
          />
        </div>

        <div>
          <label className="label">Traffic Sensor</label>
          <input
            className="input"
            name="trafficSensor"
            value={form.trafficSensor}
            onChange={handleInput}
          />
        </div>
      </div>

      {/* Feedback + Alerts */}
      <div className="grid">
        <div>
          <label className="label">App View Type</label>
          <input
            className="input"
            type="number"
            name="appViewType"
            value={form.appViewType}
            onChange={handleInput}
          />
        </div>

        <div>
          <label className="label">Feedback Alert Config</label>
          <input
            className="input"
            name="feedbackAlertConfig"
            value={form.feedbackAlertConfig}
            onChange={handleInput}
          />
        </div>
      </div>

      <div className="grid">
        <div>
          <label className="label">Feedback Type</label>
          <input
            className="input"
            type="number"
            name="feedbackType"
            value={form.feedbackType}
            onChange={handleInput}
          />
        </div>

        <div>
          <label className="label">Feedback Alert Order</label>
          <input
            className="input"
            type="number"
            name="feedbackAlertOrder"
            value={form.feedbackAlertOrder}
            onChange={handleInput}
          />
        </div>
      </div>

      <div className="grid">
        <div>
          <label className="label">Feedback Default Timeout</label>
          <input
            className="input"
            type="number"
            name="feedbackDefaultTimeout"
            value={form.feedbackDefaultTimeout}
            onChange={handleInput}
          />
        </div>

        <div>
          <label className="label">Overview Start Time</label>
          <input
            className="input"
            name="overViewStartTime"
            value={form.overViewStartTime}
            onChange={handleInput}
          />
        </div>
      </div>

      {/* Charts + Posting */}
      <div className="grid">
        <div>
          <label className="label">Canned Chart Period</label>
          <input
            className="input"
            type="number"
            name="cannedChartPeriod"
            value={form.cannedChartPeriod}
            onChange={handleInput}
          />
        </div>

        <div>
          <label className="label">Data Posting Type</label>
          <input
            className="input"
            name="dataPostingType"
            value={form.dataPostingType}
            onChange={handleInput}
          />
        </div>
      </div>

      {/* Soap + Weather */}
      <div className="grid">
        <div>
          <label className="label">Beacon Time Interval</label>
          <input
            className="input"
            type="number"
            name="beaconTimeInterval"
            value={form.beaconTimeInterval}
            onChange={handleInput}
          />
        </div>

        <div>
          <label className="label">Soap Shots</label>
          <input
            className="input"
            type="number"
            name="soapShots"
            value={form.soapShots}
            onChange={handleInput}
          />
        </div>
      </div>

      <div className="grid">
        <div>
          <label className="label">Pump Percentage</label>
          <input
            className="input"
            type="number"
            name="pumpPercentage"
            value={form.pumpPercentage}
            onChange={handleInput}
          />
        </div>

        <div>
          <label className="label">Soap Prediction Enabled</label>
          <input
            className="input"
            name="soapPredictionIsEnabled"
            value={form.soapPredictionIsEnabled}
            onChange={handleInput}
          />
        </div>
      </div>

      <div className="grid">
        <div>
          <label className="label">Label Flag</label>
          <input
            className="input"
            type="number"
            name="labelFlag"
            value={form.labelFlag}
            onChange={handleInput}
          />
        </div>

        <div>
          <label className="label">Weather Enabled</label>
          <input
            className="input"
            name="weatherEnabled"
            value={form.weatherEnabled}
            onChange={handleInput}
          />
        </div>
      </div>

      {/* Language + Duration */}
      <div className="grid">
        <div>
          <label className="label">Language (UI)</label>
          <input
            className="input"
            name="language"
            value={form.language}
            onChange={handleInput}
          />
        </div>

        <div>
          <label className="label">Occupancy Duration Limit</label>
          <input
            className="input"
            type="number"
            name="occupancyDurationLimit"
            value={form.occupancyDurationLimit}
            onChange={handleInput}
          />
        </div>
      </div>

      {/* Password + MFA */}
      <div className="grid">
        <div>
          <label className="label">Password Rotation Interval</label>
          <input
            className="input"
            type="number"
            name="passwordRotationInterval"
            value={form.passwordRotationInterval}
            onChange={handleInput}
          />
        </div>

        <div>
          <label className="label">MFA Flag</label>
          <input
            className="input"
            type="number"
            name="mfaFlag"
            value={form.mfaFlag}
            onChange={handleInput}
          />
        </div>
      </div>

      {/* Reload + Inspection */}
      <div className="grid">
        <div>
          <label className="label">Page Reload Interval</label>
          <input
            className="input"
            type="number"
            name="pageReloadInterval"
            value={form.pageReloadInterval}
            onChange={handleInput}
          />
        </div>

        <div>
          <label className="label">Inspection Type</label>
          <input
            className="input"
            type="number"
            name="inspectionType"
            value={form.inspectionType}
            onChange={handleInput}
          />
        </div>
      </div>

      {/* Grading + Comments */}
      <div className="grid">
        <div>
          <label className="label">Default Grading Flag</label>
          <input
            className="input"
            type="number"
            name="defaultGradingflag"
            value={form.defaultGradingflag}
            onChange={handleInput}
          />
        </div>

        <div>
          <label className="label">Comments Limit</label>
          <input
            className="input"
            type="number"
            name="commentsLimit"
            value={form.commentsLimit}
            onChange={handleInput}
          />
        </div>
      </div>

      {/* Janitor Schedule + Publisher */}
      <div className="grid">
        <div>
          <label className="label">Janitor Schedule Flag</label>
          <input
            className="input"
            type="number"
            name="janitorScheduleFlag"
            value={form.janitorScheduleFlag}
            onChange={handleInput}
          />
        </div>

        <div>
          <label className="label">Publisher Type</label>
          <input
            className="input"
            name="publisherType"
            value={form.publisherType}
            onChange={handleInput}
          />
        </div>
      </div>

      {/* Available Sensors */}
      <div className="grid">
        <div>
          <label className="label">Available Sensors</label>
          <textarea
            className="input"
            rows={3}
            name="availableSensors"
            value={form.availableSensors}
            onChange={handleInput}
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="form-actions">
        <button
          className="btn primary"
          type="button"
          onClick={() => setTab(2)}
        >
          Next →
        </button>
      </div>
    </div>
  );
}

// ===============================================
// TAB 2 — CLIENT APP DETAILS
// ===============================================
function Tab2({
  form,
  handleInput,
  newLang,
  newDispLang,
  addLanguage,
  addDispLanguage,
  removeLanguage,
  removeDispLanguage,
  setNewLang,
  setNewDispLang,
  setTab,
}) {
  return (
    <div className="form-step">
      {/* Default languages */}
      <div className="grid">
        <div>
          <label className="label">Default Language</label>
          <select
            className="input"
            name="defaultLanguage"
            value={form.defaultLanguage}
            onChange={handleInput}
          >
            <option value="">-- Select --</option>
            {form.listOfLanguage.map((lang, i) => (
              <option key={i} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Default Display Language</label>
          <select
            className="input"
            name="defaultDisplayLanguage"
            value={form.defaultDisplayLanguage}
            onChange={handleInput}
          >
            <option value="">-- Select --</option>
            {form.listOfDisplayLanguage.map((lang, i) => (
              <option key={i} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Language lists */}
      <div className="grid">
        <div>
          <label className="label">Language List</label>
          <div className="tag-input">
            <input
              className="input"
              value={newLang}
              onChange={(e) => setNewLang(e.target.value)}
              placeholder="Add language"
            />
            <button
              type="button"
              className="blue-plus-btn"
              onClick={addLanguage}
            >
              +
            </button>
          </div>

          <div className="tag-list">
            {form.listOfLanguage.map((lang, i) => (
              <span key={i} className="tag-item">
                {lang}
                <button
                  className="remove-tag"
                  type="button"
                  onClick={() => removeLanguage(i)}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        <div>
          <label className="label">Display Language List</label>

          <div className="tag-input">
            <input
              className="input"
              value={newDispLang}
              onChange={(e) => setNewDispLang(e.target.value)}
              placeholder="Add display language"
            />
            <button
              type="button"
              className="blue-plus-btn"
              onClick={addDispLanguage}
            >
              +
            </button>
          </div>

          <div className="tag-list">
            {form.listOfDisplayLanguage.map((lang, i) => (
              <span key={i} className="tag-item">
                {lang}
                <button
                  className="remove-tag"
                  type="button"
                  onClick={() => removeDispLanguage(i)}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Logos */}
      <div className="grid">
        <div>
          <label className="label">Header Logo</label>
          <input
            className="input"
            name="headerLogo"
            value={form.headerLogo}
            onChange={handleInput}
          />
        </div>

        <div>
          <label className="label">Footer Logo</label>
          <input
            className="input"
            name="footerLogo"
            value={form.footerLogo}
            onChange={handleInput}
          />
        </div>
      </div>

      <div className="grid">
        <div>
          <label className="label">Powered By Logo</label>
          <input
            className="input"
            name="poweredByLogo"
            value={form.poweredByLogo}
            onChange={handleInput}
          />
        </div>

        <div>
          <label className="label">Product Logo</label>
          <input
            className="input"
            name="productLogo"
            value={form.productLogo}
            onChange={handleInput}
          />
        </div>
      </div>

      {/* Colors */}
      <div className="grid">
        <div>
          <label className="label">Menu Color</label>
          <input
            className="input"
            name="menuColor"
            value={form.menuColor}
            onChange={handleInput}
          />
        </div>

        <div>
          <label className="label">Sub Menu Color</label>
          <input
            className="input"
            name="subMenuColor"
            value={form.subMenuColor}
            onChange={handleInput}
          />
        </div>
      </div>

      <div className="grid">
        <div>
          <label className="label">Text Color</label>
          <input
            className="input"
            name="textColor"
            value={form.textColor}
            onChange={handleInput}
          />
        </div>

        <div>
          <label className="label">Mobile Header Color</label>
          <input
            className="input"
            name="mobileHeaderColor"
            value={form.mobileHeaderColor}
            onChange={handleInput}
          />
        </div>
      </div>

      <div className="grid">
        <div>
          <label className="label">Mobile Menu Background</label>
          <input
            className="input"
            name="mobileMenuBgColor"
            value={form.mobileMenuBgColor}
            onChange={handleInput}
          />
        </div>

        <div>
          <label className="label">Home Background Color</label>
          <input
            className="input"
            name="homeBgColor"
            value={form.homeBgColor}
            onChange={handleInput}
          />
        </div>
      </div>

      {/* Home screen texts */}
      <div className="grid">
        <div>
          <label className="label">Home Launcher Logo</label>
          <input
            className="input"
            name="homeLauncherLogo"
            value={form.homeLauncherLogo}
            onChange={handleInput}
          />
        </div>

        <div>
          <label className="label">Header Text</label>
          <input
            className="input"
            name="headerText"
            value={form.headerText}
            onChange={handleInput}
          />
        </div>
      </div>

      <div className="grid">
        <div>
          <label className="label">Welcome Text</label>
          <input
            className="input"
            name="welcomeText"
            value={form.welcomeText}
            onChange={handleInput}
          />
        </div>
      </div>

      <div className="grid">
        <div>
          <label className="label">Welcome Body</label>
          <textarea
            className="input"
            rows={3}
            name="welcomeBody"
            value={form.welcomeBody}
            onChange={handleInput}
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="form-actions space-between">
        <button
          className="btn secondary"
          type="button"
          onClick={() => setTab(1)}
        >
          ← Previous
        </button>

        <button
          className="btn primary"
          type="button"
          onClick={() => setTab(3)}
        >
          Next →
        </button>
      </div>
    </div>
  );
}

// ===============================================
// TAB 3 — NOTIFICATION CONFIG
// ===============================================
function Tab3({ form, handleInput, setTab, handleSave, saving }) {
  return (
    <div className="form-step">
      <div className="grid">
        <div>
          <label className="label">Push</label>
          <select
            className="input"
            name="push"
            value={form.push}
            onChange={handleInput}
          >
            <option value="True">True</option>
            <option value="False">False</option>
          </select>
        </div>

        <div>
          <label className="label">Time Restriction</label>
          <input
            className="input"
            name="timeRestriction"
            value={form.timeRestriction}
            onChange={handleInput}
          />
        </div>
      </div>

      <div className="grid">
        <div>
          <label className="label">Weekend Restriction</label>
          <input
            className="input"
            name="weekendRestriction"
            value={form.weekendRestriction}
            onChange={handleInput}
          />
        </div>

        <div>
          <label className="label">Alert Interval</label>
          <input
            className="input"
            type="number"
            name="alertInterval"
            value={form.alertInterval}
            onChange={handleInput}
          />
        </div>
      </div>

      {/* Issue intervals */}
      <div className="grid">
        <div>
          <label className="label">Janitor Issue Interval</label>
          <input
            className="input"
            name="janitorIssueInterval"
            value={form.janitorIssueInterval}
            onChange={handleInput}
          />
        </div>

        <div>
          <label className="label">Maintenance Issue Interval</label>
          <input
            className="input"
            name="maintenanceIssueInterval"
            value={form.maintenanceIssueInterval}
            onChange={handleInput}
          />
        </div>
      </div>

      {/* Feedback intervals */}
      <div className="grid">
        <div>
          <label className="label">
            Feedback Duplicate Filter Interval
          </label>
          <input
            className="input"
            type="number"
            name="feedbackDuplicateFilterInterval"
            value={form.feedbackDuplicateFilterInterval}
            onChange={handleInput}
          />
        </div>

        <div>
          <label className="label">Feedback Filter Count</label>
          <input
            className="input"
            type="number"
            name="feedbackFilterCount"
            value={form.feedbackFilterCount}
            onChange={handleInput}
          />
        </div>
      </div>

      {/* Flags */}
      <div className="grid">
        <div>
          <label className="label">Device Email Flag</label>
          <input
            className="input"
            name="deviceEmailFlag"
            value={form.deviceEmailFlag}
            onChange={handleInput}
          />
        </div>

        <div>
          <label className="label">Feedback Combined Flag</label>
          <input
            className="input"
            name="feedbackCombinedFlag"
            value={form.feedbackCombinedFlag}
            onChange={handleInput}
          />
        </div>
      </div>

      <div className="grid">
        <div>
          <label className="label">Feedback Email Flag</label>
          <input
            className="input"
            name="feedbackEmailFlag"
            value={form.feedbackEmailFlag}
            onChange={handleInput}
          />
        </div>

        <div>
          <label className="label">Feedback Text Flag</label>
          <input
            className="input"
            type="number"
            name="feedbackTextFlag"
            value={form.feedbackTextFlag}
            onChange={handleInput}
          />
        </div>
      </div>

      {/* Device + QR */}
      <div className="grid">
        <div>
          <label className="label">Device Text Flag</label>
          <input
            className="input"
            type="number"
            name="deviceTextFlag"
            value={form.deviceTextFlag}
            onChange={handleInput}
          />
        </div>

        <div>
          <label className="label">QR Janitor Push</label>
          <input
            className="input"
            name="qrJanitorpush"
            value={form.qrJanitorpush}
            onChange={handleInput}
          />
        </div>
      </div>

      <div className="grid">
        <div>
          <label className="label">QR Janitor Text Flag</label>
          <input
            className="input"
            type="number"
            name="qrJanitorTextFlag"
            value={form.qrJanitorTextFlag}
            onChange={handleInput}
          />
        </div>

        <div>
          <label className="label">QR Janitor Email Flag</label>
          <input
            className="input"
            name="qrJanitorEmailFlag"
            value={form.qrJanitorEmailFlag}
            onChange={handleInput}
          />
        </div>
      </div>

      {/* Escalation */}
      <div className="grid">
        <div>
          <label className="label">Open Area Traffic Flag</label>
          <input
            className="input"
            type="number"
            name="openAreaTrafficFlag"
            value={form.openAreaTrafficFlag}
            onChange={handleInput}
          />
        </div>

        <div>
          <label className="label">Escalation Type</label>
          <input
            className="input"
            type="number"
            name="escalationType"
            value={form.escalationType}
            onChange={handleInput}
          />
        </div>
      </div>

      <div className="grid">
        <div>
          <label className="label">Escalation Level 1 Interval</label>
          <input
            className="input"
            type="number"
            name="escalationLevel1Interval"
            value={form.escalationLevel1Interval}
            onChange={handleInput}
          />
        </div>

        <div>
          <label className="label">Escalation Level 2 Interval</label>
          <input
            className="input"
            type="number"
            name="escalationLevel2Interval"
            value={form.escalationLevel2Interval}
            onChange={handleInput}
          />
        </div>
      </div>

      {/* Cleaning */}
      <div className="grid">
        <div>
          <label className="label">Not Clean Escalation Interval</label>
          <input
            className="input"
            type="number"
            name="notCleanEscalationInterval"
            value={form.notCleanEscalationInterval}
            onChange={handleInput}
          />
        </div>

        <div>
          <label className="label">Cleaning Schedule Flag</label>
          <input
            className="input"
            name="cleaningScheduleFlag"
            value={form.cleaningScheduleFlag}
            onChange={handleInput}
          />
        </div>
      </div>

      {/* Dispatch + Device Data */}
      <div className="grid">
        <div>
          <label className="label">Dispatched Interval</label>
          <input
            className="input"
            type="number"
            name="dispatchedInterval"
            value={form.dispatchedInterval}
            onChange={handleInput}
          />
        </div>

        <div>
          <label className="label">Device Data Time Interval</label>
          <input
            className="input"
            type="number"
            name="deviceDataTimeInterval"
            value={form.deviceDataTimeInterval}
            onChange={handleInput}
          />
        </div>
      </div>

      {/* Thresholds */}
      <div className="grid">
        <div>
          <label className="label">Toilet Paper Threshold</label>
          <input
            className="input"
            type="number"
            name="toiletPaperThreshold"
            value={form.toiletPaperThreshold}
            onChange={handleInput}
          />
        </div>

        <div>
          <label className="label">Paper Towel Threshold</label>
          <input
            className="input"
            type="number"
            name="paperTowelThreshold"
            value={form.paperTowelThreshold}
            onChange={handleInput}
          />
        </div>
      </div>

      <div className="grid">
        <div>
          <label className="label">Trash Threshold</label>
          <input
            className="input"
            type="number"
            name="trashThreshold"
            value={form.trashThreshold}
            onChange={handleInput}
          />
        </div>

        <div>
          <label className="label">Area Alert Threshold</label>
          <input
            className="input"
            type="number"
            name="areaAlertThreshold"
            value={form.areaAlertThreshold}
            onChange={handleInput}
          />
        </div>
      </div>

      {/* Traffic Alert */}
      <div className="grid">
        <div>
          <label className="label">Traffic Alert</label>
          <input
            className="input"
            name="trafficAlert"
            value={form.trafficAlert}
            onChange={handleInput}
          />
        </div>
      </div>

      {/* Save + Nav */}
      <div className="form-actions space-between">
        <button
          className="btn secondary"
          type="button"
          onClick={() => setTab(2)}
        >
          ← Previous
        </button>

        <button
          className="btn primary"
          type="button"
          disabled={saving}
          onClick={handleSave}
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
