
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.js';  // Authentication state access karne ke liye



const PrivateRoute = ({ children }) => {
  // Authentication state se isAuthenticated aur loading le lo
  const { isAuthenticated, loading } = useAuth();

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

  // Agar user logged in hai, to children component render karo
  // Agar nahi hai, to /login pe redirect karo
  // replace - Browser history me replace karega (back button se protected route pe nahi jayega)
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;
