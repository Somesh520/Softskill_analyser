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