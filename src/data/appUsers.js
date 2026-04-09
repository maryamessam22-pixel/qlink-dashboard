/**
 * Dynamic app user rows — values shift over time (minute bucket) for a live admin feel.
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
  return mulberry32((bucket % 2147483647) + 1);
}

const FIRST = [
  'Ahmed', 'Fatima', 'Omar', 'Layla', 'Youssef', 'Nour', 'Karim', 'Mariam', 'Hassan', 'Salma',
  'Malak', 'Khaled', 'Zeina', 'Tarek', 'Dina', 'Mohamed', 'Reem', 'Hana', 'Amr', 'Yasmin',
];
const LAST = [
  'El-Sayed', 'Hassan', 'Ibrahim', 'Mahmoud', 'Farid', 'Ali', 'Nasser', 'Khalil', 'Soliman', 'Fouad',
  'Sabry', 'Othman', 'Zaki', 'Rashid', 'Adel', 'Mansour', 'Hakim', 'Samir', 'Tawfik', 'Gamal',
];

function pick(arr, next) {
  return arr[Math.floor(next() * arr.length)];
}

function formatDate(next) {
  const d = new Date();
  d.setDate(d.getDate() - Math.floor(next() * 400));
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * @param {number} count
 * @param {number} [nowMs]
 */
export function getAppUsersList(count = 8, nowMs = Date.now()) {
  const next = seedFromTime(nowMs);
  const used = new Set();
  const rows = [];

  for (let i = 0; i < count; i += 1) {
    let id = `USR-${1000 + Math.floor(next() * 9000)}`;
    while (used.has(id)) {
      id = `USR-${1000 + Math.floor(next() * 9000)}`;
    }
    used.add(id);

    const first = pick(FIRST, next);
    const last = pick(LAST, next);
    const role = next() > 0.42 ? 'guardian' : 'patient';
    const active = next() > 0.15;
    const profilesManaged = role === 'guardian' ? Math.floor(next() * 5) + 1 : Math.floor(next() * 3);
    const email = `${first.toLowerCase()}.${last.toLowerCase().replace(/[^a-z]/g, '')}${Math.floor(next() * 90)}@email.com`;

    rows.push({
      id,
      fullName: `${first} ${last}`,
      email,
      role,
      registrationDate: formatDate(next),
      active,
      profilesManaged,
      avatarHue: Math.floor(next() * 360),
    });
  }

  rows.sort((a, b) => a.registrationDate.localeCompare(b.registrationDate));
  return {
    rows,
    updatedLabel: new Date(nowMs).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }),
    summary: {
      total: rows.length,
      guardians: rows.filter((r) => r.role === 'guardian').length,
      patients: rows.filter((r) => r.role === 'patient').length,
      active: rows.filter((r) => r.active).length,
    },
  };
}
