import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.js';  // Authentication context
import PrivateRoute from './components/PrivateRoute.js';    // Protected routes component
import SkipToContent from './components/SkipToContent.js';  // Accessibility component

// Page components import karo
import Login from './pages/Login.js';       // Login page
import Register from './pages/Register.js';  // Registration page
import Dashboard from './pages/Dashboard.js'; // Dashboard page
import Clients from './pages/Clients.js';    // Clients management page
import Documents from './pages/Documents.js'; // Documents management page


 //App Component - Main Application Component Ye component sabhi routes define karta hai aur authentication context provide karta hai

function App() {
  return (

    <AuthProvider>
      {/* Router - URL routing handle karta hai */}
      <Router>
        {/* SkipToContent - Accessibility feature (keyboard users ke liye) */}
        <SkipToContent />
        
        {/* Routes - Different URLs ke liye components define karte hain */}
        <Routes>
          
          {/* Login Page - /login URL pe Login component render hoga */}
          <Route path="/login" element={<Login />} />
          
          {/* Registration Page - /register URL pe Register component render hoga */}
          <Route path="/register" element={<Register />} />
          
          
          {/* Dashboard Page - /dashboard URL pe Dashboard component render hoga
              PrivateRoute - Check karega ki user logged in hai ya nahi
              Agar nahi hai, to /login pe redirect kar dega */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          
          {/* Clients Page - /clients URL pe Clients component render hoga */}
          <Route
            path="/clients"
            element={
              <PrivateRoute>
                <Clients />
              </PrivateRoute>
            }
          />
          
          {/* Documents Page - /documents URL pe Documents component render hoga */}
          <Route
            path="/documents"
            element={
              <PrivateRoute>
                <Documents />
              </PrivateRoute>
            }
          />
          
          
          {/* Root Route (/) - Agar user / pe jaye, to /dashboard pe redirect kar do
              replace - Browser history me replace karega (back button se / pe nahi jayega) */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
