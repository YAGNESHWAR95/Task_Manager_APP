import {Task} from '../models/task.js'; // Note the .js extension!

export const getAllTasks = async (req, res) => {
    try {
        // Enforce user scoping
        let query = { user: req.user.id };

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
        // Bind the task to the authenticated user's ID
        const newTask = await Task.create({ ...req.body, user: req.user.id });
        res.status(201).json(newTask);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteTask = async (req, res) => {
    try {
        // Locate and delete only if it belongs to the authenticated user
        const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user.id });
        if (!task) {
            return res.status(404).json({ message: 'Task not found or unauthorized' });
        }
        res.status(200).json({ message: 'Task deleted successfully' });
    } catch (error) {
        res.status(404).json({ message: 'Task not found' });
    }
};

export const updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        // Locate and update only if it belongs to the authenticated user
        const updatedTask = await Task.findOneAndUpdate(
            { _id: id, user: req.user.id },
            req.body,
            { new: true }
        );
        if (!updatedTask) {
            return res.status(404).json({ message: 'Task not found or unauthorized' });
        }
        res.status(200).json(updatedTask);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};