import React, { useEffect, useMemo, useState } from "react";
import { Clock3, Link2, Search } from "lucide-react";
import PageMeta from "../../../components/seo/PageMeta";
import SeoSection from "../../../components/seo/SeoSection";
import { supabase } from "../../../lib/supabase";
import "./Bracelets.css";

const REFRESH_MS = 60_000;

function avatarHueFromId(id = "") {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) hash = (hash * 31 + id.charCodeAt(i)) | 0;
  return Math.abs(hash) % 360;
}

function mapBraceletRow(row) {
  const statusText = String(row.status || "Inactive");
  const active = statusText.toLowerCase() === "active";
  return {
    id: row.id,
    braceletCode: row.bracelet_id_code || row.id,
    assignedProfile: row.assigned_profile || "Unassigned",
    assignedProfileId: row.assigned_profile_id || "",
    status: active ? "Active" : "Inactive",
    active,
    lastSync: row.last_sync || "Offline",
    action: row.actions || "Assign",
    image: row.image || "",
    avatarHue: avatarHueFromId(row.id),
  };
}

const Bracelets = () => {
  const [bracelets, setBracelets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [updatedLabel, setUpdatedLabel] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [seo, setSeo] = useState({
    slug: "bracelets",
    metaTitle: "Manage bracelets — Qlink App",
    metaDescription: "Manage Qlink hardware devices and profile assignments.",
    keywords: "bracelets, qlink hardware, assignments, sync",
    featuredImageAlt: "Qlink bracelets dashboard table",
  });

  useEffect(() => {
    let mounted = true;
    const fetchBracelets = async () => {
      setFetchError("");
      setLoading(true);
      const { data, error } = await supabase
        .from("bracelets")
        .select("id, bracelet_id_code, status, assigned_profile_id, last_sync, created_at, assigned_profile, actions, image")
        .order("created_at", { ascending: false });

      if (!mounted) return;
      if (error) {
        setFetchError(error.message || "Failed to load bracelets.");
        setBracelets([]);
        setLoading(false);
        return;
      }
      setBracelets((data || []).map(mapBraceletRow));
      setUpdatedLabel(
        new Date().toLocaleString(undefined, {
          dateStyle: "medium",
          timeStyle: "short",
        })
      );
      setLoading(false);
    };

    fetchBracelets();
    const id = window.setInterval(fetchBracelets, REFRESH_MS);
    return () => {
      mounted = false;
      window.clearInterval(id);
    };
  }, []);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return bracelets.filter((b) => {
      const matchQuery =
        !q ||
        b.braceletCode.toLowerCase().includes(q) ||
        b.assignedProfile.toLowerCase().includes(q) ||
        b.assignedProfileId.toLowerCase().includes(q);
      const matchStatus = statusFilter === "all" || (statusFilter === "active" ? b.active : !b.active);
      return matchQuery && matchStatus;
    });
  }, [bracelets, query, statusFilter]);

  const summary = useMemo(() => {
    return {
      total: bracelets.length,
      active: bracelets.filter((b) => b.active).length,
    };
  }, [bracelets]);

  return (
    <div className="app-bracelets-page">
      <PageMeta title="App · Bracelets" description={seo.metaDescription} keywords={seo.keywords} />

      <p className="app-bracelets-meta">
        Supabase bracelets · {loading ? "Loading..." : `Updated ${updatedLabel}`} · <strong>{summary.active}</strong> active of{" "}
        <strong>{summary.total}</strong> bracelets
      </p>

      <div className="app-bracelets-head">
        <h1 className="app-bracelets-title">Manage Bracelets</h1>
        <p className="app-bracelets-sub">Manage Qlink hardware devices and assignments</p>
      </div>

      <div className="app-bracelets-toolbar">
        <div className="app-bracelets-search">
          <Search size={18} aria-hidden />
          <input
            type="search"
            placeholder="Search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search bracelets"
          />
        </div>
        <select className="app-bracelets-filter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} aria-label="Filter bracelets by status">
          <option value="all">All status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <span className="app-bracelets-summary">
          Showing <strong>{rows.length}</strong> of <strong>{bracelets.length}</strong>
        </span>
      </div>

      {fetchError ? <p className="app-bracelets-meta" style={{ color: "var(--app-danger)" }}>{fetchError}</p> : null}
      {loading ? <p className="app-bracelets-meta" style={{ color: "var(--app-primary)", fontWeight: 600 }}>Loading bracelets...</p> : null}

      <div className="app-bracelets-table-wrap">
        <div className="app-bracelets-table-scroll">
          <table className="app-bracelets-table">
            <thead>
              <tr>
                <th>Bracelet ID</th>
                <th>Status</th>
                <th>Assigned Profile</th>
                <th>Last Sync</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((b) => (
                <tr key={b.id}>
                  <td>
                    <div className="app-bracelets-id-cell">
                      <div className="app-bracelets-avatar" style={{ "--ah": b.avatarHue }} aria-hidden>
                        {b.image ? (
                          <img src={b.image} alt={b.assignedProfile} className="app-bracelets-avatar-img" />
                        ) : (
                          b.assignedProfile
                            .split(" ")
                            .map((x) => x[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()
                        )}
                      </div>
                      <div>
                        <p className="app-bracelets-id">{b.braceletCode}</p>
                        <p className="app-bracelets-contact">{b.assignedProfileId || "No profile id"}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`app-bracelets-status app-bracelets-status--${b.active ? "active" : "inactive"}`}>
                      {b.status}
                    </span>
                  </td>
                  <td>
                    <span className="app-bracelets-profile">{b.assignedProfile}</span>
                  </td>
                  <td>
                    <span className="app-bracelets-sync">
                      <Clock3 size={14} aria-hidden />
                      {b.lastSync}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="app-bracelets-action"
                      onClick={() => window.alert(`${b.action} action opened for ${b.braceletCode}`)}
                    >
                      <Link2 size={14} aria-hidden />
                      {b.action}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <SeoSection
        title="Bracelets SEO"
        slugPrefix="admin.qlink.com/app/bracelets/"
        value={seo}
        onChange={setSeo}
        badge="Internal"
      />
    </div>
  );
};

export default Bracelets;
