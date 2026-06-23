import express from 'express';
import rateLimit from 'express-rate-limit';
import { loginUser, forgotPassword, resetPassword, refreshToken, logoutUser } from '../Controller/authController.js';

const router = express.Router();

// Define a rate limiter for auth routes



router.post('/login', loginUser);
router.post('/refresh-token', refreshToken);
router.post('/logout', logoutUser);

// Password Reset Routes
router.post('/forgot-password', forgotPassword);
router.post('/reset-password',  resetPassword);

export default router;