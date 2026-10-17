import { Router } from 'express';
import { createTask, listTasks, getTask, updateTask, deleteTask } from '../controllers/task.js';
import { validateTaskBody, validateTaskId } from '../middlewares/task.js';

const router = Router();

router.post('/', validateTaskBody('post'), createTask);
router.get('/', listTasks);
router.get('/:id', validateTaskId, getTask);
router.patch('/:id', validateTaskId, validateTaskBody('patch'), updateTask);
router.delete('/:id', validateTaskId, deleteTask);

export default router;
