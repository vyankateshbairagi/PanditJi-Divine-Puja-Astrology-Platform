// backend/middleware/validation.js - FIXED VERSION
const { body, validationResult } = require('express-validator');

// Validation rules for pandit
exports.validatePandit = [
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters'),
  
  body('email')
    .isEmail()
    .withMessage('Valid email is required'),
  
  body('contact')
    .isMobilePhone()
    .withMessage('Valid contact number is required'),
  
  body('rating')
    .isFloat({ min: 0, max: 5 })
    .withMessage('Rating must be between 0 and 5'),
  
  body('experience')
    .isInt({ min: 0 })
    .withMessage('Experience must be a positive number'),
  
  (req, res, next) => {
    console.log('🔍 Pandit Validation Debug:');
    console.log('   Body received:', req.body);
    
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }
    
    console.log('✅ Validation passed');
    next();
  }
];

// Validation rules for service
exports.validateService = [
  body('name')
    .notEmpty()
    .withMessage('Service name is required'),
  
  body('description')
    .isLength({ min: 10 })
    .withMessage('Description must be at least 10 characters'),
  
  body('price')
    .notEmpty()
    .withMessage('Price is required'),
  
  body('category')
    .isIn(['regular', 'festive', 'hawan', 'shanti', 'shraddha'])
    .withMessage('Invalid category'),
  
  (req, res, next) => {
    console.log('🔍 Service Validation Debug:');
    console.log('   Body received:', req.body);
    console.log('   Files received:', req.file);
    
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      console.log('❌ Service validation errors:', errors.array());
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }
    
    console.log('✅ Service validation passed');
    next();
  }
];