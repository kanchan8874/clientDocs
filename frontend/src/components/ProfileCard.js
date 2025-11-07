import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Calendar, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.js';

const ProfileCard = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const cardRef = useRef(null);
  const buttonRef = useRef(null);
  const { logout } = useAuth();
  const navigate = useNavigate();

  // Close card when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cardRef.current && !cardRef.current.contains(event.target) && 
          buttonRef.current && !buttonRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
    navigate('/login');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsOpen(!isOpen);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getJoinedDate = () => {
    if (user?.createdAt) {
      return new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    }
    return 'Recently';
  };

  return (
    <div className="relative z-[1100]" ref={cardRef}>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        aria-label={`User menu for ${user?.name || 'User'}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className="flex items-center gap-3 px-4 py-2 rounded-2xl border border-white/70 bg-white/95 cursor-pointer transition-all duration-300 font-sans text-slate-900 min-h-11 text-[0.9375rem] font-medium outline-none shadow-soft-glow hover:-translate-y-0.5 hover:shadow-ambient-glow hover:bg-gradient-to-br hover:from-blue-50/80 hover:to-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white"
      >
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 shadow-ambient-glow border-2 border-white/90" aria-hidden="true">
          <span className="leading-none tracking-wide">{getInitials(user?.name)}</span>
        </div>
        <span className="text-[0.9375rem] font-medium text-slate-900 leading-snug">{user?.name || 'User'}</span>
        <ChevronDown 
          size={16} 
          aria-hidden="true"
          className={`text-slate-600 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : 'rotate-0'}`}
        />
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-label="User profile menu"
          className="absolute top-[calc(100%+12px)] right-0 rounded-3xl border border-white/70 bg-gradient-to-br from-white via-white to-blue-50/20 w-80 overflow-hidden z-[1100] shadow-soft-glow animate-[slide-down-fade_0.2s_cubic-bezier(0.4,0,0.2,1)] backdrop-blur-xl"
        >
          {/* Header */}
          <div className="flex items-center p-6 bg-gradient-to-br from-white via-white to-blue-50/30 border-b border-white/60">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center text-white font-bold text-2xl mr-4 shadow-ambient-glow border-[3px] border-white/90 flex-shrink-0" aria-hidden="true">
              <span className="leading-none tracking-wide">{getInitials(user?.name)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-slate-900 m-0 mb-1 leading-tight tracking-tight overflow-hidden text-ellipsis whitespace-nowrap">{user?.name || 'User'}</h3>
              <p className="text-sm text-slate-600 m-0 leading-snug overflow-hidden text-ellipsis whitespace-nowrap">{user?.email || 'No email'}</p>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-white/60 m-0" role="separator" aria-orientation="horizontal"></div>

          {/* Profile Info */}
          <div className="px-6 py-5 bg-white/95" role="group" aria-label="Profile information">
            <div className="flex items-start gap-3 mb-4">
              <Mail size={16} className="text-slate-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <div className="flex flex-col gap-1 flex-1 min-w-0">
                <span className="text-xs text-slate-600 font-medium leading-snug uppercase tracking-wider">Email</span>
                <span className="text-[0.9375rem] text-slate-900 leading-relaxed font-normal break-words">{user?.email || 'Not provided'}</span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar size={16} className="text-slate-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <div className="flex flex-col gap-1 flex-1 min-w-0">
                <span className="text-xs text-slate-600 font-medium leading-snug uppercase tracking-wider">Member since</span>
                <span className="text-[0.9375rem] text-slate-900 leading-relaxed font-normal break-words">{getJoinedDate()}</span>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-white/60 m-0" role="separator" aria-orientation="horizontal"></div>

          {/* Actions */}
          <div className="flex flex-col p-3 gap-1 bg-gradient-to-br from-white via-white to-rose-50/30 border-t border-white/60" role="group" aria-label="User actions">
            <button
              role="menuitem"
              className="flex items-center w-full px-4 py-3.5 bg-transparent border-0 rounded-lg text-red-600 text-[0.9375rem] font-semibold cursor-pointer transition-all duration-200 font-sans justify-start min-h-11 text-left outline-none hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              onClick={handleLogout}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleLogout();
                }
              }}
              aria-label="Logout from account"
            >
              <LogOut size={18} aria-hidden="true" className="mr-3" />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileCard;
