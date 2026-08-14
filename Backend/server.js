import dotenv from 'dotenv';
dotenv.config();
import helmet from 'helmet';
import express from 'express';
import os from "os";
import cookieParser from 'cookie-parser';
import cors from 'cors';
import connectDB from './src/Config/db.js';
import authRoutes from './src/Routes/authRoutes.js';
import adminRoutes from './src/Routes/adminRoutes.js';
import teacherRoutes from './src/Routes/teacherRoutes.js';
import studentRoutes from './src/Routes/studentRoutes.js';
import leaderboardRoutes from './src/Routes/leaderboardRoutes.js';
import surveyRoutes from './src/Routes/surveyRoutes.js';
import morgan from 'morgan';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cookieParser());
app.use(helmet());
app.use(morgan("combined"));

// Database connection
connectDB();

// CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
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

// Middleware to normalize duplicate slashes in request URLs
app.use((req, res, next) => {
  if (req.url.includes('//')) {
    // Replace multiple consecutive slashes with a single slash
    req.url = req.url.replace(/\/+/g, '/');
  }
  next();
});

// app.use('/api/auth',authRoutes);

// all routes will be prefixed with /api/auth
app.use('/api/auth', authRoutes);

// Admin-specific routes
app.use('/api/admin', adminRoutes);

// Teacher-specific routes
app.use('/api/teacher', teacherRoutes);

// Student-specific routes
app.use('/api/student', studentRoutes);

// Leaderboard-specific routes
app.use('/api/leaderboard', leaderboardRoutes);

// Survey-specific routes
app.use('/api/surveys', surveyRoutes);

app.get('/', (req, res) => {
  res.send('soft skill analyser backend is running');
});
// health check endpoint to check if the server is running fine or not

app.get("/api/health", (req, res) => {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;

  res.json({
    status: "UP",
    uptimeSeconds: Math.floor(process.uptime()),
    system: {
      cpuCount: os.cpus().length,
      loadAvg1m: os.loadavg()[0],
      totalRamMB: (totalMem / 1024 / 1024).toFixed(0),
      usedRamMB: (usedMem / 1024 / 1024).toFixed(0),
      ramUsagePercent: `${((usedMem / totalMem) * 100).toFixed(1)}%`,
    },
  });
});



//basic server file 

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export default app;

