import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Bell, Menu, X } from 'lucide-react';
import './Topbar.css';

const Topbar = ({ toggleSidebar, isSidebarOpen }) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const location = useLocation();
  
  const getCurrentPageName = () => {
    const path = location.pathname;
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
      if (path.endsWith('/emails')) return 'CMS · Emails';
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

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
  };

  return (
    <div className="topbar-container">
      
      <div className="left-section">
        {/* Burger Menu Button - Independent State */}
        <button className="menu-btn" onClick={toggleSidebar}>
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <div className="breadcrumb">
          <span className="breadcrumb-muted">Dashboard /</span>
          <span>{getCurrentPageName()}</span>
        </div>
      </div>

      <div className="topbar-actions">
        
        {/* Search Bar - Independent State */}
        <div className={`search-wrapper ${isSearchOpen ? 'visible' : ''}`}>
          {isSearchOpen ? (
            <X 
              size={18} 
              className="search-icon close-search" 
              onClick={toggleSearch} 
            />
          ) : (
            <Search 
              size={18} 
              className="search-icon" 
              onClick={toggleSearch} 
            />
          )}
          
          <input 
            type="text" 
            className="search-input" 
            placeholder="Search" 
          />
        </div>

        <button className="notification-btn">
          <Bell size={24} />
          <span className="notification-dot"></span>
        </button>

      </div>
    </div>
  );
};

export default Topbar;