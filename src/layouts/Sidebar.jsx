import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Package, ClipboardList, LifeBuoy, Settings, LogOut, X } from 'lucide-react';
import './Sidebar.css';
import myPic from '../assets/imges/my-pic.png';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/login');
  };

  const navLinks = [
    { path: '/web/overview', name: 'Overview', icon: <LayoutDashboard size={20} /> },
    { path: '/web/orders', name: 'Orders', icon: <ClipboardList size={20} /> },
    { path: '/web/products', name: 'Products', icon: <ShoppingBag size={20} /> },
    { path: '/web/inventory', name: 'Inventory', icon: <Package size={20} /> },
    { path: '/web/support', name: 'Support', icon: <LifeBuoy size={20} /> },
    { path: '/web/cms', name: 'CMS', icon: <Settings size={20} /> },
  ];

  return (
    <div className={`sidebar-container ${isOpen ? 'open' : ''}`}>
      <button className="sidebar-close-btn" onClick={toggleSidebar}>
        <X size={24} />
      </button>
      
      <div className="sidebar-profile">
        <div className="profile-image-container">
          <img src={myPic} alt="M.Farid" className="profile-image" />
        </div>
        <h3 className="profile-name">M.Farid</h3>
        <p className="profile-role">Founder & CEO</p>
        <div className="profile-divider"></div>
      </div>

      <div className="sidebar-nav">
        {navLinks.map((link) => (
          <NavLink 
            key={link.name} 
            to={link.path} 
            className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
          >
            <span className="nav-icon">{link.icon}</span>
            <span>{link.name}</span>
          </NavLink>
        ))}
      </div>

      <div className="sidebar-footer">
        <div className="logout-divider"></div>
        <button className="logout-button" onClick={handleLogout}>
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;