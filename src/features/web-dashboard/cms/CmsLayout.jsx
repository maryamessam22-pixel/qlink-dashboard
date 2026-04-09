import React, { useCallback, useRef, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Save, Plus, FilePlus } from 'lucide-react';
import './CmsLayout.css';

const INITIAL_TABS = [
  { to: 'home', label: 'Homepage' },
  { to: 'about', label: 'About' },
  { to: 'reviews', label: 'Reviews' },
  { to: 'faq', label: 'FAQ' },
  { to: 'contact', label: 'Contact' },
  { to: 'terms', label: 'Terms & Privacy' },
  { to: 'emails', label: 'Emails' },
];

const CmsLayout = () => {
  const [tabs, setTabs] = useState(INITIAL_TABS);
  const [toast, setToast] = useState('');
  const toastTimer = useRef(null);

  const showToast = useCallback((msg) => {
    setToast(msg);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(''), 2800);
  }, []);

  const onAddSection = () => {
    showToast('New section added to the current editor!');
    window.dispatchEvent(new CustomEvent('cms:add-section'));
  };

  const onAddPage = () => {
    const name = window.prompt('New page name:', 'New Landing');
    if (name) {
      const slug = name.toLowerCase().replace(/\s+/g, '-');
      setTabs((prev) => [...prev, { to: slug, label: name }]);
      showToast(`Page “${name}” added to tabs! (Requires route config to open)`);
    }
  };

  const onSave = () => {
    window.dispatchEvent(new CustomEvent('cms:save'));
    showToast('Changes saved locally (wire to API when ready).');
  };

  return (
    <div className="cms-layout web-page">
      <div className="cms-hero">
        <div>
          <h1 className="web-page-title">Content Management System</h1>
          <p className="web-page-sub">Manage your website content, FAQs, legal documents, and email templates.</p>
        </div>
        <div className="cms-hero-actions">
          <button type="button" className="btn-primary" onClick={onSave}>
            <Save size={18} />
            Save Changes
          </button>
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
