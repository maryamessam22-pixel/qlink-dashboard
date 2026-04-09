import React, { useEffect, useMemo, useState } from "react";
import PageMeta from "../../../components/seo/PageMeta";
import SeoSection from "../../../components/seo/SeoSection";
import { getAppBraceletsList } from "../../../data/appBracelets";
import "./Bracelets.css";

const REFRESH_MS = 60_000;

const Bracelets = () => {
  const [tick, setTick] = useState(0);
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

  const payload = useMemo(() => getAppBraceletsList(8, Date.now() + tick), [tick]);

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
              {payload.rows.map((b) => (
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
                    <span className="app-bracelets-sync">{b.lastSync}</span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="app-bracelets-action"
                      onClick={() => window.alert(`Assign action opened for ${b.id}`)}
                    >
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
