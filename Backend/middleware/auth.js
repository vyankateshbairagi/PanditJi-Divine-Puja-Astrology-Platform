// backend/middleware/auth.js - COMPLETE FIXED VERSION
const jwt = require('jsonwebtoken');
const Pandit = require('../models/Pandit');
const User = require('../models/User');
const Customer = require('../models/Customer');

// ✅ Customer authentication middleware (for user app)

exports.authenticateCustomer = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }
    
    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-for-development');
    const customerId = decoded.id || decoded.userId;
    
    if (!customerId) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token - missing customer ID'
      });
    }
    
    // Find customer by ID
    const customer = await Customer.findById(customerId).select('-password');
    
    if (!customer) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token - customer not found'
      });
    }
    
    // ✅ Set COMPLETE user object with all fields
    req.user = {
      id: customer._id,
      userId: customer._id,
      email: customer.email,
      phone: customer.phone,        // ✅ Always set phone
      name: customer.name,
      role: 'customer'
    };
    
    console.log(`✅ Customer authenticated: ${customer.email} (Phone: ${customer.phone})`);
    next();
    
  } catch (error) {
    console.error('❌ Customer auth error:', error.message);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Authentication error: ' + error.message
    });
  }
};

// ✅ Alias for backward compatibility
exports.authenticateUser = exports.authenticateCustomer;

// Pandit authentication middleware
exports.authenticatePandit = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-for-development');
    const panditId = decoded.id || decoded.userId;
    
    if (!panditId) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token - missing pandit ID'
      });
    }
    
    const pandit = await Pandit.findById(panditId).select('-password');
    
    if (!pandit) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token - pandit not found'
      });
    }
    
    req.user = {
      id: pandit._id,
      email: pandit.email,
      name: pandit.name,
      role: 'pandit',
      panditId: pandit._id
    };
    
    console.log(`✅ Pandit authenticated: ${pandit.name}`);
    next();
    
  } catch (error) {
    console.error('❌ Pandit auth error:', error.message);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Authentication error'
    });
  }
};

// Admin authentication middleware
exports.authenticateAdmin = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-for-development');
    
    if (decoded.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }
    
    // Check if token is expired
    const currentTime = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < currentTime) {
      return res.status(401).json({
        success: false,
        message: 'Token expired. Please login again.'
      });
    }
    
    req.user = decoded;
    next();
    
  } catch (error) {
    console.error('❌ Admin auth error:', error.message);
    
    // Only return 401 for actual token errors, not for network issues
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired. Please login again.'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Authentication error'
    });
  }
};


// Role check middleware
exports.isAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }
  next();
};

exports.isPandit = (req, res, next) => {
  if (req.user?.role !== 'pandit') {
    return res.status(403).json({
      success: false,
      message: 'Pandit access required'
    });
  }
  next();
};

exports.isCustomer = (req, res, next) => {
  if (req.user?.role !== 'customer') {
    return res.status(403).json({
      success: false,
      message: 'Customer access required'
    });
  }
  next();
};