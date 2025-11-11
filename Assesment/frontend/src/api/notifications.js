import apiClient from './client.js';

/**
 * Notifications API Service
 * 
 * Functions for notification management:
 * - Get all notifications
 * - Get unread notification count
 * - Mark notification as read
 * - Mark all notifications as read
 */

export const getNotifications = async (unreadOnly = false) => {
  const params = unreadOnly ? '?unreadOnly=true' : '';
  const response = await apiClient.get(`/notifications${params}`);
  return response;
};

export const getUnreadCount = async () => {
  const response = await apiClient.get('/notifications/unread/count');
  return response;
};

export const markAsRead = async (notificationId) => {
  const response = await apiClient.put(`/notifications/${notificationId}/read`);
  return response;
};

export const markAllAsRead = async () => {
  const response = await apiClient.put('/notifications/read-all');
  return response;
};



