export const normalizeRole = (value) => {
  const role = value && typeof value === 'object'
    ? value.role || value.name || value.value
    : value;

  return String(role || '').trim().toUpperCase().replace(/[\s-]+/g, '_');
};

export const isManagerRole = (value) =>
  ['CLUB_MANAGER', 'MANAGER', 'OWNER', 'ADMIN'].includes(normalizeRole(value));
