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

router.get('/', validate(documentFiltersSchema, 'query'), getDocuments);
router.get('/:id', getDocument);
router.post(
  '/',
  uploadSingle,
  handleUploadError,
  validate(documentSchema),
  uploadDocument
);

router.put('/:id', validate(documentSchema), updateDocument);
router.delete('/:id', deleteDocument);
router.post('/:id/share', validate(shareDocumentSchema), shareDocument);
router.get('/:id/download', downloadDocument);

export default router;
