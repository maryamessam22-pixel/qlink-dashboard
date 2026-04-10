import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Eye, Plus, Search, Trash2 } from 'lucide-react';
import PageMeta from '../../../components/seo/PageMeta';
import SeoSection from '../../../components/seo/SeoSection';
import { supabase } from '../../../lib/supabase';
import './Users.css';

const REFRESH_MS = 60_000;

function avatarHueFromId(id = '') {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) hash = (hash * 31 + id.charCodeAt(i)) | 0;
  return Math.abs(hash) % 360;
}

function mapProfileRow(row) {
  const roleNorm = String(row.role || 'patient').toLowerCase();
  const role = roleNorm === 'guardian' ? 'guardian' : 'patient';
  return {
    id: row.id,
    fullName: row.full_name || 'Unknown',
    email: row.email || '-',
    role,
    registrationDate: row.registration_date || '',
    active: Boolean(row.status),
    profilesManaged: role === 'guardian' ? 1 : 0,
    avatarHue: avatarHueFromId(row.id),
    avatarUrl: row.avatar_url || '',
    jobTitle: row.job_title || '',
  };
}

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [updatedLabel, setUpdatedLabel] = useState('');
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [overrides, setOverrides] = useState({});
  const [togglingId, setTogglingId] = useState(null);
  const [seo, setSeo] = useState({
    slug: 'users',
    metaTitle: 'User management — Qlink App',
    metaDescription: 'Manage guardians and wearers registered in the Qlink app.',
    keywords: 'users, guardians, app, qlink',
    featuredImageAlt: 'Users',
  });

  useEffect(() => {
    let mounted = true;
    const fetchUsers = async () => {
      setFetchError('');
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, job_title, email, role, status, registration_date, avatar_url, created_at')
        .order('created_at', { ascending: false });
      if (!mounted) return;
      if (error) {
        setFetchError(error.message || 'Failed to load profiles.');
        setUsers([]);
        setLoading(false);
        return;
      }
      setUsers((data || []).map(mapProfileRow));
      setUpdatedLabel(new Date().toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }));
      setLoading(false);
    };
    fetchUsers();
    const id = window.setInterval(fetchUsers, REFRESH_MS);
    return () => {
      mounted = false;
      window.clearInterval(id);
    };
  }, []);

  const isActive = useCallback(
    (u) => {
      const o = overrides[u.id];
      if (o && typeof o.active === 'boolean') return o.active;
      return u.active;
    },
    [overrides]
  );

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((r) => {
      const matchQuery =
        !q ||
        r.fullName.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q) ||
        r.role.includes(q);
      const matchRole = roleFilter === 'all' || r.role === roleFilter;
      const active = isActive(r);
      const matchStatus = statusFilter === 'all' || (statusFilter === 'active' ? active : !active);
      return matchQuery && matchRole && matchStatus;
    });
  }, [users, query, roleFilter, statusFilter, isActive]);

  const setUserActive = async (id, active) => {
    setTogglingId(id);
    try {
      const { error } = await supabase.from('profiles').update({ status: active }).eq('id', id);
      if (error) throw error;
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, active } : u)));
      setOverrides((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    } catch (e) {
      window.alert(e?.message || 'Could not update user status.');
    } finally {
      setTogglingId(null);
    }
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
        Supabase profiles · {loading ? 'Loading...' : `Updated ${updatedLabel}`} · refreshes every minute ·{' '}
        <strong>{users.filter((r) => r.role === 'guardian').length}</strong> guardians, <strong>{users.filter((r) => r.role === 'patient').length}</strong> patients
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
        <select className="app-users-filter" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} aria-label="Filter users by role">
          <option value="all">All roles</option>
          <option value="guardian">Guardian</option>
          <option value="patient">Patient</option>
        </select>
        <select className="app-users-filter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} aria-label="Filter users by status">
          <option value="all">All status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <span className="app-users-summary">
          Showing <strong>{rows.length}</strong> of <strong>{users.length}</strong>
        </span>
      </div>

      {fetchError ? <p className="app-users-meta" style={{ color: 'var(--app-danger)' }}>{fetchError}</p> : null}
      {loading ? <p className="app-users-meta" style={{ color: 'var(--app-primary)', fontWeight: 600 }}>Loading profiles...</p> : null}

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
                        {u.avatarUrl ? (
                          <img src={u.avatarUrl} alt={u.fullName} className="app-users-avatar-img" />
                        ) : (
                          u.fullName
                            .split(' ')
                            .map((p) => p[0])
                            .join('')
                            .slice(0, 2)
                            .toUpperCase()
                        )}
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
                    <div className="app-users-status-cell">
                      <label className="app-users-toggle">
                        <input
                          type="checkbox"
                          checked={isActive(u)}
                          disabled={togglingId === u.id}
                          onChange={(e) => setUserActive(u.id, e.target.checked)}
                          aria-label={`Active status for ${u.fullName}`}
                        />
                        <span className="app-users-toggle-slider" />
                      </label>
                      <span className={`app-users-status-text ${isActive(u) ? 'is-active' : 'is-inactive'}`}>
                        {isActive(u) ? 'Active' : 'Inactive'}
                      </span>
                    </div>
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
