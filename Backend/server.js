import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import connectDB from './src/Config/db.js';
import authRoutes from './src/Routes/authRoutes.js';
import adminRoutes from './src/Routes/adminRoutes.js';
import teacherRoutes from './src/Routes/teacherRoutes.js';
import studentRoutes from './src/Routes/studentRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// Database connection
connectDB();

// CORS configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('CORS Blocked Origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));


// app.use('/api/auth',authRoutes);

// all routes will be prefixed with /api/auth
app.use('/api/auth', authRoutes);

// Admin-specific routes
app.use('/api/admin', adminRoutes);

// Teacher-specific routes
app.use('/api/teacher', teacherRoutes);

// Student-specific routes
app.use('/api/student', studentRoutes);

app.get('/', (req, res) => {
  res.send('soft skill analyser backend is running');
});
// health check endpoint to check if the server is running fine or not

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});



//basic server file 

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

