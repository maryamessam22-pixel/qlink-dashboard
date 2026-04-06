import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Layouts
import MainLayout from './layouts/MainLayout';

// Auth
import AdminLogin from './features/auth/AdminLogin';

// Web Dashboard
import WebOverview from './features/web-dashboard/overview/WebOverview';

// App Dashboard
import AppOverview from './features/app-dashboard/overview/AppOverview';
import UserProfiles from './features/app-dashboard/user-profiles/UserProfiles';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Route for Login */}
        <Route path="/login" element={<AdminLogin />} />

        {/* Main Layout containing the Sidebar and Topbar */}
        <Route path="/" element={<MainLayout />}>
          
          {/* Redirect root (/) to Web Overview by default */}
          <Route index element={<Navigate to="/web/overview" replace />} />
          
          {/* Web Dashboard Routes */}
          <Route path="web">
            <Route path="overview" element={<WebOverview />} />
            {/* We will add other web routes (CMS, Products, etc.) here later */}
          </Route>
          {/* App Dashboard Routes */}
          <Route path="app">
            <Route path="overview" element={<AppOverview />} />
            <Route path="users" element={<Navigate to="overview" replace />} />
            <Route path="user-profiles" element={<UserProfiles />} />
            {/* We will add other app routes (Linked Devices, Bracelets, etc.) here later */}
          </Route>

        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
