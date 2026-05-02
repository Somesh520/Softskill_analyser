import axiosInstance from './axiosInstance';

export const loginUser = async (credentials) => {
  try {
    const response = await axiosInstance.post('/auth/login', credentials);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network Error' };
  }
};

export const forgotPassword = async (email, turnstileToken) => {
  try {
    const response = await axiosInstance.post('/auth/forgot-password', { email, turnstileToken });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network Error' };
  }
};

export const resetPassword = async (email, otp, newPassword, turnstileToken) => {
  try {
    const response = await axiosInstance.post('/auth/reset-password', { email, otp, newPassword, turnstileToken });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network Error' };
  }
};
