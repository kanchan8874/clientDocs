import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';


const userSchema = new mongoose.Schema({
  // User ka name
  name: {
    type: String,                    
    required: [true, 'Name is required'],  
    trim: true,                      // Spaces remove karo start/end se
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  
  // User ka email
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,63}$/,
      'Please provide a valid email'
    ]
  },
  
  
  // User ka password
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
    // Security ke liye - jab bhi user fetch karo, password automatically nahi aayega
  },
  

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
userSchema.index({ email: 1 });




userSchema.pre('save', async function(next) {
  // Agar password modify nahi hua hai (update operation me), to skip karo
  // Sirf naya password ya modified password ko hash karo
  if (!this.isModified('password')) {
    return next();  
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

 // matchPassword() 
 // Ye method entered password ko database ke hashed password se compare karta hai

userSchema.methods.matchPassword = async function(enteredPassword) {
  // bcrypt.compare() - plain password ko hashed password se compare karta hai
  // Ye automatically salt detect karta hai aur compare karta hai
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
