/**
 * Sports Club Management System - Permission Matrix
 * Maps operational permission tokens to user roles
 */

export const PERMISSIONS = {
  OWNER: [
    'MEMBER_VIEW',
    'MEMBER_MANAGE',
    'MEMBERSHIP_MANAGE',
    'EMPLOYEE_VIEW',
    'EMPLOYEE_MANAGE',
    'COURT_VIEW',
    'COURT_MANAGE',
    'BOOKING_VIEW',
    'BOOKING_MANAGE',
    'SHOP_MANAGE',
    'INVENTORY_MANAGE',
    'CANTEEN_MANAGE',
    'REPORT_VIEW',
    'FINANCE_VIEW',
  ],

  FRONT_DESK: [
    'MEMBER_VIEW',
    'COURT_VIEW',
    'BOOKING_VIEW',
    'BOOKING_MANAGE',
  ],

  SHOP_STAFF: [
    'PRODUCT_VIEW',
    'INVENTORY_MANAGE',
    'SHOP_ORDER_MANAGE',
  ],

  CANTEEN_STAFF: [
    'MENU_VIEW',
    'TABLE_MANAGE',
    'CANTEEN_ORDER_MANAGE',
    'BILL_MANAGE',
  ],

  MEMBER: [
    'PROFILE_VIEW_OWN',
    'BOOKING_CREATE',
    'BOOKING_VIEW_OWN',
    'ORDER_CREATE',
    'ORDER_VIEW_OWN',
  ],
};

/**
 * Check if a role has a given permission
 */
export const hasPermission = (role, permission) => {
  if (!role || !permission) return false;
  // OWNER / ADMIN role has super-admin rights across all permissions
  if (role === 'OWNER' || role === 'ADMIN') return true;

  const rolePerms = PERMISSIONS[role] || [];
  return rolePerms.includes(permission);
};

export default {
  PERMISSIONS,
  hasPermission,
};
