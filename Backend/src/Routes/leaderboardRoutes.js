import express from 'express';
import { getLeaderboard, getLeaderboardInsights } from '../Controller/leaderboardController.js';
import { verifyToken } from '../Middlewares/authMiddleware.js';

const router = express.Router();

// Protect ALL leaderboard routes with verifyToken
router.use(verifyToken);

// Route:  GET /api/leaderboard
router.get('/', getLeaderboard);

// Route:  GET /api/leaderboard/insights
router.get('/insights', getLeaderboardInsights);

export default router;
