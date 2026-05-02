import axiosInstance from './axiosInstance';

export const loginUser = async (credentials) => {
  try {
    const response = await axiosInstance.post('/auth/login', credentials);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network Error' };
  }
};

export const forgotPassword = async (email) => {
  try {
    const response = await axiosInstance.post('/auth/forgot-password', { email });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network Error' };
  }
};

export const resetPassword = async (email, otp, newPassword) => {
  try {
    const response = await axiosInstance.post('/auth/reset-password', { email, otp, newPassword });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network Error' };
  }
};
