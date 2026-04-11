import React, { useCallback, useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Plus, FilePlus } from 'lucide-react';
import './CmsLayout.css';

const STORAGE_KEY = 'qlink_cms_extra_tabs';

const INITIAL_TABS = [
  { to: 'home', label: 'Homepage' },
  { to: 'about', label: 'About' },
  { to: 'reviews', label: 'Reviews' },
  { to: 'faq', label: 'FAQ' },
  { to: 'contact', label: 'Contact' },
  { to: 'terms', label: 'Terms & Privacy' },
  { to: 'emails', label: 'Emails' },
  { to: 'app-features', label: 'App features' },
];

const initialTabPaths = new Set(INITIAL_TABS.map((t) => t.to));

function loadMergedTabs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const extra = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(extra)) return [...INITIAL_TABS];
    return [...INITIAL_TABS, ...extra.filter((t) => t && typeof t.to === 'string' && typeof t.label === 'string')];
  } catch {
    return [...INITIAL_TABS];
  }
}

function persistExtraTabs(allTabs) {
  const extra = allTabs.filter((t) => !initialTabPaths.has(t.to));
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(extra));
  } catch {
    /* ignore */
  }
}

const CmsLayout = () => {
  const navigate = useNavigate();
  const [tabs, setTabs] = useState(loadMergedTabs);
  const [toast, setToast] = useState('');
  const toastTimer = useRef(null);

  const showToast = useCallback((msg) => {
    setToast(msg);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(''), 2800);
  }, []);

  const onAddSection = () => {
    showToast('New section added in the editor below — use Save Changes on that page to publish.');
    window.dispatchEvent(new CustomEvent('cms:add-section'));
  };

  useEffect(() => {
    const onRemoveTab = (e) => {
      const to = e.detail?.to;
      if (!to || initialTabPaths.has(to)) return;
      setTabs((prev) => {
        const next = prev.filter((t) => t.to !== to);
        persistExtraTabs(next);
        return next;
      });
    };
    window.addEventListener('cms:remove-custom-tab', onRemoveTab);
    return () => window.removeEventListener('cms:remove-custom-tab', onRemoveTab);
  }, []);

  const onAddPage = () => {
    const name = window.prompt('New page name:', 'New Landing');
    if (!name?.trim()) return;
    const slug = name
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
    if (!slug) {
      showToast('Use letters and numbers in the page name.');
      return;
    }
    const to = `p/${slug}`;
    let added = false;
    setTabs((prev) => {
      if (prev.some((t) => t.to === to)) return prev;
      added = true;
      const next = [...prev, { to, label: name.trim() }];
      persistExtraTabs(next);
      return next;
    });
    navigate(to);
    showToast(
      added
        ? `Page “${name.trim()}” added — use Save Changes on this page to publish.`
        : 'Opening existing page tab.'
    );
  };

  return (
    <div className="cms-layout web-page">
      <div className="cms-hero">
        <div>
          <h1 className="web-page-title">Content Management System</h1>
          <p className="web-page-sub">Manage your website content, FAQs, legal documents, and email templates.</p>
        </div>
      </div>

      <div className="cms-toolbar-row">
        <nav className="cms-tabs" aria-label="CMS sections">
          {tabs.map((tab) => (
            <NavLink key={tab.to} to={tab.to} className={({ isActive }) => `cms-tab ${isActive ? 'active' : ''}`} end={tab.to === 'home'}>
              {tab.label}
            </NavLink>
          ))}
        </nav>
        <div className="cms-toolbar-buttons">
          <button type="button" className="btn-secondary" onClick={onAddSection}>
            <Plus size={16} />
            Add New Section
          </button>
          <button type="button" className="btn-secondary" onClick={onAddPage}>
            <FilePlus size={16} />
            Add New Page
          </button>
        </div>
      </div>

      {toast ? <div className="cms-toast" role="status">{toast}</div> : null}

      <Outlet />
    </div>
  );
};

export default CmsLayout;
