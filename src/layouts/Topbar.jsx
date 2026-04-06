import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Bell, Menu, X } from 'lucide-react';
import './Topbar.css';

const Topbar = ({ toggleSidebar, isSidebarOpen }) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const location = useLocation();
  
  const getCurrentPageName = () => {
    const path = location.pathname;
    if (path.includes('overview')) return 'Overview';
    if (path.includes('orders')) return 'Orders';
    if (path.includes('products')) return 'Products';
    if (path.includes('inventory')) return 'Inventory';
    if (path.includes('support')) return 'Support';
    if (path.includes('cms')) return 'CMS';
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