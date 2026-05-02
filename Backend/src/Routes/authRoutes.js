import express from 'express';
import rateLimit from 'express-rate-limit';
import { loginUser, forgotPassword, resetPassword } from '../Controller/authController.js';

const router = express.Router();

// Define a rate limiter for auth routes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 requests per windowMs
    message: { message: 'Too many login attempts, please try again after 15 minutes' },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Route to log in (works for Admin, Teacher, and Student)
router.post('/login', authLimiter, loginUser);

// Password Reset Routes
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password', authLimiter, resetPassword);

export default router;