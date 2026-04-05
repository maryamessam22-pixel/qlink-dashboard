import React from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Bell, Menu } from 'lucide-react';
import './Topbar.css';

const Topbar = ({ toggleSidebar }) => {
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

  return (
    <div className="topbar-container">
      
      <div className="left-section">
        <button className="menu-btn" onClick={toggleSidebar}>
          <Menu size={24} />
        </button>
        <div className="breadcrumb">
          <span className="breadcrumb-muted">Dashboard /</span>
          <span>{getCurrentPageName()}</span>
        </div>
      </div>

      <div className="topbar-actions">
        
        <div className="search-wrapper">
          <Search size={18} className="search-icon" />
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