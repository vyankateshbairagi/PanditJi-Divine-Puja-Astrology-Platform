// backend/middleware/bookingValidation.js - FIXED VERSION
const { body, validationResult } = require('express-validator');

exports.validateBooking = [
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .trim()
    .escape(),
  
  body('contact')
    .notEmpty()
    .withMessage('Contact number is required')
    .isMobilePhone('en-IN')
    .withMessage('Please enter a valid Indian mobile number'),
  
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail(),
  
  // ✅ FIX: Make serviceId optional (can be null for pandit-only booking)
  body('serviceId')
    .optional({ nullable: true, checkFalsy: false })
    .isMongoId()
    .withMessage('Invalid service ID'),
  
  // ✅ Add validation for panditId (optional)
  body('panditId')
    .optional({ nullable: true, checkFalsy: false })
    .isMongoId()
    .withMessage('Invalid pandit ID'),
  
  // ✅ Custom validator: Either serviceId or panditId must be provided
  body().custom((value, { req }) => {
    const { serviceId, panditId } = req.body;
    if (!serviceId && !panditId) {
      throw new Error('Either service or pandit selection is required');
    }
    return true;
  }),
  
  body('dateTime')
    .notEmpty()
    .withMessage('Date and time is required')
    .isISO8601()
    .withMessage('Invalid date format')
    .custom((value) => {
      const selectedDate = new Date(value);
      const now = new Date();
      if (selectedDate <= now) {
        throw new Error('Booking date must be in the future');
      }
      return true;
    }),
  
  body('address')
    .notEmpty()
    .withMessage('Address is required')
    .isLength({ min: 3, max: 500 })
    .withMessage('Address must be between 3 and 500 characters')
    .trim()
    .escape(),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(error => error.msg);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errorMessages,
        userMessage: 'Please check your input: ' + errorMessages.join(', ')
      });
    }
    next();
  }
];