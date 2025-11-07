/**
 * APP.JS - Express Application Setup
 * 
 * Yeh file Express app ko configure karti hai:
 * - Middleware setup (security, CORS, rate limiting, etc.)
 * - Routes define karti hai
 * - Error handling setup karti hai
 * 
 * IMPORTANT: Middleware order important hai - pehle security, phir routes, last me error handling
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Routes import karo - ye sabhi API endpoints define karte hain
import authRoutes from './routes/authRoutes.js';           // Authentication routes (/api/auth/*)
import clientRoutes from './routes/clientRoutes.js';       // Client routes (/api/clients/*)
import documentRoutes from './routes/documentRoutes.js';   // Document routes (/api/documents/*)
import notificationRoutes from './routes/notificationRoutes.js'; // Notification routes (/api/notifications/*)

// Error handling middleware - errors handle karne ke liye
import errorHandler from './middleware/errorHandler.js';   // General error handler
import notFound from './middleware/notFound.js';           // 404 error handler

dotenv.config();

// Express app instance create karo
const app = express();

// ============================================
// SECURITY MIDDLEWARE (Pehle ye sab setup karo)
// ============================================

// Helmet - Security headers add karta hai (XSS protection, etc.)
// Ye HTTP headers set karta hai jo attacks se bachata hai
app.use(helmet());

// CORS (Cross-Origin Resource Sharing) Configuration
// Frontend (React app) ko backend se data access karne ki permission deta hai
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173', // Frontend URL
  credentials: true,  // Cookies/credentials allow karta hai
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Rate Limiting - Too many requests se bachne ke liye
// Ek time period me maximum kitne requests allow hain
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes ka window
  max: process.env.NODE_ENV === 'production' ? 100 : 500, // Production me 100, development me 500 requests
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Health check route pe rate limiting skip karo
    return req.path === '/health';
  }
});
app.use('/api/', limiter); // Sirf /api/ routes pe rate limiting apply karo

// ============================================
// BODY PARSER MIDDLEWARE
// ============================================

// JSON data parse karo (request body me JSON data handle karne ke liye)
app.use(express.json());

// URL-encoded data parse karo (form data handle karne ke liye)
app.use(express.urlencoded({ extended: true }));

// ============================================
// ROUTES
// ============================================

// Health Check Route - Server running hai ya nahi check karne ke liye
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'ClientDocs API is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes - Different features ke liye routes
// Ye routes controllers ko map karte hain
app.use('/api/auth', authRoutes);           // Authentication: /api/auth/register, /api/auth/login, etc.
app.use('/api/clients', clientRoutes);      // Clients: /api/clients, /api/clients/:id, etc.
app.use('/api/documents', documentRoutes);  // Documents: /api/documents, /api/documents/:id, etc.
app.use('/api/notifications', notificationRoutes); // Notifications: /api/notifications, etc.

// ============================================
// ERROR HANDLING MIDDLEWARE (Ye last me hoga)
// ============================================

// 404 Error Handler - Agar route nahi mila to
app.use(notFound);

// General Error Handler - Sabhi errors handle karta hai
app.use(errorHandler);

// Express app export karo - server.js me use hoga
export default app;
