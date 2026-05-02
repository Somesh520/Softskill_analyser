import axiosInstance from './axiosInstance';

export const createTeacher = async (teacherData) => {
  try {
    const response = await axiosInstance.post('/admin/add-teacher', teacherData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error assigning teacher');
  }
};