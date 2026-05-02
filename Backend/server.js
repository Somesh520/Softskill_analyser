import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors'
import connectDB from './src/Config/db.js';
import authRoutes from './src/Routes/authRoutes.js';
import adminRoutes from './src/Routes/adminRoutes.js';
import teacherRoutes from './src/Routes/teacherRoutes.js';

const app = express();
const PORT = 3000;
dotenv.config();
app.use(express.json());

// here we are connecting to the database and then starting the server

connectDB();




app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));


// app.use('/api/auth',authRoutes);

// all routes will be prefixed with /api/auth
app.use('/api/auth', authRoutes);

// Admin-specific routes
app.use('/api/admin', adminRoutes);

// Teacher-specific routes
app.use('/api/teacher', teacherRoutes);

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

