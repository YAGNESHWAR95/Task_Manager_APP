import {Task} from '../models/task.js'; // Note the .js extension!

export const getAllTasks = async (req, res) => {
    try {
        let query = {};

        // 1. Completion status filter (uses compound index: completed + priority + createdAt)
        if (req.query.completed !== undefined && req.query.completed !== '') {
            query.completed = req.query.completed === 'true';
        }

        // 2. Priority filter (uses compound index or single-field priority index)
        if (req.query.priority && req.query.priority !== 'All') {
            query.priority = req.query.priority;
        }

        // 3. Optimized text search (uses the text index on title and description)
        if (req.query.search) {
            query.$text = { $search: req.query.search };
        }

        // 4. Sorting configurations
        let sortOption = { createdAt: -1 }; // default: newest first
        if (req.query.sortBy) {
            if (req.query.sortBy === 'dueDate') {
                // Sort by due date ascending (closest deadline first), nulls last
                sortOption = { dueDate: 1, createdAt: -1 };
            } else if (req.query.sortBy === 'oldest') {
                sortOption = { createdAt: 1 };
            } else if (req.query.sortBy === 'newest') {
                sortOption = { createdAt: -1 };
            } else if (req.query.sortBy === 'priority') {
                // Map priorities High -> Medium -> Low for sorting. 
                // In MongoDB we can sort alphabetically (High, Low, Medium), but for clean priority sort:
                sortOption = { priority: 1, createdAt: -1 };
            }
        }

        // Execute query with optimized indexes
        const tasks = await Task.find(query).sort(sortOption);
        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createTask = async (req, res) => {
    try {
        const newTask = await Task.create(req.body);
        res.status(201).json(newTask);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteTask = async (req, res) => {
    try {
        await Task.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Task deleted successfully' });
    } catch (error) {
        res.status(404).json({ message: 'Task not found' });
    }
};

export const updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedTask = await Task.findByIdAndUpdate(id, req.body, { new: true });
        res.status(200).json(updatedTask);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};