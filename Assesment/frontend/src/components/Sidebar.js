import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, FileText, X } from 'lucide-react';
import Logo from './Logo.js';

/**
 * Accessible Sidebar Navigation Component
 * WCAG 2.2 Level AA Compliant & Fully Responsive
 * 
 * Features:
 * - Semantic nav element
 * - ARIA labels and current page indication
 * - Keyboard navigation support
 * - Minimum touch target sizes
 * - Mobile-responsive with overlay
 */
const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Users, label: 'Clients', path: '/clients' },
    { icon: FileText, label: 'Documents', path: '/documents' }
  ];

  const handleKeyDown = (e, path) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      navigate(path);
      setSidebarOpen?.(false);
    }
  };

  const handleNavClick = (path) => {
    navigate(path);
    setSidebarOpen?.(false);
  };

  return (
    <aside 
      className={`
        fixed lg:static inset-y-0 left-0 z-[100]
        w-60 lg:w-60
        h-screen
        bg-white border-r border-gray-200
        overflow-y-auto overflow-x-hidden
        flex flex-col shadow-lg lg:shadow-none
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}
      aria-label="Main navigation"
    >
      <div className="p-4 sm:p-6 border-b border-gray-200 bg-white sticky top-0 z-10 flex items-center justify-between lg:justify-start">
        <Logo size="md" />
        <button
          onClick={() => setSidebarOpen?.(false)}
          aria-label="Close navigation menu"
          className="lg:hidden ml-auto p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 min-w-[2.75rem] min-h-[2.75rem] flex items-center justify-center"
        >
          <X size={20} aria-hidden="true" className="text-gray-600" />
        </button>
      </div>
      <nav 
        className="flex-1 p-3 sm:p-4 overflow-y-auto"
        aria-label="Primary navigation"
        role="navigation"
      >
        <ul className="list-none m-0 p-0 flex flex-col gap-1" role="list">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <li key={item.path} role="listitem">
                <button
                  onClick={() => handleNavClick(item.path)}
                  onKeyDown={(e) => handleKeyDown(e, item.path)}
                  aria-current={isActive ? 'page' : undefined}
                  aria-label={`Navigate to ${item.label}${isActive ? ' (current page)' : ''}`}
                  className={`
                    flex items-center w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-transparent border-none rounded-lg cursor-pointer
                    text-sm sm:text-[0.9375rem] transition-all duration-200 text-left min-h-[2.75rem] outline-none relative
                    focus:outline-none focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2
                    ${isActive 
                      ? 'bg-primary-light text-primary' 
                      : 'text-gray-800 hover:bg-primary-light/60'
                    }
                  `.trim().replace(/\s+/g, ' ')}
                >
                  <Icon 
                    size={20} 
                    aria-hidden="true"
                    className={`mr-3 sm:mr-4 flex-shrink-0 ${isActive ? 'text-primary' : 'text-gray-600'}`}
                  />
                  <span className={`text-sm sm:text-[0.9375rem] leading-tight tracking-tight ${isActive ? 'text-primary font-semibold' : 'text-gray-800 font-medium'}`}>
                    {item.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
