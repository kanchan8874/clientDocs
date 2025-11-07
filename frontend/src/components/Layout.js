import React from 'react';
import Sidebar from './Sidebar.js';
import TopNavbar from './TopNavbar.js';


const Layout = ({ children }) => {
  return (
    <div className="flex min-h-screen">
      <TopNavbar />
      <Sidebar />
      <main 
        id="main-content"
        tabIndex={-1}
        className="ml-60 mt-20 flex-1 p-8 max-w-[calc(100vw-15rem)] overflow-x-hidden bg-white text-slate-900 outline-none min-h-[calc(100vh-5rem)] focus:outline-none focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-4 md:ml-60 md:mt-20 md:max-w-[calc(100vw-15rem)] md:p-8"
        role="main"
        aria-label="Main content"
      >
        {children}
      </main>
    </div>
  );
};

export default Layout;
