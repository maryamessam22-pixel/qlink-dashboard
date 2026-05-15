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

  const [activeIndex, setActiveIndex] = useState(null);

  const w = 400;
  const h = 180;
  const padding = 22;
  const pts = data.chartPoints;
  const minY = Math.min(...pts);
  const maxY = Math.max(...pts);
  const innerW = w - padding * 2;
  const innerH = h - padding * 2;
  const xAt = (index) => padding + (innerW * index) / (pts.length - 1);
  const yAt = (value) => padding + innerH - ((value - minY) / (maxY - minY || 1)) * innerH;

  const dateLabels = useMemo(() => {
    const formatter = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' });
    return Array.from({ length: pts.length }, (_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (pts.length - index - 1));
      return formatter.format(date);
    });
  }, [pts.length]);

  const points = pts.map((p, i) => ({
    x: xAt(i),
    y: yAt(p),
    value: Math.round(p),
    label: dateLabels[i],
  }));
  const lineD = points.map((point, i) => `${i === 0 ? 'M' : 'L'}${point.x},${point.y}`).join(' ');
  const areaD = `${lineD} L${w - padding},${h - padding} L${padding},${h - padding} Z`;
  const yTicks = [maxY, (maxY + minY) / 2, minY];
  const activePoint = activeIndex !== null ? points[activeIndex] : null;

  const handleChartMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left - padding;
    const nearest = Math.round((x / innerW) * (pts.length - 1));
    if (nearest >= 0 && nearest < pts.length) {
      setActiveIndex(nearest);
    }
  };

  const handleChartLeave = () => setActiveIndex(null);

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
            <svg
              className="wave-chart"
              viewBox={`0 0 ${w} ${h}`}
              preserveAspectRatio="none"
              onMouseMove={handleChartMove}
              onMouseLeave={handleChartLeave}
            >
              <defs>
                <linearGradient id="scanTrendGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#E03232" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#E03232" stopOpacity="0" />
                </linearGradient>
              </defs>

              {yTicks.map((tick, idx) => {
                const y = padding + innerH - ((tick - minY) / (maxY - minY || 1)) * innerH;
                return (
                  <g key={tick}>
                    <line x1={padding} x2={w - padding} y1={y} y2={y} stroke="rgba(148, 163, 184, 0.16)" strokeWidth="1" />
                    <text x={padding - 10} y={y + 5} fontSize="11" fill="#8B949E" textAnchor="end">
                      {Math.round(tick)}
                    </text>
                  </g>
                );
              })}

              <path d={areaD} fill="url(#scanTrendGradient)" />
              <path d={lineD} fill="none" stroke="#E03232" strokeWidth="2.5" strokeLinecap="round" />

              {points.map((point, index) => (
                <g key={point.label}>
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r={activeIndex === index ? 6 : 4}
                    className={`data-point${activeIndex === index ? ' active-point' : ''}`}
                  />
                  {(index % 2 === 0 || index === points.length - 1) && (
                    <text x={point.x} y={h - 6} fontSize="10" fill="#8B949E" textAnchor="middle">
                      {point.label}
                    </text>
                  )}
                </g>
              ))}

              {activePoint && (
                <line
                  x1={activePoint.x}
                  x2={activePoint.x}
                  y1={padding}
                  y2={h - padding}
                  stroke="rgba(224, 50, 50, 0.18)"
                  strokeWidth="1"
                />
              )}
            </svg>

            {activePoint && (
              <div
                className="chart-tooltip"
                style={{
                  left: `clamp(12px, ${activePoint.x}px, calc(100% - 140px))`,
                  top: `${activePoint.y - 10}px`,
                }}
              >
                <span className="tooltip-label">{activePoint.label}</span>
                <strong>{activePoint.value} scans</strong>
              </div>
            )}
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
