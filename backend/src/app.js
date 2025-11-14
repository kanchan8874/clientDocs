//APP.JS - Express Application Setup ,Yeh file Express app ko configure karti hai,Routes define karti hai,Error handling setup karti hai
//Middleware setup (security, CORS, rate limiting, etc.
import express from 'express'; 
import cors from 'cors';
import helmet from 'helmet';
// Rate limiting disabled - removed import to prevent 429 errors during development
// import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Routes import karo - ye sabhi API endpoints define karte hain
import authRoutes from './routes/authRoutes.js';           
import clientRoutes from './routes/clientRoutes.js';      
import documentRoutes from './routes/documentRoutes.js';  
import notificationRoutes from './routes/notificationRoutes.js';

// Error handling middleware - errors handle karne ke liye
import errorHandler from './middleware/errorHandler.js';   
import notFound from './middleware/notFound.js';    

dotenv.config();

// Express app instance create karo
const app = express();

// Helmet - Security headers add karta hai (XSS protection, etc.),// Ye HTTP headers set karta hai jo attacks se bachata hai
app.use(helmet());

// CORS (Cross-Origin Resource Sharing) Configuration
// Frontend (React app) ko backend se data access karne ki permission deta hai
const defaultOrigins = ['http://localhost:5173', 'http://localhost:5174'];
const envOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim()).filter(Boolean)
  : [];
const allowedOrigins = [...new Set([...defaultOrigins, ...envOrigins])];

const corsOptions = {
  origin: (origin, callback) => {
    // origin null hona possible hai (Postman/Server-side requests) - allow karo
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Rate Limiting - Disabled for development to prevent 429 errors during active development
// Uncomment and configure for production if needed
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes ka window
//   max: process.env.NODE_ENV === 'production' ? 100 : 10000, // Production me 100, development me 10000 requests
//   message: 'Too many requests from this IP, please try again later.',
//   standardHeaders: true,
//   legacyHeaders: false,
//   skip: (req) => {
//     // Health check route pe rate limiting skip karo
//     return ['/health', '/healthz', '/api/health'].includes(req.path);
//   }
// });
// app.use('/api/', limiter); 

// JSON data parse karo (request body me JSON data handle karne ke liye)
app.use(express.json());

// URL-encoded data parse karo (form data handle karne ke liye)
app.use(express.urlencoded({ extended: true }));

// Health Check Route - Server running hai ya nahi check karne ke liye
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'ClientDocs API is running',
    timestamp: new Date().toISOString()
  });
});

// Render default health check path support
app.get('/healthz', (req, res) => {
  res.json({
    status: 'OK',
    message: 'ClientDocs API is healthy',
    timestamp: new Date().toISOString()
  });
});

// API Health route (kuch systems /api/health call karte hain)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'ClientDocs API is running',
    timestamp: new Date().toISOString()
  });
});

// Root Route - Render jese platforms ke health check ke liye 200 response
app.get('/', (req, res) => {
  res.json({
    status: 'OK',
    message: 'ClientDocs API root endpoint',
    timestamp: new Date().toISOString()
  });
});

// API Routes - Different features ke liye routes
// Ye routes controllers ko map karte hain
app.use('/api/auth', authRoutes);           
app.use('/api/clients', clientRoutes);      
app.use('/api/documents', documentRoutes); 
app.use('/api/notifications', notificationRoutes); 


// 404 Error Handler - Agar route nahi mila to
app.use(notFound);

// General Error Handler - Sabhi errors handle karta hai
app.use(errorHandler);

// Express app export karo - server.js me use hoga
export default app;
