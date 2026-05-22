// Backend/models/Notifications.js

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
}, { timestamps: true });