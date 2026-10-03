import express from 'express';
import { getFinancialOverview } from '../controllers/financeReportsController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.get('/overview', authorize('OWNER'), getFinancialOverview);

export default router;
