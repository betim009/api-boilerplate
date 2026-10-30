import { Router } from 'express';
import {
  createTask,
  deleteTask,
  getAllTasks,
  getTaskById,
  updateTask,
} from '../controllers/task.js';
import {
  validateTaskBody,
  validateTaskId,
} from '../middlewares/task.js';

const router = Router();

router.post('/', validateTaskBody, createTask);
router.get('/', getAllTasks);
router.get('/:id', validateTaskId, getTaskById);
router.patch('/:id', validateTaskId, validateTaskBody, updateTask);
router.delete('/:id', validateTaskId, deleteTask);

export default router;
