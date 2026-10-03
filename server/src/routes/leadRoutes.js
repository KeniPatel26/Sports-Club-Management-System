import express from 'express';
import { createLead, getLeads } from '../controllers/leadController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', createLead);
router.get('/', protect, authorize('OWNER', 'FRONT_DESK'), getLeads);

export default router;
