import React, { useEffect, useMemo, useState } from "react";
import PageMeta from "../../../components/seo/PageMeta";
import SeoSection from "../../../components/seo/SeoSection";
import { getAppLinkedDevicesList } from "../../../data/appLinkedDevices";
import "./LinkedDevices.css";

const REFRESH_MS = 60_000;

const LinkedDevices = () => {
  const [tick, setTick] = useState(0);
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

  const payload = useMemo(() => getAppLinkedDevicesList(9, Date.now() + tick), [tick]);

  const isActive = (row) => {
    const o = overrides[row.id];
    if (o && typeof o.active === "boolean") return o.active;
    return row.active;
  };

  const setDeviceActive = (id, active) => {
    setOverrides((prev) => ({ ...prev, [id]: { ...prev[id], active } }));
  };

  const effectiveBattery = (row) => {
    const active = isActive(row);
    if (!active) return 0;
    return row.batteryLevel;
  };

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
              {payload.rows.map((d) => {
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
                      <label className="app-linked-toggle">
                        <input
                          type="checkbox"
                          checked={active}
                          onChange={(e) => setDeviceActive(d.id, e.target.checked)}
                          aria-label={`Device status for ${d.deviceName}`}
                        />
                        <span className="app-linked-toggle-slider" />
                      </label>
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
