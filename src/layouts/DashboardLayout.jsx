import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { InboxProvider } from '../context/InboxContext';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import '../styles/app-dashboard-shared.css';

const DashboardLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen((o) => !o);
  const location = useLocation();
  const isApp = location.pathname.startsWith('/app');

  return (
    <InboxProvider>
      <div
        className={`layout-wrapper${isApp ? ' layout-wrapper--app' : ''}`}
        style={{
          display: 'flex',
          minHeight: '100vh',
          backgroundColor: isApp ? 'var(--app-bg-page)' : 'var(--c-bg-dark)',
        }}
      >
        <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

        {isSidebarOpen && (
          <div
            className="sidebar-overlay"
            onClick={toggleSidebar}
            onKeyDown={(e) => e.key === 'Escape' && toggleSidebar()}
            role="presentation"
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.5)',
              zIndex: 900,
              backdropFilter: 'blur(4px)',
            }}
          />
        )}

        <div className="main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Topbar toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
          <main className="page-container" style={{ padding: '32px', flex: 1, overflowY: 'auto' }}>
            <Outlet />
          </main>
        </div>
      </div>
    </InboxProvider>
  );
};

export default DashboardLayout;
