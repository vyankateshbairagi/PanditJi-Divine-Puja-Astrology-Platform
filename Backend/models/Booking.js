// models/Booking.js - FIXED VERSION
const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  name: { type: String, required: true },
  contact: { type: String, required: true },
  email: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  // ✅ FIX 13: serviceId was required:true but pandit-only bookings don't have one
  serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: false },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer'
  },
  panditId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pandit' },
  dateTime: { type: Date, required: true },
  address: { type: String },
  userLocation: { type: String, default: 'Unknown' },
  message: { type: String },
  status: {
    type: String,
    enum: ['pending', 'notified', 'accepted', 'confirmed', 'completed', 'cancelled'],
    default: 'pending'
  },

  // Payment fields
  paymentId: { type: String, default: null },
  orderId: { type: String, default: null },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded', 'partially_refunded'],
    default: 'pending'
  },
  advanceAmount: { type: Number, default: 0 },
  refundAmount: { type: Number, default: 0 },
  refundId: { type: String, default: null },
  refundStatus: {
    type: String,
    enum: ['not_applied', 'pending', 'completed', 'failed'],
    default: 'not_applied'
  },
  paymentMethod: { type: String, default: null },
  paidAt: { type: Date, default: null },

  price: { type: String },      // Display price like "₹1099/-"
  actualPrice: { type: Number }, // Numeric price for calculations

  assignedPandit: { type: mongoose.Schema.Types.ObjectId, ref: 'Pandit' },

  notifiedPandits: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Pandit' }],

  location: String,
  expiryTime: Date,

  // Verification code for puja completion
  verificationCode: { type: String, default: null },
  codeGeneratedAt: { type: Date, default: null },
  codeExpiresAt: { type: Date, default: null },
  codeVerified: { type: Boolean, default: false }

}, { timestamps: true });

// Indexes for efficient queries
bookingSchema.index({ panditId: 1, dateTime: 1 });
bookingSchema.index({ status: 1, userLocation: 1 });
bookingSchema.index({ customerId: 1, createdAt: -1 }); // ✅ FIX 14: Added index for customer booking lookups
bookingSchema.index({ email: 1 }); // ✅ FIX 15: Added index for guest booking lookups by email

module.exports = mongoose.model('Booking', bookingSchema);