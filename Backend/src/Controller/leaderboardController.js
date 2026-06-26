import { getLeaderboardService, getLeaderboardInsightsService } from '../Services/leaderboardService.js';

// @desc    Get Top Students Leaderboard
// @route   GET /api/leaderboard
// @access  Private (All Authenticated Users)
export const getLeaderboard = async (req, res) => {
    try {
        const limit = req.query.limit || 20;
        const leaderboard = await getLeaderboardService(limit);
        res.status(200).json(leaderboard);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get AI Insights for Leaderboard
// @route   GET /api/leaderboard/insights
// @access  Private (All Authenticated Users)
export const getLeaderboardInsights = async (req, res) => {
    try {
        // Fetch top 5 students for the insight context
        const leaderboard = await getLeaderboardService(5);
        const insights = await getLeaderboardInsightsService(leaderboard);
        res.status(200).json({ insights });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
