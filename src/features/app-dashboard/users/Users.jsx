import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Eye, Plus, Search, Trash2 } from 'lucide-react';
import PageMeta from '../../../components/seo/PageMeta';
import SeoSection from '../../../components/seo/SeoSection';
import { getAppUsersList } from '../../../data/appUsers';
import './Users.css';

const REFRESH_MS = 60_000;

const Users = () => {
  const [tick, setTick] = useState(0);
  const [query, setQuery] = useState('');
  const [overrides, setOverrides] = useState({});
  const [seo, setSeo] = useState({
    slug: 'users',
    metaTitle: 'User management — Qlink App',
    metaDescription: 'Manage guardians and wearers registered in the Qlink app.',
    keywords: 'users, guardians, app, qlink',
    featuredImageAlt: 'Users',
  });

  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), REFRESH_MS);
    return () => window.clearInterval(id);
  }, []);

  const payload = useMemo(() => getAppUsersList(9, Date.now() + tick), [tick]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return payload.rows;
    return payload.rows.filter(
      (r) =>
        r.fullName.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q) ||
        r.role.includes(q)
    );
  }, [payload.rows, query]);

  const isActive = useCallback(
    (u) => {
      const o = overrides[u.id];
      if (o && typeof o.active === 'boolean') return o.active;
      return u.active;
    },
    [overrides]
  );

  const setUserActive = (id, active) => {
    setOverrides((prev) => ({ ...prev, [id]: { ...prev[id], active } }));
  };

  const onAddUser = () => {
    window.alert('Add user flow — connect to your API to create guardians or wearers.');
  };

  const onView = (u) => {
    window.alert(`View profile: ${u.fullName} (${u.id})`);
  };

  const onDelete = (u) => {
    if (window.confirm(`Remove ${u.fullName} from the list? (demo only)`)) {
      window.alert('Delete queued — wire to API.');
    }
  };

  return (
    <div className="app-users-page">
      <PageMeta title="App · Users" description={seo.metaDescription} keywords={seo.keywords} />

      <p className="app-users-meta">
        Live sample data · {payload.updatedLabel} · refreshes every minute ·{' '}
        <strong>{payload.summary.guardians}</strong> guardians, <strong>{payload.summary.patients}</strong> patients
      </p>

      <div className="app-users-head">
        <div>
          <h1 className="app-users-title">User management</h1>
          <p className="app-users-sub">Manage all registered guardians and wearers.</p>
        </div>
        <button type="button" className="app-users-add-btn" onClick={onAddUser}>
          <Plus size={18} strokeWidth={2.5} />
          Add new user manually
        </button>
      </div>

      <div className="app-users-toolbar">
        <div className="app-users-search">
          <Search size={18} aria-hidden />
          <input
            type="search"
            placeholder="Search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search users"
          />
        </div>
        <span className="app-users-summary">
          Showing <strong>{rows.length}</strong> of <strong>{payload.rows.length}</strong>
        </span>
      </div>

      <div className="app-users-table-wrap">
        <div className="app-users-table-scroll">
          <table className="app-users-table">
            <thead>
              <tr>
                <th>Full name</th>
                <th>Role</th>
                <th>Registration date</th>
                <th>Status</th>
                <th>Profiles managed</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div className="app-users-user-cell">
                      <div
                        className="app-users-avatar"
                        style={{ '--ah': u.avatarHue }}
                        aria-hidden
                      >
                        {u.fullName
                          .split(' ')
                          .map((p) => p[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                      <div>
                        <p className="app-users-name">{u.fullName}</p>
                        <p className="app-users-email">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span
                      className={`app-users-role-pill app-users-role-pill--${u.role === 'guardian' ? 'guardian' : 'patient'}`}
                    >
                      {u.role === 'guardian' ? 'Guardian' : 'Patient'}
                    </span>
                  </td>
                  <td>
                    <span className="app-users-date">{u.registrationDate}</span>
                  </td>
                  <td>
                    <label className="app-users-toggle">
                      <input
                        type="checkbox"
                        checked={isActive(u)}
                        onChange={(e) => setUserActive(u.id, e.target.checked)}
                        aria-label={`Active status for ${u.fullName}`}
                      />
                      <span className="app-users-toggle-slider" />
                    </label>
                  </td>
                  <td>
                    <span className="app-users-profiles">
                      {u.profilesManaged} {u.profilesManaged === 1 ? 'Profile' : 'Profiles'}
                    </span>
                  </td>
                  <td>
                    <div className="app-users-actions">
                      <button type="button" className="app-users-icon-btn" aria-label="View user" onClick={() => onView(u)}>
                        <Eye size={18} />
                      </button>
                      <button
                        type="button"
                        className="app-users-icon-btn app-users-icon-btn--danger"
                        aria-label="Delete user"
                        onClick={() => onDelete(u)}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <SeoSection title="Users admin SEO" slugPrefix="admin.qlink.com/app/users/" value={seo} onChange={setSeo} badge="Internal" />
    </div>
  );
};

export default Users;
