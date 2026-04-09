import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import PageMeta from "../../../components/seo/PageMeta";
import SeoSection from "../../../components/seo/SeoSection";
import "./LinkedDevices.css";

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
  return mulberry32((bucket % 2147483647) + 11);
}

const PROFILES = ["Mohmed Saber", "Karma Ahmed", "Hoda Mansour", "Mariam Essam", "Omar Farid", "Nour Saad"];
const BRACELET_NAMES = ['Qlink Smart Bracelet "Nova"', 'Qlink Smart Bracelet "Pulse"', 'Qlink Smart Bracelet "Core"'];
const WATCH_NAMES = ["Smartwatch Pro #5678", "Apple Watch S9", "Galaxy Watch 6"];

function pick(arr, next) {
  return arr[Math.floor(next() * arr.length)];
}

function getLinkedDevicesPayload(count = 8, nowMs = Date.now()) {
  const next = seedFromTime(nowMs);
  const rows = [];
  for (let i = 0; i < count; i += 1) {
    const useWatch = next() > 0.72;
    const type = useWatch ? "Apple Watch" : "Qlink Bracelet";
    const active = next() > 0.25;
    const batteryLevel = active ? Math.max(5, Math.floor(next() * 100)) : Math.floor(next() * 12);
    rows.push({
      id: `DEV-${1500 + Math.floor(next() * 7000)}`,
      deviceName: useWatch ? pick(WATCH_NAMES, next) : pick(BRACELET_NAMES, next),
      type,
      typeClass: type === "Apple Watch" ? "watch" : "qlink",
      linkedProfile: pick(PROFILES, next),
      active,
      batteryLevel,
      avatarHue: Math.floor(next() * 360),
    });
  }
  if (rows.length >= 3) {
    rows[0] = { ...rows[0], deviceName: 'Qlink Smart Bracelet "Nova"', type: "Qlink Bracelet", typeClass: "qlink", linkedProfile: "Mohmed Saber", active: true, batteryLevel: 85 };
    rows[1] = { ...rows[1], deviceName: 'Qlink Smart Bracelet "Pulse"', type: "Qlink Bracelet", typeClass: "qlink", linkedProfile: "Karma Ahmed", active: true, batteryLevel: 85 };
    rows[2] = { ...rows[2], deviceName: "Smartwatch Pro #5678", type: "Apple Watch", typeClass: "watch", linkedProfile: "Hoda Mansour", active: false, batteryLevel: 0 };
  }
  return {
    rows,
    updatedLabel: new Date(nowMs).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }),
    summary: {
      total: rows.length,
      active: rows.filter((r) => r.active).length,
      avgBattery: rows.length > 0 ? Math.round(rows.reduce((sum, r) => sum + r.batteryLevel, 0) / rows.length) : 0,
    },
  };
}

const LinkedDevices = () => {
  const [tick, setTick] = useState(0);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [overrides, setOverrides] = useState({});
  const [seo, setSeo] = useState({
    slug: "linked-devices",
    metaTitle: "Manage linked devices — Qlink App",
    metaDescription: "Manage all connected devices and their live status.",
    keywords: "linked devices, battery, profile, qlink",
    featuredImageAlt: "Linked devices",
  });

  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), REFRESH_MS);
    return () => window.clearInterval(id);
  }, []);

  const payload = useMemo(() => getLinkedDevicesPayload(9, Date.now() + tick), [tick]);

  const isActive = useCallback(
    (row) => {
      const o = overrides[row.id];
      if (o && typeof o.active === "boolean") return o.active;
      return row.active;
    },
    [overrides]
  );

  const setDeviceActive = (id, active) => {
    setOverrides((prev) => ({ ...prev, [id]: { ...prev[id], active } }));
  };

  const effectiveBattery = (row) => {
    const active = isActive(row);
    if (!active) return 0;
    return row.batteryLevel;
  };

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return payload.rows.filter((d) => {
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
  }, [payload.rows, query, typeFilter, statusFilter, isActive]);

  return (
    <div className="app-linked-page">
      <PageMeta title="App · Linked Devices" description={seo.metaDescription} keywords={seo.keywords} />

      <p className="app-linked-meta">
        Live sample data · {payload.updatedLabel} · refreshes every minute ·{" "}
        <strong>{payload.summary.active}</strong> active of <strong>{payload.summary.total}</strong> · avg battery{" "}
        <strong>{payload.summary.avgBattery}%</strong>
      </p>

      <div className="app-linked-head">
        <h1 className="app-linked-title">Manage Devices</h1>
        <p className="app-linked-sub">Manage all connected devices and their status</p>
      </div>

      <div className="app-linked-toolbar">
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
          Showing <strong>{rows.length}</strong> of <strong>{payload.rows.length}</strong>
        </span>
      </div>

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
                          {d.deviceName
                            .split(" ")
                            .map((x) => x[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()}
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
                          onClick={() => window.alert(`Disconnect queued: ${d.deviceName}`)}
                        >
                          Disconnect
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
