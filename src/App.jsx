import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';

import DashboardChoice from './features/auth/DashboardChoice';
import AdminLogin from './features/auth/AdminLogin';

import WebOverview from './features/web-dashboard/overview/WebOverview';
import Orders from './features/web-dashboard/orders/Orders';
import Products from './features/web-dashboard/products/Products';
import ProductEditor from './features/web-dashboard/products/ProductEditor';
import Inventory from './features/web-dashboard/inventory/Inventory';
import Support from './features/web-dashboard/support/Support';
import WebSettings from './features/web-dashboard/settings/WebSettings';

import CmsLayout from './features/web-dashboard/cms/CmsLayout';
import CmsHome from './features/web-dashboard/cms/home/CmsHome';
import CmsAbout from './features/web-dashboard/cms/about/CmsAbout';
import CmsReviews from './features/web-dashboard/cms/reviews/CmsReviews';
import CmsFaqs from './features/web-dashboard/cms/faqs/CmsFaqs';
import CmsContact from './features/web-dashboard/cms/contact/CmsContact';
import CmsTerms from './features/web-dashboard/cms/terms/CmsTerms';
import CmsEmails from './features/web-dashboard/cms/emails/CmsEmails';

import AppOverview from './features/app-dashboard/overview/AppOverview';
import Users from './features/app-dashboard/users/Users';
import UserProfiles from './features/app-dashboard/user-profiles/UserProfiles';
import EditUserProfile from './features/app-dashboard/user-profiles/EditUserProfile';
import LinkedDevices from './features/app-dashboard/linked-devices/LinkedDevices';
import Bracelets from './features/app-dashboard/bracelets/Bracelets';
import AppSettings from './features/app-dashboard/settings/AppSettings';

import { isAuthenticated } from './lib/authStorage';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardChoice />} />
        <Route path="/login" element={<AdminLogin />} />

        <Route
          path="/web"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<WebOverview />} />
          <Route path="orders" element={<Orders />} />
          <Route path="products" element={<Products />} />
          <Route path="products/new" element={<ProductEditor />} />
          <Route path="products/:productId/edit" element={<ProductEditor />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="support" element={<Support />} />
          <Route path="cms" element={<CmsLayout />}>
            <Route index element={<Navigate to="home" replace />} />
            <Route path="home" element={<CmsHome />} />
            <Route path="about" element={<CmsAbout />} />
            <Route path="reviews" element={<CmsReviews />} />
            <Route path="faq" element={<CmsFaqs />} />
            <Route path="contact" element={<CmsContact />} />
            <Route path="terms" element={<CmsTerms />} />
            <Route path="emails" element={<CmsEmails />} />
          </Route>
          <Route path="settings" element={<WebSettings />} />
        </Route>

        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<AppOverview />} />
          <Route path="users" element={<Users />} />
          <Route path="user-profiles" element={<UserProfiles />} />
          <Route path="user-profiles/:profileId/edit" element={<EditUserProfile />} />
          <Route path="linked-devices" element={<LinkedDevices />} />
          <Route path="bracelets" element={<Bracelets />} />
          <Route path="settings" element={<AppSettings />} />
        </Route>

        <Route path="*" element={<Navigate to={isAuthenticated() ? '/web/overview' : '/'} replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
