import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Authentication Middleware
 * Validates the JWT Bearer token and attaches the authenticated User document to req.user
 */
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Invalid authentication token',
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'super_secret_jwt_key_change_this'
    );

    const userId = decoded.userId || decoded.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User no longer exists',
      });
    }

    if (user.status !== 'ACTIVE') {
      return res.status(403).json({
        success: false,
        message: 'Your account is not active',
      });
    }

    // Attach authenticated user to request
    req.user = user;

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired. Please login again.',
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid authentication token',
    });
  }
};

/**
 * Backward compatibility alias for routes using protect
 */
export const protect = authenticate;

/**
 * Role-based authorization middleware helper
 * @param  {...string} roles Allowed roles or departments
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
    const userDept = req.user.department?.toUpperCase();
    const allowed = roles.map((r) => r.toUpperCase());

    // Club Manager / Owner / Admin always has full bypass
    if (userRole === 'CLUB_MANAGER' || userRole === 'OWNER' || userRole === 'ADMIN') {
      return next();
    }

    if (allowed.includes(userRole) || (userDept && allowed.includes(userDept))) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'You do not have permission to perform this action',
    });
  };
};

export default {
  authenticate,
  protect,
  authorize,
};
