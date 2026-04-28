import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import qFavicon from './assets/logos/Q.png';

import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';

import DashboardChoice from './features/auth/DashboardChoice';
import AdminLogin from './features/auth/AdminLogin';
import LoadingScreen from './features/auth/LoadingScreen';

import WebOverview from './features/web-dashboard/overview/WebOverview';
import Orders from './features/web-dashboard/orders/Orders';
import Products from './features/web-dashboard/products/Products';
import ProductEditor from './features/web-dashboard/products/ProductEditor';
import Inventory from './features/web-dashboard/inventory/Inventory';
import Support from './features/web-dashboard/support/Support';
import WebAiChat from './features/web-dashboard/ai-chat/WebAiChat';
import WebSettings from './features/web-dashboard/settings/WebSettings';

import CmsLayout from './features/web-dashboard/cms/CmsLayout';
import CmsHome from './features/web-dashboard/cms/home/CmsHome';
import CmsAbout from './features/web-dashboard/cms/about/CmsAbout';
import CmsReviews from './features/web-dashboard/cms/reviews/CmsReviews';
import CmsFaqs from './features/web-dashboard/cms/faqs/CmsFaqs';
import CmsContact from './features/web-dashboard/cms/contact/CmsContact';
// I kept it hidden for now.
// import CmsTerms from './features/web-dashboard/cms/terms/CmsTerms';
import CmsPrivacySecurity from './features/web-dashboard/cms/privacy-security/CmsPrivacySecurity';
import CmsAppFeatures from './features/web-dashboard/cms/app-features/CmsAppFeatures';
import CmsCustomPage from './features/web-dashboard/cms/CmsCustomPage';

import AppOverview from './features/app-dashboard/overview/AppOverview';
import Users from './features/app-dashboard/users/Users';
import UserProfiles from './features/app-dashboard/user-profiles/UserProfiles';
import EditUserProfile from './features/app-dashboard/user-profiles/EditUserProfile';
import LinkedDevices from './features/app-dashboard/linked-devices/LinkedDevices';
import Bracelets from './features/app-dashboard/bracelets/Bracelets';
import AppSettings from './features/app-dashboard/settings/AppSettings';
import EditUserAccount from './features/app-dashboard/users/EditUserAccount';

import { isAuthenticated } from './lib/authStorage';

const App = () => {
  useEffect(() => {
    let link = document.querySelector("link[rel*='icon']");
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'icon');
      document.head.appendChild(link);
    }
    link.setAttribute('href', qFavicon);
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardChoice />} />
        <Route path="/login" element={<AdminLogin />} />
        <Route path="/loading" element={<LoadingScreen />} />

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
          <Route path="ai-chat" element={<WebAiChat />} />
          <Route path="cms" element={<CmsLayout />}>
            <Route index element={<Navigate to="home" replace />} />
            <Route path="home" element={<CmsHome />} />
            <Route path="about" element={<CmsAbout />} />
            <Route path="reviews" element={<CmsReviews />} />
            <Route path="faq" element={<CmsFaqs />} />
            <Route path="contact" element={<CmsContact />} />
            <Route path="terms" element={<Navigate to="/web/cms/home" replace />} />
            <Route path="privacy-security" element={<CmsPrivacySecurity />} />
            <Route path="app-features" element={<CmsAppFeatures />} />
            <Route path="p/:pageSlug" element={<CmsCustomPage />} />
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
          <Route path="users/new" element={<EditUserAccount />} />
          <Route path="user-profiles" element={<UserProfiles />} />
          <Route path="user-profiles/new" element={<EditUserProfile />} />
          <Route path="user-profiles/:profileId/edit" element={<EditUserProfile />} />
          <Route path="linked-devices" element={<LinkedDevices />} />
          <Route path="bracelets" element={<Bracelets />} />
          <Route path="support" element={<Support />} />
          <Route path="settings" element={<AppSettings />} />
        </Route>

        <Route path="*" element={<Navigate to={isAuthenticated() ? '/web/overview' : '/'} replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
