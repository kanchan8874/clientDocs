import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, FileText } from 'lucide-react';
import Logo from './Logo.js';


const Sidebar = () => {
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
    }
  };

  return (
    <aside 
      className="w-60 h-screen bg-white border-r border-slate-200 fixed left-0 top-0 overflow-y-auto overflow-x-hidden z-[100] flex flex-col transition-transform duration-300"
      aria-label="Main navigation"
    >
      <div className="p-6 px-5 border-b border-slate-200 bg-white sticky top-0 z-10">
        <Logo size="md" />
      </div>
      <nav 
        className="flex-1 p-4 px-3 overflow-y-auto"
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
                  onClick={() => navigate(item.path)}
                  onKeyDown={(e) => handleKeyDown(e, item.path)}
                  aria-current={isActive ? 'page' : undefined}
                  aria-label={`Navigate to ${item.label}${isActive ? ' (current page)' : ''}`}
                  className={`
                    flex items-center w-full px-4 py-3 bg-transparent border-none rounded-[12px] cursor-pointer
                    text-[0.9375rem] transition-all duration-200 text-left min-h-[44px] outline-none relative
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white
                    ${isActive 
                      ? 'bg-primary-light text-primary' 
                      : 'text-slate-900 hover:bg-primary-light/60'
                    }
                  `.trim().replace(/\s+/g, ' ')}
                >
                  <Icon 
                    size={20} 
                    aria-hidden="true"
                    className={`mr-4 flex-shrink-0 ${isActive ? 'text-primary' : 'text-slate-600'}`}
                  />
                  <span className={`text-[0.9375rem] leading-tight tracking-tight ${isActive ? 'text-primary font-semibold' : 'text-slate-900 font-medium'}`}>
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
