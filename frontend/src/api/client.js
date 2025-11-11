import axios from 'axios'; //Axios API Client Setup sabhi API calls ke liye use hoti 


const rawApiUrl = import.meta.env.VITE_API_URL || 'https://clientdocs.onrender.com/api';
const API_URL = rawApiUrl.endsWith('/api')
  ? rawApiUrl
  : `${rawApiUrl.replace(/\/$/, '')}/api`;
const apiClient = axios.create({
  baseURL: API_URL,  // Base URL - har request me ye automatically add hoga
  headers: {
    'Content-Type': 'application/json'  // Default header - JSON data bhejenge
  }
});
/**
 * Request Interceptor - Har request se pehle execute hota hai
 * Ye interceptor automatically har request me JWT token add karta hai
 * 1. localStorage se token fetch karo
 * 2. Agar token hai, to Authorization header me add karo
 * 3. Request forward karo
 */
apiClient.interceptors.request.use(  
  (config) => {
    // localStorage se token get karo (login ke time save hua tha)
    const token = localStorage.getItem('token');
    
    // Agar token hai, to Authorization header me add karo
    // Format: "Authorization: Bearer <token>"
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Modified config return karo (token ke saath)
    return config;
  },
  (error) => {
    // Request me error aayi to reject karo
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor - Har response ke baad execute hota hai
 * Ye interceptor errors handle karta hai:
 * - 401 errors (unauthorized) - automatic logout
 * - Other errors - error message preserve karta hai
 * 1. Response receive karo
 * 2. Success case: response.data return karo (data extract karke)
 * 3. Error case: Check karo status code
 * 4. 401 error: Token invalid/expired - logout karo
 * 5. Other errors: Error message return karo
 */
apiClient.interceptors.response.use(
  // Success case - response.data return karo (sirf data part)
  (response) => response.data,
  
  // Error case - error handle karo
  (error) => {
    // 401 Unauthorized - Token invalid ya expired
    if (error.response?.status === 401) {
      // Token expired/invalid - logout karo
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Login page pe redirect karo
      window.location.href = '/login';
    }
    
    // Error data extract karo (backend se aaya error message)
    // error.response?.data - backend se aaya error
    // error.message - network error ya other errors
    const errorData = error.response?.data || { message: error.message };
    
    // Error reject karo - caller ko error mil jayega
    return Promise.reject({
      ...errorData,
      message: errorData.message || error.message,
      status: error.response?.status
    });
  }
);

// API client export karo - sabhi API files me use hoga
export default apiClient;
