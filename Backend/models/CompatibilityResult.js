const mongoose = require('mongoose');

const compatibilityResultSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
  },
  userName:  { type: String, required: true },
  userEmail: { type: String, required: true },
  userPhone: { type: String, default: null },

  // Boy birth details
  boyDetails: {
    name:        { type: String, default: null },
    dateOfBirth: { type: String, default: null },
    timeOfBirth: { type: String, default: null },
    placeOfBirth:{ type: String, default: null },
    latitude:    { type: Number, default: null },
    longitude:   { type: Number, default: null },
    timezone:    { type: Number, default: 5.5 },
  },

  // Girl birth details
  girlDetails: {
    name:        { type: String, default: null },
    dateOfBirth: { type: String, default: null },
    timeOfBirth: { type: String, default: null },
    placeOfBirth:{ type: String, default: null },
    latitude:    { type: Number, default: null },
    longitude:   { type: Number, default: null },
    timezone:    { type: Number, default: 5.5 },
  },

  // Full computed compatibility result (stored as raw JSON)
  compatibilityResult: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },

  // Quick-access summary fields
  overallScore:    { type: Number, default: null },
  recommendation:  { type: String, default: null },
  gunaMilanTotal:  { type: Number, default: null },

  createdAt: { type: Date, default: Date.now },
});

compatibilityResultSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('CompatibilityResult', compatibilityResultSchema);