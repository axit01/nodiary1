const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id, name, role, department) => {
    return jwt.sign({ id, name, role, department }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const authUser = async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        // If the user is a faculty or HOD, check if they have a profile created by admin
        if (user.role === 'faculty' || user.role === 'hod') {
            const Faculty = require('../models/Faculty');
            const facultyProfile = await Faculty.findOne({ email: user.email });
            if (!facultyProfile) {
                return res.status(403).json({ message: 'No faculty profile found. Please contact Admin.' });
            }
        }

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id, user.name, user.role, user.department),
        });
    } else {
        res.status(401).json({ message: 'Invalid email or password' });
    }
};

// @desc    Register a new admin (For seeding mostly)
// @route   POST /api/auth/register
// @access  Public (Should be protected or removed in prod)
const registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400).json({ message: 'User already exists' });
        return;
    }

    const user = await User.create({
        name,
        email,
        password,
        role: 'admin',
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id, user.name, user.role, user.department),
        });
    } else {
        res.status(400).json({ message: 'Invalid user data' });
    }
};

const crypto = require('crypto');
const { sendResetEmail } = require('../utils/mailer');

// @desc    Forgot Password - Send reset email
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
    const { email } = req.body;
    let user;
    try {
        user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(20).toString('hex');

        // Hash token and set to field
        user.resetPasswordToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        // Set expire (30 mins)
        user.resetPasswordExpire = Date.now() + 30 * 60 * 1000;

        await user.save();

        // Create reset url
        // In local dev, it's http://localhost:5173/reset-password/:token
        const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

        await sendResetEmail({
            name: user.name,
            email: user.email,
            resetLink: resetUrl
        });

        res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
        console.error('Forgot password error:', error);
        if (user) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save();
        }
        res.status(500).json({ message: 'Internal server error' });
    }
};

// @desc    Reset Password
// @route   POST /api/auth/reset-password/:token
// @access  Public
const resetPassword = async (req, res) => {
    try {
        // Get hashed token
        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(req.params.token)
            .digest('hex');

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        // Set new password
        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        res.status(200).json({ message: 'Password reset successful' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { authUser, registerUser, forgotPassword, resetPassword };
