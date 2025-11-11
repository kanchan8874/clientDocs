import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, FileText, X } from 'lucide-react';
import Logo from './Logo.js';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Users, label: 'Clients', path: '/clients' },
  { icon: FileText, label: 'Documents', path: '/documents' }
];

const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleKeyDown = (event, path) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      navigate(path);
    }
  };

  const getWrapperClasses = () => {
    const baseClasses = [
      'fixed inset-y-0 left-0 z-[150]',
      'flex w-60 flex-col bg-white',
      'border-r border-slate-200',
      'transition-transform duration-300 ease-out',
      'focus-visible:outline-none',
      'lg:static lg:z-[120] lg:translate-x-0'
    ];

    if (isOpen) {
      baseClasses.push('translate-x-0');
    } else {
      baseClasses.push('-translate-x-full lg:translate-x-0');
    }

    return baseClasses.join(' ');
  };

  return (
    <aside className={getWrapperClasses()} role="navigation" aria-label="Main navigation">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-5">
        <Logo size="md" />
        <button
          type="button"
          onClick={onClose}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-transparent text-slate-600 transition-colors duration-200 focus-visible:ring-3 focus-visible:ring-primary/40 focus-visible:ring-offset-2 hover:bg-slate-100 lg:hidden"
          aria-label="Close navigation"
        >
          <X size={18} aria-hidden="true" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 scrollbar-hidden" aria-label="Primary navigation">
        <ul className="flex flex-col gap-1" role="list">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <li key={item.path} role="listitem">
                <button
                  type="button"
                  onClick={() => {
                    navigate(item.path);
                    onClose?.();
                  }}
                  onKeyDown={(event) => handleKeyDown(event, item.path)}
                  aria-current={isActive ? 'page' : undefined}
                  aria-label={`Navigate to ${item.label}${isActive ? ' (current page)' : ''}`}
                  className={`flex w-full items-center gap-4 rounded-xl border border-transparent px-4 py-3 text-[0.95rem] font-medium tracking-tight transition-all duration-200 focus-visible:ring-3 focus-visible:ring-primary/30 focus-visible:ring-offset-2 ${
                    isActive
                      ? 'bg-primary/12 text-primary'
                      : 'text-slate-800 hover:bg-primary/10 hover:text-primary'
                  }`}
                >
                  <Icon
                    size={20}
                    aria-hidden="true"
                    className={`${isActive ? 'text-primary' : 'text-slate-500'} flex-shrink-0`}
                  />
                  <span className="leading-tight">{item.label}</span>
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
