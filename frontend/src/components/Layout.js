import { useState, useEffect } from 'react';
import Sidebar from './Sidebar.js';
import TopNavbar from './TopNavbar.js';

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleToggleSidebar = () => {
    setIsSidebarOpen((previous) => !previous);
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsSidebarOpen(false);
      }
    };

    if (isSidebarOpen) {
      window.addEventListener('keydown', handleEscape);
    }

    return () => window.removeEventListener('keydown', handleEscape);
  }, [isSidebarOpen]);

  return (
    <div className="relative flex min-h-screen bg-slate-50/80">
      <TopNavbar onToggleSidebar={handleToggleSidebar} />
      <Sidebar isOpen={isSidebarOpen} onClose={handleCloseSidebar} />

      {isSidebarOpen && (
        <div
          role="presentation"
          className="fixed inset-0 z-[140] bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 ease-out lg:hidden"
          onClick={handleCloseSidebar}
        />
      )}

      <main
        id="main-content"
        tabIndex={-1}
        role="main"
        aria-label="Main content"
        className="relative z-0 flex-1 px-4 pt-24 pb-12 text-slate-900 transition-[margin] duration-300 ease-out focus:outline-none sm:px-6 lg:ml-60 lg:px-10 lg:pt-24"
      >
        {children}
      </main>
    </div>
  );
};

export default Layout;
