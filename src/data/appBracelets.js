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
  return mulberry32((bucket % 2147483647) + 19);
}

const ASSIGNEES = [
  "Mohamed Saber",
  "Karma Ahmed",
  "Hoda Mansour",
  "Mariam Essam",
  "Omar Farid",
  "Nour Saad",
];

function pick(arr, next) {
  return arr[Math.floor(next() * arr.length)];
}

function makeBraceletId(next) {
  const series = pick(["PULSE", "NOVA", "CORE", "SENSE"], next);
  const part = Math.floor(next() * 0xffffff)
    .toString(16)
    .toUpperCase()
    .padStart(6, "0");
  return `QLINK-${series}-${part}`;
}

function makeSyncLabel(next) {
  const mins = Math.max(1, Math.floor(next() * 15));
  if (mins === 1) return "1 minute ago";
  return `${mins} minutes ago`;
}

export function getAppBraceletsList(count = 8, nowMs = Date.now()) {
  const next = seedFromTime(nowMs);
  const rows = [];

  for (let i = 0; i < count; i += 1) {
    const active = next() > 0.2;
    const assignedProfile = pick(ASSIGNEES, next);
    const emailHandle = assignedProfile.toLowerCase().replace(/\s+/g, ".");
    rows.push({
      id: makeBraceletId(next),
      assignedProfile,
      contact: `${emailHandle}${Math.floor(next() * 99)}@gmail.com`,
      status: active ? "Active" : "Inactive",
      active,
      lastSync: active ? makeSyncLabel(next) : "Offline",
      avatarHue: Math.floor(next() * 360),
    });
  }

  if (rows.length >= 2) {
    rows[0] = {
      ...rows[0],
      id: "QLINK-PULSE-8A3F2E",
      assignedProfile: "Mohamed Saber",
      contact: "moh.saber42@gmail.com",
      status: "Active",
      active: true,
      lastSync: "2 minutes ago",
    };
    rows[1] = {
      ...rows[1],
      id: "QLINK-NOVA-12B30E8",
      assignedProfile: "Karma Ahmed",
      contact: "karma.ahmed62@gmail.com",
      status: "Active",
      active: true,
      lastSync: "5 minutes ago",
    };
  }

  return {
    rows,
    updatedLabel: new Date(nowMs).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }),
    summary: {
      total: rows.length,
      active: rows.filter((r) => r.active).length,
    },
  };
}
