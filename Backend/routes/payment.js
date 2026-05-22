// backend/routes/payment.js
const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticateCustomer } = require('../middleware/auth');

// ✅ All payment routes require customer authentication
router.post('/create-order', authenticateCustomer, paymentController.createOrder);
router.post('/verify-payment', authenticateCustomer, paymentController.verifyPayment);
router.post('/cancel-booking', authenticateCustomer, paymentController.cancelBookingWithRefund);
router.get('/refund-eligibility/:bookingId', authenticateCustomer, paymentController.checkRefundEligibility);

// ✅ Test route to verify auth is working
router.get('/auth-test', authenticateCustomer, (req, res) => {
  res.json({
    success: true,
    message: 'Authentication working!',
    user: {
      id: req.user.id,
      email: req.user.email,
      name: req.user.name
    }
  });
});

module.exports = router;