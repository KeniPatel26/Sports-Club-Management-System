import express from 'express';
import {
  registerMember,
  login,
  getMe,
  updateProfile,
  changePassword,
} from '../controllers/authController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = express.Router();

// ============================================
// PUBLIC ROUTES
// ============================================
router.post('/register', registerMember);
router.post('/login', login);

// ============================================
// PROTECTED ROUTES (Authenticated)
// ============================================
router.get('/me', authenticate, getMe);
router.put('/profile', authenticate, updateProfile);
router.put('/change-password', authenticate, changePassword);

export default router;
