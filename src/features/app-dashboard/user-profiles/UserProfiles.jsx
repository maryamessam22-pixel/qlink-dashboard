import React, { useEffect, useMemo, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import PageMeta from "../../../components/seo/PageMeta";
import SeoSection from "../../../components/seo/SeoSection";
import { getAppProfilesList } from "../../../data/appProfiles";
import "./UserProfiles.css";

const REFRESH_MS = 60_000;

function bloodClass(type) {
  switch (type) {
    case "O+":
      return "op";
    case "O-":
      return "on";
    case "A+":
      return "ap";
    case "A-":
      return "an";
    case "B+":
      return "bp";
    case "B-":
      return "bn";
    case "AB+":
      return "abp";
    case "AB-":
      return "abn";
    default:
      return "op";
  }
}

const UserProfiles = () => {
  const [tick, setTick] = useState(0);
  const [overrides, setOverrides] = useState({});
  const [seo, setSeo] = useState({
    slug: "user-profiles",
    metaTitle: "Profiles management — Qlink App",
    metaDescription: "Manage patient profiles and linked guardian information.",
    keywords: "profiles, patient, guardian, app, qlink",
    featuredImageAlt: "Profiles",
  });

  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), REFRESH_MS);
    return () => window.clearInterval(id);
  }, []);

  const payload = useMemo(() => getAppProfilesList(9, Date.now() + tick), [tick]);

  const isActive = (row) => {
    const o = overrides[row.id];
    if (o && typeof o.active === "boolean") return o.active;
    return row.active;
  };

  const setProfileActive = (id, active) => {
    setOverrides((prev) => ({ ...prev, [id]: { ...prev[id], active } }));
  };

  return (
    <div className="app-profiles-page">
      <PageMeta title="App · User Profiles" description={seo.metaDescription} keywords={seo.keywords} />

      <p className="app-profiles-meta">
        Live sample data · {payload.updatedLabel} · refreshes every minute ·{" "}
        <strong>{payload.summary.active}</strong> active of <strong>{payload.summary.total}</strong> · avg age{" "}
        <strong>{payload.summary.avgAge}</strong>
      </p>

      <div className="app-profiles-head">
        <div>
          <h1 className="app-profiles-title">Profiles management</h1>
          <p className="app-profiles-sub">Manage patient profiles and medical information</p>
        </div>
        <button type="button" className="app-profiles-add-btn" onClick={() => window.alert("Create profile flow (connect API).")}>
          <Plus size={18} strokeWidth={2.5} />
          Add New User Manually
        </button>
      </div>

      <div className="app-profiles-table-wrap">
        <div className="app-profiles-table-scroll">
          <table className="app-profiles-table">
            <thead>
              <tr>
                <th>Profile Name</th>
                <th>Age</th>
                <th>Blood Type</th>
                <th>Linked Guardian</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {payload.rows.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div className="app-profiles-user-cell">
                      <div className="app-profiles-avatar" style={{ "--ah": p.avatarHue }} aria-hidden>
                        {p.fullName
                          .split(" ")
                          .map((x) => x[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                      <p className="app-profiles-name">{p.fullName}</p>
                    </div>
                  </td>
                  <td>
                    <span className={p.age < 18 ? "app-profiles-age-young" : p.age > 60 ? "app-profiles-age-senior" : ""}>{p.age}</span>
                  </td>
                  <td>
                    <span className={`app-profiles-blood-pill app-profiles-blood-pill--${bloodClass(p.bloodType)}`}>{p.bloodType}</span>
                  </td>
                  <td>
                    <span className="app-profiles-guardian">{p.linkedGuardian}</span>
                  </td>
                  <td>
                    <label className="app-profiles-toggle">
                      <input
                        type="checkbox"
                        checked={isActive(p)}
                        onChange={(e) => setProfileActive(p.id, e.target.checked)}
                        aria-label={`Active status for ${p.fullName}`}
                      />
                      <span className="app-profiles-toggle-slider" />
                    </label>
                  </td>
                  <td>
                    <div className="app-profiles-actions">
                      <button
                        type="button"
                        className="app-profiles-icon-btn"
                        onClick={() => window.alert(`Edit profile: ${p.fullName}`)}
                        aria-label={`Edit ${p.fullName}`}
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        type="button"
                        className="app-profiles-icon-btn app-profiles-icon-btn--danger"
                        onClick={() => window.alert(`Delete profile: ${p.fullName}`)}
                        aria-label={`Delete ${p.fullName}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <SeoSection
        title="Profiles admin SEO"
        slugPrefix="admin.qlink.com/app/user-profiles/"
        value={seo}
        onChange={setSeo}
        badge="Internal"
      />
    </div>
  );
};

export default UserProfiles;
