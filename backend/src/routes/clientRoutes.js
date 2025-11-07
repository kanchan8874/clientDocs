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

router.get('/', getClients); // Get all clients for the authenticated user
router.get('/:id', getClient);  // Get a specific client by ID
router.post('/', validate(clientSchema), createClient);  // Create a new client
router.put('/:id', validate(clientSchema), updateClient);  // Update an existing client
router.delete('/:id', deleteClient);  // Delete a client by ID

export default router;
