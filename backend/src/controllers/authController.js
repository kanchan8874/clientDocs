import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

/** register ke case me ,
 * 1. Request body se name, email, password lete hain
 * 2. Check karte hain ki user already exists hai ya nahi
 * 3. Agar nahi hai, to naya user create karte hain
 * 4. JWT token generate karte hain
 * 5. Token aur user info response me bhejte hain
 */

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;   // Request body se user data extract karo

    const userExists = await User.findOne({ email });
    if (userExists) {
      // Agar user already exists hai, to error response bhejo
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }
    
    const user = await User.create({   
      name,
      email,
      password  // Password hash automatically 
    });
    
    // User ID use karke JWT token generate karo ,Token me user ID encrypt hoti hai
    const token = generateToken(user._id);

    // Success response bhej deta hai  - token aur user info ke saath 
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        token,  
        user: {
          id: user._id,
          name: user.name,
          email: user.email //pasord nahi bhejega
        }
      }
    });
  } catch (error) {
    // Error aayi to error handler middleware ko forward karo
    next(error);
  }
};



export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body; //Request body se email aur password lete hain

    // Database me user find karo
    const user = await User.findOne({ email }).select('+password');
    
    // Agar user nahi mila to error
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    const isMatch = await user.matchPassword(password);
    
    // Agar password match nahi hua to error
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

  // Password match ho gaya - ab token generate karo
    const token = generateToken(user._id);
    // Success response bhejo
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,  // JWT token
        user: {
          id: user._id,
          name: user.name,
          email: user.email
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    // req.user - authGuard middleware se aaya hai (token verify karne ke baad)
    // req.user.id - current logged in user ka ID
    const user = await User.findById(req.user.id);

    // User info response me bhejo
    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt
        }
      }
    });
  } catch (error) {
    next(error);
  }
};


 // getUserByEmail() - Get User by Email Function
 //1. Request params se email lete hain
// 2. Database se user find karte hain
 // 3. User info response me bhejte hain 
 //Use Case: Document sharing ke liye - jab user kisi document ko share karta hai,
 // to email se user find karte hain

export const getUserByEmail = async (req, res, next) => {
  try {
    // Example: /api/auth/user/john@example.com
    const { email } = req.params;

    // Database se user find karo
    // .toLowerCase() - email ko lowercase me convert karo (case-insensitive search)
    // .select('-password') - password field exclude karo
    const user = await User.findOne({ email: email.toLowerCase() }).select('-password');

    // Agar user nahi mila to error
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found with this email'
      });
    }

    // User info response me bhejo
    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email
        }
      }
    });
  } catch (error) {
    next(error);
  }
};


 // Frontend me token remove karna hi sufficient hai

export const logout = async (req, res, next) => {
  try {
    // Simple success response

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
};
