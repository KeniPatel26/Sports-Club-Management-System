import express from 'express';
import { getActivities, getAuditLogs } from '../controllers/activityController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getActivities);
router.get('/audit-logs', authorize('admin'), getAuditLogs);

export default router;
