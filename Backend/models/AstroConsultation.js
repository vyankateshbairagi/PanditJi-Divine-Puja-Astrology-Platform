// backend/models/AstroConsultation.js
const mongoose = require('mongoose');

const astroConsultationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  userEmail: {
    type: String,
    required: true
  },
  userPhone: {
    type: String,
    required: true
  },
  serviceType: {
    type: String,
    enum: ['kundli', 'horoscope', 'compatibility'],
    required: true
  },
  serviceName: {
    type: String,
    required: true
  },
  consultationDate: {
    type: Date,
    default: null
  },
  preferredTime: {
    type: String,
    default: null
  },
  birthDetails: {
    dateOfBirth: String,
    timeOfBirth: String,
    placeOfBirth: String,
    latitude: String,
    longitude: String
  },
  partnerBirthDetails: {
    dateOfBirth: String,
    timeOfBirth: String,
    placeOfBirth: String
  },
  questions: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'completed', 'cancelled'],
    default: 'pending'
  },
  assignedPanditId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pandit',
    default: null
  },
  assignedAt: {
    type: Date,
    default: null
  },
  consultationNotes: {
    type: String,
    default: null
  },
  notifiedPandits: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pandit'
  }],
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'refunded'],
    default: 'pending'
  },
  paymentAmount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

astroConsultationSchema.index({ status: 1, createdAt: -1 });
astroConsultationSchema.index({ assignedPanditId: 1 });
astroConsultationSchema.index({ notifiedPandits: 1 });

module.exports = mongoose.model('AstroConsultation', astroConsultationSchema);