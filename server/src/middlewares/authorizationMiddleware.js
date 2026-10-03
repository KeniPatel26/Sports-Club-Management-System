import { hasPermission } from '../utils/permissions.js';

/**
 * Authorization Middleware - Verifies granular user permissions
 * @param {string} permission - Permission identifier (e.g. 'BOOKING_CREATE', 'EMPLOYEE_VIEW')
 */
export const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const allowed = hasPermission(req.user, permission);

    if (!allowed) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action',
      });
    }

    next();
  };
};

export default {
  requirePermission,
};
