import axiosInstance from './axiosInstance';

export const createTeacher = async (teacherData) => {
  try {
    const response = await axiosInstance.post('/admin/add-teacher', teacherData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error assigning teacher');
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
export const getCollegeAnalytics = async () => {
  try {
    const response = await axiosInstance.get('/admin/analytics/college');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch college analytics');
  }
};

export const getClassPerformance = async () => {
  try {
    const response = await axiosInstance.get('/admin/analytics/class-performance');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch class performance');
  }
};

export const getDepartmentAnalytics = async () => {
  try {
    const response = await axiosInstance.get('/admin/analytics/departments');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch department analytics');
  }
};

export const getPerformanceDistribution = async () => {
  try {
    const response = await axiosInstance.get('/admin/analytics/performance-distribution');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch performance distribution');
  }
};

export const getActivityAnalytics = async () => {
  try {
    const response = await axiosInstance.get('/admin/analytics/activities');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch activity analytics');
  }
};