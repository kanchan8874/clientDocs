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
      className="fixed top-0 left-0 right-0 z-[200] flex h-20 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur-md transition-all duration-300 ease-out sm:px-6 lg:left-60 lg:px-10"
      role="banner"
      aria-label="Site header"
    >
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition-colors duration-200 focus-visible:ring-3 focus-visible:ring-primary/40 focus-visible:ring-offset-2 hover:bg-slate-100 lg:hidden"
          aria-label="Toggle navigation"
        >
          <Menu size={20} aria-hidden="true" />
        </button>
        <div 
          onClick={handleLogoClick}
          onKeyDown={handleLogoKeyDown}
          role="button"
          tabIndex={0}
          aria-label="Go to dashboard"
          className="flex min-h-[52px] min-w-[52px] cursor-pointer items-center justify-center rounded-xl border border-transparent p-2 transition-all duration-300 hover:bg-card-gradient focus:outline-none focus-visible:ring-3 focus-visible:ring-primary/40 focus-visible:ring-offset-2"
        >
          <Logo size="lg" showText={false} />
        </div>
      </div>
      
      <div className="flex items-center gap-4" role="toolbar" aria-label="User actions">
        <NotificationBell />
        <ProfileCard user={user} />
      </div>
    </header>
  );
};

export default TopNavbar;
