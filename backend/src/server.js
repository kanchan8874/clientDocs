/**
 * SERVER.JS - Backend ka Entry Point
 * 
 * Yeh file backend server start karti hai aur database se connect karti hai.
 * 
 * Flow:
 * 1. Environment variables load karti hai (.env file se)
 * 2. MongoDB database se connect karti hai
 * 3. Express app start karti hai (listening port pe)
 * 4. Error handling setup karti hai
 */

import dotenv from 'dotenv';
import app from './app.js';
import connectDB from './config/db.js';

// Environment variables load karo (.env file se)
// Ye important hai kyunki PORT, database URL, etc. yaha se aate hain
dotenv.config();

// Server ka port number (.env se ya default 5000)
const PORT = process.env.PORT || 5000;

// MongoDB database se connect karo
// connectDB() function database connection establish karta hai
connectDB();

// Express server start karo - port pe listen karna shuru karo
// Jab server start ho jayega, ye message console pe dikhega
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 API URL: http://localhost:${PORT}/api`);
});

// Unhandled promise rejections handle karo
// Agar koi promise reject ho jaye aur catch nahi hua, to ye error handle karega
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
  // Server safely close karo aur process exit karo
  app.close(() => {
    process.exit(1);
  });
});
