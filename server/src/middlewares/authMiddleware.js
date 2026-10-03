import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { hasPermission } from '../config/permissions.js';

/**
 * Protect routes - Verify JWT token from Authorization header (Bearer <token>)
 */
export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Verify token signature with JWT_SECRET
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'super_secret_jwt_key_change_in_production_2026'
      );

      // Get user from token ID (excluding hashed password)
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User belonging to this session token no longer exists',
        });
      }

      if (req.user.status === 'SUSPENDED' || req.user.status === 'INACTIVE') {
        return res.status(403).json({
          success: false,
          message: `Your account is currently ${req.user.status}. Please contact the club manager.`,
        });
      }

      return next();
    } catch (error) {
      console.error('JWT Verification Error:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Not authorized, invalid or expired token',
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no bearer token provided',
    });
  }
};

/**
 * Role-based authorization middleware
 * @param  {...string} roles Allowed roles ('OWNER', 'FRONT_DESK', 'SHOP_STAFF', 'CANTEEN_STAFF', 'MEMBER', etc.)
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const userRole = req.user.role?.toUpperCase();
    const allowedRoles = roles.map((r) => r.toUpperCase());

    // OWNER and ADMIN always have access
    if (userRole === 'OWNER' || userRole === 'ADMIN') {
      return next();
    }

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not authorized to access this resource`,
      });
    }
    next();
  };
};

/**
 * Granular Permission-based authorization middleware
 * @param {string} permission Operational permission token (e.g. 'BOOKING_MANAGE', 'INVENTORY_MANAGE')
 */
export const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    if (!hasPermission(req.user.role, permission)) {
      return res.status(403).json({
        success: false,
        message: `Missing required permission: ${permission}`,
      });
    }

    next();
  };
};

export default {
  protect,
  authorize,
  requirePermission,
};
