import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import taskRoutes from './routes/taskRoutes.js'; // .js is mandatory
import authRoutes from './routes/authRoutes.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

const PORT = process.env.PORT;

mongoose.connect(process.env.MONGO_URI)
    .then(() => app.listen(PORT, () => console.log(`Server running on port ${PORT}`)))
    .catch(err => console.log(err));