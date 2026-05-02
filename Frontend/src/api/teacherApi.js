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
