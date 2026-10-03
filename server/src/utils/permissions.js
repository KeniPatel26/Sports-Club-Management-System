/**
 * Central Permissions Registry for Sports Club Management System
 */
export const PERMISSIONS = {
  // -------------------------
  // MEMBER
  // -------------------------
  PROFILE_VIEW_OWN: 'PROFILE_VIEW_OWN',
  PROFILE_UPDATE_OWN: 'PROFILE_UPDATE_OWN',

  MEMBERSHIP_VIEW_OWN: 'MEMBERSHIP_VIEW_OWN',

  BOOKING_CREATE: 'BOOKING_CREATE',
  BOOKING_VIEW_OWN: 'BOOKING_VIEW_OWN',
  BOOKING_CANCEL_OWN: 'BOOKING_CANCEL_OWN',

  SHOP_VIEW: 'SHOP_VIEW',
  CART_MANAGE: 'CART_MANAGE',
  SHOP_ORDER_CREATE: 'SHOP_ORDER_CREATE',
  SHOP_ORDER_VIEW_OWN: 'SHOP_ORDER_VIEW_OWN',

  CANTEEN_MENU_VIEW: 'CANTEEN_MENU_VIEW',
  CANTEEN_ORDER_CREATE: 'CANTEEN_ORDER_CREATE',
  CANTEEN_ORDER_VIEW_OWN: 'CANTEEN_ORDER_VIEW_OWN',

  PAYMENT_CREATE: 'PAYMENT_CREATE',
  INVOICE_VIEW_OWN: 'INVOICE_VIEW_OWN',

  // -------------------------
  // MEMBER MANAGEMENT
  // -------------------------
  MEMBER_VIEW: 'MEMBER_VIEW',
  MEMBER_CREATE: 'MEMBER_CREATE',
  MEMBER_UPDATE: 'MEMBER_UPDATE',
  MEMBER_DELETE: 'MEMBER_DELETE',

  MEMBERSHIP_VIEW: 'MEMBERSHIP_VIEW',
  MEMBERSHIP_CREATE: 'MEMBERSHIP_CREATE',
  MEMBERSHIP_UPDATE: 'MEMBERSHIP_UPDATE',
  MEMBERSHIP_DELETE: 'MEMBERSHIP_DELETE',

  // -------------------------
  // COURTS / BOOKINGS
  // -------------------------
  COURT_VIEW: 'COURT_VIEW',
  COURT_CREATE: 'COURT_CREATE',
  COURT_UPDATE: 'COURT_UPDATE',
  COURT_DELETE: 'COURT_DELETE',

  BOOKING_VIEW: 'BOOKING_VIEW',
  BOOKING_CREATE: 'BOOKING_CREATE',
  BOOKING_UPDATE: 'BOOKING_UPDATE',
  BOOKING_CANCEL: 'BOOKING_CANCEL',

  // -------------------------
  // EMPLOYEES
  // -------------------------
  EMPLOYEE_VIEW: 'EMPLOYEE_VIEW',
  EMPLOYEE_CREATE: 'EMPLOYEE_CREATE',
  EMPLOYEE_UPDATE: 'EMPLOYEE_UPDATE',
  EMPLOYEE_DELETE: 'EMPLOYEE_DELETE',

  ATTENDANCE_VIEW: 'ATTENDANCE_VIEW',
  ATTENDANCE_MANAGE: 'ATTENDANCE_MANAGE',

  LEAVE_VIEW: 'LEAVE_VIEW',
  LEAVE_MANAGE: 'LEAVE_MANAGE',

  SALARY_VIEW: 'SALARY_VIEW',
  SALARY_MANAGE: 'SALARY_MANAGE',

  SHIFT_VIEW: 'SHIFT_VIEW',
  SHIFT_MANAGE: 'SHIFT_MANAGE',

  // -------------------------
  // SHOP
  // -------------------------
  PRODUCT_VIEW: 'PRODUCT_VIEW',
  PRODUCT_CREATE: 'PRODUCT_CREATE',
  PRODUCT_UPDATE: 'PRODUCT_UPDATE',
  PRODUCT_DELETE: 'PRODUCT_DELETE',

  INVENTORY_VIEW: 'INVENTORY_VIEW',
  INVENTORY_MANAGE: 'INVENTORY_MANAGE',

  SHOP_ORDER_VIEW: 'SHOP_ORDER_VIEW',
  SHOP_ORDER_MANAGE: 'SHOP_ORDER_MANAGE',

  // -------------------------
  // CANTEEN
  // -------------------------
  MENU_VIEW: 'MENU_VIEW',
  MENU_MANAGE: 'MENU_MANAGE',

  TABLE_VIEW: 'TABLE_VIEW',
  TABLE_MANAGE: 'TABLE_MANAGE',

  CANTEEN_ORDER_VIEW: 'CANTEEN_ORDER_VIEW',
  CANTEEN_ORDER_MANAGE: 'CANTEEN_ORDER_MANAGE',

  BILL_MANAGE: 'BILL_MANAGE',

  // -------------------------
  // FINANCE
  // -------------------------
  PAYMENT_VIEW: 'PAYMENT_VIEW',
  PAYMENT_MANAGE: 'PAYMENT_MANAGE',

  INVOICE_VIEW: 'INVOICE_VIEW',
  INVOICE_MANAGE: 'INVOICE_MANAGE',

  REPORT_VIEW: 'REPORT_VIEW',

  // -------------------------
  // CRM
  // -------------------------
  LEAD_VIEW: 'LEAD_VIEW',
  LEAD_MANAGE: 'LEAD_MANAGE',
};

// ==================================================
// ROLE PERMISSION MAPPING
// ==================================================
export const ROLE_PERMISSIONS = {
  // ==================================================
  // MEMBER
  // ==================================================
  MEMBER: [
    PERMISSIONS.PROFILE_VIEW_OWN,
    PERMISSIONS.PROFILE_UPDATE_OWN,

    PERMISSIONS.MEMBERSHIP_VIEW_OWN,

    PERMISSIONS.BOOKING_CREATE,
    PERMISSIONS.BOOKING_VIEW_OWN,
    PERMISSIONS.BOOKING_CANCEL_OWN,

    PERMISSIONS.SHOP_VIEW,
    PERMISSIONS.CART_MANAGE,
    PERMISSIONS.SHOP_ORDER_CREATE,
    PERMISSIONS.SHOP_ORDER_VIEW_OWN,

    PERMISSIONS.CANTEEN_MENU_VIEW,
    PERMISSIONS.TABLE_VIEW,
    PERMISSIONS.CANTEEN_ORDER_CREATE,
    PERMISSIONS.CANTEEN_ORDER_VIEW_OWN,

    PERMISSIONS.PAYMENT_CREATE,
    PERMISSIONS.INVOICE_VIEW_OWN,
  ],

  // ==================================================
  // CLUB MANAGER
  // ==================================================
  CLUB_MANAGER: [
    // Members
    PERMISSIONS.MEMBER_VIEW,
    PERMISSIONS.MEMBER_CREATE,
    PERMISSIONS.MEMBER_UPDATE,
    PERMISSIONS.MEMBER_DELETE,

    // Membership
    PERMISSIONS.MEMBERSHIP_VIEW,
    PERMISSIONS.MEMBERSHIP_CREATE,
    PERMISSIONS.MEMBERSHIP_UPDATE,
    PERMISSIONS.MEMBERSHIP_DELETE,

    // Courts
    PERMISSIONS.COURT_VIEW,
    PERMISSIONS.COURT_CREATE,
    PERMISSIONS.COURT_UPDATE,
    PERMISSIONS.COURT_DELETE,

    // Bookings
    PERMISSIONS.BOOKING_VIEW,
    PERMISSIONS.BOOKING_CREATE,
    PERMISSIONS.BOOKING_UPDATE,
    PERMISSIONS.BOOKING_CANCEL,

    // Employees
    PERMISSIONS.EMPLOYEE_VIEW,
    PERMISSIONS.EMPLOYEE_CREATE,
    PERMISSIONS.EMPLOYEE_UPDATE,
    PERMISSIONS.EMPLOYEE_DELETE,

    // Attendance
    PERMISSIONS.ATTENDANCE_VIEW,
    PERMISSIONS.ATTENDANCE_MANAGE,

    // Leave
    PERMISSIONS.LEAVE_VIEW,
    PERMISSIONS.LEAVE_MANAGE,

    // Salary
    PERMISSIONS.SALARY_VIEW,
    PERMISSIONS.SALARY_MANAGE,

    // Shift
    PERMISSIONS.SHIFT_VIEW,
    PERMISSIONS.SHIFT_MANAGE,

    // Shop
    PERMISSIONS.PRODUCT_VIEW,
    PERMISSIONS.PRODUCT_CREATE,
    PERMISSIONS.PRODUCT_UPDATE,
    PERMISSIONS.PRODUCT_DELETE,

    PERMISSIONS.INVENTORY_VIEW,
    PERMISSIONS.INVENTORY_MANAGE,

    PERMISSIONS.SHOP_ORDER_VIEW,
    PERMISSIONS.SHOP_ORDER_MANAGE,

    // Canteen
    PERMISSIONS.MENU_VIEW,
    PERMISSIONS.MENU_MANAGE,

    PERMISSIONS.TABLE_VIEW,
    PERMISSIONS.TABLE_MANAGE,

    PERMISSIONS.CANTEEN_ORDER_VIEW,
    PERMISSIONS.CANTEEN_ORDER_MANAGE,

    PERMISSIONS.BILL_MANAGE,

    // Finance
    PERMISSIONS.PAYMENT_VIEW,
    PERMISSIONS.PAYMENT_MANAGE,

    PERMISSIONS.INVOICE_VIEW,
    PERMISSIONS.INVOICE_MANAGE,

    PERMISSIONS.REPORT_VIEW,

    // CRM
    PERMISSIONS.LEAD_VIEW,
    PERMISSIONS.LEAD_MANAGE,
  ],

  // ==================================================
  // STAFF (Permissions derived from department)
  // ==================================================
  STAFF: [],
};

// ==================================================
// STAFF DEPARTMENT PERMISSIONS
// ==================================================
export const STAFF_DEPARTMENT_PERMISSIONS = {
  FRONT_DESK: [
    PERMISSIONS.MEMBER_VIEW,

    PERMISSIONS.COURT_VIEW,

    PERMISSIONS.BOOKING_VIEW,
    PERMISSIONS.BOOKING_CREATE,
    PERMISSIONS.BOOKING_UPDATE,
    PERMISSIONS.BOOKING_CANCEL,

    PERMISSIONS.PAYMENT_CREATE,
  ],

  SPORTS_SHOP: [
    PERMISSIONS.PRODUCT_VIEW,

    PERMISSIONS.INVENTORY_VIEW,
    PERMISSIONS.INVENTORY_MANAGE,

    PERMISSIONS.SHOP_ORDER_VIEW,
    PERMISSIONS.SHOP_ORDER_MANAGE,

    PERMISSIONS.PAYMENT_CREATE,
  ],

  CANTEEN: [
    PERMISSIONS.MENU_VIEW,
    PERMISSIONS.MENU_MANAGE,

    PERMISSIONS.TABLE_VIEW,
    PERMISSIONS.TABLE_MANAGE,

    PERMISSIONS.CANTEEN_ORDER_VIEW,
    PERMISSIONS.CANTEEN_ORDER_MANAGE,

    PERMISSIONS.BILL_MANAGE,

    PERMISSIONS.PAYMENT_CREATE,
  ],
};

/**
 * Get all permissions assigned to a user based on role and department
 * @param {object|string} user - User document/object or role string
 * @returns {Array<string>} - Array of permission tokens
 */
export const getUserPermissions = (user) => {
  if (!user) return [];

  // If user is passed as string (role name)
  if (typeof user === 'string') {
    const roleUpper = user.toUpperCase();
    if (roleUpper === 'CLUB_MANAGER' || roleUpper === 'OWNER' || roleUpper === 'ADMIN') {
      return ROLE_PERMISSIONS.CLUB_MANAGER;
    }
    if (roleUpper === 'MEMBER' || roleUpper === 'USER') {
      return ROLE_PERMISSIONS.MEMBER;
    }
    if (STAFF_DEPARTMENT_PERMISSIONS[roleUpper]) {
      return STAFF_DEPARTMENT_PERMISSIONS[roleUpper];
    }
    return [];
  }

  const role = user.role?.toUpperCase();
  const department = user.department?.toUpperCase();

  // Manager / Owner / Admin has full manager permission matrix
  if (role === 'CLUB_MANAGER' || role === 'OWNER' || role === 'ADMIN') {
    return ROLE_PERMISSIONS.CLUB_MANAGER;
  }

  // Member
  if (role === 'MEMBER' || role === 'USER') {
    return ROLE_PERMISSIONS.MEMBER;
  }

  // Staff (role === 'STAFF' or legacy departmental roles)
  if (role === 'STAFF') {
    return STAFF_DEPARTMENT_PERMISSIONS[department] || [];
  }

  // Handle direct department role aliases for compatibility
  if (STAFF_DEPARTMENT_PERMISSIONS[role]) {
    return STAFF_DEPARTMENT_PERMISSIONS[role];
  }

  return [];
};

/**
 * Check if a user has a specific operational permission
 * @param {object} user - User object
 * @param {string} permission - Permission key to check
 * @returns {boolean} - true if user has the permission
 */
export const hasPermission = (user, permission) => {
  if (!user || !permission) return false;

  const role = user.role?.toUpperCase?.() || user;
  // Super-admin bypass
  if (role === 'CLUB_MANAGER' || role === 'OWNER' || role === 'ADMIN') {
    return true;
  }

  const permissions = getUserPermissions(user);
  return permissions.includes(permission);
};

export default {
  PERMISSIONS,
  ROLE_PERMISSIONS,
  STAFF_DEPARTMENT_PERMISSIONS,
  getUserPermissions,
  hasPermission,
};
