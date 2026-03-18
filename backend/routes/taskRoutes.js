import express from 'express';
const router = express.Router();

// Destructured import - MUST include .js extension
import { getAllTasks, createTask, deleteTask } from '../controllers/taskController.js';

router.get('/', getAllTasks);
router.post('/', createTask);
router.delete('/:id', deleteTask);

export default router;