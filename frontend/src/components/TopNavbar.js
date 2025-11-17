import { useNavigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Logo from './Logo.js';
import NotificationBell from './NotificationBell.js';
import ProfileCard from './ProfileCard.js';
import { useAuth } from '../contexts/AuthContext.js';


const TopNavbar = ({ onToggleSidebar }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate('/dashboard');
  };

  const handleLogoKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleLogoClick();
    }
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-[200] flex h-14 sm:h-16 md:h-20 items-center justify-between border-b border-border bg-white px-2 sm:px-3 md:px-4 lg:px-6 backdrop-blur-2xl shadow-[0_14px_40px_-24px_rgba(15,23,42,0.45)] transition-all duration-300 ease-out lg:left-64 lg:px-10 xl:left-72 xl:px-14"
      role="banner"
      aria-label="Site header"
    >
      <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl border border-border bg-white text-neutral-600 transition-colors duration-200 hover:bg-primary-50 focus-visible:ring-3 focus-visible:ring-accent/40 focus-visible:ring-offset-2 lg:hidden"
          aria-label="Toggle navigation"
        >
          <Menu size={18} className="sm:w-5 sm:h-5" aria-hidden="true" />
        </button>
        <div
          onClick={handleLogoClick}
          onKeyDown={handleLogoKeyDown}
          role="button"
          tabIndex={0}
          aria-label="Go to dashboard"
          className="flex min-h-[40px] min-w-[40px] sm:min-h-[44px] sm:min-w-[44px] cursor-pointer items-center justify-center rounded-2xl border border-transparent p-1.5 sm:p-2 transition-all duration-300 hover:bg-card-gradient focus:outline-none focus-visible:ring-3 focus-visible:ring-accent/40 focus-visible:ring-offset-2"
        >
          <Logo size="lg" showText={false} />
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 md:gap-4" role="toolbar" aria-label="User actions">
        <NotificationBell />
        <ProfileCard user={user} />
      </div>
    </header>
  );
};

export default TopNavbar;
