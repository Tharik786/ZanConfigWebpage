// ===============================================
// src/pages/AddClient.jsx (CLEANED FINAL VERSION WITH DEFAULTS)
// ===============================================

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createClient, fetchClientDefaults } from "../api";
import "../App.css";

// -----------------------------------------------------
// BASE EMPTY FORM (ALL FIELDS)
// -----------------------------------------------------
const emptyForm = {
  clientName: "",
  dbName: "",
  baseClient: "",
  medianFlag: "",
  stateMaintainHours: "",
  recentAlertHours: "",
  notificationListHours: "",
  trashEnabled: "",
  paperEnabled: "",
  hvacEnabled: "",
  waterFlowEnabled: "",
  feedbackEnabled: "",
  soapDispenserEnabled: "",
  airFreshenerEnabled: "",
  cleanIndexEnabled: "",
  heatMapEnabled: "",
  schedulerEnabled: "",
  peopleCountEnabled: "",
  typicalHighValue: "",
  cleaningThreshold: "",
  analyticsWeekEndRestrictionFlag: "",
  trafficSensor: "",
  appViewType: "",
  feedbackAlertConfig: "",
  beaconTimeInterval: "",
  soapShots: "",
  pumpPercentage: "",
  soapPredictionIsEnabled: "",
  labelFlag: "",
  weatherEnabled: "",
  language: "",
  occupancyDurationLimit: "",
  passwordRotationInterval: "",
  mfaFlag: "",
  pageReloadInterval: "",
  inspectionType: "",
  defaultGradingflag: "",
  commentsLimit: "",
  janitorScheduleFlag: "",
  publisherType: "",
  availableSensors: "",
  feedbackType: "",
  feedbackAlertOrder: "",
  feedbackDefaultTimeout: "",
  overViewStartTime: "",
  cannedChartPeriod: "",
  dataPostingType: "",

  // clientappdetails
  defaultLanguage: "",
  listOfLanguage: [],
  defaultDisplayLanguage: "",
  listOfDisplayLanguage: [],
  headerLogo: "",
  footerLogo: "",
  poweredByLogo: "",
  menuColor: "",
  subMenuColor: "",
  textColor: "",
  mobileHeaderColor: "",
  mobileMenuBgColor: "",
  headerText: "",
  welcomeText: "",
  welcomeBody: "",
  productLogo: "",
  homeBgColor: "",
  homeLauncherLogo: "",

  // notificationconfiguration
  push: "True",
  timeRestriction: "",
  weekendRestriction: "",
  alertInterval: "",
  janitorIssueInterval: "",
  maintenanceIssueInterval: "",
  feedbackDuplicateFilterInterval: "",
  feedbackFilterCount: "",
  deviceEmailFlag: "",
  feedbackCombinedFlag: "",
  feedbackEmailFlag: "",
  feedbackTextFlag: "",
  deviceTextFlag: "",
  qrJanitorpush: "",
  qrJanitorTextFlag: "",
  qrJanitorEmailFlag: "",
  openAreaTrafficFlag: "",
  escalationType: "",
  escalationLevel1Interval: "",
  escalationLevel2Interval: "",
  notCleanEscalationInterval: "",
  cleaningScheduleFlag: "",
  dispatchedInterval: "",
  deviceDataTimeInterval: "",
  toiletPaperThreshold: "",
  paperTowelThreshold: "",
  trashThreshold: "",
  areaAlertThreshold: "",
  trafficAlert: "",
};

export default function AddClient() {
  const navigate = useNavigate();
  const [tab, setTab] = useState(1);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);          // submit loading
  const [defaultsLoading, setDefaultsLoading] = useState(true); // defaults loading
  const [errorMsg, setErrorMsg] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const [newLang, setNewLang] = useState("");
  const [newDispLang, setNewDispLang] = useState("");

  // -----------------------------------------------------
  // LOAD BACKEND DEFAULTS (FOR NEW CLIENT)
  // -----------------------------------------------------
  const loadDefaults = async () => {
    try {
      setDefaultsLoading(true);
      const res = await fetchClientDefaults();

      if (!res || res.ok === false) {
        console.warn("Failed to load client defaults:", res?.error);
        // still keep form as emptyForm if backend defaults not available
        setForm((prev) => ({ ...emptyForm, ...prev }));
        return;
      }

      const d1 = res.client_details || {};
      const d2 = res.client_appdetails || {};
      const d3 = res.notification_config || {};

      const listLangStr = d2.listOfLanguage || "";
      const listDispStr = d2.listOfDisplayLanguage || "";

      const mapped = {
        ...emptyForm,
        ...d1,
        ...d2,
        ...d3,
        // make sure these two crucial fields start blank for a brand new client
        clientName: "",
        dbName: "",
        baseClient: "",
        listOfLanguage: listLangStr
          ? listLangStr.split(",").map((s) => s.trim()).filter(Boolean)
          : [],
        listOfDisplayLanguage: listDispStr
          ? listDispStr.split(",").map((s) => s.trim()).filter(Boolean)
          : [],
      };

      setForm(mapped);
    } catch (err) {
      console.error("Error loading client defaults:", err);
      // on error, fall back to empty form
      setForm(emptyForm);
    } finally {
      setDefaultsLoading(false);
    }
  };

  useEffect(() => {
    loadDefaults();
  }, []);

  // -----------------------------------------------------
  // HANDLERS
  // -----------------------------------------------------
  const handleInput = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const addLanguage = () => {
    if (!newLang.trim()) return;
    setForm((prev) => ({
      ...prev,
      listOfLanguage: [...prev.listOfLanguage, newLang.trim()],
    }));
    setNewLang("");
  };

  const removeLanguage = (i) => {
    setForm((prev) => ({
      ...prev,
      listOfLanguage: prev.listOfLanguage.filter((_, x) => x !== i),
    }));
  };

  const addDisplayLanguage = () => {
    if (!newDispLang.trim()) return;
    setForm((prev) => ({
      ...prev,
      listOfDisplayLanguage: [
        ...prev.listOfDisplayLanguage,
        newDispLang.trim(),
      ],
    }));
    setNewDispLang("");
  };

  const removeDisplayLanguage = (i) => {
    setForm((prev) => ({
      ...prev,
      listOfDisplayLanguage: prev.listOfDisplayLanguage.filter(
        (_, x) => x !== i
      ),
    }));
  };

  const handleSubmit = async () => {
    if (!form.clientName.trim())
      return setErrorMsg("Client Name is required");
    if (!form.dbName.trim()) return setErrorMsg("DB Name is required");

    setLoading(true);
    setErrorMsg("");

    try {
      const payload = {
        ...form,
        listOfLanguage: form.listOfLanguage.join(","),
        listOfDisplayLanguage: form.listOfDisplayLanguage.join(","),
      };

      const res = await createClient(payload);
      if (res?.error) {
        setErrorMsg(res.error);
        setLoading(false);
        return;
      }
      setShowSuccess(true);
    } catch (err) {
      setErrorMsg(err.message || "Failed to save client");
    } finally {
      setLoading(false);
    }
  };

  const closeSuccess = () => {
    setShowSuccess(false);
    setTab(1);
    // reset to backend defaults for adding another new client
    loadDefaults();
  };

  // -----------------------------------------------------
  // RENDER
  // -----------------------------------------------------
  if (defaultsLoading) {
    return (
      <div className="add-client-page">
        <p>Loading default values for new client…</p>
      </div>
    );
  }

  return (
    <div className="add-client-page">
      {/* SUCCESS POPUP */}
      {showSuccess && (
        <div className="success-popup">
          <div className="success-box">
            <h2>Client Added Successfully</h2>
            <p>Your new client has been created.</p>
            <div className="popup-actions">
              <button
                className="btn primary"
                onClick={() => navigate("/client-list")}
              >
                View Clients
              </button>
              <button className="btn secondary" onClick={closeSuccess}>
                + Add Another
              </button>
              <button className="btn secondary" onClick={() => navigate("/")}>
                Back to Home
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Optional error display */}
      {errorMsg && <div className="error-banner">{errorMsg}</div>}

      {/* TAB HEADER */}
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
          Client App Details
        </button>

        <button
          className={`tab-modern-btn ${tab === 3 ? "active" : ""}`}
          onClick={() => setTab(3)}
        >
          Notification Config
        </button>
      </div>

      {/* ================= TAB 1 – CLIENT DETAILS ================= */}
      {tab === 1 && (
        <div className="form-step">
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
              <label className="label">
                Analytics Weekend Restriction Flag
              </label>
              <input
                className="input"
                name="analyticsWeekEndRestrictionFlag"
                value={form.analyticsWeekEndRestrictionFlag}
                onChange={handleInput}
              />
            </div>
          </div>

          {/* Feature flags */}
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

          {/* Feedback & app config */}
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

          {/* Soap / Misc */}
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
      )}

      {/* ================= TAB 2 – APP DETAILS ================= */}
      {tab === 2 && (
        <div className="form-step">
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
                {form.listOfLanguage.map((lang, index) => (
                  <option key={index} value={lang}>
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
                {form.listOfDisplayLanguage.map((lang, index) => (
                  <option key={index} value={lang}>
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
                  placeholder="Add language"
                  value={newLang}
                  onChange={(e) => setNewLang(e.target.value)}
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
                {form.listOfLanguage.map((lang, index) => (
                  <span key={index} className="tag-item">
                    {lang}
                    <button
                      type="button"
                      className="remove-tag"
                      onClick={() => removeLanguage(index)}
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
                  placeholder="Add display language"
                  value={newDispLang}
                  onChange={(e) => setNewDispLang(e.target.value)}
                />
                <button
                  type="button"
                  className="blue-plus-btn"
                  onClick={addDisplayLanguage}
                >
                  +
                </button>
              </div>
              <div className="tag-list">
                {form.listOfDisplayLanguage.map((lang, index) => (
                  <span key={index} className="tag-item">
                    {lang}
                    <button
                      type="button"
                      className="remove-tag"
                      onClick={() => removeDisplayLanguage(index)}
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
      )}

      {/* ================= TAB 3 – NOTIFICATION CONFIG ================= */}
      {tab === 3 && (
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
              disabled={loading}
              onClick={handleSubmit}
            >
              {loading ? "Saving..." : "Submit"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
