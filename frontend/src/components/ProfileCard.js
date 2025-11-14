import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Calendar, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.js';
import { getCurrentUser } from '../api/auth.js';

const ProfileCard = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [userWithDates, setUserWithDates] = useState(user);
  const cardRef = useRef(null);
  const buttonRef = useRef(null);
  const { logout } = useAuth();
  const navigate = useNavigate();

  // Sync userWithDates when user prop changes
  useEffect(() => {
    setUserWithDates(user);
  }, [user]);

  // Fetch user info with createdAt if missing (only once)
  useEffect(() => {
    const fetchUserInfo = async () => {
      // If user doesn't have createdAt, fetch from API
      if (user && !user.createdAt) {
        try {
          const response = await getCurrentUser();
          if (response.data?.user) {
            const updatedUser = { ...user, ...response.data.user };
            setUserWithDates(updatedUser);
            // Update localStorage (AuthContext will pick it up on next refresh)
            localStorage.setItem('user', JSON.stringify(updatedUser));
          }
        } catch (error) {
          // Silently handle error - don't spam console
          setUserWithDates(user);
        }
      }
    };

    // Only fetch if createdAt is missing
    if (user && !user.createdAt) {
      fetchUserInfo();
    }
  }, [user]);

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
    setIsOpen(false);
    
    // Clear localStorage immediately (don't wait for API)
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('lastLogin');
    
    // Try API logout in background (non-blocking, don't wait)
    logout().catch((apiError) => {
      console.warn('Logout API call failed (non-critical):', apiError);
    });
    
    // Force immediate navigation to login page
    // Using window.location.replace to prevent back button navigation
    window.location.replace('/login');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsOpen(!isOpen);
    }
  };

  const getInitials = (name) => {
    if (!name || typeof name !== 'string') return 'U';
    const initials = name
      .trim()
      .split(/\s+/)
      .filter(word => word.length > 0)
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
    return initials || 'U';
  };

  const getJoinedDate = () => {
    // Use userWithDates which has updated user info
    const currentUser = userWithDates || user;
    const createdAt = currentUser?.createdAt || currentUser?.created_at || currentUser?.joinDate;
    
    if (createdAt) {
      try {
        const date = new Date(createdAt);
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
          });
        }
      } catch (e) {
        // Silently handle date parsing errors
      }
    }
    return 'N/A';
  };


  return (
    <div className="relative z-[1100]" ref={cardRef}>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        aria-label={`User menu for ${(userWithDates || user)?.name || 'User'}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className="flex min-h-11 items-center gap-3 rounded-2xl border border-border/70 bg-white px-4 py-2 text-[0.9375rem] font-medium text-neutral-800 transition-all duration-200 hover:border-accent hover:bg-primary-50 focus:outline-none focus-visible:ring-3 focus-visible:ring-accent/35 focus-visible:ring-offset-2"
      >
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border-2 border-white/90 bg-gradient-to-br from-accent via-primary-500 to-primary-700 text-sm font-semibold text-white shadow-soft-glow" aria-hidden="true">
          <span className="leading-none tracking-wide">{getInitials((userWithDates || user)?.name)}</span>
        </div>
        <span 
          className="hidden text-[0.9375rem] font-medium leading-snug text-text sm:inline max-w-[120px] md:max-w-[180px] overflow-hidden text-ellipsis whitespace-nowrap"
          title={(userWithDates || user)?.name || 'User'}
        >
          {(userWithDates || user)?.name || 'User'}
        </span>
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
          className="absolute top-[calc(100%+12px)] right-0 z-[1100] w-72 max-w-[calc(100vw-2rem)] overflow-hidden rounded-3xl border border-slate-200/60 bg-white/95 shadow-[0_8px_32px_rgba(15,23,42,0.12),0_2px_8px_rgba(15,23,42,0.08)] backdrop-blur-md animate-[slide-down-fade_0.2s_cubic-bezier(0.4,0,0.2,1)]"
        >
          {/* Header Section */}
          <div className="relative px-5 pt-4 pb-3">
            <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary-50/80 via-white/90 to-primary-100/80" />
            <div className="relative flex items-center gap-3">
              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full border-[3px] border-white/90 bg-gradient-to-br from-accent via-primary-500 to-primary-700 text-xl font-bold text-white shadow-lg shadow-accent/20" aria-hidden="true">
                <span className="leading-none tracking-wide">{getInitials((userWithDates || user)?.name)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 
                  className="m-0 overflow-hidden text-ellipsis whitespace-nowrap text-base font-semibold leading-tight tracking-tight text-slate-900 max-w-[200px]"
                  title={(userWithDates || user)?.name || 'User'}
                >
                  {(userWithDates || user)?.name || 'User'}
                </h3>
                <p 
                  className="m-0 mt-0.5 overflow-hidden text-ellipsis whitespace-nowrap text-xs leading-snug text-slate-600 max-w-[200px]"
                  title={(userWithDates || user)?.email || 'No email'}
                >
                  {(userWithDates || user)?.email || 'No email'}
                </p>
              </div>
            </div>
          </div>

          {/* Profile Information Section */}
          <div className="space-y-2 px-5 pb-3" role="group" aria-label="Profile information">
            {/* Email */}
            <div className="flex items-start gap-2.5 rounded-xl bg-slate-50/80 px-3 py-2.5 transition-colors duration-200 hover:bg-slate-100/80">
              <Mail size={14} className="mt-0.5 flex-shrink-0 text-accent" aria-hidden="true" />
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="text-[0.65rem] font-semibold uppercase tracking-[0.08em] text-slate-500">Email</span>
                <span className="break-words text-sm font-medium leading-snug text-slate-900">{(userWithDates || user)?.email || 'Not provided'}</span>
              </div>
            </div>

            {/* Member Since */}
            <div className="flex items-start gap-2.5 rounded-xl bg-slate-50/80 px-3 py-2.5 transition-colors duration-200 hover:bg-slate-100/80">
              <Calendar size={14} className="mt-0.5 flex-shrink-0 text-accent" aria-hidden="true" />
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="text-[0.65rem] font-semibold uppercase tracking-[0.08em] text-slate-500">Member Since</span>
                <span className="break-words text-sm font-medium leading-snug text-slate-900">{getJoinedDate()}</span>
              </div>
            </div>
          </div>

          {/* Logout Button Section */}
          <div className="px-5 pb-4">
            <button
              role="menuitem"
              className="group flex min-h-10 w-full items-center justify-center gap-2.5 rounded-2xl border border-transparent bg-gradient-to-r from-red-500 via-red-600 to-red-600 px-4 py-2 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(239,68,68,0.25)] transition-all duration-300 ease-out hover:from-red-600 hover:via-red-600 hover:to-red-700 hover:shadow-[0_6px_16px_rgba(239,68,68,0.35)] hover:-translate-y-0.5 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/50 focus-visible:ring-offset-2"
              onClick={handleLogout}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleLogout();
                }
              }}
              aria-label="Logout from account"
            >
              <LogOut size={16} aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-0.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileCard;

