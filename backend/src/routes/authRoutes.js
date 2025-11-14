import express from 'express';
import { register, login, getMe, getUserByEmail, logout, getAllUsers } from '../controllers/authController.js';
import authGuard from '../middleware/authGuard.js';
import { validate } from '../utils/validation.js';
import { registerSchema, loginSchema } from '../utils/validation.js';


const router = express.Router();



router.post('/register', validate(registerSchema), register);

router.post('/login', validate(loginSchema), login);


router.get('/me', authGuard, getMe);

// IMPORTANT: /users route must come BEFORE /user/:email to prevent route conflict
router.get('/users', authGuard, getAllUsers);

router.get('/user/:email', authGuard, getUserByEmail);

router.post('/logout', authGuard, logout);

export default router;
