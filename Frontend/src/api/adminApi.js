import axiosInstance from './axiosInstance';

export const createTeacher = async (teacherData) => {
  try {
    const response = await axiosInstance.post('/admin/add-teacher', teacherData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error assigning teacher');
  }
};

export const getAdminDashboardStats = async () => {
  try {
    const response = await axiosInstance.get('/admin/dashboard-stats');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error fetching admin dashboard stats');
  }
};

// --- SURVEY APIs ---

export const getAdminSurveys = async () => {
  try {
    const response = await axiosInstance.get('/surveys/admin');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error fetching surveys');
  }
};

export const createAdminSurvey = async (surveyData) => {
  try {
    const response = await axiosInstance.post('/surveys/admin', surveyData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error creating survey');
  }
};

export const toggleAdminSurveyStatus = async (id) => {
  try {
    const response = await axiosInstance.put(`/surveys/admin/${id}/toggle`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error toggling survey status');
  }
};

export const deleteAdminSurvey = async (id) => {
  try {
    const response = await axiosInstance.delete(`/surveys/admin/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error deleting survey');
  }
};

export const getAdminSurveyResponses = async (id) => {
  try {
    const response = await axiosInstance.get(`/surveys/admin/${id}/responses`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error fetching responses');
  }
};

export const generateAdminSurveyQuestions = async (topic) => {
  try {
    const response = await axiosInstance.post('/surveys/admin/generate', { topic });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error generating questions');
  }
};

export const getAllClasses = async () => {
  try {
    const response = await axiosInstance.get('/admin/classes');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error fetching classes');
  }
};

export const getTeachers = async () => {
  try {
    const response = await axiosInstance.get('/admin/teachers');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error fetching teachers');
  }
};

export const deleteTeacher = async (id) => {
  try {
    const response = await axiosInstance.delete(`/admin/teachers/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error removing teacher');
  }
};

export const getStudents = async () => {
  try {
    const response = await axiosInstance.get('/admin/students');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error fetching students');
  }
};

// Analytics APIs
export const getCollegeAnalytics = async (filters = {}) => {
  try {
    const query = new URLSearchParams(filters).toString();
    const res = await axiosInstance.get(`/admin/analytics/college${query ? `?${query}` : ''}`);
    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch college analytics');
  }
};

export const getClassPerformance = async (filters = {}) => {
  try {
    const query = new URLSearchParams(filters).toString();
    const res = await axiosInstance.get(`/admin/analytics/class-performance${query ? `?${query}` : ''}`);
    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch class performance');
  }
};

export const getDepartmentAnalytics = async (filters = {}) => {
  try {
    const query = new URLSearchParams(filters).toString();
    const res = await axiosInstance.get(`/admin/analytics/departments${query ? `?${query}` : ''}`);
    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch department analytics');
  }
};

export const getPerformanceDistribution = async (filters = {}) => {
  try {
    const query = new URLSearchParams(filters).toString();
    const res = await axiosInstance.get(`/admin/analytics/performance-distribution${query ? `?${query}` : ''}`);
    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch performance distribution');
  }
};

export const getActivityAnalytics = async (filters = {}) => {
  try {
    const query = new URLSearchParams(filters).toString();
    const res = await axiosInstance.get(`/admin/analytics/activities${query ? `?${query}` : ''}`);
    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch activity analytics');
  }
};

export const getAnalyticsFilters = async () => {
  try {
    const res = await axiosInstance.get('/admin/analytics/filters');
    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch filters');
  }
};

export const getLogs = async () => {
  try {
    const response = await axiosInstance.get('/admin/logs');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error fetching logs');
  }
};