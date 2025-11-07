import Notification from '../models/Notification.js';
import Document from '../models/Document.js';
import User from '../models/User.js';


export const getNotifications = async (req, res, next) => {
  try {
    const { unreadOnly } = req.query;

    const query = { userId: req.user.id };

    // If unreadOnly is true, filter only unread notifications
    if (unreadOnly === 'true') {
      query.isRead = false;
    }

    const notifications = await Notification.find(query)
      .populate('documentId', 'title category')
      .populate('fromUserId', 'name email')
      .sort({ createdAt: -1 })
      .limit(50); // Limit to 50 most recent

    res.json({
      success: true,
      count: notifications.length,
      data: { notifications }
    });
  } catch (error) {
    next(error);
  }
};

export const getUnreadCount = async (req, res, next) => {
  try {
    const count = await Notification.countDocuments({
      userId: req.user.id,
      isRead: false
    });

    res.json({
      success: true,
      data: { count }
    });
  } catch (error) {
    next(error);
  }
};


export const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    // Check if notification belongs to user
    if (notification.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this notification'
      });
    }

    notification.isRead = true;
    await notification.save();

    res.json({
      success: true,
      message: 'Notification marked as read',
      data: { notification }
    });
  } catch (error) {
    next(error);
  }
};


export const markAllAsRead = async (req, res, next) => {
  try {
    const result = await Notification.updateMany(
      { userId: req.user.id, isRead: false },
      { isRead: true }
    );

    res.json({
      success: true,
      message: 'All notifications marked as read',
      data: { updatedCount: result.modifiedCount }
    });
  } catch (error) {
    next(error);
  }
};




