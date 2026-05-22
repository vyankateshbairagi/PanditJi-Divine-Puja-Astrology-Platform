// backend/models/User.js - COMPLETE REPLACEMENT
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'moderator'],
    default: 'admin'
  }
}, {
  timestamps: true
});

// ✅ FIXED: Password hashing middleware
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  try {
    console.log('🔐 Hashing password for user:', this.email);
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    console.log('✅ Password hashed successfully');
    next();
  } catch (error) {
    console.error('❌ Password hashing error:', error);
    next(error);
  }
});

// ✅ FIXED: Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    console.log('🔑 Comparing passwords for:', this.email);
    console.log('   Candidate length:', candidatePassword.length);
    console.log('   Stored hash length:', this.password.length);
    
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    console.log('   Bcrypt result:', isMatch);
    
    return isMatch;
  } catch (error) {
    console.error('❌ Password comparison error:', error);
    return false;
  }
};

module.exports = mongoose.model('User', userSchema);