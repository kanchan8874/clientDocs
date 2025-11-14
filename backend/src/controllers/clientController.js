import Client from '../models/Client.js';
import User from '../models/User.js';


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


export const createClient = async (req, res, next) => {
  try {
    // Get current user's email
    const currentUser = await User.findById(req.user.id);
    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if client email matches current user's email
    if (req.body.email && req.body.email.trim().toLowerCase() === currentUser.email.toLowerCase()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot use your own email address for a client. Please use a different email address.'
      });
    }

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

    // Get current user's email
    const currentUser = await User.findById(req.user.id);
    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if updated client email matches current user's email
    if (req.body.email && req.body.email.trim().toLowerCase() === currentUser.email.toLowerCase()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot use your own email address for a client. Please use a different email address.'
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
