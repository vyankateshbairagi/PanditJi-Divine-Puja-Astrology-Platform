// backend/models/Notification.js
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  panditId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pandit',
    required: true
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  type: {
    type: String,
    enum: ['booking_request', 'booking_accepted', 'booking_cancelled'],
    default: 'booking_request'
  },
  message: String,
  isRead: {
    type: Boolean,
    default: false
  },
  expiresAt: Date
}, { 
  timestamps: true 
});

// Index for efficient queries
notificationSchema.index({ panditId: 1, isRead: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Notification', notificationSchema);