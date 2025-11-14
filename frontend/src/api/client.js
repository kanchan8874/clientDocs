import axios from 'axios';

const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const API_URL = rawApiUrl.endsWith('/api')
  ? rawApiUrl
  : `${rawApiUrl.replace(/\/$/, '')}/api`;

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000 // 30 seconds timeout
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const isAuthEndpoint = error.config?.url?.includes('/auth/login') || 
                          error.config?.url?.includes('/auth/register');
    
    // Handle network errors (no response from server)
    if (!error.response) {
      const networkError = {
        message: error.code === 'ECONNABORTED' 
          ? 'Request timeout. Please check if the server is running.' 
          : 'Network error. Please check your connection and ensure the backend server is running.',
        status: undefined,
        response: undefined,
        isNetworkError: true
      };
      return Promise.reject(networkError);
    }
    
    if (error.response?.status === 401 && !isAuthEndpoint) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    const errorData = error.response?.data || {};
    const errorMessage = errorData.message || error.message || 'An error occurred';
    
    return Promise.reject({
      ...errorData,
      message: errorMessage,
      status: error.response?.status,
      response: error.response
    });
  }
);

export default apiClient;
