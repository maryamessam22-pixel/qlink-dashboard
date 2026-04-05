import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const MainLayout = ({ children }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  return (
    <div className="layout-wrapper">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      
      {/* Overlay to close sidebar on mobile */}
      {isSidebarOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={toggleSidebar}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 900,
            backdropFilter: 'blur(4px)'
          }}
        />
      )}

      <div className="main-content">
        <Topbar toggleSidebar={toggleSidebar} />
        <main className="page-container">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
