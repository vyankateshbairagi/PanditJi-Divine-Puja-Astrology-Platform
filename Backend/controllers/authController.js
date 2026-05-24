const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Customer = require('../models/Customer');
const RegistrationOtp = require('../models/RegistrationOtp');
const authEmailService = require('../utils/authEmailService');

const OTP_EXPIRY_MINUTES = 5;
const OTP_ATTEMPT_LIMIT = 5;

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();
const normalizePhone = (phone) => String(phone || '').trim();

const buildToken = (customer) => jwt.sign(
  {
    id: customer._id,
    userId: customer._id,
    email: customer.email,
    phone: customer.phone,
    name: customer.name,
    role: 'customer'
  },
  process.env.JWT_SECRET || 'fallback-secret-for-development',
  { expiresIn: '12h' }
);

const validateRegistrationInput = ({ name, email, phone, password }, { requirePassword = true } = {}) => {
  if (!name || !String(name).trim()) return 'Name is required';
  if (!email || !String(email).trim()) return 'Email is required';
  if (!/^\S+@\S+\.\S+$/.test(String(email).trim())) return 'Please enter a valid email address';
  if (!phone || !/^\d{10}$/.test(String(phone).trim())) return 'Valid 10-digit phone number is required';
  if (requirePassword && (!password || String(password).length < 6)) return 'Password must be at least 6 characters';
  return null;
};

exports.sendOtp = async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const validationError = validateRegistrationInput({ name, email, phone }, { requirePassword: false });

    if (validationError) {
      return res.status(400).json({ success: false, message: validationError });
    }

    const normalizedEmail = normalizeEmail(email);
    const normalizedPhone = normalizePhone(phone);

    const existingCustomer = await Customer.findOne({
      $or: [{ email: normalizedEmail }, { phone: normalizedPhone }]
    });

    if (existingCustomer) {
      return res.status(400).json({
        success: false,
        message: 'An account already exists with this email or phone number'
      });
    }

    const otp = String(crypto.randomInt(100000, 1000000));
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await RegistrationOtp.deleteMany({
      $or: [{ email: normalizedEmail }, { phone: normalizedPhone }]
    });

    await RegistrationOtp.create({
      name: String(name).trim(),
      email: normalizedEmail,
      phone: normalizedPhone,
      otpHash,
      expiresAt
    });

    const emailSent = await authEmailService.sendRegistrationOtpEmail({
      to: normalizedEmail,
      name: String(name).trim(),
      otp,
      expiresInMinutes: OTP_EXPIRY_MINUTES
    });

    if (!emailSent) {
      await RegistrationOtp.deleteMany({
        $or: [{ email: normalizedEmail }, { phone: normalizedPhone }]
      });

      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP email. Please try again.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'OTP sent to your email address. It will expire in 5 minutes.',
      resendAfterSeconds: 30,
      expiresInMinutes: OTP_EXPIRY_MINUTES
    });
  } catch (error) {
    console.error('❌ Send OTP error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to send OTP'
    });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { name, email, phone, otp } = req.body;

    if (!name || !String(name).trim()) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }
    if (!email || !String(email).trim()) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }
    if (!phone || !/^\d{10}$/.test(String(phone).trim())) {
      return res.status(400).json({ success: false, message: 'Valid 10-digit phone number is required' });
    }
    if (!otp || !/^\d{6}$/.test(String(otp).trim())) {
      return res.status(400).json({ success: false, message: 'Please enter the 6-digit OTP sent to your email' });
    }

    const normalizedEmail = normalizeEmail(email);
    const normalizedPhone = normalizePhone(phone);
    const pending = await RegistrationOtp.findOne({ email: normalizedEmail, phone: normalizedPhone });

    if (!pending) {
      return res.status(400).json({ success: false, message: 'OTP request not found. Please send a new OTP.' });
    }

    if (pending.expiresAt && pending.expiresAt < new Date()) {
      await RegistrationOtp.deleteOne({ _id: pending._id });
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
    }

    if (pending.name !== String(name).trim()) {
      return res.status(400).json({ success: false, message: 'Registration details do not match the OTP request' });
    }

    const isOtpValid = await bcrypt.compare(String(otp).trim(), pending.otpHash);

    if (!isOtpValid) {
      const attempts = (pending.attempts || 0) + 1;

      if (attempts >= OTP_ATTEMPT_LIMIT) {
        await RegistrationOtp.deleteOne({ _id: pending._id });
        return res.status(400).json({ success: false, message: 'Too many invalid OTP attempts. Please request a new OTP.' });
      }

      pending.attempts = attempts;
      await pending.save();

      return res.status(400).json({ success: false, message: 'Invalid OTP. Please try again.' });
    }

    pending.verifiedAt = new Date();
    await pending.save();

    return res.status(200).json({
      success: true,
      message: 'OTP verified successfully'
    });
  } catch (error) {
    console.error('❌ Verify OTP error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to verify OTP'
    });
  }
};

exports.register = async (req, res) => {
  try {
    const { name, email, phone, password, otp } = req.body;
    const validationError = validateRegistrationInput({ name, email, phone, password });

    if (validationError) {
      return res.status(400).json({ success: false, message: validationError });
    }

    if (!otp || !/^\d{6}$/.test(String(otp).trim())) {
      return res.status(400).json({
        success: false,
        message: 'Please enter the 6-digit OTP sent to your email'
      });
    }

    const normalizedEmail = normalizeEmail(email);
    const normalizedPhone = normalizePhone(phone);
    const pending = await RegistrationOtp.findOne({
      email: normalizedEmail,
      phone: normalizedPhone
    });

    if (!pending) {
      return res.status(400).json({
        success: false,
        message: 'OTP request not found. Please send a new OTP.'
      });
    }

    if (pending.expiresAt && pending.expiresAt < new Date()) {
      await RegistrationOtp.deleteOne({ _id: pending._id });
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new one.'
      });
    }

    if (pending.name !== String(name).trim()) {
      return res.status(400).json({
        success: false,
        message: 'Registration details do not match the OTP request'
      });
    }

    if (!pending.verifiedAt) {
      return res.status(400).json({
        success: false,
        message: 'Please verify the OTP before registering'
      });
    }

    const isOtpValid = await bcrypt.compare(String(otp).trim(), pending.otpHash);

    if (!isOtpValid) {
      const attempts = (pending.attempts || 0) + 1;

      if (attempts >= OTP_ATTEMPT_LIMIT) {
        await RegistrationOtp.deleteOne({ _id: pending._id });
        return res.status(400).json({
          success: false,
          message: 'Too many invalid OTP attempts. Please request a new OTP.'
        });
      }

      pending.attempts = attempts;
      await pending.save();

      return res.status(400).json({
        success: false,
        message: 'Invalid OTP. Please try again.'
      });
    }

    const existingCustomer = await Customer.findOne({
      $or: [{ email: normalizedEmail }, { phone: normalizedPhone }]
    });

    if (existingCustomer) {
      await RegistrationOtp.deleteOne({ _id: pending._id });
      return res.status(400).json({
        success: false,
        message: 'An account already exists with this email or phone number'
      });
    }

    const passwordHash = await bcrypt.hash(String(password), 12);

    const customer = await Customer.create({
      name: String(name).trim(),
      email: normalizedEmail,
      phone: normalizedPhone,
      password: passwordHash
    });

    await RegistrationOtp.deleteOne({ _id: pending._id });

    const token = buildToken(customer);

    const welcomeEmailSent = await authEmailService.sendWelcomeEmail({
      to: customer.email,
      name: customer.name
    });

    if (!welcomeEmailSent) {
      console.warn(`⚠️ Welcome email could not be sent to ${customer.email}`);
    }

    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      customer: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone
      }
    });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0] || 'field';
      return res.status(400).json({
        success: false,
        message: `${field} already exists`
      });
    }

    console.error('❌ Registration error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Registration failed'
    });
  }
};
