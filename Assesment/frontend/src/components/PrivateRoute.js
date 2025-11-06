import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.js';

/**
 * Private Route Component
 * 
 * Protects routes that require authentication.
 * Redirects to login if user is not authenticated.
 */

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50 font-sans text-gray-800">
        <div className="text-center flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-[3px] border-gray-300 border-t-primary rounded-full animate-spin"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;
