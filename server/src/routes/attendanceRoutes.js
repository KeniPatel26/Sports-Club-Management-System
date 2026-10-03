import express from 'express';
import { authenticate } from '../middlewares/authMiddleware.js';
import { requirePermission } from '../middlewares/authorizationMiddleware.js';
import {
  getManagerAttendance,
  updateManagerAttendance,
  recordManualAttendance,
  getMyAttendance,
  checkOutStaff,
  checkInStaff,
} from '../controllers/attendanceController.js';

const router = express.Router();

// ============================================
// STAFF ATTENDANCE ENDPOINTS
// ============================================
router.get('/my', authenticate, getMyAttendance);
router.post('/check-in', authenticate, checkInStaff);
router.post('/check-out', authenticate, checkOutStaff);

// ============================================
// MANAGER ERP ATTENDANCE ENDPOINTS
// ============================================
router.get(
  '/manager',
  authenticate,
  requirePermission('STAFF_VIEW'),
  getManagerAttendance
);

router.put(
  '/manager/:id',
  authenticate,
  requirePermission('STAFF_MANAGE'),
  updateManagerAttendance
);

router.post(
  '/manager/manual',
  authenticate,
  requirePermission('STAFF_MANAGE'),
  recordManualAttendance
);

export default router;
