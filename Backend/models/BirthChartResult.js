const mongoose = require('mongoose');

const birthChartResultSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
  },
  userName:  { type: String, required: true },
  userEmail: { type: String, required: true },
  userPhone: { type: String, default: null },

  // Birth input details
  birthDetails: {
    fullName:    { type: String,  default: null },
    dateOfBirth: { type: String,  default: null },   // YYYY-MM-DD
    timeOfBirth: { type: String,  default: null },   // HH:MM
    placeOfBirth:{ type: String,  default: null },
    latitude:    { type: Number,  default: null },
    longitude:   { type: Number,  default: null },
    timezone:    { type: Number,  default: 5.5 },
  },

  // Full computed kundali result (stored as raw JSON)
  chartResult: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },

  createdAt: { type: Date, default: Date.now },
});

birthChartResultSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('BirthChartResult', birthChartResultSchema);