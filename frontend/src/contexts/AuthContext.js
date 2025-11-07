import React, { createContext, useState, useContext, useEffect } from 'react';
// API functions import karo
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
      
      // Response se token aur user info extract karo
      const { token, user: newUser } = response.data;

      // Token aur user info localStorage me save karo (persistent storage)
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(newUser));
      
      // User state update karo (React state)
      setUser(newUser);

      // Success return karo
      return { success: true };
    } catch (err) {
      // Error aayi - detailed error message extract karo
      const errorMessage = err.message || 
                          err.response?.data?.message || 
                          err.response?.data?.errors?.[0]?.message ||
                          'Registration failed';
      
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
      
      // Response se token aur user info extract karo
      const { token, user: loggedInUser } = response.data;

      // Token aur user info localStorage me save karo
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(loggedInUser));
      
      // User state update karo
      setUser(loggedInUser);

      // Success return karo
      return { success: true };
    } catch (err) {
      // Error aayi - error message extract karo
      const errorMessage = err.message || 'Login failed';
      
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
      // Agar API call fail ho, to bhi localStorage clear karna hai
      // Finally block me hoga
    } finally {
      // Hamesha localStorage clear karo (API call success/fail dono me)
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
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
