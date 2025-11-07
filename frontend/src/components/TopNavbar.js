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
      className="fixed top-0 left-60 right-0 h-20 bg-white border-b border-gray-200 flex justify-between items-center px-8 z-[200] shadow-md md:left-60 md:px-8"
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
          className="cursor-pointer flex items-center p-3 rounded-xl transition-all duration-300 min-h-[52px] min-w-[52px] justify-center outline-none hover:bg-gradient-to-br hover:from-blue-50 hover:to-green-50 hover:shadow-md focus:outline-none focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
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
