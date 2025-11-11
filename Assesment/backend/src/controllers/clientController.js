import Client from '../models/Client.js';

/**
 * Client Controller
 * 
 * Handles all client-related operations:
 * - Create, Read, Update, Delete clients
 * - Only allows users to access their own clients
 */

// @desc    Get all clients for authenticated user
// @route   GET /api/clients
// @access  Private
export const getClients = async (req, res, next) => {
  try {
    const clients = await Client.find({ createdBy: req.user.id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: clients.length,
      data: { clients }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single client by ID
// @route   GET /api/clients/:id
// @access  Private
export const getClient = async (req, res, next) => {
  try {
    const client = await Client.findById(req.params.id);

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    // Check if client belongs to the authenticated user
    if (client.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this client'
      });
    }

    res.json({
      success: true,
      data: { client }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new client
// @route   POST /api/clients
// @access  Private
export const createClient = async (req, res, next) => {
  try {
    // Add user ID to request body
    req.body.createdBy = req.user.id;

    const client = await Client.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Client created successfully',
      data: { client }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update client
// @route   PUT /api/clients/:id
// @access  Private
export const updateClient = async (req, res, next) => {
  try {
    let client = await Client.findById(req.params.id);

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    // Check if client belongs to the authenticated user
    if (client.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this client'
      });
    }

    client = await Client.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    res.json({
      success: true,
      message: 'Client updated successfully',
      data: { client }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete client
// @route   DELETE /api/clients/:id
// @access  Private
export const deleteClient = async (req, res, next) => {
  try {
    const client = await Client.findById(req.params.id);

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    // Check if client belongs to the authenticated user
    if (client.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this client'
      });
    }

    await client.deleteOne();

    res.json({
      success: true,
      message: 'Client deleted successfully',
      data: {}
    });
  } catch (error) {
    next(error);
  }
};
