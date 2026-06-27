import express from 'express';
const router = express.Router();

// Destructured import - MUST include .js extension
import { getAllTasks, createTask, deleteTask, updateTask } from '../controllers/taskController.js';

router.get('/', getAllTasks);
router.post('/', createTask);
router.patch('/:id', updateTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

export default router;