/**
MongoDB Database Connection, Yeh file MongoDB database se connect karti hai.
 * 1. MongoDB URI (.env file se) use karke connect karti hai
 */
import mongoose from 'mongoose';

const connectDB = async () => {
  try {
   
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
    });

 
    console.log(` MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database: ${conn.connection.name}`);
    
  
    // Error event - Agar connection me koi error aaye
    mongoose.connection.on('error', (err) => {
      console.error(' MongoDB connection error:', err);
    });

    // Disconnected event - Agar connection disconnect ho jaye
    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected');
    });

    // SIGINT event - Jab terminal me Ctrl + C dabate ho ya app band hoti hai
    // Ye code trigger hota hai taki database connection safely close ho
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed due to app termination');
      process.exit(0);
    });

  } catch (error) {
    // Connection failed - Error message dikhao aur process exit karo
    console.error('MongoDB connection failed:', error.message);
    process.exit(1); // Exit code 1 = error
  }
};
export default connectDB;
