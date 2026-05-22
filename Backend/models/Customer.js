// backend/models/Customer.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true,
    unique: true,           // ✅ Add unique constraint
    trim: true,             // ✅ Remove whitespace
    validate: {
      validator: function (v) {
        return /^[6-9]\d{9}$/.test(v);  // ✅ Indian phone number validation
      },
      message: 'Please enter a valid 10-digit Indian mobile number'
    }
  },
  password: {
    type: String,
    required: true
  },
  resetPasswordToken: {
    type: String,
    default: null
  },
  resetPasswordExpires: {
    type: Date,
    default: null
  },
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String
  },
  bookings: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  }],
  lastLoginAt: {
    type: Date,
    default: null
  }
},
  {
    timestamps: true // ✅ this handles createdAt & updatedAt
  });


// Hash password before saving
customerSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  if (typeof this.password === 'string' && /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(this.password)) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
customerSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    console.error('Password comparison error:', error);
    return false;
  }
};

module.exports = mongoose.model('Customer', customerSchema);