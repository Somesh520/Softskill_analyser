import axios from 'axios';

// Create an Axios instance
const axiosInstance = axios.create({
  baseURL: '/api',

  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true // Important for cookies/CORS
});

// Request interceptor: Attach token to headers for stateless auth (as fallback)
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

// Response interceptor to handle token refresh on expired access token
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if the response is unauthorized/expired and request hasn't been retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      
      // Do not attempt to refresh token if the request was a login attempt
      if (originalRequest.url?.includes('/auth/login')) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return axiosInstance(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Request the backend to refresh the access token
        await axios.post('/api/auth/refresh-token', {}, { withCredentials: true });
        isRefreshing = false;
        processQueue(null);
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        processQueue(refreshError, null);
        // Clear local storage and redirect to login if refresh fails
        if (typeof window !== 'undefined') {
          localStorage.removeItem('user');
          sessionStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
