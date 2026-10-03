import express from 'express';
import { authenticate } from '../middlewares/authMiddleware.js';
import { requirePermission } from '../middlewares/authorizationMiddleware.js';

const router = express.Router();

/**
 * @desc    Test Club Manager Permissions (e.g. EMPLOYEE_VIEW)
 * @route   GET /api/test/manager-test
 */
router.get(
  '/manager-test',
  authenticate,
  requirePermission('EMPLOYEE_VIEW'),
  (req, res) => {
    res.json({
      success: true,
      message: 'You can access employee management',
      user: {
        id: req.user._id,
        name: req.user.name,
        role: req.user.role,
        department: req.user.department,
      },
    });
  }
);

/**
 * @desc    Test Booking Permissions (e.g. BOOKING_CREATE)
 * @route   GET /api/test/booking-test
 */
router.get(
  '/booking-test',
  authenticate,
  requirePermission('BOOKING_CREATE'),
  (req, res) => {
    res.json({
      success: true,
      message: 'You can create bookings',
      user: {
        id: req.user._id,
        name: req.user.name,
        role: req.user.role,
        department: req.user.department,
      },
    });
  }
);

/**
 * @desc    Test Pro Shop Permissions (e.g. INVENTORY_MANAGE)
 * @route   GET /api/test/shop-test
 */
router.get(
  '/shop-test',
  authenticate,
  requirePermission('INVENTORY_MANAGE'),
  (req, res) => {
    res.json({
      success: true,
      message: 'You can manage pro shop inventory',
      user: {
        id: req.user._id,
        name: req.user.name,
        role: req.user.role,
        department: req.user.department,
      },
    });
  }
);

/**
 * @desc    Test Canteen / Cafe Permissions (e.g. TABLE_MANAGE)
 * @route   GET /api/test/canteen-test
 */
router.get(
  '/canteen-test',
  authenticate,
  requirePermission('TABLE_MANAGE'),
  (req, res) => {
    res.json({
      success: true,
      message: 'You can manage canteen tables and orders',
      user: {
        id: req.user._id,
        name: req.user.name,
        role: req.user.role,
        department: req.user.department,
      },
    });
  }
);

export default router;
