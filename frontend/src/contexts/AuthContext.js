import { createContext, useState, useContext, useEffect } from 'react';
import { login as loginApi, register as registerApi, logout as logoutApi } from '../api/auth.js';


const AuthContext = createContext();

export const useAuth = () => {
  // Context se value le lo
  const context = useContext(AuthContext);
  
  // Agar context nahi mila (AuthProvider ke bahar use kiya), to error throw karo
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};


export const AuthProvider = ({ children }) => {
  
  const [user, setUser] = useState(null);
  
  // Loading state - initial check kar rahe hain (localStorage se token check)
  const [loading, setLoading] = useState(true);
  
  // Error state - koi error aayi to store karega
  const [error, setError] = useState(null);

  useEffect(() => {
    const initAuth = async () => {
      // localStorage se token aur user info fetch karo
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      // Agar token aur user info dono hai, to user logged in hai
      if (token && storedUser) {
        try {
          // storedUser JSON string hai, ise parse karo
          setUser(JSON.parse(storedUser));
        } catch (err) {
          // Agar parse me error aayi, to localStorage clear karo
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      
      // Loading false karo - initial check complete
      setLoading(false);
    };

    // Initial auth check run karo
    initAuth();
  }, []); // Empty dependency array - sirf mount pe run hoga

  const register = async (userData) => {
    try {
      // Error clear karo
      setError(null);
      
      // Backend API call - user registration
      const response = await registerApi(userData);
      
      // API client interceptor returns response.data
      // Backend response: { success: true, data: { token, user } }
      // After interceptor: { success: true, data: { token, user } }
      const responseData = response.data || response;
      const { token, user: newUser } = responseData;
      
      // Validate response structure
      if (!token || !newUser) {
        throw new Error('Invalid response from server. Missing token or user data.');
      }

      // Token aur user info localStorage me save karo (persistent storage)
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(newUser));
      
      // User state update karo (React state)
      setUser(newUser);

      // Success return karo
      return { success: true };
    } catch (err) {
      // Error aayi - detailed error message extract karo
      let errorMessage = 'Registration failed';
      
      if (err?.isNetworkError) {
        errorMessage = 'Unable to connect to server. Please ensure the backend server is running on http://localhost:5000';
      } else if (err.message) {
        errorMessage = err.message;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.errors?.[0]?.message) {
        errorMessage = err.response.data.errors[0].message;
      }
      
      // Error state me store karo
      setError(errorMessage);
      
      // Error return karo
      return { success: false, error: errorMessage };
    }
  };


  const login = async (credentials) => {
    try {
      // Error clear karo
      setError(null);
      
      // Backend API call - user login
      const response = await loginApi(credentials);
      
      // API client interceptor returns response.data
      // Backend response: { success: true, data: { token, user } }
      // After interceptor: { success: true, data: { token, user } }
      const responseData = response.data || response;
      const { token, user: loggedInUser } = responseData;

      // Validate response structure
      if (!token || !loggedInUser) {
        throw new Error('Invalid response from server. Missing token or user data.');
      }

      // Token aur user info localStorage me save karo
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(loggedInUser));
      // Last login time save karo
      localStorage.setItem('lastLogin', new Date().toISOString());
      
      // User state update karo
      setUser(loggedInUser);

      // Success return karo
      return { success: true };
    } catch (err) {
      // Error aayi - detailed error message extract karo
      let errorMessage = 'Login failed.';
      
      if (err?.isNetworkError) {
        errorMessage = 'Unable to connect to server. Please ensure the backend server is running on http://localhost:5000';
      } else if (err.message) {
        errorMessage = err.message;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      
      // Error state me store karo
      setError(errorMessage);
      
      // Error return karo
      return { success: false, error: errorMessage };
    }
  };

  
  const logout = async () => {
    try {
      // Backend API call - logout (optional, server ko inform karna)
      await logoutApi();
    } catch (error) {
      // Agar API call fail ho (401, network error, etc.), to bhi continue karo
      // Logout hamesha succeed hona chahiye, chahe API call fail ho ya na ho
      console.warn('Logout API call failed, but continuing with local logout:', error);
    } finally {
      // Hamesha localStorage clear karo (API call success/fail dono me)
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('lastLogin');
      
      // State clear karo
      setUser(null);
      setError(null);
    }
  };

  
  // Context me provide karne ke liye value object
  const value = {
    user,              // Current user (null = not logged in)
    loading,           // Loading state
    error,             // Error message
    register,          // Registration function
    login,             // Login function
    logout,            // Logout function
    isAuthenticated: !!user  // Boolean - user logged in hai ya nahi
  };

  // Context Provider return karo - sabhi children components ko value provide karega
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
