import express from 'express';
import { register, login, getMe, getUserByEmail, logout, getAllUsers } from '../controllers/authController.js'; // Controller functions  ye actual logic execute karenge
import authGuard from '../middleware/authGuard.js';  // Middleware import karo // Authentication check ke liye
import { validate } from '../utils/validation.js';   // Input validation ke liye
import { registerSchema, loginSchema } from '../utils/validation.js'; // Validation schemas import karo


const router = express.Router();



router.post('/register', validate(registerSchema), register); //public route

 // User login endpoint validate(loginSchema)  Controller function call
router.post('/login', validate(loginSchema), login);    //public route


/**
 * 1. authGuard - Token verify karta hai, req.user me user info add karta hai
 * 2. getMe - Controller function call hota hai (user info return karta hai)
 * Access: Private (sirf logged in users)
 */
router.get('/me', authGuard, getMe);    //Current logged in user ka info dene ke liye

// IMPORTANT: /users route must come BEFORE /user/:email to prevent route conflict
router.get('/users', authGuard, getAllUsers);              //Saare users fetch karne ke liye (document sharing dropdown ke liye) //private route

router.get('/user/:email', authGuard, getUserByEmail);      //Email se user find karne ke liye (document sharing ke liye use hota hai) //private route

router.post('/logout', authGuard, logout);    //authGuard -Authentication check,   logout - Controller function call hota hai

export default router;
