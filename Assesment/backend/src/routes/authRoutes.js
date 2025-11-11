import express from 'express';
import { register, login, getMe, getUserByEmail, logout } from '../controllers/authController.js';
import authGuard from '../middleware/authGuard.js';
import { validate } from '../utils/validation.js';
import { registerSchema, loginSchema } from '../utils/validation.js';

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', validate(registerSchema), register);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', validate(loginSchema), login);

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', authGuard, getMe);

// @route   GET /api/auth/user/:email
// @desc    Get user by email (for sharing)
// @access  Private
router.get('/user/:email', authGuard, getUserByEmail);

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', authGuard, logout);

export default router;
