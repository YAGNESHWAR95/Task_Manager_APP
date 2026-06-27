import { User } from '../models/user.js';
import jwt from 'jsonwebtoken';

// Helper to generate a JWT token signed with the environment secret
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secretkey123', {
        expiresIn: '7d',
    });
};

// @desc Register a new user
// @route POST /api/auth/register
export const register = async (req, res) => {
    const { username, email, password } = req.body;
    try {
        // Validate input fields
        if (!username || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        // Check if user already exists by email
        const emailExists = await User.findOne({ email });
        if (emailExists) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        // Check if user already exists by username
        const usernameExists = await User.findOne({ username });
        if (usernameExists) {
            return res.status(400).json({ message: 'Username is already taken' });
        }

        // Create new user
        const user = await User.create({
            username,
            email,
            password
        });

        // Generate token
        const token = generateToken(user._id);

        res.status(201).json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Authenticate a user and get token
// @route POST /api/auth/login
export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Check password matching
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Generate token
        const token = generateToken(user._id);

        res.status(200).json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
