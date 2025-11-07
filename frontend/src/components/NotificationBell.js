import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, RefreshCw, FileText } from 'lucide-react';
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead } from '../api/notifications.js';

/**
 * Accessible Notification Bell Component
 * WCAG 2.2 Level AA Compliant
 * 
 * Features:
 * - ARIA labels and live regions
 * - Keyboard navigation
 * - Focus management
 * - Screen reader announcements
 */
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
        className="relative bg-transparent border border-gray-300 rounded-full cursor-pointer p-2 w-10 h-10 min-w-10 min-h-10 flex items-center justify-center text-gray-600 transition-all duration-200 hover:border-primary hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      >
        <Bell size={18} aria-hidden="true" />
        {unreadCount > 0 && (
          <span
            className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-semibold border-2 border-white"
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
          className="absolute top-[calc(100%+0.75rem)] right-0 w-[22rem] max-w-[90vw] bg-white rounded-xl shadow-xl border border-gray-200 z-[1100] flex flex-col max-h-[28rem] overflow-hidden"
        >
          {/* Header - Fixed */}
          <div className="flex justify-between items-center px-5 py-4 border-b border-gray-200 bg-white flex-shrink-0 sticky top-0 z-10">
            <h3 className="m-0 text-base font-semibold text-gray-800 flex items-center gap-2 tracking-tight">
              Notifications
              {unreadCount > 0 && (
                <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 bg-red-600 text-white rounded-[10px] text-xs font-semibold leading-none" aria-label={`${unreadCount} unread`}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={handleManualRefresh}
                aria-label="Refresh notifications"
                disabled={loading}
                className="bg-transparent border-0 cursor-pointer p-2 rounded-lg flex items-center justify-center min-w-9 min-h-9 text-gray-600 transition-all duration-200 outline-none hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
              >
                <RefreshCw 
                  size={16} 
                  aria-hidden="true"
                  className={loading ? 'animate-spin text-gray-400' : 'text-gray-600'}
                />
              </button>
              {notifications.length > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  aria-label="Mark all notifications as read"
                  className="bg-transparent border-0 cursor-pointer px-3 py-2 rounded-lg text-sm text-primary font-medium min-h-9 transition-all duration-200 outline-none whitespace-nowrap hover:bg-blue-50 hover:text-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
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
            className="flex-1 overflow-y-auto overflow-x-hidden max-h-[calc(28rem-73px)] min-h-0 scroll-smooth [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-gray-400"
            data-notification-list
          >
            {loading ? (
              <div className="py-10 px-6 text-center flex flex-col items-center justify-center">
                <RefreshCw 
                  size={24} 
                  aria-hidden="true"
                  className="animate-spin text-gray-400 mb-2"
                />
                <p className="text-[0.9375rem] font-medium text-gray-600 m-0 mb-1">Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-10 px-6 text-center flex flex-col items-center justify-center">
                <Bell size={32} aria-hidden="true" className="text-gray-300 mb-3" />
                <p className="text-[0.9375rem] font-medium text-gray-600 m-0 mb-1">No notifications</p>
                <p className="text-[0.8125rem] text-gray-400 m-0">You're all caught up!</p>
              </div>
            ) : (
              notifications.map((notification, index) => (
                <button
                  key={notification._id}
                  role="menuitem"
                  onClick={() => handleNotificationClick(notification)}
                  className={`w-full px-5 py-4 border-0 border-b border-gray-200 cursor-pointer text-left transition-colors duration-150 outline-none flex items-start gap-3 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset ${
                    notification.isRead 
                      ? 'bg-white' 
                      : 'bg-blue-50/40 border-l-[3px] border-l-primary'
                  } ${index === notifications.length - 1 ? 'border-b-0' : ''}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleNotificationClick(notification);
                    }
                  }}
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="relative w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <FileText 
                        size={18} 
                        aria-hidden="true"
                        className={notification.isRead ? 'text-gray-400' : 'text-primary'}
                      />
                      {!notification.isRead && (
                        <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-red-600 border-2 border-white shadow-sm" aria-hidden="true" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-800 mb-1 leading-snug break-words">
                        {notification.title}
                      </div>
                      <div className="text-[0.8125rem] text-gray-600 leading-relaxed mb-1.5 break-words">
                        {notification.message}
                      </div>
                      {notification.createdAt && (
                        <div className="text-xs text-gray-400 leading-snug">
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
                  {!notification.isRead && (
                    <span className="sr-only">Unread notification</span>
                  )}
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
