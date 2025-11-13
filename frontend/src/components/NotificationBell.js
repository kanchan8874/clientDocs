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
  const isMountedRef = useRef(true);
  const lastRequestTimeRef = useRef(0);
  const requestThrottleMs = 5000; // Minimum 5 seconds between requests

  useEffect(() => {
    isMountedRef.current = true;
    
    // Initial load with delay to avoid double mount issues
    const initialLoad = setTimeout(() => {
      if (isMountedRef.current) {
        loadNotifications();
        loadUnreadCount();
      }
    }, 100);

    // Polling interval increased to 5 minutes
    const interval = setInterval(() => {
      if (isMountedRef.current) {
        loadNotifications();
        loadUnreadCount();
      }
    }, 300000); // 5 minutes

    return () => {
      isMountedRef.current = false;
      clearTimeout(initialLoad);
      clearInterval(interval);
    };
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
    // Throttle requests
    const now = Date.now();
    if (now - lastRequestTimeRef.current < requestThrottleMs) {
      return;
    }
    lastRequestTimeRef.current = now;

    if (!isMountedRef.current) return;

    try {
      const response = await getNotifications(true);
      if (isMountedRef.current) {
        setNotifications(response.data?.notifications || []);
      }
    } catch (error) {
      // Silently handle rate limit errors
      if (error.response?.status === 429 || error.status === 429 || error.message?.includes('Too many requests')) {
        return;
      }
      if (isMountedRef.current) {
        console.error('Error loading notifications:', error);
      }
    }
  };

  const loadUnreadCount = async () => {
    // Throttle requests
    const now = Date.now();
    if (now - lastRequestTimeRef.current < requestThrottleMs) {
      return;
    }
    lastRequestTimeRef.current = now;

    if (!isMountedRef.current) return;

    try {
      const response = await getUnreadCount();
      if (isMountedRef.current) {
        setUnreadCount(response.data?.count || 0);
      }
    } catch (error) {
      // Silently handle rate limit errors
      if (error.response?.status === 429 || error.status === 429 || error.message?.includes('Too many requests')) {
        return;
      }
      if (isMountedRef.current) {
        console.error('Error loading unread count:', error);
      }
    }
  };

  const handleBellClick = async () => {
    if (!showDropdown) {
      setLoading(true);
      try {
        await Promise.all([loadNotifications(), loadUnreadCount()]);
      } catch (error) {
        // Errors already handled in individual functions
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
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
    try {
      await Promise.all([loadNotifications(), loadUnreadCount()]);
    } catch (error) {
      // Errors already handled in individual functions
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
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
        className="relative flex h-10 min-h-10 w-10 min-w-10 items-center justify-center rounded-full border border-border bg-white text-neutral-400 transition-all duration-200 hover:border-accent hover:text-accent focus:outline-none focus-visible:ring-3 focus-visible:ring-accent/35 focus-visible:ring-offset-2"
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
          className="absolute top-[calc(100%+0.75rem)] right-0 z-[1100] flex max-h-[28rem] w-[22rem] max-w-[90vw] flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-surface"
        >
          {/* Header - Fixed */}
          <div className="sticky top-0 z-10 flex flex-shrink-0 items-center justify-between border-b border-border bg-white px-5 py-4">
            <h3 className="m-0 flex items-center gap-2 text-base font-semibold tracking-tight text-text">
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
                className="flex min-h-9 min-w-9 items-center justify-center rounded-lg border border-transparent bg-transparent p-2 text-neutral-400 transition-colors duration-200 hover:bg-primary-50 hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:opacity-50"
              >
                <RefreshCw 
                  size={16} 
                  aria-hidden="true"
                  className={loading ? 'animate-spin text-neutral-300' : 'text-neutral-400'}
                />
              </button>
              {notifications.length > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  aria-label="Mark all notifications as read"
                  className="min-h-9 whitespace-nowrap rounded-lg border border-transparent bg-transparent px-3 py-2 text-sm font-medium text-accent transition-colors duration-200 hover:bg-primary-50 hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
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
            className="max-h-[calc(28rem-73px)] min-h-0 flex-1 overflow-y-auto overflow-x-hidden scroll-smooth [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-neutral-300 [&::-webkit-scrollbar-thumb]:hover:bg-neutral-400"
            data-notification-list
          >
            {loading ? (
              <div className="flex flex-col items-center justify-center px-6 py-10 text-center">
                <RefreshCw 
                  size={24} 
                  aria-hidden="true"
                  className="mb-2 animate-spin text-neutral-300"
                />
                <p className="m-0 mb-1 text-[0.9375rem] font-medium text-text-muted">Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-6 py-10 text-center">
                <Bell size={32} aria-hidden="true" className="mb-3 text-neutral-300" />
                <p className="m-0 mb-1 text-[0.9375rem] font-medium text-text-muted">No notifications.</p>
                <p className="m-0 text-[0.8125rem] text-text-subtle">You're all caught up!</p>
              </div>
            ) : (
              notifications.map((notification, index) => (
                <button
                  key={notification._id}
                  role="menuitem"
                  onClick={() => handleNotificationClick(notification)}
                  className={`flex w-full cursor-pointer items-start gap-3 border-0 border-b border-border px-5 py-4 text-left outline-none transition-colors duration-150 hover:bg-primary-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset ${
                    notification.isRead
                      ? 'bg-white'
                      : 'bg-primary-50 border-l-[3px] border-l-accent'
                  } ${index === notifications.length - 1 ? 'border-b-0' : ''}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleNotificationClick(notification);
                    }
                  }}
                >
                  <div className="flex min-w-0 flex-1 items-start gap-3">
                    <div className="relative flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-primary-50">
                      <FileText
                        size={18}
                        aria-hidden="true"
                        className={notification.isRead ? 'text-neutral-300' : 'text-accent'}
                      />
                      {!notification.isRead && (
                        <div className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full border-2 border-white bg-red-600 shadow-sm" aria-hidden="true" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 break-words text-sm font-semibold leading-snug text-text">
                        {notification.title}
                      </div>
                      <div className="mb-1.5 break-words text-[0.8125rem] leading-relaxed text-text-muted">
                        {notification.message}
                      </div>
                      {notification.createdAt && (
                        <div className="text-xs leading-snug text-text-subtle">
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
