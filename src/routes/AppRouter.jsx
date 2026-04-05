import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import AdminLogin from '../features/auth/AdminLogin';
import WebOverview from '../features/web-dashboard/overview/WebOverview';
import AppOverview from '../features/app-dashboard/overview/AppOverview';

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<AdminLogin />} />
        
        <Route path="/web/*" element={
          <MainLayout>
            <Routes>
              <Route path="overview" element={<WebOverview />} />
              <Route path="*" element={<Navigate to="overview" replace />} />
            </Routes>
          </MainLayout>
        } />

        <Route path="/app/*" element={
          <MainLayout>
            <Routes>
              <Route path="overview" element={<AppOverview />} />
              <Route path="*" element={<Navigate to="overview" replace />} />
            </Routes>
          </MainLayout>
        } />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
