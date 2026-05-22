// backend/controllers/paymentController.js - FIXED VERSION
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Booking = require('../models/Booking');





// Initialize Razorpay with error handling
let razorpay;
try {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
  console.log('✅ Razorpay initialized successfully');
} catch (error) {
  console.error('❌ Razorpay initialization failed:', error.message);
}

// Calculate advance amount (30% of total)
const calculateAdvance = (totalPrice) => {
  return Math.round(totalPrice * 0.3);
};

// Extract numeric price from string like "₹1099/-"
const extractNumericPrice = (priceString) => {
  if (!priceString) return 0;
  const match = priceString.toString().match(/\d+/);
  return match ? parseInt(match[0]) : 0;
};

// Create Razorpay Order
exports.createOrder = async (req, res) => {
  try {
    const { bookingId, totalAmount } = req.body;

    // ✅ Build query with available fields only
    const query = { _id: bookingId };
    const orConditions = [{ customerId: req.user.id }];
    
    if (req.user.email) orConditions.push({ email: req.user.email });
    if (req.user.phone) orConditions.push({ contact: req.user.phone });
    
    query.$or = orConditions;

    const booking = await Booking.findOne(query);
    
    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        message: 'Booking not found or unauthorized' 
      });
    }
    // ✅ FIX 6: Prevent duplicate payment orders for already-paid bookings
    if (booking.paymentStatus === 'completed') {
      return res.status(400).json({ success: false, message: 'This booking has already been paid' });
    }

    const advanceAmount = calculateAdvance(totalAmount);

    console.log(`Booking ID: ${bookingId}`);
    console.log(`Total Amount: ₹${totalAmount}`);
    console.log(`Advance Amount (30%): ₹${advanceAmount}`);

    const options = {
      amount: advanceAmount * 100, // Convert to paise
      currency: 'INR',
      receipt: `booking_${bookingId}`,
      payment_capture: 1,
      notes: {
        bookingId: bookingId.toString(),
        customerId: req.user.id.toString(),
        totalAmount: totalAmount,
        advanceAmount: advanceAmount
      }
    };

    const order = await razorpay.orders.create(options);
    console.log('✅ Razorpay order created:', order.id);

    // Update booking with order ID
    await Booking.findByIdAndUpdate(bookingId, {
      orderId: order.id,
      advanceAmount: advanceAmount
    });

    res.json({
      success: true,
      orderId: order.id,
      amount: advanceAmount,
      currency: 'INR',
      keyId: process.env.RAZORPAY_KEY_ID
    });

  } catch (error) {
    console.error('❌ Order creation error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to create payment order' });
  }
};

// Verify Payment
exports.verifyPayment = async (req, res) => {
  try {
    const { orderId, paymentId, signature, bookingId, totalAmount } = req.body;

    // ✅ Build query with available fields only
    const query = { _id: bookingId };
    const orConditions = [{ customerId: req.user.id }];
    
    if (req.user.email) orConditions.push({ email: req.user.email });
    if (req.user.phone) orConditions.push({ contact: req.user.phone });
    
    query.$or = orConditions;

    const booking = await Booking.findOne(query);
    
    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        message: 'Booking not found or unauthorized' 
      });
    }    
    // Verify Razorpay signature
    const body = orderId + '|' + paymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    console.log(`Expected: ${expectedSignature}`);
    console.log(`Received: ${signature}`);

    if (expectedSignature !== signature) {
      console.error('❌ Invalid payment signature');
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }

    const advanceAmount = calculateAdvance(totalAmount || booking.actualPrice || 0);

    await Booking.findByIdAndUpdate(bookingId, {
      paymentId: paymentId,
      paymentStatus: 'completed',
      paidAt: new Date(),
      advanceAmount: advanceAmount
    });

    console.log('✅ Payment verified for booking:', bookingId);

    res.json({ success: true, message: 'Payment verified successfully' });

  } catch (error) {
    console.error('❌ Payment verification error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Process Refund (internal helper)
exports.processRefund = async (bookingId, refundPercentage = 100) => {
  try {
    console.log(`Processing refund for booking: ${bookingId}, ${refundPercentage}%`);

    const booking = await Booking.findById(bookingId);

    if (!booking || booking.paymentStatus !== 'completed') {
      return { success: false, message: 'Invalid booking or payment not completed' };
    }

    if (!booking.paymentId) {
      return { success: false, message: 'No payment found for this booking' };
    }

    const refundAmount = (booking.advanceAmount * refundPercentage) / 100;

    const refundOptions = {
      payment_id: booking.paymentId,
      amount: Math.round(refundAmount * 100),
      notes: {
        bookingId: bookingId.toString(),
        reason: `Cancellation refund - ${refundPercentage}%`
      }
    };

    const refund = await razorpay.payments.refund(refundOptions);

    await Booking.findByIdAndUpdate(bookingId, {
      refundId: refund.id,
      refundAmount: refundAmount,
      refundStatus: 'completed',
      paymentStatus: refundPercentage === 100 ? 'refunded' : 'partially_refunded'
    });

    console.log('✅ Refund processed:', refund.id);
    return { success: true, refund };

  } catch (error) {
    console.error('❌ Refund error:', error);
    return { success: false, message: error.message };
  }
};

// Refund eligibility rules
const rules = [
  {
    name: 'FULL_REFUND',
    condition: ({ hoursSinceBooking }) => hoursSinceBooking <= 5,
    result: { eligible: true, percentage: 100, reason: 'Cancelled within 5 hours' }
  },
  {
    name: 'HALF_REFUND',
    condition: ({ hoursUntilPuja }) => hoursUntilPuja > 30,
    result: { eligible: true, percentage: 50, reason: 'Cancelled >30 hours before puja' }
  },
  {
    name: 'NO_REFUND',
    condition: ({ hoursUntilPuja }) => hoursUntilPuja <= 30 && hoursUntilPuja > 0,
    result: { eligible: false, percentage: 0, reason: 'Cancelled within 30 hours' }
  }
];

const getRefundEligibility = ({ bookingDateTime, createdAt, now = new Date() }) => {
  const bookingDate = new Date(bookingDateTime);
  const createdDate = new Date(createdAt);
  const current = new Date(now);

  const hoursSinceBooking = (current - createdDate) / (1000 * 60 * 60);
  const hoursUntilPuja = (bookingDate - current) / (1000 * 60 * 60);

  // ✅ Rule 1: Puja already passed
  if (hoursUntilPuja <= 0) {
    return {
      eligible: false,
      percentage: 0,
      reason: 'Puja has already passed. No refund available.'
    };
  }

  // ✅ Rule 2: Cancelled within 5 hours of booking (full refund)
  if (hoursSinceBooking <= 5) {
    return {
      eligible: true,
      percentage: 100,
      reason: `Cancelled within 5 hours of booking (${hoursSinceBooking.toFixed(1)} hours ago)`
    };
  }
  
  // ✅ Rule 3: Cancelled more than 30 hours before puja (50% refund)
  else if (hoursUntilPuja > 30) {
    return {
      eligible: true,
      percentage: 50,
      reason: `Cancelled ${hoursUntilPuja.toFixed(1)} hours before puja (30+ hours threshold)`
    };
  }
  
  // ✅ Rule 4: Cancelled within 30 hours of puja (no refund)
  else if (hoursUntilPuja > 0 && hoursUntilPuja <= 30) {
    return {
      eligible: false,
      percentage: 0,
      reason: `Cancelled within 30 hours of puja. Only ${hoursUntilPuja.toFixed(1)} hours remaining.`
    };
  }
  
  // ✅ Fallback (should never reach here)
  return {
    eligible: false,
    percentage: 0,
    reason: 'Not eligible for refund. Please contact support.'
  };
};
// ✅ FIX 9: Helper now correctly calls getRefundEligibility with an object (matching its signature)
const getEligibilityWithSpecialCase = (booking) => {
  const eligibility = exports.getRefundEligibility({
    bookingDateTime: booking.dateTime,
    createdAt: booking.createdAt,
    now: new Date()
  });

  // Special case: No pandit accepted yet
  const noPanditAccepted = !booking.panditId && ['pending', 'notified'].includes(booking.status);
  
  if (noPanditAccepted) {
    return {
      eligible: true,
      percentage: 100,
      reason: 'No pandit has accepted your booking yet. Full refund applicable.',
      originalEligibility: eligibility
    };
  }

  // Special case: Admin cancellation
  if (booking.cancelledBy === 'admin') {
    return {
      eligible: true,
      percentage: 100,
      reason: 'Booking cancelled by administrator. Full refund processed.',
      originalEligibility: eligibility
    };
  }

  return { ...eligibility };
};

// Cancel booking with refund
exports.cancelBookingWithRefund = async (req, res) => {
  try {
    const { bookingId } = req.body;

    // ✅ Build query with available fields only
    const query = { _id: bookingId };
    const orConditions = [{ customerId: req.user.id }];
    
    if (req.user.email) orConditions.push({ email: req.user.email });
    if (req.user.phone) orConditions.push({ contact: req.user.phone });
    
    query.$or = orConditions;

    const booking = await Booking.findOne(query)
      .populate('serviceId', 'price');

    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        message: 'Booking not found or unauthorized' 
      });
    }
    const eligibility = getEligibilityWithSpecialCase(booking);

    if (eligibility.eligible && eligibility.percentage > 0) {
      const refundResult = await exports.processRefund(bookingId, eligibility.percentage);
      if (refundResult.success) {
        await Booking.findByIdAndUpdate(bookingId, { status: 'cancelled' });
        return res.json({
          success: true,
          message: `Booking cancelled. Refund of ${eligibility.percentage}% processed.`,
          refundAmount: booking.advanceAmount * eligibility.percentage / 100,
          refundPercentage: eligibility.percentage,
          reason: eligibility.reason
        });
      } else {
        return res.status(500).json({
          success: false,
          message: 'Booking cancelled but refund failed. Contact support.',
          refundFailed: true
        });
      }
    } else {
      await Booking.findByIdAndUpdate(bookingId, { status: 'cancelled' });
      return res.json({
        success: true,
        message: `Booking cancelled. No refund applicable. Reason: ${eligibility.reason}`,
        refundAmount: 0,
        refundPercentage: 0,
        reason: eligibility.reason
      });
    }

  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Check refund eligibility (for frontend)
exports.checkRefundEligibility = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const query = { _id: bookingId };
    const orConditions = [{ customerId: req.user.id }];
    if (req.user.email) orConditions.push({ email: req.user.email });
    if (req.user.phone) orConditions.push({ contact: req.user.phone });
    query.$or = orConditions;

    const booking = await Booking.findOne(query);

    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        message: 'Booking not found or unauthorized' 
      });
    }

    const eligibility = getEligibilityWithSpecialCase(booking);
    
    // Calculate actual refund amount
    const refundAmount = eligibility.eligible 
      ? (booking.advanceAmount || 0) * eligibility.percentage / 100 
      : 0;

    res.json({
      success: true,
      eligible: eligibility.eligible,
      percentage: eligibility.percentage,
      reason: eligibility.reason,
      advanceAmount: booking.advanceAmount || 0,
      refundAmount: refundAmount,
      message: exports.getRefundMessage(eligibility, booking),
      hoursUntilPuja: ((new Date(booking.dateTime) - new Date()) / (1000 * 60 * 60)).toFixed(1),
      hoursSinceBooking: ((new Date() - new Date(booking.createdAt)) / (1000 * 60 * 60)).toFixed(1)
    });
  } catch (error) {
    console.error('Refund eligibility error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add this helper for better user messaging
exports.getRefundMessage = (eligibility, booking) => {
  if (eligibility.eligible) {
    if (eligibility.percentage === 100) {
      return `✅ Full refund (₹${booking.advanceAmount}) will be processed to your original payment method.`;
    } else if (eligibility.percentage === 50) {
      const refundAmount = (booking.advanceAmount * 0.5).toFixed(0);
      return `⚠️ 50% refund (₹${refundAmount}) will be processed. ₹${(booking.advanceAmount * 0.5).toFixed(0)} will be deducted as cancellation fee.`;
    }
  } else {
    return `❌ No refund applicable. ${eligibility.reason}`;
  }
  return eligibility.reason;
};