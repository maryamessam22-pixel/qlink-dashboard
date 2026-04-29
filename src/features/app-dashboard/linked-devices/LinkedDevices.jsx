import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import PageMeta from "../../../components/seo/PageMeta";
import SeoSection from "../../../components/seo/SeoSection";
import { supabase } from "../../../lib/supabase";
import AppPageLoading from "../../../components/app/AppPageLoading";
import "./LinkedDevices.css";

const REFRESH_MS = 60_000;

function avatarHueFromId(id = "") {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) hash = (hash * 31 + id.charCodeAt(i)) | 0;
  return Math.abs(hash) % 360;
}

function mapDeviceRow(row, profileNameById = {}) {
  const linkedProfile = (row.profile_id && profileNameById[row.profile_id]) || row.linekd_profile || "Unassigned";
  const type = row.type || "Qlink Bracelet";
  return {
    id: row.id,
    deviceName: row.device_name || row.device_code || "Unnamed device",
    type,
    typeClass: String(type).toLowerCase().includes("apple") ? "watch" : "qlink",
    linkedProfile,
    active: Boolean(row.status),
    batteryLevel: Number.isFinite(row.battery_level) ? row.battery_level : 0,
    avatarHue: avatarHueFromId(row.id),
    image: row.image || "",
    action: row.action || "Disconnect",
  };
}

const LinkedDevices = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [updatedLabel, setUpdatedLabel] = useState("");
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [overrides, setOverrides] = useState({});
  const [togglingId, setTogglingId] = useState(null);
  const [seo, setSeo] = useState({
    slug: "linked-devices",
    metaTitle: "Manage linked devices — Qlink App",
    metaDescription: "Manage all connected devices and their live status.",
    keywords: "linked devices, battery, profile, qlink",
    featuredImageAlt: "Linked devices",
  });

  const fetchDevices = useCallback(async () => {
    setFetchError("");
    setLoading(true);
    const {
      data: { session },
    } = await supabase.auth.getSession();
    console.log("[LinkedDevices] session user:", session?.user?.id, session?.user?.email);
    const [{ data: devicesData, error: devicesError }, { data: patientProfilesData, error: patientProfilesError }] = await Promise.all([
      supabase
        .from("devices")
        .select("id, device_name, device_code, type, profile_id, status, battery_level, action, created_at, linekd_profile, image")
        .order("created_at", { ascending: false }),
      supabase.from("patient_profiles").select("id, profile_name"),
    ]);
    if (devicesError || patientProfilesError) {
      console.log("[LinkedDevices] fetch debug:", {
        devicesError,
        patientProfilesError,
        devicesRows: devicesData?.length ?? 0,
        patientProfilesRows: patientProfilesData?.length ?? 0,
      });
    }

    if (devicesError || patientProfilesError) {
      setFetchError(devicesError?.message || patientProfilesError?.message || "Failed to load devices.");
      setDevices([]);
      setLoading(false);
      return;
    }
    const profileNameById = Object.fromEntries((patientProfilesData || []).map((profile) => [profile.id, profile.profile_name || "Unknown profile"]));
    setDevices((devicesData || []).map((row) => mapDeviceRow(row, profileNameById)));
    setUpdatedLabel(
      new Date().toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchDevices();
    const id = window.setInterval(fetchDevices, REFRESH_MS);
    return () => window.clearInterval(id);
  }, [fetchDevices]);

  const isActive = useCallback(
    (row) => {
      const o = overrides[row.id];
      if (o && typeof o.active === "boolean") return o.active;
      return row.active;
    },
    [overrides]
  );

  const setDeviceActive = async (id, active) => {
    setTogglingId(id);
    try {
      const { error } = await supabase.from('devices').update({ status: active }).eq('id', id);
      if (error) throw error;
      setDevices((prev) => prev.map((d) => (d.id === id ? { ...d, active } : d)));
      setOverrides((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    } catch (e) {
      window.alert(e?.message || 'Could not update device status.');
    } finally {
      setTogglingId(null);
    }
  };

  const effectiveBattery = (row) => {
    const active = isActive(row);
    if (!active) return 0;
    return row.batteryLevel;
  };

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return devices.filter((d) => {
      const active = isActive(d);
      const matchQuery =
        !q ||
        d.deviceName.toLowerCase().includes(q) ||
        d.id.toLowerCase().includes(q) ||
        d.linkedProfile.toLowerCase().includes(q) ||
        d.type.toLowerCase().includes(q);
      const matchType = typeFilter === "all" || d.type === typeFilter;
      const matchStatus = statusFilter === "all" || (statusFilter === "active" ? active : !active);
      return matchQuery && matchType && matchStatus;
    });
  }, [devices, query, typeFilter, statusFilter, isActive]);

  const summary = useMemo(() => {
    const total = devices.length;
    const active = devices.filter((r) => isActive(r)).length;
    const avgBattery = total > 0 ? Math.round(devices.reduce((sum, r) => sum + (Number(r.batteryLevel) || 0), 0) / total) : 0;
    return { total, active, avgBattery };
  }, [devices, isActive]);

  const initialLoad = loading && devices.length === 0 && !fetchError;
  if (initialLoad) {
    return (
      <div className="app-linked-page">
        <PageMeta title="App · Linked Devices" description={seo.metaDescription} keywords={seo.keywords} />
        <AppPageLoading message="Loading devices…" />
      </div>
    );
  }

  return (
    <div className="app-linked-page">
      <PageMeta title="App · Linked Devices" description={seo.metaDescription} keywords={seo.keywords} />

      <p className="app-linked-meta">
        Supabase devices · {loading ? "Loading..." : `Updated ${updatedLabel}`} · <strong>{summary.active}</strong> active of{" "}
        <strong>{summary.total}</strong> · avg battery <strong>{summary.avgBattery}%</strong>
      </p>

      <div className="app-linked-head">
        <h1 className="app-linked-title">Manage Devices</h1>
        <p className="app-linked-sub">Manage all connected devices and their status</p>
      </div>

      <div className="app-linked-toolbar app-toolbar-bar">
        <div className="app-linked-search">
          <Search size={18} aria-hidden />
          <input
            type="search"
            placeholder="Search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search linked devices"
          />
        </div>
        <select className="app-linked-filter" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} aria-label="Filter by device type">
          <option value="all">All types</option>
          <option value="Qlink Bracelet">Qlink Bracelet</option>
          <option value="Apple Watch">Apple Watch</option>
        </select>
        <select className="app-linked-filter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} aria-label="Filter by status">
          <option value="all">All status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <span className="app-linked-summary">
          Showing <strong>{rows.length}</strong> of <strong>{devices.length}</strong>
        </span>
      </div>

      {fetchError ? <p className="app-linked-meta" style={{ color: "var(--app-danger)" }}>{fetchError}</p> : null}

      <div className="app-linked-table-wrap">
        <div className="app-linked-table-scroll">
          <table className="app-linked-table">
            <thead>
              <tr>
                <th>Device Name (ID or Code)</th>
                <th>Type</th>
                <th>Linked Profile</th>
                <th>Status</th>
                <th>Battery Level</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((d) => {
                const active = isActive(d);
                const battery = effectiveBattery(d);
                const batteryClass = battery <= 10 ? "low" : "ok";
                return (
                  <tr key={d.id}>
                    <td>
                      <div className="app-linked-device-cell">
                        <div className="app-linked-avatar" style={{ "--ah": d.avatarHue }} aria-hidden>
                          {d.image ? (
                            <img src={d.image} alt={d.linkedProfile} className="app-linked-avatar-img" />
                          ) : (
                            d.deviceName
                              .split(" ")
                              .map((x) => x[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase()
                          )}
                        </div>
                        <p className="app-linked-device-name">{d.deviceName}</p>
                      </div>
                    </td>
                    <td>
                      <span className={`app-linked-type-pill app-linked-type-pill--${d.typeClass}`}>{d.type}</span>
                    </td>
                    <td>
                      <span className="app-linked-profile">{d.linkedProfile}</span>
                    </td>
                    <td>
                      <div className="app-linked-status-cell">
                        <label className="app-linked-toggle">
                          <input
                            type="checkbox"
                            checked={active}
                            disabled={togglingId === d.id}
                            onChange={(e) => setDeviceActive(d.id, e.target.checked)}
                            aria-label={`Device status for ${d.deviceName}`}
                          />
                          <span className="app-linked-toggle-slider" />
                        </label>
                        <span className={`app-linked-status-text ${active ? "is-active" : "is-inactive"}`}>
                          {active ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className={`app-linked-battery app-linked-battery--${batteryClass}`}>
                        <span className="app-linked-battery-icon" aria-hidden />
                        {battery}%
                      </span>
                    </td>
                    <td>
                      <div className="app-linked-actions">
                        <button
                          type="button"
                          className="app-linked-disconnect"
                          onClick={() => window.alert(`${d.action} queued: ${d.deviceName}`)}
                        >
                          {d.action}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <SeoSection
        title="Linked devices SEO"
        slugPrefix="admin.qlink.com/app/linked-devices/"
        value={seo}
        onChange={setSeo}
        badge="Internal"
      />
    </div>
  );
};

export default LinkedDevices;
