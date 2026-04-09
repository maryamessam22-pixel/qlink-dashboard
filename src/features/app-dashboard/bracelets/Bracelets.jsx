import React, { useEffect, useMemo, useState } from "react";
import { Clock3, Link2, Search } from "lucide-react";
import PageMeta from "../../../components/seo/PageMeta";
import SeoSection from "../../../components/seo/SeoSection";
import "./Bracelets.css";

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
  return mulberry32((bucket % 2147483647) + 19);
}

const ASSIGNEES = ["Mohamed Saber", "Karma Ahmed", "Hoda Mansour", "Mariam Essam", "Omar Farid", "Nour Saad"];

function pick(arr, next) {
  return arr[Math.floor(next() * arr.length)];
}

function makeBraceletId(next) {
  const series = pick(["PULSE", "NOVA", "CORE", "SENSE"], next);
  const part = Math.floor(next() * 0xffffff).toString(16).toUpperCase().padStart(6, "0");
  return `QLINK-${series}-${part}`;
}

function makeSyncLabel(next) {
  const mins = Math.max(1, Math.floor(next() * 15));
  return mins === 1 ? "1 minute ago" : `${mins} minutes ago`;
}

function getBraceletsPayload(count = 8, nowMs = Date.now()) {
  const next = seedFromTime(nowMs);
  const rows = [];
  for (let i = 0; i < count; i += 1) {
    const active = next() > 0.2;
    const assignedProfile = pick(ASSIGNEES, next);
    const emailHandle = assignedProfile.toLowerCase().replace(/\s+/g, ".");
    rows.push({
      id: makeBraceletId(next),
      assignedProfile,
      contact: `${emailHandle}${Math.floor(next() * 99)}@gmail.com`,
      status: active ? "Active" : "Inactive",
      active,
      lastSync: active ? makeSyncLabel(next) : "Offline",
      avatarHue: Math.floor(next() * 360),
    });
  }
  if (rows.length >= 2) {
    rows[0] = { ...rows[0], id: "QLINK-PULSE-8A3F2E", assignedProfile: "Mohamed Saber", contact: "moh.saber42@gmail.com", status: "Active", active: true, lastSync: "2 minutes ago" };
    rows[1] = { ...rows[1], id: "QLINK-NOVA-12B30E8", assignedProfile: "Karma Ahmed", contact: "karma.ahmed62@gmail.com", status: "Active", active: true, lastSync: "5 minutes ago" };
  }
  return {
    rows,
    updatedLabel: new Date(nowMs).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }),
    summary: { total: rows.length, active: rows.filter((r) => r.active).length },
  };
}

const Bracelets = () => {
  const [tick, setTick] = useState(0);
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
    const id = window.setInterval(() => setTick((t) => t + 1), REFRESH_MS);
    return () => window.clearInterval(id);
  }, []);

  const payload = useMemo(() => getBraceletsPayload(8, Date.now() + tick), [tick]);
  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return payload.rows.filter((b) => {
      const matchQuery =
        !q ||
        b.id.toLowerCase().includes(q) ||
        b.assignedProfile.toLowerCase().includes(q) ||
        b.contact.toLowerCase().includes(q);
      const matchStatus = statusFilter === "all" || (statusFilter === "active" ? b.active : !b.active);
      return matchQuery && matchStatus;
    });
  }, [payload.rows, query, statusFilter]);

  return (
    <div className="app-bracelets-page">
      <PageMeta title="App · Bracelets" description={seo.metaDescription} keywords={seo.keywords} />

      <p className="app-bracelets-meta">
        Live sample data · {payload.updatedLabel} · <strong>{payload.summary.active}</strong> active of{" "}
        <strong>{payload.summary.total}</strong> bracelets
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
          Showing <strong>{rows.length}</strong> of <strong>{payload.rows.length}</strong>
        </span>
      </div>

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
                        {b.assignedProfile
                          .split(" ")
                          .map((x) => x[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                      <div>
                        <p className="app-bracelets-id">{b.id}</p>
                        <p className="app-bracelets-contact">{b.contact}</p>
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
                      onClick={() => window.alert(`Assign action opened for ${b.id}`)}
                    >
                      <Link2 size={14} aria-hidden />
                      Assign
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
