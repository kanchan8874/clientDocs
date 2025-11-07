/**
 * AUTHCONTEXT.JS - Authentication Context (Global State Management)
 * 
 * Yeh file authentication state ko globally manage karti hai.
 * 
 * Features:
 * - User login/logout state
 * - User information (name, email, etc.)
 * - Login, register, logout functions
 * - Token management (localStorage)
 * 
 * React Context API use karta hai - props drilling se bachne ke liye
 * 
 * Flow:
 * 1. AuthProvider - Sabhi components ko authentication state provide karta hai
 * 2. useAuth() hook - Components me authentication state access karne ke liye
 * 3. localStorage - Token aur user info store karta hai
 */

import React, { createContext, useState, useContext, useEffect } from 'react';
// API functions import karo
import { login as loginApi, register as registerApi, logout as logoutApi } from '../api/auth.js';

/**
 * AuthContext - React Context create karo
 * 
 * Ye context authentication state provide karega
 */
const AuthContext = createContext();

/**
 * useAuth() - Custom Hook
 * 
 * Ye hook components me authentication state access karne ke liye use hota hai
 * 
 * Usage:
 * const { user, login, logout, isAuthenticated } = useAuth();
 * 
 * @returns {Object} Authentication state aur functions
 */
export const useAuth = () => {
  // Context se value le lo
  const context = useContext(AuthContext);
  
  // Agar context nahi mila (AuthProvider ke bahar use kiya), to error throw karo
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

/**
 * AuthProvider - Authentication Context Provider
 * 
 * Ye component sabhi child components ko authentication state provide karta hai
 * 
 * State:
 * - user: Current logged in user info (null = not logged in)
 * - loading: Loading state (initial check kar rahe hain)
 * - error: Error message (agar koi error aaye)
 * 
 * Functions:
 * - register(): User registration
 * - login(): User login
 * - logout(): User logout
 * - isAuthenticated: Boolean (user logged in hai ya nahi)
 */
export const AuthProvider = ({ children }) => {
  // ============================================
  // STATE MANAGEMENT
  // ============================================
  
  // Current user state - null = not logged in, object = logged in user
  const [user, setUser] = useState(null);
  
  // Loading state - initial check kar rahe hain (localStorage se token check)
  const [loading, setLoading] = useState(true);
  
  // Error state - koi error aayi to store karega
  const [error, setError] = useState(null);

  // ============================================
  // INITIAL AUTH CHECK (Component Mount pe)
  // ============================================
  
  /**
   * useEffect - Component mount hone pe execute hota hai
   * 
   * Ye function check karta hai ki user pehle se logged in hai ya nahi
   * (localStorage me token hai ya nahi)
   * 
   * Flow:
   * 1. localStorage se token aur user info check karo
   * 2. Agar dono hai, to user state me set karo
   * 3. Loading false karo
   */
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

  // ============================================
  // AUTHENTICATION FUNCTIONS
  // ============================================
  
  /**
   * register() - User Registration Function
   * 
   * Flow:
   * 1. registerApi() call karo (backend API)
   * 2. Response me token aur user info milega
   * 3. Token aur user info localStorage me save karo
   * 4. User state update karo
   * 5. Success return karo
   * 
   * @param {Object} userData - Registration data (name, email, password)
   * @returns {Object} { success: boolean, error?: string }
   */
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

  /**
   * login() - User Login Function
   * 
   * Flow:
   * 1. loginApi() call karo (backend API)
   * 2. Response me token aur user info milega
   * 3. Token aur user info localStorage me save karo
   * 4. User state update karo
   * 5. Success return karo
   * 
   * @param {Object} credentials - Login credentials (email, password)
   * @returns {Object} { success: boolean, error?: string }
   */
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

  /**
   * logout() - User Logout Function
   * 
   * Flow:
   * 1. Backend API call (optional - server ko inform karna)
   * 2. localStorage clear karo (token aur user info remove)
   * 3. User state clear karo (null set karo)
   * 4. Error state clear karo
   * 
   * Note: JWT tokens stateless hain - server me store nahi hote
   * LocalStorage se remove karna hi sufficient hai
   */
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

  // ============================================
  // CONTEXT VALUE
  // ============================================
  
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
