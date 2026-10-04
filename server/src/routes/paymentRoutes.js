import express from 'express';
import {
  createPayment,
  confirmPayment,
  getPaymentById,
  getMyPayments,
  getManagerPayments,
  getPaymentSummary,
} from '../controllers/paymentController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Member and guest payment endpoints
router.post('/', protect, createPayment);
router.post('/create', protect, createPayment);
router.post('/:id/confirm', protect, confirmPayment);
router.get('/my', protect, getMyPayments);
router.get('/summary', protect, getPaymentSummary);
router.get('/:id', protect, getPaymentById);

// Manager / Staff payment endpoints
router.get('/manager', protect, authorize('OWNER', 'CLUB_MANAGER', 'STAFF'), getManagerPayments);
router.get('/manager/all', protect, authorize('OWNER', 'CLUB_MANAGER', 'STAFF'), getManagerPayments);
router.get('/all', protect, authorize('OWNER', 'CLUB_MANAGER', 'STAFF'), getManagerPayments);
router.get('/manager/summary', protect, authorize('OWNER', 'CLUB_MANAGER', 'STAFF'), getPaymentSummary);

export default router;
