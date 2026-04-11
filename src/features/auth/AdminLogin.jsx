import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  getIntendedDashboard,
  isAuthenticated,
} from '../../lib/authStorage';
import logoImg from '../../assets/logos/QLINK.png';
import './AdminLogin.css';

const REQUIRED_FIELD_MSG = 'This field is required.';

const AdminLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({ email: '', password: '' });
  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);
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

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    const errors = { email: '', password: '' };
    if (!trimmedEmail) errors.email = REQUIRED_FIELD_MSG;
    if (!trimmedPassword) errors.password = REQUIRED_FIELD_MSG;
    setFieldErrors(errors);
    if (errors.email || errors.password) {
      if (errors.email) emailInputRef.current?.focus();
      else passwordInputRef.current?.focus();
      return;
    }

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

  const isAppLogin = intended === 'app';

  return (
    <div className={`login-container${isAppLogin ? ' login-container--app' : ' login-container--web'}`}>
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
            <label htmlFor="login-email">Email address</label>
            <div className={`input-wrapper${fieldErrors.email ? ' input-wrapper--invalid' : ''}`}>
              <span className="icon">✉</span>
              <input
                id="login-email"
                ref={emailInputRef}
                type="email"
                placeholder="admin@qlink.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email) setFieldErrors((f) => ({ ...f, email: '' }));
                }}
                autoComplete="email"
                aria-invalid={Boolean(fieldErrors.email)}
                aria-describedby={fieldErrors.email ? 'login-email-error' : undefined}
              />
            </div>
            {fieldErrors.email ? (
              <p id="login-email-error" className="login-field-error" role="alert">
                {fieldErrors.email}
              </p>
            ) : null}
          </div>

          <div className="input-group">
            <label htmlFor="login-password">Password</label>
            <div className={`input-wrapper${fieldErrors.password ? ' input-wrapper--invalid' : ''}`}>
              <span className="icon">🔒</span>
              <input
                id="login-password"
                ref={passwordInputRef}
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password) setFieldErrors((f) => ({ ...f, password: '' }));
                }}
                autoComplete="current-password"
                aria-invalid={Boolean(fieldErrors.password)}
                aria-describedby={fieldErrors.password ? 'login-password-error' : undefined}
              />
            </div>
            {fieldErrors.password ? (
              <p id="login-password-error" className="login-field-error" role="alert">
                {fieldErrors.password}
              </p>
            ) : null}
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
