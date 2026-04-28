import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { isAuthenticated } from '../../lib/authStorage';
import './NotFound.css';

const NotFound = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isApp = location.pathname.startsWith('/app');

  const handleBack = () => {
    if (isAuthenticated()) {
      navigate(isApp ? '/app/overview' : '/web/overview');
    } else {
      navigate('/');
    }
  };

  return (
    <div className={`nf-container${isApp ? ' nf-container--app' : ''}`}>
      <div className="nf-content">
        <div className="nf-code-wrap">
          <span className="nf-four">4</span>
          <span className="nf-zero">
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="nf-lock-svg">
              <rect x="20" y="46" width="60" height="42" rx="8" fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeWidth="5" />
              <path d="M34 46V34a16 16 0 0 1 32 0v12" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
              <circle cx="50" cy="67" r="6" fill="currentColor" />
              <line x1="50" y1="73" x2="50" y2="82" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
            </svg>
          </span>
          <span className="nf-four">4</span>
        </div>

        <h1 className="nf-title">Page Not Found</h1>
        <p className="nf-subtitle">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <button className="nf-btn" onClick={handleBack}>
          ← Back to Dashboard
        </button>
      </div>

      <div className="nf-footer">SECURED BY QLINK SHIELD PROTOCOL V4.0</div>
    </div>
  );
};

export default NotFound;
