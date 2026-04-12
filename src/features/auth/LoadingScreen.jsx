import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  setAuthenticated,
  clearIntendedDashboard,
  getIntendedDashboard,
  isAuthenticated,
} from '../../lib/authStorage';
import logoWeb from '../../assets/logos/QLINK.png';
import logoAppWordmark from '../../assets/logos/Qlink-login.png';
import './LoadingScreen.css';

const LoadingScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const destFromState = location.state?.dest;
    const intended = getIntendedDashboard();
    const fallbackDest = intended === 'app' ? '/app/overview' : '/web/overview';
    const dest =
      typeof destFromState === 'string' && (destFromState.startsWith('/web') || destFromState.startsWith('/app'))
        ? destFromState
        : fallbackDest;

    if (!isAuthenticated()) {
      if (location.state?.authReady) setAuthenticated(true);
      else {
        navigate('/login', { replace: true });
        return undefined;
      }
    }

    const timer = window.setTimeout(() => {
      clearIntendedDashboard();
      navigate(dest, { replace: true });
    }, 1400);

    return () => window.clearTimeout(timer);
  }, [navigate, location.state]);

  const isApp = getIntendedDashboard() === 'app';
  const logoSrc = isApp ? logoAppWordmark : logoWeb;

  return (
    <div className={`auth-loading-page${isApp ? ' auth-loading-page--app' : ' auth-loading-page--web'}`}>
      <div className="auth-loading-content">
        <img
          src={logoSrc}
          alt="Qlink"
          className={`auth-loading-logo${isApp ? ' auth-loading-logo--app-wordmark' : ''}`}
        />
        <div className="auth-loading-spinner" />
        <p className="auth-loading-text">Initializing dashboard...</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
