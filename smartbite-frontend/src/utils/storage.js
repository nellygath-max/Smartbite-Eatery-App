export const getStoredValue = (key, fallback = null) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

export const setStoredValue = (key, value) =>
  localStorage.setItem(key, JSON.stringify(value));
export const removeStoredValue = (key) => localStorage.removeItem(key);
export const getRawValue = (key) => localStorage.getItem(key);
export const setRawValue = (key, value) => localStorage.setItem(key, value);
