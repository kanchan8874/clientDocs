import React from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from './Logo.js';
import NotificationBell from './NotificationBell.js';
import ProfileCard from './ProfileCard.js';
import { useAuth } from '../contexts/AuthContext.js';


const TopNavbar = () => {
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
      className="fixed top-0 left-60 right-0 h-20 bg-white border-b border-slate-200 flex justify-between items-center px-8 z-[200] md:left-60 md:px-8"
      role="banner"
      aria-label="Site header"
    >
      <div className="flex items-center gap-5">
        <div 
          onClick={handleLogoClick}
          onKeyDown={handleLogoKeyDown}
          role="button"
          tabIndex={0}
          aria-label="Go to dashboard"
        className="cursor-pointer flex items-center p-3 rounded-2xl transition-transform duration-200 min-h-[52px] min-w-[52px] justify-center outline-none bg-transparent hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white"
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
