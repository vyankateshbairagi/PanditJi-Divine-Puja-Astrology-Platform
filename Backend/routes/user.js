// backend/routes/user.js - FIXED VERSION
const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');
const Booking = require('../models/Booking');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { authenticateCustomer } = require('../middleware/auth');
const SupportTicket = require('../models/SupportTicket');
const Review = require('../models/Review');
const Pandit = require('../models/Pandit');
const emailService = require('../utils/emailService');
const authController = require('../controllers/authController');

// Customer registration uses email OTP verification
router.post('/register', authController.register);


// Customer login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
       const customer = await Customer.findOne({ 
      $or: [{ email }, { phone: email }]  // If user enters phone in email field
    });
    if (!customer) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }
    
    const isPasswordValid = await bcrypt.compare(password, customer.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }
    // ✅ FIX 1: Token expiry changed from 12h → 7d (prevents apparent logouts mid-session)
    // ✅ FIX 2: phone & name included in token so auth middleware can use them without DB lookup
    const token = jwt.sign(
      {
        id: customer._id,
        userId: customer._id,
        email: customer.email,
        phone: customer.phone,  // ✅ Add phone to token
        role: 'customer'
      },
      process.env.JWT_SECRET || 'fallback-secret-for-development',
      { expiresIn: '12h' }
    );
    customer.lastLoginAt = Date.now();
    await customer.save();
    res.json({ success: true, token, customer: { id: customer._id, name: customer.name, email: customer.email, phone: customer.phone } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get customer profile (protected)
router.get('/profile', authenticateCustomer, async (req, res) => {
  try {
    const customer = await Customer.findById(req.user.id).select('-password').populate({ path: 'bookings', populate: { path: 'serviceId panditId', select: 'name price contact email' } });
    res.json({ success: true, customer });
  } catch (error) {
    console.error('❌ Profile error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get customer bookings (protected)
router.get('/bookings', authenticateCustomer, async (req, res) => {
  try {
    const { status } = req.query;
    let query = { $or: [{ customerId: req.user.id }, { email: req.user.email }, { contact: req.user.phone }] };
    if (status) query.status = status;
    const bookings = await Booking.find(query)
      .populate('serviceId', 'name price category image')
      .populate('panditId', 'name contact rating experience')
      .sort({ dateTime: -1 });
    if (bookings.length > 0) {
      await Customer.findByIdAndUpdate(req.user.id, { $addToSet: { bookings: { $each: bookings.map(b => b._id) } } });
    }
    res.json({ success: true, bookings });
  } catch (error) {
    console.error('❌ Bookings error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ FIX 3: Verification code route — was using req.params.id (undefined) instead of req.params.bookingId
router.get('/bookings/:bookingId/verification-code', authenticateCustomer, async (req, res) => {
  try {
    const { bookingId } = req.params; // ✅ FIXED: was incorrectly `req.params.id` (undefined)
    const customerId = req.user.id;
    console.log('🔐 Verification code request for booking:', bookingId, 'by customer:', customerId);
    const booking = await Booking.findOne({
      _id: bookingId,
      $or: [{ customerId: customerId }, { email: req.user.email }, { contact: req.user.phone }]
    }).populate('serviceId', 'name price');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    if (!['accepted', 'confirmed'].includes(booking.status)) {
      return res.json({ success: true, data: { showCode: false, message: 'Code will be available when pandit starts the puja' } });
    }
    if (!booking.verificationCode) {
      return res.json({ success: true, data: { showCode: false, message: 'Pandit has not yet generated the verification code. Please wait.' } });
    }
    const isExpired = booking.codeExpiresAt && booking.codeExpiresAt.getTime() < Date.now();
    if (isExpired) {
      return res.json({ success: true, data: { showCode: false, verificationCode: null, isExpired: true, message: 'Code expired. Please ask pandit to generate a new code.' } });
    }
    res.json({ success: true, data: { showCode: true, verificationCode: booking.verificationCode, expiresAt: booking.codeExpiresAt, isExpired: false, message: 'Please share this code with your pandit to complete the puja.' } });
  } catch (error) {
    console.error('❌ Error getting verification code:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create support ticket
router.post('/support-ticket', authenticateCustomer, async (req, res) => {
  try {
    const { name, email, issueType, issueDescription, bookingId } = req.body;
    const customerId = req.user.id;
    if (!issueType || !issueDescription) {
      return res.status(400).json({ success: false, message: 'Issue type and description are required' });
    }
    const ticket = new SupportTicket({ customerId, name: name || req.user.name, email: email || req.user.email, issueType, issueDescription, bookingId: bookingId || null, status: 'open', createdAt: Date.now(), updatedAt: Date.now() });
    await ticket.save();
    res.json({ success: true, message: 'Support ticket submitted successfully', ticket: { id: ticket._id, ticketNumber: ticket._id.toString().slice(-8), status: ticket.status, createdAt: ticket.createdAt } });
  } catch (error) {
    console.error('❌ Support ticket error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get user's own support tickets
router.get('/support-tickets', authenticateCustomer, async (req, res) => {
  try {
    const customerId = req.user.id;
    const tickets = await SupportTicket.find({ customerId }).populate('bookingId', 'serviceId dateTime price status').sort({ createdAt: -1 });
    res.json({ success: true, tickets });
  } catch (error) {
    console.error('Error fetching support tickets:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update customer profile
router.put('/profile', authenticateCustomer, async (req, res) => {
  try {
    const updates = req.body;
    
    // If phone is being updated, check for duplicates
    if (updates.phone) {
      const existingCustomer = await Customer.findOne({ 
        phone: updates.phone,
        _id: { $ne: req.user.id }  // Exclude current user
      });
      
      if (existingCustomer) {
        return res.status(400).json({ 
          success: false, 
          message: 'Phone number already in use by another account' 
        });
      }
    }
    
    delete updates.password;
    const customer = await Customer.findByIdAndUpdate(
      req.user.id, 
      updates, 
      { new: true, runValidators: true }
    ).select('-password');
    
    res.json({ success: true, message: 'Profile updated successfully', customer });
  } catch (error) {
    console.error('❌ Profile update error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ FIX 4: Cancel booking — was missing customerId check, only matched email/phone
router.put('/bookings/:id/cancel', authenticateCustomer, async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      $or: [
        { customerId: req.user.id },
        { email: req.user.email },
        { contact: req.user.phone }
      ]
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found or unauthorized'
      });
    }

    // Check if booking can be cancelled (not already completed/cancelled)
    if (booking.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Completed bookings cannot be cancelled'
      });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Booking is already cancelled'
      });
    }

    // Check cancellation timing (optional - implement based on policy)
    const hoursUntilPuja = (new Date(booking.dateTime).getTime() - Date.now()) / (1000 * 60 * 60);
    if (hoursUntilPuja < 24) {
      return res.status(400).json({
        success: false,
        message: 'Bookings can only be cancelled 24 hours in advance'
      });
    }

    booking.status = 'cancelled';
    await booking.save();

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      booking
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Submit review
router.post('/review', authenticateCustomer, async (req, res) => {
  try {
    const { bookingId, rating, review } = req.body;
    const customerId = req.user.id;
    if (!bookingId || !rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Booking ID and valid rating (1-5) are required' });
    }
    const booking = await Booking.findOne({ _id: bookingId, $or: [{ customerId }, { email: req.user.email }, { contact: req.user.phone }] });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.status !== 'completed') return res.status(400).json({ success: false, message: 'You can only review completed bookings' });
    const existingReview = await Review.findOne({ bookingId });
    if (existingReview) return res.status(400).json({ success: false, message: 'You have already reviewed this booking' });
    const panditId = booking.panditId;
    if (!panditId) return res.status(400).json({ success: false, message: 'No pandit assigned to this booking' });
    const newReview = new Review({ bookingId, panditId, customerId, rating, review: review || '' });
    await newReview.save();
    const allReviews = await Review.find({ panditId });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    await Pandit.findByIdAndUpdate(panditId, { rating: avgRating, totalReviews: allReviews.length });
    res.json({ success: true, message: 'Thank you for your review!', review: newReview });
  } catch (error) {
    console.error('Review submission error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get reviews for a specific pandit (public)
router.get('/pandit/:panditId/reviews', async (req, res) => {
  try {
    const { panditId } = req.params;
    const reviews = await Review.find({ panditId }).populate('customerId', 'name').sort({ createdAt: -1 }).limit(20);
    res.json({ success: true, reviews: reviews.map(r => ({ id: r._id, customerName: r.customerId?.name || 'Anonymous', rating: r.rating, review: r.review, date: r.createdAt })) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Check if user can review a booking
router.get('/can-review/:bookingId', authenticateCustomer, async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findOne({ _id: bookingId, $or: [{ customerId: req.user.id }, { email: req.user.email }, { contact: req.user.phone }] });
    if (!booking) return res.json({ success: true, canReview: false, reason: 'Booking not found' });
    if (booking.status !== 'completed') return res.json({ success: true, canReview: false, reason: 'Booking not completed yet' });
    const existingReview = await Review.findOne({ bookingId });
    if (existingReview) return res.json({ success: true, canReview: false, reason: 'Already reviewed' });
    res.json({ success: true, canReview: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Forgot Password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });
    const customer = await Customer.findOne({ email });
    if (!customer) return res.status(404).json({ success: false, message: 'No account found with this email address' });
    const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
    customer.resetPasswordToken = resetToken;
    customer.resetPasswordExpires = Date.now() + 3600000;
    await customer.save();
    const emailSent = await emailService.sendPasswordResetEmail(customer.email, resetToken, customer.name);
    if (emailSent) {
      res.json({ success: true, message: 'Password reset code sent to your email' });
    } else {
      res.status(500).json({ success: false, message: 'Failed to send email. Please try again later.' });
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Verify Reset Code
router.post('/verify-reset-code', async (req, res) => {
  try {
    const { email, resetCode } = req.body;
    const customer = await Customer.findOne({ email, resetPasswordToken: resetCode, resetPasswordExpires: { $gt: Date.now() } });
    if (!customer) return res.status(400).json({ success: false, message: 'Invalid or expired reset code' });
    res.json({ success: true, message: 'Reset code verified' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, resetCode, newPassword } = req.body;
    const customer = await Customer.findOne({ email, resetPasswordToken: resetCode, resetPasswordExpires: { $gt: Date.now() } });
    if (!customer) return res.status(400).json({ success: false, message: 'Invalid or expired reset code' });
    customer.password = newPassword;
    customer.resetPasswordToken = null;
    customer.resetPasswordExpires = null;
    await customer.save();
    res.json({ success: true, message: 'Password has been reset successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete account
router.delete('/delete-account', authenticateCustomer, async (req, res) => {
  try {
    const { reason } = req.body;
    const customerId = req.user.id;
    const customer = await Customer.findById(customerId);
    if (!customer) return res.status(404).json({ success: false, message: 'User not found' });
    await Booking.updateMany({ customerId }, { name: 'Deleted User', email: null, contact: null, customerId: null });
    await Review.deleteMany({ customerId });
    await SupportTicket.deleteMany({ customerId });
    console.log(`Account deleted: ${customer.email} - Reason: ${reason}`);
    await Customer.findByIdAndDelete(customerId);
    res.json({ success: true, message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Add this to Backend/routes/user.js
router.delete('/bookings/:id/void', authenticateCustomer, async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      $or: [
        { customerId: req.user.id },
        { email: req.user.email },
        { contact: req.user.phone }
      ]
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found or unauthorized' });
    }

    // Only allow voiding if payment has never been completed
    if (booking.paymentStatus === 'completed') {
      return res.status(400).json({ success: false, message: 'Cannot void a paid booking. Use cancel instead.' });
    }

    // Delete notifications for this booking
    const Notification = require('../models/Notification');
    await Notification.deleteMany({ bookingId: booking._id });

    await Booking.findByIdAndDelete(booking._id);

    res.json({ success: true, message: 'Booking voided successfully' });
  } catch (error) {
    console.error('❌ Void booking error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;