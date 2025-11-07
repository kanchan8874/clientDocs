import React from 'react';
import Sidebar from './Sidebar.js';
import TopNavbar from './TopNavbar.js';

/**
 * Main Layout Component
 * WCAG 2.2 Level AA Compliant
 * 
 * Uses semantic HTML structure with proper ARIA landmarks
 */
const Layout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <TopNavbar />
      <Sidebar />
      <main 
        id="main-content"
        tabIndex={-1}
        className="ml-60 mt-20 flex-1 p-8 max-w-[calc(100vw-15rem)] overflow-x-hidden outline-none bg-gray-50 min-h-[calc(100vh-5rem)] md:ml-60 md:mt-20 md:max-w-[calc(100vw-15rem)] md:p-8"
        role="main"
        aria-label="Main content"
      >
        {children}
      </main>
    </div>
  );
};

export default Layout;
