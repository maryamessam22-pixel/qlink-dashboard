const AUTH_KEY = 'qlink_admin_auth';
const INTENDED_KEY = 'qlink_intended_dashboard';

export function setAuthenticated(value) {
  if (value) localStorage.setItem(AUTH_KEY, '1');
  else localStorage.removeItem(AUTH_KEY);
}

export function isAuthenticated() {
  return localStorage.getItem(AUTH_KEY) === '1';
}

export function clearAuth() {
  localStorage.removeItem(AUTH_KEY);
}

export function setIntendedDashboard(mode) {
  if (mode === 'web' || mode === 'app') {
    localStorage.setItem(INTENDED_KEY, mode);
  }
}

export function getIntendedDashboard() {
  const v = localStorage.getItem(INTENDED_KEY);
  return v === 'app' ? 'app' : 'web';
}

export function clearIntendedDashboard() {
  localStorage.removeItem(INTENDED_KEY);
}
