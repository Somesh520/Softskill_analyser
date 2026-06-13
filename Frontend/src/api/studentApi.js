import axiosInstance from './axiosInstance';

export const getStudentDashboardSummary = async () => {
  try {
    const response = await axiosInstance.get('/student/dashboard/summary');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch student dashboard summary');
  }
};
