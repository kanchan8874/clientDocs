import React, { useState } from 'react';
import Sidebar from './Sidebar.js';
import TopNavbar from './TopNavbar.js';

/**
 * Main Layout Component
 * WCAG 2.2 Level AA Compliant & Fully Responsive
 * 
 * Uses semantic HTML structure with proper ARIA landmarks
 * Responsive design: mobile-first approach with breakpoints
 */
const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <TopNavbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <main 
        id="main-content"
        tabIndex={-1}
        className="w-full flex-1 transition-all duration-300 ease-in-out bg-gray-50 min-h-screen pt-16 pb-8 px-4 sm:px-6 md:px-8 lg:pl-[15rem] lg:pr-8 outline-none"
        role="main"
        aria-label="Main content"
      >
        <div className="max-w-[87.5rem] mx-auto w-full">
          {children}
        </div>
      </main>
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-[90] lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
};

export default Layout;
