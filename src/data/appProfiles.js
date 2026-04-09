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
  return mulberry32((bucket % 2147483647) + 3);
}

const FIRST = [
  "Mariam",
  "Mohamed",
  "Karma",
  "Yousef",
  "Leila",
  "Hoda",
  "Ola",
  "Zeinab",
  "Rania",
  "Farah",
  "Tamer",
  "Nada",
  "Ibrahim",
  "Rami",
  "Nour",
  "Jana",
];

const LAST = [
  "Essam",
  "Saber",
  "Ahmed",
  "Mansour",
  "Wahba",
  "Mostafa",
  "Hassan",
  "Kamel",
  "Mahmoud",
  "Farid",
  "Saad",
  "Nabil",
];

const BLOOD = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

function pick(arr, next) {
  return arr[Math.floor(next() * arr.length)];
}

function formatDate(next) {
  const d = new Date();
  d.setDate(d.getDate() - Math.floor(next() * 2200 + 120));
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function getAppProfilesList(count = 8, nowMs = Date.now()) {
  const next = seedFromTime(nowMs);
  const rows = [];
  const guardianNames = [];

  for (let i = 0; i < Math.max(3, Math.floor(count / 2)); i += 1) {
    guardianNames.push(`${pick(FIRST, next)} ${pick(LAST, next)}`);
  }

  for (let i = 0; i < count; i += 1) {
    const fullName = `${pick(FIRST, next)} ${pick(LAST, next)}`;
    const ageBase = Math.floor(next() * 85) + 1;
    const age = i === 0 ? 23 : i === 1 ? 74 : i === 2 ? 10 : ageBase;
    const bloodType = i === 0 ? "O+" : i === 1 ? "AB-" : i === 2 ? "O+" : pick(BLOOD, next);
    const active = next() > 0.32;

    rows.push({
      id: `PRF-${1200 + Math.floor(next() * 8000)}`,
      fullName,
      email: `${fullName.toLowerCase().replace(/\s+/g, ".")}@email.com`,
      age,
      bloodType,
      linkedGuardian: pick(guardianNames, next),
      active,
      avatarHue: Math.floor(next() * 360),
      createdAt: formatDate(next),
    });
  }

  rows.sort((a, b) => a.fullName.localeCompare(b.fullName));

  return {
    rows,
    updatedLabel: new Date(nowMs).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }),
    summary: {
      total: rows.length,
      active: rows.filter((r) => r.active).length,
      avgAge:
        rows.length > 0
          ? Math.round(rows.reduce((sum, r) => sum + r.age, 0) / rows.length)
          : 0,
    },
  };
}
