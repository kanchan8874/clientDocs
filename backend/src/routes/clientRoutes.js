import express from 'express';
import {
  getClients,
  getClient,
  createClient,
  updateClient,
  deleteClient
} from '../controllers/clientController.js';
import authGuard from '../middleware/authGuard.js';
import { validate } from '../utils/validation.js';
import { clientSchema } from '../utils/validation.js';

const router = express.Router();

// All routes require authentication
router.use(authGuard);

// @route   GET /api/clients
// @desc    Get all clients for authenticated user
// @access  Private
router.get('/', getClients);

// @route   GET /api/clients/:id
// @desc    Get single client by ID
// @access  Private
router.get('/:id', getClient);

// @route   POST /api/clients
// @desc    Create new client
// @access  Private
router.post('/', validate(clientSchema), createClient);

// @route   PUT /api/clients/:id
// @desc    Update client
// @access  Private
router.put('/:id', validate(clientSchema), updateClient);

// @route   DELETE /api/clients/:id
// @desc    Delete client
// @access  Private
router.delete('/:id', deleteClient);

export default router;
