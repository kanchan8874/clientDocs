import express from 'express';
import {
  getDocuments,
  getDocument,
  uploadDocument,
  updateDocument,
  deleteDocument,
  shareDocument,
  downloadDocument
} from '../controllers/fileController.js';
import authGuard from '../middleware/authGuard.js';
import { uploadSingle, handleUploadError } from '../middleware/upload.js';
import { validate } from '../utils/validation.js';
import { documentSchema, shareDocumentSchema, documentFiltersSchema } from '../utils/validation.js';

const router = express.Router();

// All routes require authentication
router.use(authGuard);

// @route   GET /api/documents
// @desc    Get all documents (with filters)
// @access  Private
router.get('/', validate(documentFiltersSchema, 'query'), getDocuments);

// @route   GET /api/documents/:id
// @desc    Get single document by ID
// @access  Private
router.get('/:id', getDocument);

// @route   POST /api/documents
// @desc    Upload/create new document
// @access  Private
router.post(
  '/',
  uploadSingle,
  handleUploadError,
  validate(documentSchema),
  uploadDocument
);

// @route   PUT /api/documents/:id
// @desc    Update document (metadata only)
// @access  Private
router.put('/:id', validate(documentSchema), updateDocument);

// @route   DELETE /api/documents/:id
// @desc    Delete document
// @access  Private
router.delete('/:id', deleteDocument);

// @route   POST /api/documents/:id/share
// @desc    Share document with users
// @access  Private
router.post('/:id/share', validate(shareDocumentSchema), shareDocument);

// @route   GET /api/documents/:id/download
// @desc    Download document file
// @access  Private
router.get('/:id/download', downloadDocument);

export default router;
