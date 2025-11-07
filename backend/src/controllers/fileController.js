import Document from '../models/Document.js';
import Client from '../models/Client.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import fs from 'fs';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';
import configureCloudinary from '../config/cloudinary.js';

export const getDocuments = async (req, res, next) => {
  try {
    const { category, accessLevel, startDate, endDate, clientId } = req.query;
    const query = {};

    // Documents owned by user OR shared with user OR public
    query.$or = [
      { createdBy: req.user.id },
      { accessLevel: 'public' },
      { accessLevel: 'shared', sharedWith: req.user.id }
    ];

    // Apply filters
    if (category) {
      query.category = category;
    }

    if (accessLevel) {
      // If filtering by accessLevel, still need to check access
      if (accessLevel === 'private') {
        query.createdBy = req.user.id;
        query.accessLevel = 'private';
      } else if (accessLevel === 'shared') {
        query.$or = [
          { createdBy: req.user.id, accessLevel: 'shared' },
          { accessLevel: 'shared', sharedWith: req.user.id }
        ];
      } else if (accessLevel === 'public') {
        query.accessLevel = 'public';
      }
    }

    if (clientId) {
      query.clientId = clientId;
    }
    if (startDate || endDate) {
      query.uploadDate = {};
      if (startDate) {
        query.uploadDate.$gte = new Date(startDate);
      }
      if (endDate) {
        query.uploadDate.$lte = new Date(endDate);
      }
    }

    const documents = await Document.find(query)
      .populate('clientId', 'name email company')
      .populate('createdBy', 'name email')
      .populate('sharedWith', 'name email')
      .sort({ uploadDate: -1 });

    res.json({
      success: true,
      count: documents.length,
      data: { documents }
    });
  } catch (error) {
    next(error);
  }
};


export const getDocument = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id)
      .populate('clientId', 'name email company')
      .populate('createdBy', 'name email')
      .populate('sharedWith', 'name email');

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Check access: owner, shared with user, or public
    const hasAccess =
      document.createdBy._id.toString() === req.user.id ||
      document.accessLevel === 'public' ||
      (document.accessLevel === 'shared' && document.sharedWith.some(user => user._id.toString() === req.user.id));

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this document'
      });
    }

    res.json({
      success: true,
      data: { document }
    });
  } catch (error) {
    next(error);
  }
};

export const uploadDocument = async (req, res, next) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file'
      });
    }

    const { title, description, category, clientId, accessLevel } = req.body;

    // Verify client exists and belongs to user
    const client = await Client.findById(clientId);
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    if (client.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add documents to this client'
      });
    }

    // Upload to Cloudinary using stream
    try {
      configureCloudinary();
    } catch (configError) {
      return res.status(500).json({
        success: false,
        message: 'Cloudinary configuration error: ' + configError.message
      });
    }

    const folder = process.env.CLOUDINARY_FOLDER?.trim() || 'clientdocs';
    // Check if buffer exists
    if (!req.file.buffer) {
      return res.status(400).json({
        success: false,
        message: 'File buffer is missing. Please try uploading again.'
      });
    }

    // Sanitize filename for Cloudinary
    const sanitizedName = req.file.originalname
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/\.\./g, '_')
      .toLowerCase();
    const ext = path.extname(sanitizedName);
    const nameWithoutExt = path.basename(sanitizedName, ext);
    const uniqueId = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const publicId = `${folder}/${nameWithoutExt}-${uniqueId}`;

    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          resource_type: 'auto',
          public_id: publicId,
          overwrite: false
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            return reject(new Error(`Cloudinary upload failed: ${error.message}`));
          }
          if (!result) {
            return reject(new Error('Cloudinary upload returned no result'));
          }
          resolve(result);
        }
      );
      
      // Handle stream errors
      uploadStream.on('error', (error) => {
        console.error('Upload stream error:', error);
        reject(new Error(`Upload stream error: ${error.message}`));
      });
      
      // Write buffer to stream
      uploadStream.write(req.file.buffer);
      uploadStream.end();
    });

    // Create document record with Cloudinary details
    const document = await Document.create({
      title,
      description: description || '',
      category,
      clientId,
      createdBy: req.user.id,
      accessLevel: accessLevel || 'private',
      file: {
        originalName: req.file.originalname,
        fileName: uploadResult.public_id,
        filePath: uploadResult.secure_url,
        fileType: req.file.mimetype,
        fileSize: req.file.size,
        cloudinaryId: uploadResult.public_id
      },
      uploadDate: new Date()
    });

    const populatedDoc = await Document.findById(document._id)
      .populate('clientId', 'name email')
      .populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      data: { document: populatedDoc }
    });
  } catch (error) {
    next(error);
  }
};


export const updateDocument = async (req, res, next) => {
  try {
    let document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Only creator can update
    if (document.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this document'
      });
    }

    // Update document (metadata only, not file)
    document = await Document.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('clientId', 'name email')
      .populate('createdBy', 'name email');

    res.json({
      success: true,
      message: 'Document updated successfully',
      data: { document }
    });
  } catch (error) {
    next(error);
  }
};

export const deleteDocument = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Only creator can delete
    if (document.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this document'
      });
    }
    // Delete from Cloudinary if stored there
    if (document.file?.cloudinaryId) {
      configureCloudinary();
      const isImage = document.file.fileType?.startsWith('image/');
      await cloudinary.uploader.destroy(document.file.cloudinaryId, {
        resource_type: isImage ? 'image' : 'raw'
      });
    } else if (document.file?.filePath) {
      // Local filesystem cleanup (legacy)
      const filePath = document.file.filePath;
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Delete document record
    await document.deleteOne();

    res.json({
      success: true,
      message: 'Document deleted successfully',
      data: {}
    });
  } catch (error) {
    next(error);
  }
};
export const shareDocument = async (req, res, next) => {
  try {
    const { userIds } = req.body;

    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Only creator can share
    if (document.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to share this document'
      });
    }

    // Get existing shared user IDs
    const existingSharedIds = document.sharedWith?.map(id => id.toString()) || [];
    
    // Find newly added users (users not already in sharedWith)
    const newUserIds = userIds.filter(userId => !existingSharedIds.includes(userId.toString()));

    // Update document: set accessLevel to 'shared' and add user IDs
    document.accessLevel = 'shared';
    document.sharedWith = [...new Set(userIds)]; // Remove duplicates

    await document.save();

    // Create notifications for newly added users
    if (newUserIds.length > 0) {
      const fromUser = await User.findById(req.user.id);
      const notificationPromises = newUserIds.map(async (userId) => {
        // Don't create notification for self
        if (userId.toString() === req.user.id) {
          return;
        }

        await Notification.create({
          userId: userId,
          type: 'document_shared',
          title: 'Document Shared with You',
          message: `${fromUser.name} shared document "${document.title}" with you`,
          documentId: document._id,
          fromUserId: req.user.id,
          isRead: false
        });
      });

      await Promise.all(notificationPromises);
    }

    const populatedDoc = await Document.findById(document._id)
      .populate('clientId', 'name email')
      .populate('createdBy', 'name email')
      .populate('sharedWith', 'name email');

    res.json({
      success: true,
      message: 'Document shared successfully',
      data: { document: populatedDoc }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Download document file
// @route   GET /api/documents/:id/download
// @access  Private
export const downloadDocument = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Check access
    const hasAccess =
      document.createdBy.toString() === req.user.id ||
      document.accessLevel === 'public' ||
      (document.accessLevel === 'shared' && document.sharedWith.includes(req.user.id));

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to download this document'
      });
    }

    const filePathUrl = document.file.filePath;
    if (filePathUrl && /^https?:\/\//i.test(filePathUrl)) {
      // Redirect to Cloudinary secure URL
      return res.redirect(filePathUrl);
    }

    // Local file fallback
    if (!fs.existsSync(filePathUrl)) {
      return res.status(404).json({
        success: false,
        message: 'File not found on server'
      });
    }
    res.download(filePathUrl, document.file.originalName, (err) => {
      if (err) next(err);
    });
  } catch (error) {
    next(error);
  }
};
