import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, Menu, X } from 'lucide-react';
import { useInbox } from '../context/InboxContext';
import NotificationsDropdown from './NotificationsDropdown';
import './Topbar.css';

const Topbar = ({ toggleSidebar, isSidebarOpen }) => {
  const location = useLocation();
  const [panelOpen, setPanelOpen] = useState(false);
  const wrapRef = useRef(null);
  const { unreadCount } = useInbox();

  useEffect(() => {
    if (!panelOpen) return undefined;
    const onDoc = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setPanelOpen(false);
      }
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [panelOpen]);

  useEffect(() => {
    setPanelOpen(false);
  }, [location.pathname]);

  const getCurrentPageName = () => {
    const path = location.pathname;
    if (path.includes('/user-profiles/') && path.includes('/edit')) return 'Edit Profile';
    if (path.includes('/settings')) return 'Settings';
    if (path.includes('/products/new')) return 'Add New Product';
    if (path.includes('/products/') && path.includes('/edit')) return 'Edit Product';
    if (path.includes('/products')) return 'Products';
    if (path.includes('/cms/')) {
      if (path.endsWith('/home')) return 'CMS · Homepage';
      if (path.endsWith('/about')) return 'CMS · About';
      if (path.endsWith('/reviews')) return 'CMS · Reviews';
      if (path.endsWith('/faq')) return 'CMS · FAQ';
      if (path.endsWith('/contact')) return 'CMS · Contact';
      if (path.endsWith('/terms')) return 'CMS · Terms';
      if (path.endsWith('/privacy-security')) return 'CMS · Privacy & Security';
      return 'CMS';
    }
    if (path.includes('overview')) return 'Overview';
    if (path.includes('orders')) return 'Orders';
    if (path.includes('inventory')) return 'Inventory';
    if (path.includes('support')) return 'Support';
    if (path.includes('users')) return 'Users';
    if (path.includes('user-profiles')) return 'User Profiles';
    if (path.includes('linked-devices')) return 'Linked Devices';
    if (path.includes('bracelets')) return 'Bracelets';
    return 'Dashboard';
  };

  const isApp = location.pathname.startsWith('/app');

  return (
    <div className={`topbar-container${isApp ? ' topbar-container--app' : ''}`}>
      <div className="left-section">
        <button type="button" className="menu-btn" onClick={toggleSidebar} aria-label="Toggle menu">
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <div className="topbar-titles">
          <div className="breadcrumb">
            <span className="breadcrumb-muted">Dashboard /</span>
            <span>{getCurrentPageName()}</span>
          </div>
          {isApp ? (
            <p className="topbar-welcome">
              Welcome back, <strong>M.Farid</strong>
            </p>
          ) : null}
        </div>
      </div>

      <div className="topbar-actions">
        <div className="topbar-notifications-wrap" ref={wrapRef}>
          <button
            type="button"
            className="notification-btn"
            aria-expanded={panelOpen}
            aria-haspopup="dialog"
            aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
            onClick={() => setPanelOpen((o) => !o)}
          >
            <Bell size={24} />
            {unreadCount > 0 ? (
              <span className="notification-count" aria-hidden>
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            ) : null}
          </button>
          {panelOpen ? <NotificationsDropdown isApp={isApp} onClose={() => setPanelOpen(false)} /> : null}
        </div>
      </div>
    </div>
  );
};

export default Topbar;
