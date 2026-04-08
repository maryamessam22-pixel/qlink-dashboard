import React, { useMemo, useState } from 'react';
import { CreditCard, QrCode, Shield, TrendingUp } from 'lucide-react';
import PageMeta from '../../../components/seo/PageMeta';
import SeoSection from '../../../components/seo/SeoSection';
import { getWebOverviewAnalytics } from '../../../data/webAnalytics';
import './WebOverview.css';

const WebOverview = () => {
  const data = useMemo(() => getWebOverviewAnalytics(), []);
  const [seo, setSeo] = useState({
    slug: 'overview',
    metaTitle: 'Overview — Qlink Admin',
    metaDescription: 'Real-time summary of sales and safety ecosystem performance.',
    keywords: 'overview, analytics, qlink',
    featuredImageAlt: 'Overview',
  });

  const w = 400;
  const h = 150;
  const pts = data.chartPoints;
  const minY = Math.min(...pts);
  const maxY = Math.max(...pts);
  const norm = (v) => h - ((v - minY) / (maxY - minY || 1)) * (h - 24) - 12;
  const step = w / (pts.length - 1);
  const lineD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${i * step},${norm(p)}`).join(' ');
  const areaD = `${lineD} L${w},${h} L0,${h} Z`;

  return (
    <div className="overview-container web-page">
      <PageMeta title="Overview" description={seo.metaDescription} keywords={seo.keywords} />

      <div className="overview-header">
        <h1 className="overview-title">Overview</h1>
        <p className="overview-subtitle">Real-time summary of your sales and safety ecosystem performance.</p>
        <p className="overview-updated">Figures refresh daily · Last built {data.updatedLabel}</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon-box icon-bg-blue">
              <CreditCard size={18} className="icon-blue" />
            </div>
            <span className={`stat-badge ${data.revenueUp ? 'badge-positive' : 'badge-negative'}`}>{data.revenueTrend}</span>
          </div>
          <div className="stat-body">
            <p className="stat-label">Total revenue</p>
            <h2 className="stat-value">{data.revenue}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon-box icon-bg-red">
              <QrCode size={18} className="icon-red" />
            </div>
            <span className={`stat-badge ${data.scansUp ? 'badge-positive' : 'badge-negative'}`}>{data.scansTrend}</span>
          </div>
          <div className="stat-body">
            <p className="stat-label">Emergency scans</p>
            <h2 className="stat-value">{data.scans}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon-box icon-bg-green">
              <Shield size={18} className="icon-green" />
            </div>
            <span className={`stat-badge ${data.livesUp ? 'badge-positive' : 'badge-negative'}`}>{data.livesTrend}</span>
          </div>
          <div className="stat-body">
            <p className="stat-label">Lives protected</p>
            <h2 className="stat-value">{data.lives}</h2>
          </div>
        </div>
      </div>

      <div className="response-card-wide">
        <div className="stat-header">
          <div className="stat-icon-box icon-bg-yellow">
            <TrendingUp size={18} className="icon-yellow" />
          </div>
          <span className={`stat-badge ${data.responseBetter ? 'badge-positive' : 'badge-negative'}`}>{data.responseDelta}s</span>
        </div>
        <div className="stat-body">
          <p className="stat-label">Median response time</p>
          <h2 className="stat-value">{data.responseSec}s</h2>
        </div>
      </div>

      <div className="analysis-grid">
        <div className="chart-card">
          <h3 className="card-title">Scan frequency trend</h3>
          <div className="chart-wrapper">
            <svg className="wave-chart" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
              <path d={areaD} fill="rgba(224, 50, 50, 0.08)" />
              <path d={lineD} fill="none" stroke="#E03232" strokeWidth="2" />
            </svg>
          </div>
        </div>

        <div className="adoption-card">
          <h3 className="card-title">Device adoption</h3>
          <div className="adoption-list">
            {data.adoption.map((d) => (
              <div key={d.name} className="adoption-item">
                <div className="item-info">
                  <span>{d.name}</span>
                  <span className="item-percent">{d.pct}%</span>
                </div>
                <div className="progress-track">
                  <div
                    className={`progress-fill ${d.name.includes('Black') ? 'fill-blue' : d.name.includes('Silver') ? 'fill-white' : 'fill-red'}`}
                    style={{ width: `${d.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <SeoSection title="Overview admin SEO" slugPrefix="admin.qlink.com/overview/" value={seo} onChange={setSeo} badge="Internal" />
    </div>
  );
};

export default WebOverview;
