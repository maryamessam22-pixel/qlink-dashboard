import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, ShoppingBag, Package, ClipboardList, 
  LifeBuoy, Settings, LogOut, X, Users, Smartphone, Watch 
} from 'lucide-react';
import './Sidebar.css';
import myPic from '../assets/imges/my-pic.png';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine which dashboard mode we are in based on URL
  const isAppDashboard = location.pathname.startsWith('/app');

  const handleLogout = () => {
    navigate('/login');
  };

  const toggleDashboardMode = () => {
    if (isAppDashboard) {
      navigate('/web/overview');
    } else {
      navigate('/app/overview');
    }
  };

  const webLinks = [
    { path: '/web/overview', name: 'Overview', icon: <LayoutDashboard size={20} /> },
    { path: '/web/orders', name: 'Orders', icon: <ClipboardList size={20} /> },
    { path: '/web/products', name: 'Products', icon: <ShoppingBag size={20} /> },
    { path: '/web/inventory', name: 'Inventory', icon: <Package size={20} /> },
    { path: '/web/support', name: 'Support', icon: <LifeBuoy size={20} /> },
    { path: '/web/cms', name: 'CMS', icon: <Settings size={20} /> },
  ];

  const appLinks = [
    { path: '/app/overview', name: 'Overview', icon: <LayoutDashboard size={20} /> },
    { path: '/app/users', name: 'Users', icon: <Users size={20} /> },
    { path: '/app/user-profiles', name: 'User Profiles', icon: <Users size={20} /> },
    { path: '/app/linked-devices', name: 'Linked Devices', icon: <Smartphone size={20} /> },
    { path: '/app/bracelets', name: 'Bracelets', icon: <Watch size={20} /> },
    { path: '/app/settings', name: 'Settings', icon: <Settings size={20} /> },
  ];

  const navLinks = isAppDashboard ? appLinks : webLinks;

  return (
    <div className={`sidebar-container ${isOpen ? 'open' : ''} ${isAppDashboard ? 'app-theme' : 'web-theme'}`}>
      <button className="sidebar-close-btn" onClick={toggleSidebar}>
        <X size={24} />
      </button>
      
      <div className="sidebar-profile">
        <div className="profile-image-container">
          <img src={myPic} alt="M.Farid" className="profile-image" />
        </div>
        <h3 className="profile-name">M.Farid</h3>
        <p className="profile-role">Founder & CEO</p>

        {/* Dashboard Switcher Toggle */}
        <div className="dashboard-toggle-wrapper">
          <div 
            className={`toggle-slider ${isAppDashboard ? 'app-mode' : 'web-mode'}`}
            onClick={toggleDashboardMode}
          >
            <span className="toggle-label web">Web</span>
            <span className="toggle-label app">App</span>
            <div className="toggle-thumb"></div>
          </div>
        </div>

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