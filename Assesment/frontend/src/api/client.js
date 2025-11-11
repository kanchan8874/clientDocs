import axios from 'axios';

/**
 * API Client Service
 * 
 * Centralized axios instance for making API requests.
 * Handles authentication tokens and error responses.
 * 
 * All API calls go through this service.
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token
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

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    // Preserve error message for rate limiting
    const errorData = error.response?.data || { message: error.message };
    return Promise.reject({
      ...errorData,
      message: errorData.message || error.message,
      status: error.response?.status
    });
  }
);

export default apiClient;
