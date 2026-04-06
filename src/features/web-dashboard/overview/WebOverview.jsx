import React from 'react';
import { CreditCard, QrCode, Shield, TrendingUp } from 'lucide-react';
import './WebOverview.css';

const WebOverview = () => {
  return (
    <div className="overview-container">
      
      {/* Header Info */}
      <div className="overview-header">
        <h1 className="overview-title">Overview</h1>
        <p className="overview-subtitle">Real-time summary of your sales and safety ecosystem performance.</p>
      </div>

      {/* Primary Stats Grid */}
      <div className="stats-grid">
        {/* Total Revenue */}
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon-box icon-bg-blue">
              <CreditCard size={18} className="icon-blue" />
            </div>
            <span className="stat-badge badge-positive">+12.5%</span>
          </div>
          <div className="stat-body">
            <p className="stat-label">Total Revenue</p>
            <h2 className="stat-value">$128.4k</h2>
          </div>
        </div>

        {/* Emergency Scans */}
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon-box icon-bg-red">
              <QrCode size={18} className="icon-red" />
            </div>
            <span className="stat-badge badge-positive">+18.2%</span>
          </div>
          <div className="stat-body">
            <p className="stat-label">Emergency Scans</p>
            <h2 className="stat-value">1,429</h2>
          </div>
        </div>

        {/* Lives Protected */}
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon-box icon-bg-green">
              <Shield size={18} className="icon-green" />
            </div>
            <span className="stat-badge badge-positive">+4.3%</span>
          </div>
          <div className="stat-body">
            <p className="stat-label">Lives Protected</p>
            <h2 className="stat-value">10,240</h2>
          </div>
        </div>
      </div>

      {/* Secondary Stats (Response Time) */}
      <div className="response-card-wide">
        <div className="stat-header">
          <div className="stat-icon-box icon-bg-yellow">
            <TrendingUp size={18} className="icon-yellow" />
          </div>
          <span className="stat-badge badge-negative">-0.2</span>
        </div>
        <div className="stat-body">
          <p className="stat-label">Response Time</p>
          <h2 className="stat-value">1.4s</h2>
        </div>
      </div>

      {/* Main Analysis Section */}
      <div className="analysis-grid">
        
        {/* Scan Frequency Trend (SVG Chart) */}
        <div className="chart-card">
          <h3 className="card-title">Scan Frequency Trend</h3>
          <div className="chart-wrapper">
             <svg className="wave-chart" viewBox="0 0 400 150" preserveAspectRatio="none">
               <path 
                 d="M0,130 C50,135 100,140 120,90 C150,20 180,80 200,100 C230,120 280,100 320,110 C360,120 380,115 400,105 L400,150 L0,150 Z" 
                 fill="rgba(224, 50, 50, 0.05)" 
               />
               <path 
                 d="M0,130 C50,135 100,140 120,90 C150,20 180,80 200,100 C230,120 280,100 320,110 C360,120 380,115 400,105" 
                 fill="none" 
                 stroke="#E03232" 
                 strokeWidth="2" 
               />
             </svg>
          </div>
        </div>

        {/* Device Adoption */}
        <div className="adoption-card">
          <h3 className="card-title">Device Adoption</h3>
          <div className="adoption-list">
            
            <div className="adoption-item">
              <div className="item-info">
                <span>Qlink Black</span>
                <span className="item-percent">85%</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill fill-blue" style={{ width: '85%' }}></div>
              </div>
            </div>

            <div className="adoption-item">
              <div className="item-info">
                <span>Qlink Silver</span>
                <span className="item-percent">62%</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill fill-white" style={{ width: '62%' }}></div>
              </div>
            </div>

            <div className="adoption-item">
              <div className="item-info">
                <span>Qlink Red</span>
                <span className="item-percent">48%</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill fill-red" style={{ width: '48%' }}></div>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};

export default WebOverview;