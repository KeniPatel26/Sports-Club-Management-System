import express from 'express';
import {
  getStaff,
  createStaff,
  getShifts,
  createShift,
  requestLeave,
  updateLeaveStatus,
  getLeaves,
} from '../controllers/staffController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', authorize('OWNER'), getStaff);
router.post('/', authorize('OWNER'), createStaff);

router.get('/shifts', getShifts);
router.post('/shifts', authorize('OWNER'), createShift);

router.get('/leaves', getLeaves);
router.post('/leaves', requestLeave);
router.patch('/leaves/:id/status', authorize('OWNER'), updateLeaveStatus);

export default router;
