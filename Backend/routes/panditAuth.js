// backend/routes/panditAuth.js - FIXED VERSION
const express = require('express');
const router = express.Router(); // ← THIS WAS MISSING!
const Pandit = require('../models/Pandit');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { sendPanditPasswordResetEmail } = require('../utils/panditEmailService');

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  console.log('🔐 Pandit login attempt for:', username);

  try {
    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username and password are required' 
      });
    }

    const pandit = await Pandit.findOne({ username });
     

    
    if (!pandit) {
      console.log('❌ Pandit not found:', username);
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid username or password' 
      });
    }

    console.log('✅ Pandit found:', pandit.name);
    console.log('   Stored hash exists:', !!pandit.password);

    // Check password
    const isMatch = await bcrypt.compare(password, pandit.password);
    console.log('   Password match:', isMatch);

    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid username or password' 
      });
    }

     pandit.isOnline = true;
    pandit.lastActivityAt = new Date();
    pandit.lastLoginAt = new Date();
    await pandit.save();
    
    // Generate JWT
    const token = jwt.sign(
      { 
        id: pandit._id.toString(),
        role: 'pandit',
        email: pandit.email,
        name: pandit.name
      },
      process.env.JWT_SECRET || 'fallback-secret-for-development',
      { expiresIn: '1d' }
    );

    res.json({
      success: true,
      token,
      
      pandit: {
        id: pandit._id,
        name: pandit.name,
        username: pandit.username,
        location: pandit.location,
        services: pandit.services,
        contact: pandit.contact,
        email: pandit.email,
        rating: pandit.rating,
        experience: pandit.experience,
        languages: pandit.languages,
        image: pandit.image,
        isAvailable: pandit.isAvailable,
        isOnline: pandit.isOnline || false
      }
    });
  } catch (err) {
    console.error('❌ Pandit login error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + err.message 
    });
  }
});

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }
    
    const pandit = await Pandit.findOne({ email });
    
    // For security, don't reveal if email exists or not
    if (!pandit) {
      return res.status(200).json({
        success: true,
        message: 'If an account exists with this email, you will receive a password reset link.'
      });
    }
    
    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    pandit.resetPasswordToken = resetToken;
    pandit.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await pandit.save();
    
    // Send email
    const emailSent = await sendPanditPasswordResetEmail(pandit, resetToken);
    
    if (emailSent) {
      res.json({
        success: true,
        message: 'Password reset link sent to your email address.'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send reset email. Please try again later.'
      });
    }
    
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

// ✅ ADD RESET PASSWORD ROUTE
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Token and new password are required'
      });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }
    
    const pandit = await Pandit.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });
    
    if (!pandit) {
      return res.status(400).json({
        success: false,
        message: 'Password reset link is invalid or has expired.'
      });
    }
    
    // Update password
    pandit.password = newPassword;
    pandit.resetPasswordToken = null;
    pandit.resetPasswordExpires = null;
    await pandit.save();
    
    res.json({
      success: true,
      message: 'Password has been reset successfully. Please login with your new password.'
    });
    
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

// ✅ ADD CHECK TOKEN ROUTE (optional - for frontend validation)
router.post('/verify-reset-token', async (req, res) => {
  try {
    const { token } = req.body;
    
    const pandit = await Pandit.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });
    
    if (!pandit) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }
    
    res.json({
      success: true,
      message: 'Token is valid'
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;