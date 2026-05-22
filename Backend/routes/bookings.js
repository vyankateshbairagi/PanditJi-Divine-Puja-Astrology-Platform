// backend/routes/bookings.js - FIXED VERSION
const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { authenticateAdmin, authenticateCustomer } = require('../middleware/auth');
const { validateBooking } = require('../middleware/bookingValidation');

// ✅ FIX 12: Booking creation now accepts optional auth token
// If user is logged in, their customerId is saved on the booking (enables payment later)
// If guest, booking still works but payment will require login
router.post('/', validateBooking, (req, res, next) => {
  // Try to authenticate but don't fail if no token
  const authHeader = req.header('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const jwt = require('jsonwebtoken');
    const Customer = require('../models/Customer');
    const token = authHeader.replace('Bearer ', '');
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-for-development');
      const customerId = decoded.id || decoded.userId;
      if (customerId) {
        req.user = {
          id: customerId,
          email: decoded.email,
          phone: decoded.phone,
          name: decoded.name,
          role: decoded.role
        };
      }
    } catch (err) {
      // Token invalid/expired — continue as guest
      console.log('⚠️ Optional auth failed, proceeding as guest:', err.message);
    }
  }
  next();
}, bookingController.createBooking);


// Pandit accepts a booking
router.patch('/:bookingId/accept', require('../middleware/auth').authenticatePandit, bookingController.acceptBooking);

// Admin routes (protected)
router.get('/', authenticateAdmin, bookingController.getBookings);
router.get('/:id', authenticateAdmin, bookingController.getBookingById);
router.patch('/:id', authenticateAdmin, bookingController.updateBooking);
router.patch('/:id/cancel', authenticateAdmin, bookingController.cancelBooking);

module.exports = router;