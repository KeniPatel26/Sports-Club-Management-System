import express from 'express';
import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  addTaskComment,
  deleteTask,
} from '../controllers/taskController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getTasks);
router.get('/:id', getTaskById);
router.post('/', createTask);
router.put('/:id', updateTask);
router.post('/:id/comments', addTaskComment);
router.delete('/:id', deleteTask);

export default router;
