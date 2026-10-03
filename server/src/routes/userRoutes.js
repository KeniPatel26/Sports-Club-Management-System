import express from 'express';
import {
  getUsers,
  getUserStats,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from '../controllers/userController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// All user routes require authentication
router.use(protect);

router.get('/stats', getUserStats);
router.get('/', getUsers);
router.get('/:id', getUserById);

// Admin-only operations
router.post('/', authorize('admin'), createUser);
router.put('/:id', authorize('admin'), updateUser);
router.delete('/:id', authorize('admin'), deleteUser);

export default router;
