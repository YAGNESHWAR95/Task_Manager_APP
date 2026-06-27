import { Schema, model } from "mongoose";

const TaskSchema = new Schema({
    title: { 
        type: String, 
        required: [true, "Title is required"], 
        trim: true 
    },
    description: { 
        type: String, 
        default: '' 
    },
    priority: { 
        type: String, 
        enum: ['Low', 'Medium', 'High'], 
        default: 'Medium' 
    },
    completed: { 
        type: Boolean, 
        default: false 
    },
    dueDate: {
        type: Date,
        default: null
    },
    tags: {
        type: [String],
        default: []
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { 
    timestamps: true // Automatically adds createdAt and updatedAt
});

// Configure indexes to optimize query performance
// 1. Text index for search functionality on title and description
TaskSchema.index({ title: 'text', description: 'text' });

// 2. Compound index to optimize queries that filter by status, priority and sort by date
TaskSchema.index({ completed: 1, priority: 1, createdAt: -1 });

// 3. Single field index for priority-only filters
TaskSchema.index({ priority: 1 });

// 4. Single field index for user scoping
TaskSchema.index({ user: 1 });

// Exporting the model as a named export
export const Task = model('Task', TaskSchema);