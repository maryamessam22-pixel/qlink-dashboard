import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  getIntendedDashboard,
  isAuthenticated,
} from '../../lib/authStorage';
import logoImg from '../../assets/logos/QLINK.png';
import './AdminLogin.css';

const AdminLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const intended = getIntendedDashboard();

  useEffect(() => {
    if (isAuthenticated()) {
      const target = location.state?.from;
      const dest =
        typeof target === 'string' && (target.startsWith('/web') || target.startsWith('/app'))
          ? target
          : intended === 'app'
            ? '/app/overview'
            : '/web/overview';
      navigate('/loading', { replace: true, state: { dest } });
    }
  }, [navigate, location.state, intended]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (isLoggingIn) return;
    setIsLoggingIn(true);

    // Simulate auth delay before entering loading screen.
    setTimeout(() => {
      const from = location.state?.from;
      const dest =
        typeof from === 'string' && (from.startsWith('/web') || from.startsWith('/app'))
          ? from
          : intended === 'app'
            ? '/app/overview'
            : '/web/overview';
      navigate('/loading', { replace: true, state: { dest, authReady: true } });
    }, 900);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <img src={logoImg} alt="Qlink Logo" className="logo-image" />
          <h2 className="title-text">Qlink Command Center</h2>
          <p className="subtitle-text">
            Signing in to the <strong>{intended === 'app' ? 'App' : 'Web'}</strong> dashboard. You can switch later from the sidebar.
          </p>
        </div>

        <form className="login-form" onSubmit={handleLogin}>
          <div className="input-group">
            <label>Email address</label>
            <div className="input-wrapper">
              <span className="icon">✉</span>
              <input
                type="email"
                placeholder="admin@qlink.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label>Password</label>
            <div className="input-wrapper">
              <span className="icon">🔒</span>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="login-button" disabled={isLoggingIn}>
            {isLoggingIn ? 'Preparing secure session...' : 'Continue to dashboard'}
          </button>

          <button
            type="button"
            className="switch-dashboard-btn"
            onClick={() => navigate('/')}
          >
            ← Switch Dashboard
          </button>
        </form>

        <div className="login-footer">SECURED BY QLINK SHIELD PROTOCOL V4.0</div>
      </div>
    </div>
  );
};

export default AdminLogin;
