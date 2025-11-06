import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Logo from './Logo.js';
import NotificationBell from './NotificationBell.js';
import ProfileCard from './ProfileCard.js';
import { useAuth } from '../contexts/AuthContext.js';

/**
 * Accessible Top Navbar Component
 * WCAG 2.2 Level AA Compliant & Fully Responsive
 * 
 * Features:
 * - Semantic header element
 * - ARIA labels
 * - Keyboard navigation
 * - Mobile menu button
 */
const TopNavbar = ({ sidebarOpen, setSidebarOpen }) => {
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

  const handleMenuClick = () => {
    setSidebarOpen?.(!sidebarOpen);
  };

  const handleMenuKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleMenuClick();
    }
  };

  return (
    <header 
      className="fixed top-0 left-0 right-0 lg:left-60 h-16 bg-white border-b border-gray-200 flex justify-between items-center px-4 sm:px-6 lg:px-8 z-[200] shadow-sm"
      role="banner"
      aria-label="Site header"
    >
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          onClick={handleMenuClick}
          onKeyDown={handleMenuKeyDown}
          aria-label={sidebarOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={sidebarOpen}
          className="lg:hidden cursor-pointer flex items-center p-2 rounded-lg transition-all duration-200 min-h-[2.75rem] min-w-[2.75rem] justify-center outline-none hover:bg-primary-light focus:outline-none focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
        >
          <Menu size={20} aria-hidden="true" className="text-gray-800" />
        </button>
        <div 
          onClick={handleLogoClick}
          onKeyDown={handleLogoKeyDown}
          role="button"
          tabIndex={0}
          aria-label="Go to dashboard"
          className="cursor-pointer flex items-center p-2 rounded-lg transition-all duration-200 min-h-[2.75rem] min-w-[2.75rem] justify-center outline-none hover:bg-primary-light focus:outline-none focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
        >
          <Logo size="md" showText={false} />
        </div>
      </div>
      
      <div className="flex items-center gap-2 sm:gap-4" role="toolbar" aria-label="User actions">
        <NotificationBell />
        <ProfileCard user={user} />
      </div>
    </header>
  );
};

export default TopNavbar;
