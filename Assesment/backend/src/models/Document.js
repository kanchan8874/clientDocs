import mongoose from 'mongoose';

/**
 * Document Model Schema
 * 
 * Represents a document/file uploaded by a user for a client.
 * Stores metadata only - actual files stored locally or on Cloudinary.
 * 
 * Key Features:
 * - File metadata (not raw file data)
 * - Access control (private, shared, public)
 * - Sharing with specific users
 * - Category classification
 * - Owner-based access control
 */

const documentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Document title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: ['Proposal', 'Invoice', 'Report', 'Contract'],
      message: 'Category must be one of: Proposal, Invoice, Report, Contract'
    },
    index: true // Index for filtering
  },
  // File metadata (actual file stored separately)
  file: {
    originalName: {
      type: String,
      required: true
    },
    fileName: {
      type: String,
      required: true // Sanitized filename
    },
    filePath: {
      type: String,
      required: true // Local path or Cloudinary URL
    },
    fileType: {
      type: String,
      required: true,
      enum: ['application/pdf', 'image/png', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    },
    fileSize: {
      type: Number,
      required: true // in bytes
    },
    // Cloudinary specific (if using cloud storage)
    cloudinaryId: {
      type: String,
      default: null
    }
  },
  uploadDate: {
    type: Date,
    default: Date.now,
    index: true // Index for date filtering
  },
  accessLevel: {
    type: String,
    required: true,
    enum: {
      values: ['private', 'shared', 'public'],
      message: 'Access level must be one of: private, shared, public'
    },
    default: 'private',
    index: true // Index for filtering
  },
  // Reference to the client this document belongs to
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true,
    index: true
  },
  // Reference to the user who created/uploaded this document
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  // Array of user IDs who have shared access (for accessLevel: 'shared')
  sharedWith: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound indexes for efficient queries
// Find documents by client
documentSchema.index({ clientId: 1, uploadDate: -1 });

// Find documents by creator
documentSchema.index({ createdBy: 1, uploadDate: -1 });

// Find shared documents for a user
documentSchema.index({ accessLevel: 1, sharedWith: 1 });

// Find public documents
documentSchema.index({ accessLevel: 1, uploadDate: -1 });

// Text search index for title and description
documentSchema.index({ title: 'text', description: 'text' });

const Document = mongoose.model('Document', documentSchema);

export default Document;
