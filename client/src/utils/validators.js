/**
 * Validation utilities for forms
 */

export const isValidEmail = (email) => {
  if (!email) return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

export const isValidPassword = (password) => {
  return password && password.length >= 6;
};

export const isNotEmpty = (val) => {
  if (val === null || val === undefined) return false;
  if (typeof val === 'string') return val.trim().length > 0;
  if (Array.isArray(val)) return val.length > 0;
  return true;
};

export const isValidNumber = (val) => {
  return !isNaN(parseFloat(val)) && isFinite(val);
};

export default {
  isValidEmail,
  isValidPassword,
  isNotEmpty,
  isValidNumber,
};
