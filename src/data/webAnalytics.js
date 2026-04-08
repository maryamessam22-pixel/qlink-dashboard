/**
 * Deterministic pseudo-live metrics from the current UTC date (no backend required).
 * Same day → stable numbers; new day → refreshed values within realistic ranges.
 */
function seedFromDate() {
  const d = new Date();
  const key = d.getUTCFullYear() * 10000 + (d.getUTCMonth() + 1) * 100 + d.getUTCDate();
  let x = key % 2147483647;
  const next = () => {
    x = (x * 48271) % 2147483647;
    return x / 2147483647;
  };
  return { next };
}

function formatCompactUsd(n) {
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}k`;
  return `$${Math.round(n)}`;
}

export function getWebOverviewAnalytics() {
  const { next } = seedFromDate();

  const revenueBase = 118000 + next() * 25000;
  const scansBase = 1200 + Math.floor(next() * 400);
  const livesBase = 9800 + Math.floor(next() * 1200);
  const responseMs = 1200 + Math.floor(next() * 400);

  const trend = (base, spread) => {
    const delta = (next() - 0.35) * spread;
    return { value: base + delta, pct: (delta / base) * 100 };
  };

  const rev = trend(revenueBase, 8000);
  const sc = trend(scansBase, 200);
  const lv = trend(livesBase, 400);
  const rt = { value: responseMs, deltaMs: -Math.floor(next() * 80) };

  const chartPoints = Array.from({ length: 14 }, (_, i) => {
    const w = next() * 0.6 + 0.2;
    const phase = (i / 14) * Math.PI * 2;
    return 40 + Math.sin(phase) * 22 * w + next() * 18;
  });

  const adoption = [
    { name: 'Qlink Black', pct: Math.round(78 + next() * 12) },
    { name: 'Qlink Silver', pct: Math.round(55 + next() * 15) },
    { name: 'Qlink Red', pct: Math.round(42 + next() * 18) },
  ];

  return {
    revenue: formatCompactUsd(rev.value),
    revenueTrend: `${rev.pct >= 0 ? '+' : ''}${rev.pct.toFixed(1)}%`,
    revenueUp: rev.pct >= 0,
    scans: Math.round(sc.value).toLocaleString(),
    scansTrend: `${sc.pct >= 0 ? '+' : ''}${sc.pct.toFixed(1)}%`,
    scansUp: sc.pct >= 0,
    lives: Math.round(lv.value).toLocaleString(),
    livesTrend: `${lv.pct >= 0 ? '+' : ''}${lv.pct.toFixed(1)}%`,
    livesUp: lv.pct >= 0,
    responseSec: (rt.value / 1000).toFixed(1),
    responseDelta: `${rt.deltaMs >= 0 ? '+' : ''}${(rt.deltaMs / 1000).toFixed(1)}`,
    responseBetter: rt.deltaMs < 0,
    chartPoints,
    adoption,
    updatedLabel: new Date().toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }),
  };
}
