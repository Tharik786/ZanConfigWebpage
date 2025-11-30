// src/pages/EditClient.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getClient, updateClient } from "../api";
import "../App.css";

const emptyForm = {
  clientName: "",
  dbName: "",
  push: "False",

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

export default function EditClient() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [newLanguage, setNewLanguage] = useState("");
  const [newDisplayLanguage, setNewDisplayLanguage] = useState("");

  // -----------------------------
  // LOAD CLIENT
  // -----------------------------
  const loadClient = useCallback(async () => {
    try {
      setErrorMsg("");
      setLoading(true);

      const c = await getClient(id);

      if (!c || !c.id) {
        setErrorMsg("Client not found");
        setForm(emptyForm);
        return;
      }

      setForm({
        ...emptyForm,
        ...c,
        listOfLanguage: c.listOfLanguage
          ? String(c.listOfLanguage).split(",").filter(Boolean)
          : [],
        listOfDisplayLanguage: c.listOfDisplayLanguage
          ? String(c.listOfDisplayLanguage).split(",").filter(Boolean)
          : [],
        dbName: c.dbName || "",
        push: c.push || "False",
      });
    } catch (err) {
      setErrorMsg(err.message || "Failed to load client.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadClient();
  }, [loadClient]);

  // -----------------------------
  // FORM HANDLERS
  // -----------------------------
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

  // -----------------------------
  // SUBMIT UPDATE
  // -----------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg("");

    try {
      const payload = {
        ...form,
        listOfLanguage: form.listOfLanguage.join(","),
        listOfDisplayLanguage: form.listOfDisplayLanguage.join(","),
      };

      await updateClient(id, payload);

      alert("Client updated successfully");
      navigate("/client-list");
    } catch (err) {
      setErrorMsg(err.message || "Failed to update client");
    } finally {
      setSaving(false);
    }
  };

  // -----------------------------
  // LOADING SCREEN
  // -----------------------------
  if (loading) {
    return (
      <div className="page1">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading client...</p>
        </div>
      </div>
    );
  }

  // -----------------------------
  // RENDER
  // -----------------------------
  return (
    <div className="add-client-page">
      <div className="add-client-content">
        <h2>Edit Client</h2>

        {errorMsg && (
          <div className="message danger">
            <strong>⚠️ </strong> {errorMsg}
          </div>
        )}

        <form className="form-step" onSubmit={handleSubmit}>
          {/* ---------------- Row 1: Client Name + DB ---------------- */}
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
              />
            </div>
          </div>

          {/* ---------------- Row 2: Alert + Push ---------------- */}
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
              <label className="label">Push Enabled *</label>
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

          {/* ---------------- Row 3: Languages ---------------- */}
          <div className="grid">
            {/* List of Languages */}
            <div>
              <label className="label">List Of Languages</label>

              <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                <input
                  className="input"
                  placeholder="Add language and press +"
                  value={newLanguage}
                  onChange={(e) => setNewLanguage(e.target.value)}
                />

                <button
                  type="button"
                  className="btn primary"
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    fontSize: 20,
                  }}
                  onClick={() => {
                    if (
                      newLanguage.trim() &&
                      !form.listOfLanguage.includes(newLanguage)
                    ) {
                      setForm({
                        ...form,
                        listOfLanguage: [
                          ...form.listOfLanguage,
                          newLanguage,
                        ],
                      });
                      setNewLanguage("");
                    }
                  }}
                >
                  +
                </button>
              </div>

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

            {/* Default Language */}
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

          {/* ---------------- Row 4: Logos ---------------- */}
          <div className="grid">
            <div>
              <label className="label">Header Logo URL</label>
              <input
                className="input"
                name="headerLogo"
                value={form.headerLogo}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="label">Powered By Logo URL</label>
              <input
                className="input"
                name="poweredByLogo"
                value={form.poweredByLogo}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* ---------------- Row 5: Display Languages ---------------- */}
          <div className="grid">
            {/* List of Display Languages */}
            <div>
              <label className="label">List Of Display Languages</label>

              <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                <input
                  className="input"
                  placeholder="Add language and press +"
                  value={newDisplayLanguage}
                  onChange={(e) => setNewDisplayLanguage(e.target.value)}
                />

                <button
                  type="button"
                  className="btn primary"
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    fontSize: 20,
                  }}
                  onClick={() => {
                    if (
                      newDisplayLanguage.trim() &&
                      !form.listOfDisplayLanguage.includes(
                        newDisplayLanguage
                      )
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

              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {form.listOfDisplayLanguage.map((lang, idx) => (
                  <div
                    key={idx}
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

            {/* Default Display Language */}
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

          {/* ---------------- Row 6: Menu Colors ---------------- */}
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

          {/* ---------------- Row 7: Logos ---------------- */}
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

          {/* ---------------- Row 8: Text + Header Colors ---------------- */}
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

          {/* ---------------- Row 9: BG Colors ---------------- */}
          <div className="grid">
            <div>
              <label className="label">Mobile Menu BG Color</label>
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

          {/* ---------------- Row 10: Header Text + Welcome Toggle ---------------- */}
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
                className={`switch ${form.welcomeText === "1" ? "on" : ""}`}
                onClick={handleWelcomeToggle}
              >
                <div className="switch-circle"></div>
                <span className="switch-text">
                  {form.welcomeText === "1" ? "ON" : "OFF"}
                </span>
              </div>
            </div>
          </div>

          {/* ---------------- Row 11: Welcome Body ---------------- */}
          <label className="label">Welcome Body</label>
          <textarea
            className="input"
            rows={4}
            name="welcomeBody"
            value={form.welcomeBody}
            onChange={handleChange}
          />

          {/* ---------------- Actions ---------------- */}
          <div className="form-actions">
            <button
              type="button"
              className="btn secondary"
              onClick={() => navigate("/client-list")}
            >
              Cancel
            </button>

            <button className="btn primary" type="submit" disabled={saving}>
              {saving ? "Updating..." : "Update Client"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
