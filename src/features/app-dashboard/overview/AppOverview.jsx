import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link2, Phone, User, Watch } from 'lucide-react';
import PageMeta from '../../../components/seo/PageMeta';
import SeoSection from '../../../components/seo/SeoSection';
import { getAppOverviewAnalytics } from '../../../data/appAnalytics';
import './AppOverview.css';

const REFRESH_MS = 60_000;

function buildGrowthChartModel(primary, secondary, yMax) {
  const W = 640;
  const H = 240;
  const padL = 56;
  const padR = 20;
  const padT = 20;
  const padB = 40;
  const n = primary.length;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const xAt = (i) => padL + (n === 1 ? innerW / 2 : (i / (n - 1)) * innerW);
  const yAt = (v) => padT + innerH - (Math.min(Math.max(v, 0), yMax) / yMax) * innerH;

  const lineD = (arr) => arr.map((v, i) => `${i === 0 ? 'M' : 'L'}${xAt(i).toFixed(1)},${yAt(v).toFixed(1)}`).join(' ');
  const areaD = (arr) => {
    const base = padT + innerH;
    let d = `M ${xAt(0).toFixed(1)} ${base} L ${xAt(0).toFixed(1)} ${yAt(arr[0]).toFixed(1)}`;
    for (let i = 1; i < n; i += 1) {
      d += ` L ${xAt(i).toFixed(1)} ${yAt(arr[i]).toFixed(1)}`;
    }
    d += ` L ${xAt(n - 1).toFixed(1)} ${base} Z`;
    return d;
  };

  const ticks = 4;
  const tickVals = Array.from({ length: ticks + 1 }, (_, i) => Math.round((yMax * i) / ticks));

  return {
    W,
    H,
    linePrimary: lineD(primary),
    lineSecondary: lineD(secondary),
    areaPrimary: areaD(primary),
    areaSecondary: areaD(secondary),
    xAt,
    yAt,
    yTicks: tickVals,
    padL,
    padT,
    innerH,
    innerW,
    baseY: padT + innerH,
  };
}

const AppOverview = () => {
  const [tick, setTick] = useState(0);
  const [period, setPeriod] = useState('monthly');
  const [hoverIdx, setHoverIdx] = useState(null);
  const [seo, setSeo] = useState({
    slug: 'app-overview',
    metaTitle: 'App dashboard overview',
    metaDescription: 'Mobile app analytics and KPIs.',
    keywords: 'app, qlink, admin, analytics',
    featuredImageAlt: 'App overview',
  });

  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), REFRESH_MS);
    return () => window.clearInterval(id);
  }, []);

  const data = useMemo(() => getAppOverviewAnalytics(Date.now() + tick), [tick]);

  const chart = useMemo(
    () => buildGrowthChartModel(data.growthPrimary, data.growthSecondary, data.yMax),
    [data.growthPrimary, data.growthSecondary, data.yMax]
  );

  const activeIdx = hoverIdx ?? data.tooltipIndex;
  const tooltipX = chart.xAt(activeIdx);
  const tooltipY = chart.yAt(data.growthPrimary[activeIdx]);

  const tooltipDateStr = useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - activeIdx));
    d.setDate(8 + (activeIdx % 20));
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  }, [activeIdx]);

  const formatK = useCallback((n) => {
    if (n >= 1000) return `${Math.round(n / 1000)}k`;
    return String(n);
  }, []);

  const onChartMove = (e) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * chart.W;
    const { padL, innerW, xAt } = chart;
    let best = 0;
    let bestDist = Infinity;
    for (let i = 0; i < data.monthLabels.length; i += 1) {
      const d = Math.abs(xAt(i) - x);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    }
    if (x >= padL - 8 && x <= padL + innerW + 8) setHoverIdx(best);
    else setHoverIdx(null);
  };

  const onChartLeave = () => setHoverIdx(null);

  return (
    <div className="app-overview-page">
      <PageMeta title="App · Overview" description={seo.metaDescription} keywords={seo.keywords} />

      <p className="app-overview-meta">Updated {data.updatedLabel} · refreshes every minute</p>
      <h1 className="app-overview-heading">Overview</h1>
      <p className="app-overview-lead">System overview and analytics</p>

      <div className="app-kpi-grid">
        <article className="app-kpi-card">
          <div className="app-kpi-icon app-kpi-icon--purple" aria-hidden>
            <User size={22} strokeWidth={2} />
          </div>
          <p className="app-kpi-label">Total users</p>
          <p className="app-kpi-value">{data.kpis.totalUsers.toLocaleString()}</p>
        </article>

        <article className="app-kpi-card">
          <div className="app-kpi-icon app-kpi-icon--blue" aria-hidden>
            <Watch size={22} strokeWidth={2} />
          </div>
          <p className="app-kpi-label">Total bracelets</p>
          <p className="app-kpi-value">{data.kpis.totalBracelets.toLocaleString()}</p>
        </article>

        <article className="app-kpi-card">
          <div className="app-kpi-icon app-kpi-icon--dark-blue" aria-hidden>
            <Link2 size={22} strokeWidth={2} />
          </div>
          <p className="app-kpi-label">Linked bracelets</p>
          <p className="app-kpi-value">{data.kpis.linkedBracelets.toLocaleString()}</p>
        </article>

        <article className="app-kpi-card app-kpi-card--wide">
          <div className="app-kpi-icon app-kpi-icon--green" aria-hidden>
            <Phone size={22} strokeWidth={2} />
          </div>
          <p className="app-kpi-label">Emergency contacts</p>
          <p className="app-kpi-value">{data.kpis.emergencyContacts.toLocaleString()}</p>
        </article>
      </div>

      <div className="app-charts-row">
        <div className="app-chart-card">
          <div className="app-chart-card-head">
            <div>
              <h2 className="app-chart-title">Users growth (last 6 months)</h2>
              <p className="app-chart-sub">Registered users · primary vs secondary cohorts</p>
            </div>
          </div>

          <div className="app-area-chart-wrap">
            <svg
              className="app-area-chart-svg"
              viewBox={`0 0 ${chart.W} ${chart.H}`}
              preserveAspectRatio="xMidYMid meet"
              role="img"
              aria-label="Users growth chart"
              onMouseMove={onChartMove}
              onMouseLeave={onChartLeave}
            >
              {chart.yTicks.map((tv) => {
                const y = chart.padT + chart.innerH - (tv / data.yMax) * chart.innerH;
                return (
                  <g key={tv}>
                    <line x1={chart.padL} x2={chart.W - 20} y1={y} y2={y} stroke="#e4e7ec" strokeWidth="1" />
                    <text x={8} y={y + 4} fontSize="11" fill="#6b778c">
                      {formatK(tv)}
                    </text>
                  </g>
                );
              })}

              <path d={chart.areaSecondary} fill="var(--app-chart-fill-b)" />
              <path d={chart.areaPrimary} fill="var(--app-chart-fill-a)" />
              <path d={chart.lineSecondary} fill="none" stroke="var(--app-chart-line-b)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
              <path d={chart.linePrimary} fill="none" stroke="var(--app-chart-line-a)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />

              {data.monthLabels.map((label, i) => (
                <text key={label} x={chart.xAt(i)} y={chart.H - 12} fontSize="11" fill="#6b778c" textAnchor="middle">
                  {label}
                </text>
              ))}

              <circle cx={tooltipX} cy={tooltipY} r="5" fill="var(--app-chart-line-a)" stroke="#fff" strokeWidth="2" />
            </svg>

            <div
              className="app-chart-tooltip"
              style={{
                left: `clamp(8px, ${(tooltipX / chart.W) * 100}% - 70px, calc(100% - 160px))`,
                top: `${(tooltipY / chart.H) * 100}%`,
                transform: 'translateY(-120%)',
              }}
            >
              <p className="app-chart-tooltip-date">{tooltipDateStr}</p>
              <p className="app-chart-tooltip-val">${data.growthPrimary[activeIdx].toLocaleString()}</p>
              <p className="app-chart-tooltip-date" style={{ marginTop: 6, marginBottom: 0 }}>
                Secondary: ${data.growthSecondary[activeIdx].toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="app-chart-card">
          <div className="app-chart-card-head">
            <div>
              <h2 className="app-chart-title">Bracelet status</h2>
              <p className="app-chart-sub">Linked vs unlinked inventory</p>
            </div>
            <select className="app-chart-select" value={period} onChange={(e) => setPeriod(e.target.value)} aria-label="Chart period">
              <option value="monthly">Monthly</option>
              <option value="weekly">Weekly</option>
              <option value="daily">Daily</option>
            </select>
          </div>

          <div className="app-donut-wrap">
            <div
              className="app-donut"
              style={{
                background:
                  data.linkedPct <= 0
                    ? 'conic-gradient(var(--app-chart-purple) 0deg 360deg)'
                    : data.linkedPct >= 100
                      ? 'conic-gradient(var(--app-chart-blue) 0deg 360deg)'
                      : `conic-gradient(var(--app-chart-blue) 0% ${data.linkedPct}%, var(--app-chart-purple) ${data.linkedPct}% 100%)`,
              }}
              role="img"
              aria-label={`Linked ${data.linkedPct} percent, unlinked ${data.unlinkedPct} percent`}
            />
            <div className="app-donut-legend">
              <span className="app-donut-legend-item">
                <span className="app-donut-dot app-donut-dot--linked" />
                Linked {data.linkedPct}%
              </span>
              <span className="app-donut-legend-item">
                <span className="app-donut-dot app-donut-dot--unlinked" />
                Unlinked {data.unlinkedPct}%
              </span>
            </div>
          </div>
        </div>
      </div>

      <SeoSection title="App overview SEO" slugPrefix="admin.qlink.com/app/overview/" value={seo} onChange={setSeo} badge="Internal" />
    </div>
  );
};

export default AppOverview;
