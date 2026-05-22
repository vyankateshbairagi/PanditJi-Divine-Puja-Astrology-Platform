const express = require('express');
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/authController');

const router = express.Router();

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many OTP requests. Please try again later.'
  }
});

router.post('/send-otp', otpLimiter, authController.sendOtp);
router.post('/register', otpLimiter, authController.register);

module.exports = router;