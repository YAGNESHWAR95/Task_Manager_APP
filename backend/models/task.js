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
}, { 
    timestamps: true // Automatically adds createdAt and updatedAt
});

// Exporting the model as a named export
export const Task = model('Task', TaskSchema);