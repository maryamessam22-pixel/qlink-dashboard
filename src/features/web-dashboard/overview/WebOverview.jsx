import React from 'react';
import { CreditCard, QrCode, Shield, Activity } from 'lucide-react';
import './WebOverview.css';

const WebOverview = () => {
  return (
    <div className="overview-container">
      
      <div className="overview-header">
        <h1 className="overview-title">Overview</h1>
        <p className="overview-subtitle">Real-time summary of your sales and safety ecosystem performance.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon icon-blue">
              <CreditCard size={18} />
            </div>
            <span className="stat-badge badge-positive">+12.5%</span>
          </div>
          <div className="stat-label">Total Revenue</div>
          <div className="stat-value">$128.4k</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon icon-red">
              <QrCode size={18} />
            </div>
            <span className="stat-badge badge-positive">+18.2%</span>
          </div>
          <div className="stat-label">Emergency Scans</div>
          <div className="stat-value">1,429</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon icon-green">
              <Shield size={18} />
            </div>
            <span className="stat-badge badge-positive">+4.3%</span>
          </div>
          <div className="stat-label">Lives Protected</div>
          <div className="stat-value">10,240</div>
        </div>
      </div>

      <div className="response-card">
        <div className="stat-header">
          <div className="stat-icon icon-red" style={{ backgroundColor: 'rgba(224, 50, 50, 0.1)' }}>
            <Activity size={18} />
          </div>
          <span className="stat-badge badge-negative">-0.2s</span>
        </div>
        <div className="stat-label">Response Time</div>
        <div className="stat-value">1.4s</div>
      </div>

      <div className="main-content-grid">
        
        <div className="chart-container">
          <h3 className="chart-title">Scan Frequency Trend</h3>
          <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4b5563', border: '1px dashed #314158', borderRadius: '8px' }}>
            [ Chart Graphic Placeholder ]
          </div>
        </div>

        <div className="adoption-card">
          <h3 className="adoption-title">Device Adoption</h3>
          
          <div className="adoption-list">
            <div className="adoption-item">
              <div className="adoption-item-header">
                <span>Qlink Black</span>
                <span className="adoption-item-value">85%</span>
              </div>
              <div className="progress-bar-container">
                <div className="progress-bar-fill fill-blue" style={{ width: '85%' }}></div>
              </div>
            </div>

            <div className="adoption-item">
              <div className="adoption-item-header">
                <span>Qlink Silver</span>
                <span className="adoption-item-value">62%</span>
              </div>
              <div className="progress-bar-container">
                <div className="progress-bar-fill fill-silver" style={{ width: '62%' }}></div>
              </div>
            </div>

            <div className="adoption-item">
              <div className="adoption-item-header">
                <span>Qlink Red</span>
                <span className="adoption-item-value">48%</span>
              </div>
              <div className="progress-bar-container">
                <div className="progress-bar-fill fill-red" style={{ width: '48%' }}></div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default WebOverview;