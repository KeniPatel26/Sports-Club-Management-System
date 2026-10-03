import express from 'express';
import { summarize, classify, getRecommendations, chat } from '../controllers/aiController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/summarize', summarize);
router.post('/classify', classify);
router.post('/recommendations', getRecommendations);
router.post('/chat', chat);

export default router;
