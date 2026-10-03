import express from 'express';
import {
  getCourts,
  getCourtSlots,
  createBooking,
  getBookings,
  cancelBooking,
} from '../controllers/courtBookingController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/courts', getCourts);
router.get('/courts/:id/slots', getCourtSlots);
router.get('/bookings', protect, getBookings);
router.post('/bookings', protect, createBooking);
router.patch('/bookings/:id/cancel', protect, cancelBooking);

export default router;
