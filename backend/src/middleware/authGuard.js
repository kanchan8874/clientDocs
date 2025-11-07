/**
 * AUTHGUARD.JS - Authentication Middleware
 * Yeh middleware protected routes ko secure karta hai.
 * 1. Request headers se JWT token extract karta hai
 * 2. Token verify karta hai (valid hai ya nahi)
 * 3. Token se user ID nikalta hai
 * 4. Database se user fetch karta hai
 * 5. req.user me user info add karta hai
 * 6. Next middleware/controller ko forward karta hai
 * Agar token invalid hai ya missing hai, to error response bhejta hai.
 */
import jwt from 'jsonwebtoken';
import User from '../models/User.js';


const authGuard = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      // "Bearer <token>" se sirf token part nikalta hai
      // split(' ')[1] - space se split karke second part (token) lete hain
      token = req.headers.authorization.split(' ')[1];
    }
    // Agar token nahi mila to error response bhejo
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route. Please provide a valid token.'
      });
    }

    try {
    
      // jwt.verify() - token ko verify karta hai aur decode karta hai
      // process.env.JWT_SECRET - token encrypt karne ke liye use hua secret key
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // decoded object me user ID hai (jab token generate kiya tha tab user ID use hui thi)
      // Token se user ID nikal kar database se user fetch karo
      req.user = await User.findById(decoded.id).select('-password');

      // Agar user nahi mila to error
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User not found. Token is invalid.'
        });
      }
      // Agar sab kuch theek hai, to next middleware/controller ko forward karo
      next();
      
    } catch (error) {
      // Token verification failed (invalid ya expired token)
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token. Please login again.'
      });
    }
  } catch (error) {
    // Koi aur error aayi to
    return res.status(500).json({
      success: false,
      message: 'Authentication error',
      // Development me error details dikhao, production me generic message
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};
// Middleware export karo - routes me use hoga
export default authGuard;
