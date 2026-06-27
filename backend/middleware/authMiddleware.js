import jwt from 'jsonwebtoken';
import { User } from '../models/user.js';

export const protect = async (req, res, next) => {
    let token;

    // Check for Bearer token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey123');

            // Get user from database, excluding the password field
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }

            next();
        } catch (error) {
            console.error('Authentication Error:', error.message);
            res.status(401).json({ message: 'Not authorized, token invalid or expired' });
        }
    } else {
        res.status(401).json({ message: 'Not authorized, no token provided' });
    }
};
