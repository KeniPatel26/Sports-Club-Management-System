import express from 'express';
import { uploadFile, uploadAvatar } from '../controllers/uploadController.js';
import { upload } from '../middlewares/uploadMiddleware.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/', upload.single('file'), uploadFile);
router.post('/avatar', upload.single('avatar'), uploadAvatar);

export default router;
