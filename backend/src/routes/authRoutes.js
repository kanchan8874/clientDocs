/**
 * AUTHRoutes.JS - Authentication Routes
 * 
 * Yeh file authentication ke sabhi API endpoints define karti hai.
 * 
 * Routes = API endpoints - client konsa URL hit karega aur konsa controller function call hoga
 * 
 * Route Structure:
 * - Method (GET, POST, PUT, DELETE)
 * - Path (/api/auth/register, /api/auth/login, etc.)
 * - Middleware (validation, authGuard)
 * - Controller function (actual logic)
 */

import express from 'express';
// Controller functions import karo - ye actual logic execute karenge
import { register, login, getMe, getUserByEmail, logout } from '../controllers/authController.js';
// Middleware import karo
import authGuard from '../middleware/authGuard.js';  // Authentication check ke liye
import { validate } from '../utils/validation.js';   // Input validation ke liye
// Validation schemas import karo
import { registerSchema, loginSchema } from '../utils/validation.js';

// Express router create karo
const router = express.Router();

// ============================================
// PUBLIC ROUTES (Authentication nahi chahiye)
// ============================================

/**
 * POST /api/auth/register
 * 
 * User registration endpoint
 * 
 * Flow:
 * 1. validate(registerSchema) - Input validate karta hai (name, email, password)
 * 2. register - Controller function call hota hai (user create karta hai)
 * 
 * Access: Public (kisi bhi user ko access kar sakta hai)
 */
router.post('/register', validate(registerSchema), register);

/**
 * POST /api/auth/login
 * 
 * User login endpoint
 * 
 * Flow:
 * 1. validate(loginSchema) - Input validate karta hai (email, password)
 * 2. login - Controller function call hota hai (password verify karta hai, token generate karta hai)
 * 
 * Access: Public
 */
router.post('/login', validate(loginSchema), login);

// ============================================
// PRIVATE ROUTES (Authentication required)
// ============================================

/**
 * GET /api/auth/me
 * 
 * Current logged in user ka info dene ke liye
 * 
 * Flow:
 * 1. authGuard - Token verify karta hai, req.user me user info add karta hai
 * 2. getMe - Controller function call hota hai (user info return karta hai)
 * 
 * Access: Private (sirf logged in users)
 */
router.get('/me', authGuard, getMe);

/**
 * GET /api/auth/user/:email
 * 
 * Email se user find karne ke liye (document sharing ke liye use hota hai)
 * 
 * Flow:
 * 1. authGuard - Authentication check
 * 2. getUserByEmail - Controller function call hota hai
 * 
 * Example: GET /api/auth/user/john@example.com
 * 
 * Access: Private
 */
router.get('/user/:email', authGuard, getUserByEmail);

/**
 * POST /api/auth/logout
 * 
 * User logout endpoint
 * 
 * Flow:
 * 1. authGuard - Authentication check
 * 2. logout - Controller function call hota hai
 * 
 * Note: Actual logout frontend me hoga (token remove karke)
 * 
 * Access: Private
 */
router.post('/logout', authGuard, logout);

// Router export karo - app.js me use hoga
export default router;
