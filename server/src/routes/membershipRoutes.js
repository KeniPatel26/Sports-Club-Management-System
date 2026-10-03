import express from 'express';
import {
  getMembershipPlans,
  createMembershipPlan,
  subscribeMembership,
  getMemberMembership,
} from '../controllers/membershipController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/plans', getMembershipPlans);
router.post('/plans', protect, authorize('OWNER'), createMembershipPlan);
router.post('/subscribe', protect, subscribeMembership);
router.get('/member/:userId', protect, getMemberMembership);
router.get('/my-membership', protect, (req, res, next) => {
  req.params.userId = req.user._id;
  return getMemberMembership(req, res, next);
});

export default router;
