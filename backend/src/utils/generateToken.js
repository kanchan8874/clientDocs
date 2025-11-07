import jwt from 'jsonwebtoken';

/**
 * Generate JWT Token
 * Creates a JWT token for user authentication.
 * Token includes user ID and expires based on JWT_EXPIRY env variable.
 * @param {string} userId - MongoDB user ID
 * @returns {string} JWT token
 */

const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRY || '7d'
    }
  );
};

export default generateToken;
