import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminLogin.css';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    navigate('/web/overview');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        
        <div className="login-header">
          <img src={require('../../assets/logos/QLINK.png')} alt="Qlink Logo" className="logo-image" />
          <h2 className="title-text">Qlink Command Center</h2>
          <p className="subtitle-text">Enter your credentials to manage the safety network.</p>
        </div>

        <form className="login-form" onSubmit={handleLogin}>
          
          <div className="input-group">
            <label>Email Address</label>
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

          <button type="submit" className="login-button">
            Sign In to Dashboard
          </button>
        </form>

        <div className="login-footer">
          SECURED BY QLINK SHIELD PROTOCOL V4.0
        </div>
        
      </div>
    </div>
  );
};

export default AdminLogin;