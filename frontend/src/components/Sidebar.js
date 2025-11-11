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
      'flex w-64 flex-col bg-white/90 lg:w-64 xl:w-72',
      'backdrop-blur-xl border-r border-border',
      'shadow-lg',
      'transition-transform duration-300 ease-out',
      'focus-visible:outline-none'
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
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-white/95 px-5 py-5 sm:px-6 sm:py-6">
        <Logo size="md" />
        <button
          type="button"
          onClick={onClose}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-transparent text-neutral-500 transition-colors duration-200 hover:bg-primary-50 focus-visible:ring-3 focus-visible:ring-accent/40 focus-visible:ring-offset-2 lg:hidden"
          aria-label="Close navigation"
        >
          <X size={18} aria-hidden="true" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-6 scrollbar-hidden" aria-label="Primary navigation">
        <ul className="flex flex-col gap-2" role="list">
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
                  className={`group flex w-full items-center gap-4 rounded-2xl border border-transparent px-4 py-3.5 text-[0.95rem] font-medium tracking-tight transition-all duration-200 focus-visible:ring-3 focus-visible:ring-accent/30 focus-visible:ring-offset-2 ${
                    isActive
                      ? 'bg-primary-50 text-accent shadow-sm'
                      : 'text-neutral-700 hover:bg-primary-50/70 hover:text-accent'
                  }`}
                >
                  <Icon
                    size={20}
                    aria-hidden="true"
                    className={`${isActive ? 'text-accent' : 'text-neutral-400 group-hover:text-accent'} flex-shrink-0`}
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
