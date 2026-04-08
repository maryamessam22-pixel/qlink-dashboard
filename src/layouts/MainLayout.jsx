import React from 'react';

/**
 * Legacy shell — routing uses `DashboardLayout` with `<Outlet />`.
 * Kept for optional reuse without unused imports.
 */
const MainLayout = ({ children }) => (
  <div className="layout-wrapper">{children}</div>
);

export default MainLayout;
