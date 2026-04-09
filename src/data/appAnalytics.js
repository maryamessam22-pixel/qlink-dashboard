/**
 * App overview metrics derived from the current time so values feel live:
 * - Updates meaningfully when the component remounts or when `tick` / `now` changes.
 * - Use with a periodic refresh (e.g. every 60s) for gradual movement without day-long staleness.
 */
function mulberry32(a) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seedFromTime(nowMs = Date.now()) {
  const bucket = Math.floor(nowMs / 60000);
  return mulberry32(bucket % 2147483647 || 1);
}

function lastNMonthLabels(n, now = new Date()) {
  const labels = [];
  for (let i = n - 1; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    labels.push(
      d.toLocaleDateString('en-US', {
        month: 'numeric',
        day: 'numeric',
      })
    );
  }
  return labels;
}

/**
 * @param {number} [nowMs] - Pass Date.now() or a tick from an interval to refresh series.
 */
export function getAppOverviewAnalytics(nowMs = Date.now()) {
  const next = seedFromTime(nowMs);
  const now = new Date(nowMs);

  const totalUsers = 2 + Math.floor(next() * 48);
  const totalBracelets = Math.max(totalUsers, 2 + Math.floor(next() * 55));
  const linkedBracelets = Math.min(
    totalBracelets,
    Math.max(0, Math.floor(totalBracelets * (0.25 + next() * 0.65)))
  );
  const emergencyContacts = Math.floor(next() * 15);

  const linkedPct =
    totalBracelets > 0 ? Math.round((linkedBracelets / totalBracelets) * 100) : Math.round(next() * 40 + 30);
  const unlinkedPct = Math.max(0, 100 - linkedPct);

  const monthLabels = lastNMonthLabels(6, now);

  let primary = 12000 + next() * 14000;
  let secondary = 9000 + next() * 11000;
  const growthPrimary = [];
  const growthSecondary = [];
  for (let i = 0; i < 6; i += 1) {
    primary += (next() - 0.38) * 12000 + 3500;
    secondary += (next() - 0.42) * 9500 + 2800;
    growthPrimary.push(Math.max(5000, Math.round(primary)));
    growthSecondary.push(Math.max(4000, Math.round(secondary)));
  }

  const maxVal = Math.max(...growthPrimary, ...growthSecondary, 1);
  const yCap = Math.ceil(maxVal / 10000) * 10000;
  const yMax = Math.max(90000, yCap);

  const tooltipIndex = Math.min(5, Math.floor(next() * 6));

  return {
    kpis: {
      totalUsers,
      totalBracelets,
      linkedBracelets,
      emergencyContacts,
    },
    linkedPct,
    unlinkedPct,
    monthLabels,
    growthPrimary,
    growthSecondary,
    yMax,
    tooltipIndex,
    updatedLabel: now.toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }),
  };
}
