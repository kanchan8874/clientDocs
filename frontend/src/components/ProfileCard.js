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
        className="flex min-h-11 items-center gap-3 rounded-xl border border-slate-200/80 bg-white px-4 py-2 text-[0.9375rem] font-medium text-slate-800 transition-all duration-200 hover:border-primary hover:bg-primary/10 focus:outline-none focus-visible:ring-3 focus-visible:ring-primary/35 focus-visible:ring-offset-2"
      >
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border-2 border-white/90 bg-gradient-to-br from-primary to-blue-500 text-sm font-semibold text-white shadow-soft-glow" aria-hidden="true">
          <span className="leading-none tracking-wide">{getInitials(user?.name)}</span>
        </div>
        <span className="text-[0.9375rem] font-medium leading-snug text-slate-900">{user?.name || 'User'}</span>
        <ChevronDown 
          size={16} 
          aria-hidden="true"
          className={`flex-shrink-0 text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : 'rotate-0'}`}
        />
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-label="User profile menu"
          className="absolute top-[calc(100%+12px)] right-0 z-[1100] w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-surface animate-[slide-down-fade_0.2s_cubic-bezier(0.4,0,0.2,1)] backdrop-blur-sm"
        >
          {/* Header */}
          <div className="flex items-center border-b border-slate-200 bg-gradient-to-br from-slate-50 to-white p-6">
            <div className="mr-4 flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full border-[3px] border-white/90 bg-gradient-to-br from-primary to-blue-500 text-2xl font-bold text-white shadow-soft-glow" aria-hidden="true">
              <span className="leading-none tracking-wide">{getInitials(user?.name)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="m-0 mb-1 overflow-hidden text-ellipsis whitespace-nowrap text-lg font-semibold leading-tight tracking-tight text-slate-900">{user?.name || 'User'}</h3>
              <p className="m-0 overflow-hidden text-ellipsis whitespace-nowrap text-sm leading-snug text-slate-600">{user?.email || 'No email'}</p>
            </div>
          </div>

          {/* Divider */}
          <div className="m-0 h-px bg-slate-200" role="separator" aria-orientation="horizontal"></div>

          {/* Profile Info */}
          <div className="bg-white px-6 py-5" role="group" aria-label="Profile information">
            <div className="mb-4 flex items-start gap-3">
              <Mail size={16} className="mt-0.5 flex-shrink-0 text-slate-500" aria-hidden="true" />
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Email</span>
                <span className="break-words text-[0.9375rem] font-normal leading-relaxed text-slate-800">{user?.email || 'Not provided'}</span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar size={16} className="mt-0.5 flex-shrink-0 text-slate-500" aria-hidden="true" />
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Member since</span>
                <span className="break-words text-[0.9375rem] font-normal leading-relaxed text-slate-800">{getJoinedDate()}</span>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="m-0 h-px bg-slate-200" role="separator" aria-orientation="horizontal"></div>

          {/* Actions */}
          <div className="flex flex-col gap-1 border-t border-slate-200 bg-slate-50 p-3" role="group" aria-label="User actions">
            <button
              role="menuitem"
              className="flex min-h-11 w-full items-center justify-start rounded-lg border border-transparent bg-transparent px-4 py-3.5 text-[0.9375rem] font-medium text-red-600 transition-all duration-200 hover:bg-red-50 hover:text-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
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
