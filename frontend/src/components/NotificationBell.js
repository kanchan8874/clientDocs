import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, RefreshCw, FileText } from 'lucide-react';
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead } from '../api/notifications.js';


const NotificationBell = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    loadNotifications();
    loadUnreadCount();

    const interval = setInterval(() => {
      loadNotifications();
      loadUnreadCount();
    }, 120000); // 2 minutes

    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape' && showDropdown) {
        setShowDropdown(false);
        buttonRef.current?.focus();
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [showDropdown]);

  const loadNotifications = async () => {
    try {
      const response = await getNotifications(true);
      setNotifications(response.data?.notifications || []);
    } catch (error) {
      if (error.message?.includes('Too many requests')) {
        return;
      }
      console.error('Error loading notifications:', error);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const response = await getUnreadCount();
      setUnreadCount(response.data?.count || 0);
    } catch (error) {
      if (error.message?.includes('Too many requests')) {
        return;
      }
      console.error('Error loading unread count:', error);
    }
  };

  const handleBellClick = async () => {
    if (!showDropdown) {
      setLoading(true);
      await loadNotifications();
      await loadUnreadCount();
      setLoading(false);
    }
    setShowDropdown(!showDropdown);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleBellClick();
    }
  };

  const handleManualRefresh = async (e) => {
    e.stopPropagation();
    setLoading(true);
    await loadNotifications();
    await loadUnreadCount();
    setLoading(false);
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      try {
        await markAsRead(notification._id);
        setUnreadCount(prev => Math.max(0, prev - 1));
        setNotifications(prev => 
          prev.map(n => n._id === notification._id ? { ...n, isRead: true } : n)
        );
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }

    if (notification.documentId) {
      navigate('/documents');
      setShowDropdown(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      setUnreadCount(0);
      setNotifications([]);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        ref={buttonRef}
        onClick={handleBellClick}
        onKeyDown={handleKeyDown}
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
        aria-expanded={showDropdown}
        aria-haspopup="true"
        className="relative flex h-10 min-h-10 w-10 min-w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition-all duration-200 hover:border-primary hover:text-primary focus:outline-none focus-visible:ring-3 focus-visible:ring-primary/40 focus-visible:ring-offset-2"
      >
        <Bell size={18} aria-hidden="true" />
        {unreadCount > 0 && (
          <span
            className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-red-600 text-xs font-semibold text-white shadow-soft-glow"
            aria-label={`${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div
          role="menu"
          aria-label="Notifications"
          className="absolute top-[calc(100%+0.75rem)] right-0 z-[1100] flex max-h-[28rem] w-[22rem] max-w-[90vw] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-surface"
        >
          {/* Header - Fixed */}
          <div className="sticky top-0 z-10 flex flex-shrink-0 items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
            <h3 className="m-0 flex items-center gap-2 text-base font-semibold tracking-tight text-slate-900">
              Notifications
              {unreadCount > 0 && (
                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-[10px] bg-red-600 px-1.5 text-xs font-semibold leading-none text-white shadow-sm" aria-label={`${unreadCount} unread`}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={handleManualRefresh}
                aria-label="Refresh notifications"
                disabled={loading}
                className="flex min-h-9 min-w-9 items-center justify-center rounded-lg border border-transparent bg-transparent p-2 text-slate-500 transition-colors duration-200 hover:bg-primary/10 hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50"
              >
                <RefreshCw 
                  size={16} 
                  aria-hidden="true"
                  className={loading ? 'animate-spin text-slate-400' : 'text-slate-500'}
                />
              </button>
              {notifications.length > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  aria-label="Mark all notifications as read"
                  className="min-h-9 whitespace-nowrap rounded-lg border border-transparent bg-transparent px-3 py-2 text-sm font-medium text-primary transition-colors duration-200 hover:bg-primary/10 hover:text-primary-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  Mark all read
                </button>
              )}
            </div>
          </div>

          {/* Notification List - Scrollable */}
          <div 
            role="group" 
            aria-label="Notification list"
            className="max-h-[calc(28rem-73px)] min-h-0 flex-1 overflow-y-auto overflow-x-hidden scroll-smooth [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:hover:bg-slate-400"
            data-notification-list
          >
            {loading ? (
              <div className="flex flex-col items-center justify-center px-6 py-10 text-center">
                <RefreshCw 
                  size={24} 
                  aria-hidden="true"
                  className="mb-2 animate-spin text-slate-400"
                />
                <p className="m-0 mb-1 text-[0.9375rem] font-medium text-slate-600">Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-6 py-10 text-center">
                <Bell size={32} aria-hidden="true" className="mb-3 text-slate-300" />
                <p className="m-0 mb-1 text-[0.9375rem] font-medium text-slate-600">No notifications</p>
                <p className="m-0 text-[0.8125rem] text-slate-400">You're all caught up!</p>
              </div>
            ) : (
              notifications.map((notification, index) => (
                <button
                  key={notification._id}
                  role="menuitem"
                  onClick={() => handleNotificationClick(notification)}
                  className={`flex w-full cursor-pointer items-start gap-3 border-0 border-b border-slate-200 px-5 py-4 text-left outline-none transition-colors duration-150 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset ${
                    notification.isRead
                      ? 'bg-white'
                      : 'bg-primary/12 border-l-[3px] border-l-primary'
                  } ${index === notifications.length - 1 ? 'border-b-0' : ''}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleNotificationClick(notification);
                    }
                  }}
                >
                  <div className="flex min-w-0 flex-1 items-start gap-3">
                    <div className="relative flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-primary/12">
                      <FileText
                        size={18}
                        aria-hidden="true"
                        className={notification.isRead ? 'text-slate-400' : 'text-primary'}
                      />
                      {!notification.isRead && (
                        <div className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full border-2 border-white bg-red-600 shadow-sm" aria-hidden="true" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 break-words text-sm font-semibold leading-snug text-slate-900">
                        {notification.title}
                      </div>
                      <div className="mb-1.5 break-words text-[0.8125rem] leading-relaxed text-slate-600">
                        {notification.message}
                      </div>
                      {notification.createdAt && (
                        <div className="text-xs leading-snug text-slate-400">
                          {new Date(notification.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                  {!notification.isRead && <span className="sr-only">Unread notification</span>}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
