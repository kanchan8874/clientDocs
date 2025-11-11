import express from 'express';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead
} from '../controllers/notificationController.js';
import authGuard from '../middleware/authGuard.js';

const router = express.Router();

// All routes require authentication
router.use(authGuard);

// @route   GET /api/notifications
// @desc    Get all notifications for user
// @access  Private
router.get('/', getNotifications);

// @route   GET /api/notifications/unread/count
// @desc    Get unread notification count
// @access  Private
router.get('/unread/count', getUnreadCount);

// @route   PUT /api/notifications/:id/read
// @desc    Mark notification as read
// @access  Private
router.put('/:id/read', markAsRead);

// @route   PUT /api/notifications/read-all
// @desc    Mark all notifications as read
// @access  Private
router.put('/read-all', markAllAsRead);

export default router;



