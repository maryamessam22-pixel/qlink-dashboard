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
  return mulberry32((bucket % 2147483647) + 11);
}

const PROFILES = [
  "Mohmed Saber",
  "Karma Ahmed",
  "Hoda Mansour",
  "Mariam Essam",
  "Omar Farid",
  "Nour Saad",
];

const BRACELET_NAMES = [
  'Qlink Smart Bracelet "Nova"',
  'Qlink Smart Bracelet "Pulse"',
  'Qlink Smart Bracelet "Core"',
];

const WATCH_NAMES = ["Smartwatch Pro #5678", "Apple Watch S9", "Galaxy Watch 6"];

function pick(arr, next) {
  return arr[Math.floor(next() * arr.length)];
}

function deviceTypeClass(type) {
  return type === "Apple Watch" ? "watch" : "qlink";
}

function batteryClass(level) {
  if (level <= 10) return "low";
  return "ok";
}

export function getAppLinkedDevicesList(count = 8, nowMs = Date.now()) {
  const next = seedFromTime(nowMs);
  const rows = [];

  for (let i = 0; i < count; i += 1) {
    const useWatch = next() > 0.72;
    const type = useWatch ? "Apple Watch" : "Qlink Bracelet";
    const deviceName = useWatch ? pick(WATCH_NAMES, next) : pick(BRACELET_NAMES, next);
    const linkedProfile = pick(PROFILES, next);
    const active = next() > 0.25;
    const batteryLevel = active ? Math.max(5, Math.floor(next() * 100)) : Math.floor(next() * 12);

    rows.push({
      id: `DEV-${1500 + Math.floor(next() * 7000)}`,
      deviceName,
      type,
      typeClass: deviceTypeClass(type),
      linkedProfile,
      active,
      batteryLevel,
      batteryClass: batteryClass(batteryLevel),
      avatarHue: Math.floor(next() * 360),
    });
  }

  // Keep a few rows close to mockup style at top.
  if (rows.length >= 3) {
    rows[0] = {
      ...rows[0],
      deviceName: 'Qlink Smart Bracelet "Nova"',
      type: "Qlink Bracelet",
      typeClass: "qlink",
      linkedProfile: "Mohmed Saber",
      active: true,
      batteryLevel: 85,
      batteryClass: "ok",
    };
    rows[1] = {
      ...rows[1],
      deviceName: 'Qlink Smart Bracelet "Pulse"',
      type: "Qlink Bracelet",
      typeClass: "qlink",
      linkedProfile: "Karma Ahmed",
      active: true,
      batteryLevel: 85,
      batteryClass: "ok",
    };
    rows[2] = {
      ...rows[2],
      deviceName: "Smartwatch Pro #5678",
      type: "Apple Watch",
      typeClass: "watch",
      linkedProfile: "Hoda Mansour",
      active: false,
      batteryLevel: 0,
      batteryClass: "low",
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
      avgBattery:
        rows.length > 0
          ? Math.round(rows.reduce((sum, r) => sum + r.batteryLevel, 0) / rows.length)
          : 0,
    },
  };
}
