export const readSavedCart = (key) => {
  if (typeof window === 'undefined') return [];
  try {
    const saved = JSON.parse(window.localStorage.getItem(key) || '[]');
    if (!Array.isArray(saved)) return [];
    return saved.filter((entry) => entry?.product?._id && Number(entry.quantity) > 0);
  } catch {
    return [];
  }
};

export const saveCart = (key, cart) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(cart));
  } catch {
    // Keep the in-memory cart usable if browser storage is unavailable.
  }
};
