import express from'express';
import dotenv from 'dotenv/config';
import cors from'cors';
import connectDB  from'./config/db.js';
import authRoutes  from './routes/authRoutes.js';

// dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);

app.get('/health', (req, res) => res.json({ status: 'Auth Service running' }));

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => console.log(`Auth Service running on port ${PORT}`));