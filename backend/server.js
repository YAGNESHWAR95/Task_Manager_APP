import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import taskRoutes from './routes/taskRoutes.js'; // .js is mandatory
import authRoutes from './routes/authRoutes.js';

dotenv.config();

const app = express();
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, etc.)
        if (!origin) return callback(null, true);
        
        // Allow localhost and any vercel.app subdomain/domain
        if (
            origin.startsWith('http://localhost') || 
            origin.endsWith('.vercel.app')
        ) {
            callback(null, true);
        } else {
            callback(null, false);
        }
    },
    credentials: true
}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

const PORT = process.env.PORT;

mongoose.connect(process.env.MONGO_URI)
    .then(() => app.listen(PORT, () => console.log(`Server running on port ${PORT}`)))
    .catch(err => console.log(err));