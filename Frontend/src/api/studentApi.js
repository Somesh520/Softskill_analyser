import axiosInstance from './axiosInstance';

export const getStudentDashboardSummary = async () => {
  try {
    const response = await axiosInstance.get('/student/dashboard/summary');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch student dashboard summary');
  }
};

// Survey APIs
export const getStudentSurveys = async () => {
  try {
    const response = await axiosInstance.get('/surveys/student');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error fetching surveys');
  }
};

export const submitSurvey = async (surveyId, answers) => {
  try {
    const response = await axiosInstance.post(`/surveys/student/${surveyId}`, { answers });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error submitting survey');
  }
};
