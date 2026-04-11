export function saveFormDraft(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify({ savedAt: Date.now(), data }));
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

/** Same as loadFormDraft but includes savedAt when stored via saveFormDraft. */
export function loadFormDraftWithMeta(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && parsed.data !== undefined) {
      return {
        data: parsed.data,
        savedAt: typeof parsed.savedAt === 'number' ? parsed.savedAt : null,
      };
    }
    return { data: parsed, savedAt: null };
  } catch {
    return null;
  }
}

export function clearFormDraft(key) {
  try {
    localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

export function hasFormDraft(key) {
  return loadFormDraft(key) != null;
}
