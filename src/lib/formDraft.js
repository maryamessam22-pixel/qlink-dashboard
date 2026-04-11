function notifyDraftChanged(key) {
  try {
    window.dispatchEvent(new CustomEvent('qlink:form-draft-changed', { detail: { key } }));
  } catch {
    /* ignore */
  }
}

export function saveFormDraft(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify({ savedAt: Date.now(), data }));
    notifyDraftChanged(key);
    return true;
  } catch (e) {
    console.error('saveFormDraft:', e);
    return false;
  }
}

export function loadFormDraft(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && parsed.data !== undefined) return parsed.data;
    return parsed;
  } catch {
    return null;
  }
}

export function clearFormDraft(key) {
  try {
    localStorage.removeItem(key);
    notifyDraftChanged(key);
  } catch {
    /* ignore */
  }
}

export function hasFormDraft(key) {
  return loadFormDraft(key) != null;
}
