import axios from 'axios';

// Create an Axios instance
const axiosInstance = axios.create({
  baseURL: '/api', 
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true // Important for cookies/CORS
});

// Request interceptor: Attach token to headers for stateless auth
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // Assuming Bearer token structure
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
