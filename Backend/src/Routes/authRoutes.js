import express from 'express';
import rateLimit from 'express-rate-limit';
import { loginUser, forgotPassword, resetPassword } from '../Controller/authController.js';

const router = express.Router();

// Define a rate limiter for auth routes


// Route to log in (works for Admin, Teacher, and Student)
router.post('/login', loginUser);

// Password Reset Routes
router.post('/forgot-password', forgotPassword);
router.post('/reset-password',  resetPassword);

export default router;