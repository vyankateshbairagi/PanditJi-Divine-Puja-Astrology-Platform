const mongoose = require('mongoose');

const freeAstroRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
  },
  userName:  { type: String, required: true },
  userEmail: { type: String, required: true },
  userPhone: { type: String, default: null },

  // 'kundli' | 'horoscope'
  serviceType: {
    type: String,
    enum: ['kundli', 'horoscope'],
    required: true,
  },
  serviceName: { type: String, required: true },

  // Birth details
  birthDetails: {
    fullName:    { type: String,  default: null },
    dateOfBirth: { type: String,  default: null },   // YYYY-MM-DD
    timeOfBirth: { type: String,  default: null },   // HH:MM
    placeOfBirth:{ type: String,  default: null },
    rashi:       { type: String,  default: null },   // Horoscope only

    // FIX: added lat/lon/timezone so chart can be regenerated later
    latitude:    { type: Number,  default: null },
    longitude:   { type: Number,  default: null },
    timezone:    { type: Number,  default: 5.5 },
  },

  // Delivery preferences
  contactEmail:   { type: String,  default: null },
  contactPhone:   { type: String,  default: null },
  preferWhatsApp: { type: Boolean, default: false },

  questions: { type: String, default: null },

  // Processing
  status: {
    type: String,
    enum: ['pending', 'processing', 'delivered', 'cancelled'],
    default: 'pending',
  },
  assignedPanditId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pandit',
    default: null,
  },
  deliveredAt: { type: Date,   default: null },
  adminNotes:  { type: String, default: null },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

freeAstroRequestSchema.index({ status: 1, createdAt: -1 });
freeAstroRequestSchema.index({ userId: 1 });
freeAstroRequestSchema.index({ serviceType: 1 });

module.exports = mongoose.model('FreeAstroRequest', freeAstroRequestSchema);