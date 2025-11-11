import { useState, useRef, useEffect } from 'react';
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
        className="flex min-h-11 items-center gap-3 rounded-2xl border border-border/70 bg-white px-4 py-2 text-[0.9375rem] font-medium text-neutral-800 transition-all duration-200 hover:border-accent hover:bg-primary-50 focus:outline-none focus-visible:ring-3 focus-visible:ring-accent/35 focus-visible:ring-offset-2"
      >
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border-2 border-white/90 bg-gradient-to-br from-accent via-primary-500 to-primary-700 text-sm font-semibold text-white shadow-soft-glow" aria-hidden="true">
          <span className="leading-none tracking-wide">{getInitials(user?.name)}</span>
        </div>
        <span className="hidden text-[0.9375rem] font-medium leading-snug text-text sm:inline">{user?.name || 'User'}</span>
        <ChevronDown
          size={16}
          aria-hidden="true"
          className={`flex-shrink-0 text-neutral-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : 'rotate-0'}`}
        />
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-label="User profile menu"
          className="absolute top-[calc(100%+12px)] right-0 z-[1100] w-80 overflow-hidden rounded-3xl border border-border bg-white shadow-[0_28px_60px_rgba(15,23,42,0.18)] backdrop-blur-sm animate-[slide-down-fade_0.2s_cubic-bezier(0.4,0,0.2,1)]"
        >
          <div className="relative px-6 pt-6 pb-5">
            <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary-50 via-white to-primary-100 opacity-90" />
            <div className="relative flex items-center gap-4">
              <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full border-[3px] border-white/90 bg-gradient-to-br from-accent via-primary-500 to-primary-700 text-2xl font-bold text-white shadow-soft-glow" aria-hidden="true">
                <span className="leading-none tracking-wide">{getInitials(user?.name)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="m-0 overflow-hidden text-ellipsis whitespace-nowrap text-lg font-semibold leading-tight tracking-tight text-text">{user?.name || 'User'}</h3>
                <p className="m-0 overflow-hidden text-ellipsis whitespace-nowrap text-sm leading-snug text-text-muted">{user?.email || 'No email'}</p>
              </div>
            </div>
          </div>

          <div className="space-y-3 px-6 pb-5" role="group" aria-label="Profile information">
            <div className="flex items-start gap-3 rounded-2xl bg-surface/70 px-4 py-3">
              <Mail size={16} className="mt-0.5 flex-shrink-0 text-accent" aria-hidden="true" />
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-text-subtle">Email</span>
                <span className="break-words text-[0.9375rem] font-medium leading-relaxed text-text">{user?.email || 'Not provided'}</span>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-2xl bg-surface/70 px-4 py-3">
              <Calendar size={16} className="mt-0.5 flex-shrink-0 text-accent" aria-hidden="true" />
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-text-subtle">Member since</span>
                <span className="break-words text-[0.9375rem] font-medium leading-relaxed text-text">{getJoinedDate()}</span>
              </div>
            </div>
          </div>

          <div className="px-6 pb-6">
            <button
              role="menuitem"
              className="flex min-h-11 w-full items-center justify-center rounded-2xl border border-transparent bg-gradient-to-r from-red-500 to-red-600 px-4 py-2.5 text-[0.9375rem] font-semibold text-white shadow-[0_16px_35px_rgba(239,68,68,0.35)] transition-all duration-200 hover:shadow-[0_18px_42px_rgba(239,68,68,0.4)] focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
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
