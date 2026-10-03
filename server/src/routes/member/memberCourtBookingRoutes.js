import express from 'express';
import {
  getMemberCourts,
  getMemberCourtSlots,
  createMemberBooking,
  getMemberBookings,
  cancelMemberBooking,
  getMemberCourtStats,
} from '../../controllers/member/memberCourtBookingController.js';
import { protect } from '../../middlewares/authMiddleware.js';

const router = express.Router();

// Member Court Routes
router.get('/courts', getMemberCourts);
router.get('/courts/:id/slots', getMemberCourtSlots);
router.get('/stats', protect, getMemberCourtStats);
router.get('/bookings', protect, getMemberBookings);
router.post('/bookings', protect, createMemberBooking);
router.patch('/bookings/:id/cancel', protect, cancelMemberBooking);

export default router;
