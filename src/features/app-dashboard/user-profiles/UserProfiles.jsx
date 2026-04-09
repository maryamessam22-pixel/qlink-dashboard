import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import PageMeta from "../../../components/seo/PageMeta";
import SeoSection from "../../../components/seo/SeoSection";
import { supabase } from "../../../lib/supabase";
import "./UserProfiles.css";

const BLOOD = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

function avatarHueFromId(id = "") {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) hash = (hash * 31 + id.charCodeAt(i)) | 0;
  return Math.abs(hash) % 360;
}

function mapProfileRow(row) {
  const primaryName = row.emergency_contacts?.primary?.name;
  return {
    id: row.id,
    fullName: row.profile_name || "Unknown",
    age: Number.isFinite(row.age) ? row.age : new Date().getFullYear() - Number(row.birth_year || new Date().getFullYear()),
    bloodType: row.blood_type || "O+",
    linkedGuardian: primaryName || row.relationship_to_guardian || "Unknown guardian",
    active: Boolean(row.status),
    avatarHue: avatarHueFromId(row.id),
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
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [query, setQuery] = useState("");
  const [bloodFilter, setBloodFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [overrides, setOverrides] = useState({});
  const [seo, setSeo] = useState({
    slug: "user-profiles",
    metaTitle: "Profiles management — Qlink App",
    metaDescription: "Manage patient profiles and linked guardian information.",
    keywords: "profiles, patient, guardian, app, qlink",
    featuredImageAlt: "Profiles",
  });

  useEffect(() => {
    let mounted = true;
    const fetchProfiles = async () => {
      setLoading(true);
      setFetchError("");
      const { data, error } = await supabase
        .from("patient_profiles")
        .select("id, profile_name, relationship_to_guardian, birth_year, age, emergency_contacts, blood_type, status, avatar_url, created_at")
        .order("created_at", { ascending: false });

      if (!mounted) return;
      if (error) {
        setFetchError(error.message || "Failed to load profiles.");
        setProfiles([]);
        setLoading(false);
        return;
      }

      setProfiles((data || []).map(mapProfileRow));
      setLoading(false);
    };

    fetchProfiles();
    return () => {
      mounted = false;
    };
  }, []);

  const isActive = useCallback(
    (row) => {
      const o = overrides[row.id];
      if (o && typeof o.active === "boolean") return o.active;
      return row.active;
    },
    [overrides]
  );

  const setProfileActive = (id, active) => {
    setOverrides((prev) => ({ ...prev, [id]: { ...prev[id], active } }));
  };

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return profiles.filter((p) => {
      const active = isActive(p);
      const matchQuery =
        !q ||
        p.fullName.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.linkedGuardian.toLowerCase().includes(q) ||
        p.bloodType.toLowerCase().includes(q);
      const matchBlood = bloodFilter === "all" || p.bloodType === bloodFilter;
      const matchStatus = statusFilter === "all" || (statusFilter === "active" ? active : !active);
      return matchQuery && matchBlood && matchStatus;
    });
  }, [profiles, query, bloodFilter, statusFilter, isActive]);

  const summary = useMemo(() => {
    const total = profiles.length;
    const active = profiles.filter((r) => isActive(r)).length;
    const avgAge = total > 0 ? Math.round(profiles.reduce((sum, r) => sum + (Number(r.age) || 0), 0) / total) : 0;
    return { total, active, avgAge };
  }, [profiles, isActive]);

  return (
    <div className="app-profiles-page">
      <PageMeta title="App · User Profiles" description={seo.metaDescription} keywords={seo.keywords} />

      <p className="app-profiles-meta">
        Supabase data · {loading ? "Loading..." : "Updated"} · <strong>{summary.active}</strong> active of{" "}
        <strong>{summary.total}</strong> · avg age <strong>{summary.avgAge}</strong>
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

      <div className="app-profiles-toolbar">
        <div className="app-profiles-search">
          <Search size={18} aria-hidden />
          <input
            type="search"
            placeholder="Search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search profiles"
          />
        </div>
        <select className="app-profiles-filter" value={bloodFilter} onChange={(e) => setBloodFilter(e.target.value)} aria-label="Filter by blood type">
          <option value="all">All blood types</option>
          {BLOOD.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
        <select className="app-profiles-filter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} aria-label="Filter by profile status">
          <option value="all">All status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <span className="app-profiles-summary">
          Showing <strong>{rows.length}</strong> of <strong>{profiles.length}</strong>
        </span>
      </div>

      {fetchError ? <p className="app-profiles-meta" style={{ color: "var(--app-danger)" }}>{fetchError}</p> : null}
      {loading ? <p className="app-profiles-meta">Loading patient profiles...</p> : null}

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
              {rows.map((p) => (
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
