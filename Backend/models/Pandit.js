// models/Pandit.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const panditSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  location: { type: String, required: true },
  services: [{ type: String, required: true }],
  contact: { 
    type: String, 
    required: true, 
    unique: true,  // ✅ ADD THIS - Make contact unique
    validate: {
      validator: function(v) {
        return /^[6-9]\d{9}$/.test(v); // Indian mobile number validation
      },
      message: 'Please enter a valid 10-digit Indian mobile number'
    }
  },
  email: { type: String, required: true, lowercase: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  rating: { type: Number, min: 0, max: 5, default: 0 },
  totalReviews: { type: Number, default: 0 },

  experience: { type: Number, default: 0 },
  languages: [String],

  image: { type: String, default: '/images/icon.png' },

  isAvailable: { type: Boolean, default: true },
  isOnline: { type: Boolean, default: false },

  fcmToken: { type: String },

  notificationPreferences: {
    email: { type: Boolean, default: true },
    push: { type: Boolean, default: true },
    sms: { type: Boolean, default: false }
  },

  lastActivityAt: {
    type: Date,
    default: Date.now
  },
resetPasswordToken: {
    type: String,
    default: null
  },
  resetPasswordExpires: {
    type: Date,
    default: null
  }
}, {timestamps: true});


// Index for search functionality
panditSchema.index({ name: 'text', location: 'text', services: 'text' });
panditSchema.index({ location: 1, isAvailable: 1, isOnline: 1 }); // ✅ New index

// Password hashing before save
panditSchema.pre('save', async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();

  try {
    console.log('🔐 Hashing password for:', this.name);
    console.log('   Original password length:', this.password.length);

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(this.password, salt);

    console.log('   Hashed password length:', hashedPassword.length);
    this.password = hashedPassword;

    next();
  } catch (error) {
    console.error('❌ Password hashing error:', error);
    next(error);
  }
});

// Compare password method
panditSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    console.log('🔑 Comparing passwords for:', this.username);
    console.log('   Candidate password:', candidatePassword);
    console.log('   Stored hash:', this.password);
    console.log('   Stored hash length:', this.password.length);

    // Check if password is already hashed (starts with $2a$ or $2b$)
    if (this.password.startsWith('$2a$') || this.password.startsWith('$2b$')) {
      // It's a bcrypt hash
      const isMatch = await bcrypt.compare(candidatePassword, this.password);
      console.log('   Bcrypt result:', isMatch);
      return isMatch;
    } else {
      // It's plain text (should not happen in production)
      console.log('⚠️ Password is not hashed! Comparing plain text...');
      const isMatch = (candidatePassword === this.password);
      console.log('   Plain text result:', isMatch);

      // If it matches, hash it and save
      if (isMatch) {
        console.log('🔄 Upgrading plain text password to hash...');
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        await this.save();
        console.log('✅ Password upgraded to hash');
      }

      return isMatch;
    }
  } catch (error) {
    console.error('❌ Password comparison error:', error);
    return false;
  }
};


module.exports = mongoose.model('Pandit', panditSchema);