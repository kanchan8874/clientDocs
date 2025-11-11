import { LayoutDashboard, Users, FileText } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const navConfig = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Clients', path: '/clients', icon: Users },
  { label: 'Documents', path: '/documents', icon: FileText }
];

const MobileNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed inset-x-0 bottom-0 z-[180] flex items-center justify-between border-t border-border bg-white/95 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-2 shadow-[0_-18px_34px_-22px_rgba(15,23,42,0.25)] backdrop-blur-lg lg:hidden"
    >
      <ul className="flex w-full items-center justify-between gap-3" role="list">
        {navConfig.map(({ label, path, icon: Icon }) => {
          const active = location.pathname.startsWith(path);
          return (
            <li key={path} className="flex-1" role="listitem">
              <button
                type="button"
                onClick={() => navigate(path)}
                aria-label={label}
                className={`flex w-full flex-col items-center justify-center rounded-2xl border border-transparent px-2 py-2 text-[0.75rem] font-medium transition-all duration-200 focus:outline-none focus-visible:ring-3 focus-visible:ring-accent/40 focus-visible:ring-offset-2 ${
                  active
                    ? 'bg-primary-50 text-accent shadow-sm'
                    : 'text-text-muted hover:bg-primary-50 hover:text-accent'
                }`}
              >
                <Icon
                  size={20}
                  aria-hidden="true"
                  className={active ? 'text-accent' : 'text-text-subtle'}
                />
                <span className="mt-1 leading-tight">{label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default MobileNav;
