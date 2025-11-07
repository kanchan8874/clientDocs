/**
 * PRIVATEROUTE.JS - Protected Route Component
 * 
 * Yeh component routes ko protect karta hai - login required routes ke liye.
 * 
 * Flow:
 * 1. useAuth() hook se authentication state check karta hai
 * 2. Agar user logged in hai, to children component render karta hai
 * 3. Agar user logged in nahi hai, to /login pe redirect karta hai
 * 4. Loading state me loading spinner dikhata hai
 * 
 * Usage:
 * <PrivateRoute>
 *   <Dashboard />
 * </PrivateRoute>
 */

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.js';  // Authentication state access karne ke liye

/**
 * PrivateRoute Component
 * 
 * Ye component check karta hai ki user logged in hai ya nahi
 * Agar nahi hai, to login page pe redirect karta hai
 * 
 * @param {ReactNode} children - Protected component (jo render karna hai)
 * @returns {ReactNode} Children component ya Navigate component
 */
const PrivateRoute = ({ children }) => {
  // Authentication state se isAuthenticated aur loading le lo
  const { isAuthenticated, loading } = useAuth();

  // ============================================
  // LOADING STATE
  // ============================================
  
  // Agar abhi loading ho rahi hai (initial check), to loading spinner dikhao
  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50 font-sans text-gray-800">
        <div className="text-center flex flex-col items-center gap-4">
          {/* Loading spinner */}
          <div className="w-10 h-10 border-[3px] border-gray-300 border-t-primary rounded-full animate-spin"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // ============================================
  // AUTHENTICATION CHECK
  // ============================================
  
  // Agar user logged in hai, to children component render karo
  // Agar nahi hai, to /login pe redirect karo
  // replace - Browser history me replace karega (back button se protected route pe nahi jayega)
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;
