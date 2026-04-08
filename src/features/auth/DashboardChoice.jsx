import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe, Smartphone } from 'lucide-react';
import { setIntendedDashboard } from '../../lib/authStorage';
import logoImg from '../../assets/logos/QLINK.png';
import DynamicBackground from '../../components/DynamicBackground';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';
import './DashboardChoice.css';

const DashboardChoice = () => {
  const navigate = useNavigate();
  const [headerRef, headerVisible] = useIntersectionObserver();
  const [cardsRef, cardsVisible] = useIntersectionObserver();

  const choose = (mode) => {
    setIntendedDashboard(mode);
    navigate('/login');
  };

  return (
    <div className="dash-choice-page">
      <DynamicBackground />
      
      <div 
        ref={headerRef}
        className={`dash-choice-brand ${headerVisible ? 'animate-in' : 'hidden'}`}
      >
        <img src={logoImg} alt="Qlink" className="dash-choice-logo" />
        <h1 className="dash-choice-title">Qlink Command Center</h1>
        <p className="dash-choice-lead">Choose your operational environment</p>
      </div>

      <div 
        ref={cardsRef}
        className={`dash-choice-cards ${cardsVisible ? 'animate-in' : 'hidden'}`}
      >
        <button type="button" className="dash-choice-card web" onClick={() => choose('web')}>
          <div className="dash-choice-card-inner">
            <span className="dash-choice-card-icon" aria-hidden>
              <Globe size={40} strokeWidth={1.5} />
            </span>
            <div className="dash-choice-card-content">
              <span className="dash-choice-card-label">Website Dashboard</span>
              <span className="dash-choice-card-desc">Control storefront, CMS, branding, and total product inventory.</span>
            </div>
          </div>
        </button>

        <button type="button" className="dash-choice-card app" onClick={() => choose('app')}>
          <div className="dash-choice-card-inner">
            <span className="dash-choice-card-icon" aria-hidden>
              <Smartphone size={40} strokeWidth={1.5} />
            </span>
            <div className="dash-choice-card-content">
              <span className="dash-choice-card-label">App Dashboard</span>
              <span className="dash-choice-card-desc">Manage end-users, device activation, SOS protocols, and app settings.</span>
            </div>
          </div>
        </button>
      </div>

      <div className="dash-choice-footer">
        QLINK SHIELD PROTOCOL · V4.0.2
      </div>
    </div>
  );
};

export default DashboardChoice;
