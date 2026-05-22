// models/Service.js

const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  purpose: {
    type: String,
    default: ''
  },
  details: [{
    type: String,
    required: true
  }],
  image: {
    type: String,
    required: true
  },
  price: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['regular', 'festive', 'hawan', 'shanti', 'shraddha'],
    default: 'regular'
  },
  duration: {
    type: String,
    default: '2-3 hours'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Service', serviceSchema);