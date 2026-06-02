const jwt  = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Protect routes — verifies JWT token from Authorization header.
 * Attaches req.user on success.
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // Accept both Bearer token and x-auth-token header
    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.headers['x-auth-token']) {
      token = req.headers['x-auth-token'];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorised — no token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'campus_connect_secret_dev');
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found — token may be stale' });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Session expired — please log in again' });
    }
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

/**
 * Restrict route to specific roles (e.g. 'admin', 'moderator').
 * Must be used AFTER protect middleware.
 */
const restrictTo = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: `Access denied. Required role(s): ${roles.join(', ')}`,
    });
  }
  next();
};

/**
 * Optional auth — attaches user if token present, continues anyway.
 * Useful for public routes that optionally show user-specific data.
 */
const optionalAuth = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'campus_connect_secret_dev');
      req.user = await User.findById(decoded.id).select('-password');
    }
  } catch (_) {
    // Silently ignore invalid token for optional routes
  }
  next();
};

module.exports = { protect, restrictTo, optionalAuth };