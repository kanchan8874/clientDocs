import mongoose from 'mongoose';


const notificationSchema = new mongoose.Schema({
  
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  // Type of notification
  type: {
    type: String,
    required: true,
    enum: ['document_shared'],
    default: 'document_shared'
  },
  // Message/title of notification
  title: {
    type: String,
    required: true
  },
  // Additional message/details
  message: {
    type: String,
    required: true
  },
  // Related document ID (if applicable)
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document'
  },
  // User who triggered the notification (who shared)
  fromUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // Read status
  isRead: {
    type: Boolean,
    default: false,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Compound index for efficient queries: get unread notifications for user
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;



