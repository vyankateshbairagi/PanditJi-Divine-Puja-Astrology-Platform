// backend/controllers/adminController.js - COMPLETE FILE
const mongoose = require('mongoose');
const crypto = require('crypto');
const Pandit = require('../models/Pandit');
const Service = require('../models/Service');
const Booking = require('../models/Booking');
const User = require('../models/User');
const Customer = require('../models/Customer');
const SupportTicket = require('../models/SupportTicket');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { sendPanditWelcomeEmail } = require('../utils/panditEmailService');




const getPanditImageUrl = (req, filename) => {
  if (!filename) return '/images/icon.png';

  // For Cloudinary (req.file.path contains the full URL)
  if (req.file && req.file.path) {
    return req.file.path;
  }

  // For local uploads (fallback)
  return `${req.protocol}://${req.get('host')}/uploads/pandits/${filename}`;
};

// Admin dashboard stats
exports.getDashboardStats = async (req, res) => {
  try {
    const totalPandits = await Pandit.countDocuments();
    const totalServices = await Service.countDocuments();
    const availablePandits = await Pandit.countDocuments({ isAvailable: true });
    const activeServices = await Service.countDocuments({ isActive: true });

    // Get payment stats for dashboard
    const paidBookings = await Booking.countDocuments({ paymentStatus: 'completed' });
    const totalAdvanceAmount = await Booking.aggregate([
      { $match: { paymentStatus: 'completed' } },
      { $group: { _id: null, total: { $sum: '$advanceAmount' } } }
    ]);

    res.json({
      totalPandits,
      totalServices,
      availablePandits,
      activeServices,
      totalAdvanceAmount: totalAdvanceAmount[0]?.total || 0,
      paidBookingsCount: paidBookings,
      recentPandits: await Pandit.find().sort({ createdAt: -1 }).limit(5),
      recentServices: await Service.find().sort({ createdAt: -1 }).limit(5)
    });
  } catch (error) {
    console.error('❌ Dashboard stats error:', error);
    res.status(500).json({ message: error.message });
  }
};


// Bulk operations for pandits
exports.bulkUpdatePandits = async (req, res) => {
  try {
    const { ids, updateData } = req.body;

    const result = await Pandit.updateMany(
      { _id: { $in: ids } },
      { $set: updateData }
    );

    res.json({
      message: `${result.modifiedCount} pandits updated successfully`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Bulk operations for services
exports.bulkUpdateServices = async (req, res) => {
  try {
    const { ids, updateData } = req.body;

    const result = await Service.updateMany(
      { _id: { $in: ids } },
      { $set: updateData }
    );

    res.json({
      message: `${result.modifiedCount} services updated successfully`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin login - FIXED VERSION
// adminController.js - Update the adminLogin function
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('🔐 Admin login attempt for:', email);
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const user = await User.findOne({ email });
    
    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    if (user.role !== 'admin') {
      console.log('❌ User is not admin:', user.role);
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const isPasswordValid = await user.comparePassword(password);
    console.log('🔑 Password validation result:', isPasswordValid);

    if (!isPasswordValid) {
      console.log('❌ Invalid password for:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // ✅ Set token expiry to 8 hours (28800 seconds)
    const token = jwt.sign(
      { 
        userId: user._id.toString(),
        id: user._id.toString(),
        role: user.role,
        email: user.email,
        username: user.username
      },
      process.env.JWT_SECRET || 'fallback-secret-for-development',
      { expiresIn: '8h' } // 8 hours
    );

    console.log('✅ Login successful for:', user.email);
    console.log('   Token expires in: 8 hours');

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.username
      }
    });
  } catch (error) {
    console.error('❌ Admin login error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error during login' 
    });
  }
};

// Get all data for admin panel
exports.getAllData = async (req, res) => {
  try {
    const pandits = await Pandit.find().sort({ createdAt: -1 });
    const services = await Service.find().sort({ createdAt: -1 });

    res.json({
      pandits,
      services
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createPandit = async (req, res) => {
  try {
    console.log('📝 Creating new pandit...');
    console.log('   Request body:', req.body);
    console.log('   File:', req.file ? req.file.filename : 'No file');

    // Prepare pandit data
    const panditData = {
      ...req.body,
      image: req.file ? getPanditImageUrl(req, req.file.filename) : (req.body.image || '/images/icon.png')
    };

    // Parse array fields from string to array (for FormData)
    if (typeof panditData.services === 'string') {
      try {
        panditData.services = JSON.parse(panditData.services);
      } catch (e) {
        console.log('Services parsing error, treating as array with single item:', panditData.services);
        panditData.services = [panditData.services];
      }
    }

    if (typeof panditData.languages === 'string') {
      try {
        panditData.languages = JSON.parse(panditData.languages);
      } catch (e) {
        console.log('Languages parsing error, treating as array with single item:', panditData.languages);
        panditData.languages = [panditData.languages];
      }
    }

    // Convert numeric fields
    if (panditData.rating) panditData.rating = parseFloat(panditData.rating);
    if (panditData.experience) panditData.experience = parseInt(panditData.experience);

    // Ensure username is set
    if (!panditData.username && panditData.name) {
      panditData.username = panditData.name.toLowerCase()
        .replace(/\s+/g, '')
        .replace(/[^a-z0-9]/g, '')
        .substring(0, 15);
    }

    // Store plain password for email (before hashing)
    const plainPassword = panditData.password || 'pandit123';

    // Create pandit (password will be hashed by pre-save hook)
    const pandit = new Pandit(panditData);
    await pandit.save();

    console.log(`✅ Pandit created successfully: ${pandit.name} (${pandit.email})`);
    console.log(`   Username: ${pandit.username}`);
    console.log(`   Password: ${plainPassword}`);

    // Send welcome email to pandit
    try {
      const emailSent = await sendPanditWelcomeEmail(pandit, plainPassword);
      if (emailSent) {
        console.log(`📧 Welcome email sent to ${pandit.email}`);
      } else {
        console.log(`⚠️ Failed to send email to ${pandit.email}`);
      }
    } catch (emailError) {
      console.error('❌ Email sending error (non-critical):', emailError.message);
      // Don't fail the pandit creation if email fails
    }

    res.status(201).json({
      success: true,
      message: `Pandit created successfully! Welcome email sent to ${pandit.email}`,
      pandit: {
        id: pandit._id,
        name: pandit.name,
        email: pandit.email,
        username: pandit.username,
        contact: pandit.contact,
        location: pandit.location
      }
    });

  } catch (error) {
    console.error('❌ Error creating pandit:', error);

    // Delete uploaded file if there's an error
    if (req.file) {
      const fs = require('fs');
      const path = require('path');
      try {
        fs.unlinkSync(req.file.path);
        console.log(`🗑️ Deleted uploaded file: ${req.file.filename}`);
      } catch (unlinkError) {
        console.log('Could not delete file:', unlinkError.message);
      }
    }

    // Handle duplicate key error (username or email already exists)
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists. Please use a different ${field}.`
      });
    }

    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create pandit'
    });
  }
};


exports.updatePandit = async (req, res) => {
  try {
    console.log('📝 Updating pandit:', req.params.id);

    const pandit = await Pandit.findById(req.params.id);
    if (!pandit) {
      return res.status(404).json({
        success: false,
        message: 'Pandit not found'
      });
    }

    const updateData = { ...req.body };

    // Handle image update
    if (req.file) {
      // For Cloudinary, req.file.path contains the full URL
      updateData.image = req.file.path || getPanditImageUrl(req, req.file.filename);
    }

    // Parse array fields
    if (typeof updateData.services === 'string') {
      try {
        updateData.services = JSON.parse(updateData.services);
      } catch (e) {
        updateData.services = [updateData.services];
      }
    }

    if (typeof updateData.languages === 'string') {
      try {
        updateData.languages = JSON.parse(updateData.languages);
      } catch (e) {
        updateData.languages = [updateData.languages];
      }
    }

    // Convert numeric fields
    if (updateData.rating) updateData.rating = parseFloat(updateData.rating);
    if (updateData.experience) updateData.experience = parseInt(updateData.experience);

    // Handle password - only update if provided and not placeholder
    if (updateData.password === '********' || !updateData.password) {
      delete updateData.password;
    }

    const updatedPandit = await Pandit.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    console.log(`✅ Pandit updated: ${updatedPandit.name}`);

    res.json({
      success: true,
      message: 'Pandit updated successfully',
      pandit: updatedPandit
    });

  } catch (error) {
    console.error('❌ Error updating pandit:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// DELETE PANDIT - Add this function
exports.deletePandit = async (req, res) => {
  try {
    const pandit = await Pandit.findById(req.params.id);

    if (!pandit) {
      return res.status(404).json({
        success: false,
        message: 'Pandit not found'
      });
    }

    await Pandit.findByIdAndDelete(req.params.id);

    console.log(`✅ Pandit deleted: ${pandit.name}`);

    res.json({
      success: true,
      message: 'Pandit deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting pandit:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// Toggle pandit availability
exports.togglePanditAvailability = async (req, res) => {
  try {
    const pandit = await Pandit.findById(req.params.id);

    if (!pandit) {
      return res.status(404).json({ message: 'Pandit not found' });
    }

    pandit.isAvailable = !pandit.isAvailable;
    await pandit.save();

    res.json({
      message: `Pandit ${pandit.isAvailable ? 'activated' : 'deactivated'} successfully`,
      pandit
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Toggle service activity
exports.toggleServiceActivity = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    service.isActive = !service.isActive;
    await service.save();

    res.json({
      message: `Service ${service.isActive ? 'activated' : 'deactivated'} successfully`,
      service
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// pandit data to admin dashboard

// Get all bookings with pandit details
exports.getAllBookings = async (req, res) => {
  try {
    console.log('📡 Admin getAllBookings called');
    console.log('   User:', req.user?.email);

    const { status, panditId, fromDate, toDate, page = 1, limit = 50 } = req.query;

    let query = {};

    // Apply filters
    if (status) query.status = status;
    if (panditId) query.panditId = panditId;
    if (fromDate || toDate) {
      query.dateTime = {};
      if (fromDate) query.dateTime.$gte = new Date(fromDate);
      if (toDate) query.dateTime.$lte = new Date(toDate);
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const bookings = await Booking.find(query)
      .populate('serviceId', 'name price category')
      .populate('panditId', 'name email contact location rating')
      .populate('customerId', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    const total = await Booking.countDocuments(query);

    // Calculate statistics
    const stats = {
      total: total,
      pending: await Booking.countDocuments({ status: 'pending' }),
      notified: await Booking.countDocuments({ status: 'notified' }),
      accepted: await Booking.countDocuments({ status: 'accepted' }),
      confirmed: await Booking.countDocuments({ status: 'confirmed' }),
      completed: await Booking.countDocuments({ status: 'completed' }),
      cancelled: await Booking.countDocuments({ status: 'cancelled' })
    };

    const paidBookings = await Booking.find({ paymentStatus: 'completed' });
    const totalAdvanceAmount = paidBookings.reduce((sum, b) => sum + (b.advanceAmount || 0), 0);

    stats.totalAdvanceAmount = totalAdvanceAmount;
    stats.paidBookings = paidBookings.length;

    res.json({
      success: true,
      bookings,
      stats,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('❌ Get all bookings error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get pandit performance stats
exports.getPanditPerformance = async (req, res) => {
  try {
    const pandits = await Pandit.find()
      .select('name email contact location rating experience isAvailable')
      .lean();

    const performanceData = await Promise.all(
      pandits.map(async (pandit) => {
        const totalBookings = await Booking.countDocuments({ panditId: pandit._id });
        const completedBookings = await Booking.countDocuments({
          panditId: pandit._id,
          status: 'completed'
        });
        const acceptedBookings = await Booking.countDocuments({
          panditId: pandit._id,
          status: { $in: ['accepted', 'confirmed', 'completed'] }
        });
        const cancelledBookings = await Booking.countDocuments({
          panditId: pandit._id,
          status: 'cancelled'
        });

        // Calculate earnings
        const completed = await Booking.find({
          panditId: pandit._id,
          status: 'completed'
        }).select('actualPrice');

        const totalEarnings = completed.reduce((sum, booking) =>
          sum + (booking.actualPrice || 0), 0);

        // Get recent bookings
        const recentBookings = await Booking.find({ panditId: pandit._id })
          .populate('serviceId', 'name')
          .sort({ createdAt: -1 })
          .limit(5)
          .lean();

        return {
          ...pandit,
          stats: {
            totalBookings,
            completedBookings,
            acceptedBookings,
            cancelledBookings,
            totalEarnings,
            acceptanceRate: totalBookings > 0
              ? Math.round((acceptedBookings / totalBookings) * 100)
              : 0,
            completionRate: acceptedBookings > 0
              ? Math.round((completedBookings / acceptedBookings) * 100)
              : 0
          },
          recentBookings: recentBookings.map(b => ({
            id: b._id,
            service: b.serviceId?.name,
            date: b.dateTime,
            status: b.status,
            price: b.price
          }))
        };
      })
    );

    res.json({
      success: true,
      pandits: performanceData
    });
  } catch (error) {
    console.error('Get pandit performance error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get detailed booking analytics
exports.getBookingAnalytics = async (req, res) => {
  try {
    const { period = 'month' } = req.query; // day, week, month, year

    let dateFilter = {};
    const now = new Date();

    if (period === 'day') {
      const today = new Date(now.setHours(0, 0, 0, 0));
      dateFilter = { $gte: today };
    } else if (period === 'week') {
      const weekAgo = new Date(now.setDate(now.getDate() - 7));
      dateFilter = { $gte: weekAgo };
    } else if (period === 'month') {
      const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
      dateFilter = { $gte: monthAgo };
    } else if (period === 'year') {
      const yearAgo = new Date(now.setFullYear(now.getFullYear() - 1));
      dateFilter = { $gte: yearAgo };
    }

    // Bookings over time
    const bookingsOverTime = await Booking.aggregate([
      { $match: dateFilter ? { createdAt: dateFilter } : {} },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // Popular services
    const popularServices = await Booking.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: '$serviceId',
          count: { $sum: 1 },
          totalEarnings: { $sum: '$actualPrice' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'services',
          localField: '_id',
          foreignField: '_id',
          as: 'service'
        }
      },
      { $unwind: '$service' }
    ]);

    // Pandit rankings
    const topPandits = await Booking.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: '$panditId',
          completedBookings: { $sum: 1 },
          totalEarnings: { $sum: '$actualPrice' }
        }
      },
      { $sort: { completedBookings: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'pandits',
          localField: '_id',
          foreignField: '_id',
          as: 'pandit'
        }
      },
      { $unwind: '$pandit' }
    ]);

    res.json({
      success: true,
      analytics: {
        period,
        bookingsOverTime,
        popularServices: popularServices.map(s => ({
          name: s.service.name,
          bookings: s.count,
          earnings: s.totalEarnings
        })),
        topPandits: topPandits.map(p => ({
          name: p.pandit.name,
          completedBookings: p.completedBookings,
          earnings: p.totalEarnings,
          rating: p.pandit.rating
        }))
      }
    });
  } catch (error) {
    console.error('Get booking analytics error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get booking details by ID
exports.getBookingDetails = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('serviceId')
      .populate('panditId')
      .populate('customerId');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.json({
      success: true,
      booking
    });
  } catch (error) {
    console.error('Get booking details error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update booking status
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.json({
      success: true,
      message: 'Booking status updated',
      booking
    });
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get recent activity feed
exports.getRecentActivity = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;

    const recentBookings = await Booking.find()
      .populate('serviceId', 'name')
      .populate('panditId', 'name')
      .populate('customerId', 'name')
      .sort({ updatedAt: -1 })
      .limit(limit)
      .lean();

    const activities = recentBookings.map(booking => {
      let action = '';
      let description = '';

      switch (booking.status) {
        case 'pending':
          action = '🆕 New Booking';
          description = `New booking for ${booking.serviceId?.name}`;
          break;
        case 'notified':
          action = '📢 Pandits Notified';
          description = `Pandits notified about ${booking.serviceId?.name}`;
          break;
        case 'accepted':
          action = '✅ Booking Accepted';
          description = `${booking.panditId?.name} accepted ${booking.serviceId?.name}`;
          break;
        case 'confirmed':
          action = '✓ Booking Confirmed';
          description = `${booking.panditId?.name} confirmed for ${booking.serviceId?.name}`;
          break;
        case 'completed':
          action = '🎉 Puja Completed';
          description = `${booking.panditId?.name} completed ${booking.serviceId?.name}`;
          break;
        case 'cancelled':
          action = '❌ Booking Cancelled';
          description = `${booking.serviceId?.name} booking cancelled`;
          break;
      }

      return {
        id: booking._id,
        action,
        description,
        customer: booking.name,
        pandit: booking.panditId?.name,
        time: booking.updatedAt,
        status: booking.status
      };
    });

    res.json({
      success: true,
      activities
    });
  } catch (error) {
    console.error('Get recent activity error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};



// Resend pandit credentials
exports.resendPanditCredentials = async (req, res) => {
  try {
    const pandit = await Pandit.findById(req.params.id);

    if (!pandit) {
      return res.status(404).json({
        success: false,
        message: 'Pandit not found'
      });
    }

    // Note: You cannot retrieve the original password as it's hashed
    // Send a password reset link instead
    const resetToken = crypto.randomBytes(32).toString('hex');
    pandit.resetPasswordToken = resetToken;
    pandit.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await pandit.save();

    // Send password reset email
    const resetLink = `${process.env.FRONTEND_URL}/pandit-reset-password?token=${resetToken}`;

    // Send email... (implement similar to welcome email)

    res.json({
      success: true,
      message: 'Password reset link sent to pandit email'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

