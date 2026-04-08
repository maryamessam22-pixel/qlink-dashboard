import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe, Smartphone } from 'lucide-react';
import { setIntendedDashboard } from '../../lib/authStorage';
import logoImg from '../../assets/logos/QLINK.png';
import './DashboardChoice.css';

const DashboardChoice = () => {
  const navigate = useNavigate();

  const choose = (mode) => {
    setIntendedDashboard(mode);
    navigate('/login');
  };

  return (
    <div className="dash-choice-page">
      <div className="dash-choice-brand">
        <img src={logoImg} alt="Qlink" className="dash-choice-logo" />
        <h1 className="dash-choice-title">Qlink Command Center</h1>
        <p className="dash-choice-lead">Choose which dashboard you want to open. You can switch later from the sidebar.</p>
      </div>

      <div className="dash-choice-cards">
        <button type="button" className="dash-choice-card web" onClick={() => choose('web')}>
          <span className="dash-choice-card-icon" aria-hidden>
            <Globe size={36} strokeWidth={1.5} />
          </span>
          <span className="dash-choice-card-label">Web Dashboard</span>
          <span className="dash-choice-card-desc">Storefront, CMS, orders, products, and inventory</span>
        </button>

        <button type="button" className="dash-choice-card app" onClick={() => choose('app')}>
          <span className="dash-choice-card-icon" aria-hidden>
            <Smartphone size={36} strokeWidth={1.5} />
          </span>
          <span className="dash-choice-card-label">App Dashboard</span>
          <span className="dash-choice-card-desc">Users, devices, bracelets, and app settings</span>
        </button>
      </div>
    </div>
  );
};

export default DashboardChoice;
