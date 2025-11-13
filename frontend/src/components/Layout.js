import { useState, useEffect } from 'react';
import Sidebar from './Sidebar.js';
import TopNavbar from './TopNavbar.js';
import MobileNav from './MobileNav.js';

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
    <div className="relative flex min-h-screen overflow-hidden bg-surface-tint">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.18),transparent_55%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.12),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-[0.035] [background-image:url('data:image/svg+xml,%3Csvg width=%2760%27 height=%2760%27 viewBox=%270 0 60 60%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cg fill=%27%23a3bffa%27 fill-opacity=%270.45%27%3E%3Cpath d=%27M0 57a3 3 0 1 1 6 0 3 3 0 0 1-6 0zm27-27a3 3 0 1 1 6 0 3 3 0 0 1-6 0zm27-27a3 3 0 1 1 6 0 3 3 0 0 1-6 0z%27/%3E%3C/g%3E%3C/svg%3E')] dark:opacity-[0.06]" />

      <TopNavbar onToggleSidebar={handleToggleSidebar} />
      <Sidebar isOpen={isSidebarOpen} onClose={handleCloseSidebar} />

      {isSidebarOpen && (
        <div
          role="presentation"
          className="fixed inset-0 z-[140] bg-neutral-900/40 backdrop-blur-sm transition-opacity duration-300 ease-out lg:hidden"
          onClick={handleCloseSidebar}
        />
      )}

      <main
        id="main-content"
        tabIndex={-1}
        role="main"
        aria-label="Main content"
        className="relative z-10 flex-1 px-4 pt-24 pb-[calc(6.5rem+env(safe-area-inset-bottom))] text-text transition-[margin] duration-300 ease-out focus:outline-none sm:px-6 md:px-8 lg:ml-64 lg:px-8 lg:pb-20 lg:pt-28 xl:ml-72 xl:px-6 2xl:px-8"
      >
        <div className="mx-auto w-full max-w-[900px] md:max-w-[1000px] lg:max-w-[1100px] xl:max-w-[1200px] 2xl:max-w-[1280px]">{children}</div>
      </main>
      <MobileNav />
    </div>
  );
};

export default Layout;
