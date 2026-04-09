import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Plus, Trash2 } from "lucide-react";
import PageMeta from "../../../components/seo/PageMeta";
import SeoSection from "../../../components/seo/SeoSection";
import "./UserProfiles.css";

const REFRESH_MS = 60_000;

function mulberry32(a) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seedFromTime(nowMs = Date.now()) {
  const bucket = Math.floor(nowMs / 60000);
  return mulberry32((bucket % 2147483647) + 3);
}

const FIRST = ["Mariam", "Mohamed", "Karma", "Yousef", "Leila", "Hoda", "Ola", "Zeinab", "Rania", "Farah", "Tamer", "Nada", "Ibrahim", "Rami", "Nour", "Jana"];
const LAST = ["Essam", "Saber", "Ahmed", "Mansour", "Wahba", "Mostafa", "Hassan", "Kamel", "Mahmoud", "Farid", "Saad", "Nabil"];
const BLOOD = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

function pick(arr, next) {
  return arr[Math.floor(next() * arr.length)];
}

function getProfilesPayload(count = 8, nowMs = Date.now()) {
  const next = seedFromTime(nowMs);
  const rows = [];
  const guardianNames = [];
  for (let i = 0; i < Math.max(3, Math.floor(count / 2)); i += 1) guardianNames.push(`${pick(FIRST, next)} ${pick(LAST, next)}`);
  for (let i = 0; i < count; i += 1) {
    const fullName = `${pick(FIRST, next)} ${pick(LAST, next)}`;
    const ageBase = Math.floor(next() * 85) + 1;
    rows.push({
      id: `PRF-${1200 + Math.floor(next() * 8000)}`,
      fullName,
      age: i === 0 ? 23 : i === 1 ? 74 : i === 2 ? 10 : ageBase,
      bloodType: i === 0 ? "O+" : i === 1 ? "AB-" : i === 2 ? "O+" : pick(BLOOD, next),
      linkedGuardian: pick(guardianNames, next),
      active: next() > 0.32,
      avatarHue: Math.floor(next() * 360),
    });
  }
  rows.sort((a, b) => a.fullName.localeCompare(b.fullName));
  return {
    rows,
    updatedLabel: new Date(nowMs).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }),
    summary: {
      total: rows.length,
      active: rows.filter((r) => r.active).length,
      avgAge: rows.length > 0 ? Math.round(rows.reduce((sum, r) => sum + r.age, 0) / rows.length) : 0,
    },
  };
}

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
  const navigate = useNavigate();
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

  const payload = useMemo(() => getProfilesPayload(9, Date.now() + tick), [tick]);

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
                    <div className="app-profiles-status-cell">
                      <label className="app-profiles-toggle">
                        <input
                          type="checkbox"
                          checked={isActive(p)}
                          onChange={(e) => setProfileActive(p.id, e.target.checked)}
                          aria-label={`Active status for ${p.fullName}`}
                        />
                        <span className="app-profiles-toggle-slider" />
                      </label>
                      <span className={`app-profiles-status-text ${isActive(p) ? "is-active" : "is-inactive"}`}>
                        {isActive(p) ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="app-profiles-actions">
                      <button
                        type="button"
                        className="app-profiles-icon-btn"
                        onClick={() => navigate(`/app/user-profiles/${encodeURIComponent(p.id)}/edit`, { state: { profile: p } })}
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
