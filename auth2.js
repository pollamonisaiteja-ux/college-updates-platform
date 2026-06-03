const express = require('express');
const router  = express.Router();
const jwt     = require('jsonwebtoken');
const User    = require('../models/User');
const { protect } = require('../middleware/auth');

const signToken = (id) =>
  jwt.sign(
    { id },
    process.env.JWT_SECRET || 'campus_connect_secret_dev',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

const sendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  res.status(statusCode).json({
    success: true,
    token,
    user: user.publicProfile,
  });
};

/**
 * POST /api/auth/register
 * Create a new student account.
 */
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, registrationNumber, branch } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    // Check VIT-AP email
    if (!email.endsWith('@vitap.ac.in')) {
      return res.status(400).json({ success: false, message: 'Only VIT-AP email addresses are allowed (@vitap.ac.in).' });
    }

    // Check duplicate
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }

    const user = await User.create({ name, email, password, registrationNumber, branch });
    sendToken(user, 201, res);
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: messages.join(' ') });
    }
    next(err);
  }
});

/**
 * POST /api/auth/login
 * Authenticate and return a JWT.
 */
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // Update last seen
    user.lastSeen = new Date();
    await user.save({ validateBeforeSave: false });

    sendToken(user, 200, res);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/auth/me
 * Get the currently logged-in user.
 */
router.get('/me', protect, (req, res) => {
  res.json({ success: true, user: req.user.publicProfile });
});

/**
 * PATCH /api/auth/me
 * Update own profile (name, bio, branch).
 */
router.patch('/me', protect, async (req, res, next) => {
  try {
    const allowed = ['name', 'bio', 'branch', 'avatar'];
    const updates = {};
    allowed.forEach(field => { if (req.body[field] !== undefined) updates[field] = req.body[field]; });

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, user: user.publicProfile });
  } catch (err) {
    next(err);
  }
});

module.exports = router;