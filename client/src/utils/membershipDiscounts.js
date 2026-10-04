const normalizePlanName = (name) => String(name || '').trim().toUpperCase().replace(/[^A-Z]/g, '');

export const courtDiscountForPlan = (planOrName) => {
  const name = normalizePlanName(typeof planOrName === 'string' ? planOrName : planOrName?.name);
  if (name === 'GOLD') return 20;
  if (name === 'SILVER') return 10;
  if (name === 'JR' || name === 'JUNIOR') return 15;
  return 0;
};

export default courtDiscountForPlan;
