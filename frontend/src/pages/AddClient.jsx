// ===============================================
// src/pages/AddClient.jsx  (FINAL FULL UPDATED)
// ===============================================

import React, { useState, useEffect, useCallback } from "react";
import { createClient, fetchClients, deleteClient } from "../api";
import FullClientTable from "../components/FullClientTable";
import "../App.css";

const emptyForm = {
  clientName: "",
  dbName: "",
  push: "True",

  defaultLanguage: "",
  listOfLanguage: [],
  defaultDisplayLanguage: "",
  listOfDisplayLanguage: [],

  headerLogo: "",
  poweredByLogo: "",
  menuColor: "",
  subMenuColor: "",
  textColor: "",
  mobileHeaderColor: "",
  mobileMenuBgColor: "",
  headerText: "",
  welcomeText: "0",
  welcomeBody: "",
  alert: "",
  productLogo: "",
  homeBgColor: "",
  homeLauncherLogo: "",
};

export default function AddClient() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(emptyForm);
  const [clients, setClients] = useState([]);
  const [loadingSave, setLoadingSave] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [newLanguage, setNewLanguage] = useState("");
  const [newDisplayLanguage, setNewDisplayLanguage] = useState("");

  // -----------------------------------------------------
  // LOAD CLIENT LIST
  // -----------------------------------------------------
  const loadClientsList = useCallback(async () => {
    try {
      const list = await fetchClients();

      const sorted = Array.isArray(list)
        ? [...list].sort((a, b) => (b.id ?? 0) - (a.id ?? 0))
        : [];

      setClients(sorted);
    } catch (err) {
      console.error("Error loading clients:", err);
    }
  }, []);

  useEffect(() => {
    loadClientsList();
  }, [loadClientsList]);

  // -----------------------------------------------------
  // FORM CHANGE
  // -----------------------------------------------------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleWelcomeToggle = () => {
    setForm((prev) => ({
      ...prev,
      welcomeText: prev.welcomeText === "1" ? "0" : "1",
    }));
  };

  // -----------------------------------------------------
  // STEP 1 → STEP 2 VALIDATION
  // -----------------------------------------------------
  const handleReview = (e) => {
    e.preventDefault();

    if (!form.clientName.trim()) return setErrorMsg("Client Name is required");
    if (!form.dbName.trim()) return setErrorMsg("DB Name is required");
    if (!form.alert) return setErrorMsg("Alert Type is required");
    if (!form.defaultLanguage)
      return setErrorMsg("Default Language is required");
    if (!form.defaultDisplayLanguage)
      return setErrorMsg("Default Display Language is required");

    setErrorMsg("");
    setStep(2);
  };

  // -----------------------------------------------------
  // SAVE CLIENT
  // -----------------------------------------------------
  const handleConfirm = async () => {
    setLoadingSave(true);

    try {
      const payload = {
        ...form,
        listOfLanguage: form.listOfLanguage.join(","),
        listOfDisplayLanguage: form.listOfDisplayLanguage.join(","),
      };

      const res = await createClient(payload);

      if (res?.error) {
        setErrorMsg(res.error);
        setLoadingSave(false);
        return;
      }

      await loadClientsList();
      setStep(3);
    } catch (err) {
      setErrorMsg(err.message || "Failed to save client");
    } finally {
      setLoadingSave(false);
    }
  };

  // -----------------------------------------------------
  // DELETE CLIENT
  // -----------------------------------------------------
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this client?")) return;

    try {
      await deleteClient(id);
      await loadClientsList();
      alert("Client deleted successfully");
    } catch (err) {
      alert("Error deleting client: " + err.message);
    }
  };

  // -----------------------------------------------------
  // RESET
  // -----------------------------------------------------
  const resetForm = () => {
    setForm(emptyForm);
    setErrorMsg("");
    setStep(1);
  };

  // -----------------------------------------------------
  // UI
  // -----------------------------------------------------
  return (
    <div className="add-client-page">
      <div className="add-client-content">

        {/* ------------------------------------------------- */}
        {/* STEPPER */}
        {/* ------------------------------------------------- */}
        <div className="stepper">
          {[1, 2, 3].map((n) => (
            <button
              key={n}
              type="button"
              className={`step-dot ${
                step === n ? "active" : step > n ? "completed" : ""
              }`}
              onClick={() => n < step && setStep(n)}
            >
              {n}
            </button>
          ))}
        </div>

        {/* ERROR MESSAGE */}
        {errorMsg && (
          <div className="message danger">
            <strong>⚠️ </strong> {errorMsg}
          </div>
        )}

        {/* ------------------------------------------------- */}
        {/* STEP 1 FORM */}
        {/* ------------------------------------------------- */}
        {step === 1 && (
          <form className="form-step" onSubmit={handleReview}>
            {/* Row 1 */}
            <div className="grid">
              <div>
                <label className="label">Client Name *</label>
                <input
                  className="input"
                  name="clientName"
                  value={form.clientName}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="label">DB Name *</label>
                <input
                  className="input"
                  name="dbName"
                  value={form.dbName}
                  onChange={handleChange}
                  placeholder="Database name"
                />
              </div>
            </div>

            {/* Row 2 */}
            <div className="grid">
              <div>
                <label className="label">Alert Type *</label>
                <select
                  className="input"
                  name="alert"
                  value={form.alert}
                  onChange={handleChange}
                >
                  <option value="">-- Select --</option>
                  <option value="Push">Push</option>
                  <option value="Get">Get</option>
                  <option value="Email">Email</option>
                </select>
              </div>

              <div>
                <label className="label">Push *</label>
                <select
                  className="input"
                  name="push"
                  value={form.push}
                  onChange={handleChange}
                >
                  <option value="True">True</option>
                  <option value="False">False</option>
                </select>
              </div>
            </div>

            {/* Languages */}
            <div className="grid">
              <div>
                <label className="label">List Of Languages</label>

                <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                  <input
                    className="input"
                    placeholder="Add language"
                    value={newLanguage}
                    onChange={(e) => setNewLanguage(e.target.value)}
                  />
                  <button
                    type="button"
                    className="btn primary"
                    style={{ width: 40, height: 40, borderRadius: "50%" }}
                    onClick={() => {
                      if (
                        newLanguage.trim() &&
                        !form.listOfLanguage.includes(newLanguage)
                      ) {
                        setForm({
                          ...form,
                          listOfLanguage: [...form.listOfLanguage, newLanguage],
                        });
                        setNewLanguage("");
                      }
                    }}
                  >
                    +
                  </button>
                </div>

                {/* Show Added Languages */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                  {form.listOfLanguage.map((lang, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "6px 12px",
                        background: "#efefef",
                        borderRadius: 20,
                      }}
                    >
                      {lang}
                      <span
                        onClick={() =>
                          setForm({
                            ...form,
                            listOfLanguage: form.listOfLanguage.filter(
                              (x) => x !== lang
                            ),
                          })
                        }
                        style={{
                          cursor: "pointer",
                          fontWeight: "bold",
                          fontSize: 18,
                        }}
                      >
                        ×
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="label">Default Language *</label>
                <select
                  className="input"
                  name="defaultLanguage"
                  value={form.defaultLanguage}
                  onChange={handleChange}
                >
                  <option value="">-- Select --</option>
                  {form.listOfLanguage.map((l, i) => (
                    <option key={i} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Display Languages */}
            <div className="grid">
              <div>
                <label className="label">List Of Display Languages</label>

                <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                  <input
                    className="input"
                    placeholder="Add display language"
                    value={newDisplayLanguage}
                    onChange={(e) => setNewDisplayLanguage(e.target.value)}
                  />

                  <button
                    type="button"
                    className="btn primary"
                    style={{ width: 40, height: 40, borderRadius: "50%" }}
                    onClick={() => {
                      if (
                        newDisplayLanguage.trim() &&
                        !form.listOfDisplayLanguage.includes(newDisplayLanguage)
                      ) {
                        setForm({
                          ...form,
                          listOfDisplayLanguage: [
                            ...form.listOfDisplayLanguage,
                            newDisplayLanguage,
                          ],
                        });
                        setNewDisplayLanguage("");
                      }
                    }}
                  >
                    +
                  </button>
                </div>

                {/* Chips */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                  {form.listOfDisplayLanguage.map((lang, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "6px 12px",
                        background: "#efefef",
                        borderRadius: 20,
                      }}
                    >
                      {lang}
                      <span
                        onClick={() =>
                          setForm({
                            ...form,
                            listOfDisplayLanguage:
                              form.listOfDisplayLanguage.filter(
                                (x) => x !== lang
                              ),
                          })
                        }
                        style={{
                          cursor: "pointer",
                          fontWeight: "bold",
                          fontSize: 18,
                        }}
                      >
                        ×
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="label">Default Display Language *</label>
                <select
                  className="input"
                  name="defaultDisplayLanguage"
                  value={form.defaultDisplayLanguage}
                  onChange={handleChange}
                >
                  <option value="">-- Select --</option>
                  {form.listOfDisplayLanguage.map((l, i) => (
                    <option key={i} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Basic UI Colors */}
            <div className="grid">
              <div>
                <label className="label">Menu Color</label>
                <input
                  className="input"
                  name="menuColor"
                  value={form.menuColor}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="label">Sub Menu Color</label>
                <input
                  className="input"
                  name="subMenuColor"
                  value={form.subMenuColor}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Logo URLs */}
            <div className="grid">
              <div>
                <label className="label">Product Logo URL</label>
                <input
                  className="input"
                  name="productLogo"
                  value={form.productLogo}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="label">Home Launcher Logo URL</label>
                <input
                  className="input"
                  name="homeLauncherLogo"
                  value={form.homeLauncherLogo}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* More Colors */}
            <div className="grid">
              <div>
                <label className="label">Text Color</label>
                <input
                  className="input"
                  name="textColor"
                  value={form.textColor}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="label">Mobile Header Color</label>
                <input
                  className="input"
                  name="mobileHeaderColor"
                  value={form.mobileHeaderColor}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid">
              <div>
                <label className="label">Mobile Menu BG</label>
                <input
                  className="input"
                  name="mobileMenuBgColor"
                  value={form.mobileMenuBgColor}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="label">Home BG Color</label>
                <input
                  className="input"
                  name="homeBgColor"
                  value={form.homeBgColor}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Header Text + Welcome Toggle */}
            <div className="grid">
              <div>
                <label className="label">Header Text</label>
                <input
                  className="input"
                  name="headerText"
                  value={form.headerText}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="label">Welcome Text</label>

                <div
                  className={`switch ${
                    form.welcomeText === "1" ? "on" : ""
                  }`}
                  onClick={handleWelcomeToggle}
                >
                  <div className="switch-circle"></div>
                  <span className="switch-text">
                    {form.welcomeText === "1" ? "ON" : "OFF"}
                  </span>
                </div>
              </div>
            </div>

            {/* Welcome Body */}
            <label className="label">Welcome Body</label>
            <textarea
              className="input"
              rows={4}
              name="welcomeBody"
              value={form.welcomeBody}
              onChange={handleChange}
            />

            {/* Submit */}
            <div className="form-actions">
              <button className="btn primary" type="submit">
                Review
              </button>
            </div>
          </form>
        )}

        {/* ------------------------------------------------- */}
        {/* STEP 2 (REVIEW PAGE) */}
        {/* ------------------------------------------------- */}
        {step === 2 && (
          <div className="form-step">
            <h2>Step 2: Review Details</h2>

            <div className="review-grid">
              <Review label="Client Name" value={form.clientName} />
              <Review label="DB Name" value={form.dbName} />
              <Review label="Push Enabled" value={form.push} />
              <Review label="Alert Type" value={form.alert} />
              <Review label="Default Language" value={form.defaultLanguage} />
              <Review
                label="Languages"
                value={form.listOfLanguage.join(", ") || "-"}
              />
              <Review
                label="Display Language"
                value={form.defaultDisplayLanguage}
              />
              <Review
                label="Display Languages"
                value={form.listOfDisplayLanguage.join(", ") || "-"}
              />
              <Review label="Menu Color" value={form.menuColor || "-"} />
              <Review label="Sub Menu Color" value={form.subMenuColor || "-"} />
              <Review label="Text Color" value={form.textColor || "-"} />
              <Review label="Home BG" value={form.homeBgColor || "-"} />
              <Review
                label="Welcome Text"
                value={form.welcomeText === "1" ? "Enabled" : "Disabled"}
              />
              <Review label="Welcome Body" value={form.welcomeBody || "-"} full />
            </div>

            <div className="form-actions">
              <button className="btn secondary" onClick={() => setStep(1)}>
                Back
              </button>

              <button
                className="btn primary"
                onClick={handleConfirm}
                disabled={loadingSave}
              >
                {loadingSave ? "Saving..." : "Add Client"}
              </button>
            </div>
          </div>
        )}

        {/* ------------------------------------------------- */}
        {/* STEP 3 (VIEW SAVED CLIENTS) */}
        {/* ------------------------------------------------- */}
        {step === 3 && (
          <div className="form-step">
            <h2>Step 3: All Clients</h2>

            <div className="message success">Client saved successfully.</div>

            <FullClientTable
              clients={clients}
              handleSort={() => {}}       // REQUIRED TO PREVENT CRASH
              getSortArrow={() => ""}     // REQUIRED TO PREVENT CRASH
              onDelete={handleDelete}
            />

            <div className="form-actions">
              <button className="btn secondary" onClick={resetForm}>
                + Add Another Client
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// ------------------------------------------------------
// REVIEW COMPONENT
// ------------------------------------------------------
function Review({ label, value, full }) {
  return (
    <div className={`review-item ${full ? "full-width" : ""}`}>
      <span className="review-label">{label}</span>
      <span className="review-value">{value}</span>
    </div>
  );
}
