//SERVER.JS - Backend ka Entry Point
//Yeh file backend server start karti hai aur database se connect karti hai.
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import app from './app.js';
import connectDB from './config/db.js';

// Environment variables load karo (.env file se)
// Ye important hai kyunki PORT, database URL, etc. yaha se aate hain
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({
  path: path.resolve(__dirname, '../.env')
});

// Server ka port number (.env se ya default 5000)
const PORT = process.env.PORT || 5000;
connectDB();  // MongoDB database se connect karo

// Express server start karo - port pe listen karna shuru karo
app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`API URL: http://localhost:${PORT}/api`);
});

// Agar koi promise reject ho jaye aur catch nahi hua, to ye error handle karega
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  // Server safely close karo aur process exit karo
  app.close(() => {
    process.exit(1);
  });
});
