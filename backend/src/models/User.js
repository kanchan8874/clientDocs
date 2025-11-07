/**
 * USER.JS - User Model (Database Schema)
 * 
 * Yeh file User collection ka schema define karti hai.
 * 
 * Schema = Database me data ka structure (konsa field kya type ka hoga)
 * 
 * Mongoose = MongoDB ke liye ODM (Object Data Modeling) library
 * 
 * Features:
 * - User registration data store karta hai
 * - Password automatically hash hota hai (pre-save hook se)
 * - Password comparison method provide karta hai
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * User Schema Definition
 * 
 * Ye schema define karta hai ki User collection me kya fields honge:
 * - name: String (required, max 100 characters)
 * - email: String (required, unique, validated)
 * - password: String (required, min 6 characters, hashed)
 * - createdAt: Date (automatically set)
 * - updatedAt: Date (automatically set)
 */
const userSchema = new mongoose.Schema({
  // User ka name
  name: {
    type: String,                    // Data type String
    required: [true, 'Name is required'],  // Required field - agar nahi hai to error
    trim: true,                      // Spaces remove karo start/end se
    maxlength: [100, 'Name cannot exceed 100 characters']  // Maximum length
  },
  
  // User ka email
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,                    // Email unique honi chahiye (duplicate nahi)
    lowercase: true,                 // Sabko lowercase me convert karo
    trim: true,                      // Spaces remove karo
    match: [                         // Email format validate karo (regex pattern)
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  
  // User ka password
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false  // IMPORTANT: By default password field exclude rahega queries se
                   // Security ke liye - jab bhi user fetch karo, password automatically nahi aayega
                   // Explicitly .select('+password') karna padega jab compare karna ho
  },
  
  // Timestamps - automatically createdAt aur updatedAt add karta hai
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true  // Mongoose automatically createdAt aur updatedAt manage karega
});

// ============================================
// DATABASE INDEXES
// ============================================

// Email pe index add karo - faster lookups ke liye
// Jab bhi email se search karenge, ye index use hoga (fast search)
userSchema.index({ email: 1 });

// ============================================
// PRE-SAVE HOOK (Password Hashing)
// ============================================

/**
 * Pre-save Hook - User save karne se pehle execute hota hai
 * 
 * Ye hook automatically password ko hash karta hai before saving
 * 
 * Flow:
 * 1. Check karo ki password modify hua hai ya nahi
 * 2. Agar modify hua hai, to bcrypt se hash karo
 * 3. Hash karke password field me store karo
 */
userSchema.pre('save', async function(next) {
  // Agar password modify nahi hua hai (update operation me), to skip karo
  // Sirf naya password ya modified password ko hash karo
  if (!this.isModified('password')) {
    return next();  // Next step pe jaao (save operation continue)
  }

  try {
    // Password hash karo using bcrypt
    // genSalt(10) - salt generate karta hai (security ke liye)
    // hash() - password ko hash karta hai
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    
    // Next step pe proceed karo
    next();
  } catch (error) {
    // Error aayi to next() me error pass karo
    next(error);
  }
});

// ============================================
// INSTANCE METHODS
// ============================================

/**
 * matchPassword() - Password Comparison Method
 * 
 * Ye method entered password ko database ke hashed password se compare karta hai
 * 
 * Use Case: Login ke time password verify karne ke liye
 * 
 * Flow:
 * 1. bcrypt.compare() use karke plain password ko hashed password se compare karo
 * 2. Boolean return karo (true = match, false = no match)
 */
userSchema.methods.matchPassword = async function(enteredPassword) {
  // bcrypt.compare() - plain password ko hashed password se compare karta hai
  // Ye automatically salt detect karta hai aur compare karta hai
  return await bcrypt.compare(enteredPassword, this.password);
};

// ============================================
// EXPORT MODEL
// ============================================

// User model create karo aur export karo
// 'User' - collection name (MongoDB me 'users' collection banega)
const User = mongoose.model('User', userSchema);

export default User;
