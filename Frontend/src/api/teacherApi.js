import axiosInstance from './axiosInstance';

export const createClass = async (classData) => {
  try {
    const response = await axiosInstance.post('/teacher/create-class', classData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create class');
  }
};

export const getClasses = async () => {
  try {
    const response = await axiosInstance.get('/teacher/classes');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch classes');
  }
};

export const getClassDetails = async (classId) => {
  try {
    const response = await axiosInstance.get(`/teacher/classes/${classId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch class details');
  }
};

export const uploadStudentCsv = async (classId, file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await axiosInstance.post(`/teacher/classes/${classId}/upload-students`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to upload CSV');
  }
};

export const deleteClass = async (classId) => {
  try {
    const response = await axiosInstance.delete(`/teacher/classes/${classId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete class');
  }
};

export const deleteStudent = async (classId, studentId) => {
  try {
    const response = await axiosInstance.delete(`/teacher/classes/${classId}/students/${studentId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete student');
  }
};

// Activity Management
export const createActivity = async (activityData) => {
  try {
    const response = await axiosInstance.post('/teacher/activities', activityData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create activity');
  }
};

export const getActivities = async (classId = null) => {
  try {
    const url = classId ? `/teacher/activities?classId=${classId}` : '/teacher/activities';
    const response = await axiosInstance.get(url);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch activities');
  }
};

export const deleteActivity = async (activityId) => {
  try {
    const response = await axiosInstance.delete(`/teacher/activities/${activityId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete activity');
  }
};

export const downloadActivityTemplate = async (activityId) => {
  try {
    const response = await axiosInstance.get(`/teacher/activities/${activityId}/template`, {
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to download template');
  }
};

export const uploadActivityMarks = async (activityId, file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axiosInstance.post(`/teacher/activities/${activityId}/upload-marks`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to upload marks');
  }
};

export const getActivitySubmissions = async (activityId) => {
  try {
    const response = await axiosInstance.get(`/teacher/activities/${activityId}/submissions`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch activity submissions');
  }
};

export const getActivityAnalytics = async (activityId) => {
  try {
    const response = await axiosInstance.get(`/teacher/activities/${activityId}/analytics`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch activity analytics');
  }
};

export const editActivityMarks = async (activityId, submissionId, updateData) => {
  try {
    const response = await axiosInstance.patch(
      `/teacher/activities/${activityId}/submissions/${submissionId}`,
      updateData
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to edit marks');
  }
};
export const activityPerformanceData =async (activityId) => {
  try {
    const response = await axiosInstance.get(`/teacher/activities/${activityId}/analytics`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch activity performance data');  }
  };

export const getTeacherReportsSummary = async (classId = null) => {
  try {
    const url = classId && classId !== 'all' ? `/teacher/reports/summary?classId=${classId}` : '/teacher/reports/summary';
    const response = await axiosInstance.get(url);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch teacher reports summary');
  }
};

export const addStudentManually = async (classId, studentData) => {
  try {
    const response = await axiosInstance.post(`/teacher/classes/${classId}/students`, studentData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to add student');
  }
};

export const getTeacherActivities = async () => {
  try {
    const response = await axiosInstance.get('/teacher/activities');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error fetching activities');
  }
};

// Survey APIs
export const generateSurveyQuestions = async (topic) => {
  try {
    const response = await axiosInstance.post('/surveys/teacher/generate', { topic });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error generating questions');
  }
};

export const createSurvey = async (surveyData) => {
  try {
    const response = await axiosInstance.post('/surveys/teacher', surveyData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error creating survey');
  }
};

export const getTeacherSurveys = async () => {
  try {
    const response = await axiosInstance.get('/surveys/teacher');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error fetching surveys');
  }
};

export const toggleSurveyStatus = async (id) => {
  try {
    const response = await axiosInstance.put(`/surveys/teacher/${id}/toggle`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error toggling survey status');
  }
};

export const deleteSurvey = async (id) => {
  try {
    const response = await axiosInstance.delete(`/surveys/teacher/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error deleting survey');
  }
};

export const getSurveyResponses = async (id) => {
  try {
    const response = await axiosInstance.get(`/surveys/teacher/${id}/responses`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error fetching responses');
  }
};

export const getTeachersList = async () => {
  try {
    const response = await axiosInstance.get('/teacher/teachers');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch teachers');
  }
};

export const updateStudentPlacement = async (classId, studentId, placementData) => {
  try {
    const response = await axiosInstance.put(`/teacher/classes/${classId}/students/${studentId}/placement`, placementData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update student placement');
  }
};

export const getStudentReport = async (classId, studentId) => {
  try {
    const response = await axiosInstance.get(`/teacher/classes/${classId}/students/${studentId}/report`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch student report');
  }
};