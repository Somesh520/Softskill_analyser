import axiosInstance from './axiosInstance';

export const getLeaderboard = async (limit = 20) => {
  try {
    const response = await axiosInstance.get(`/leaderboard?limit=${limit}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch leaderboard');
  }
};

export const getLeaderboardInsights = async () => {
  try {
    const response = await axiosInstance.get('/leaderboard/insights');
    return response.data.insights;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch AI insights');
  }
};
