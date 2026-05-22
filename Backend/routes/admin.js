// backend/routes/admin.js - CORRECTED VERSION
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose'); 
const adminController = require('../controllers/adminController');
const serviceController = require('../controllers/serviceController');
const { authenticateAdmin, isAdmin } = require('../middleware/auth');
const Booking = require('../models/Booking'); 
const { validatePandit, validateService } = require('../middleware/validation');
const upload = require('../middleware/cloudinaryUpload');
const SupportTicket = require('../models/SupportTicket');

// Handle OPTIONS requests for all routes
router.options('*', (req, res) => {
  console.log('📡 OPTIONS request received for admin route');
  const requestOrigin = req.headers.origin || '';
  const configuredOrigins = [process.env.FRONTEND_URL, process.env.CORS_ORIGINS]
    .filter(Boolean)
    .flatMap(value => value.split(','))
    .map(value => value.trim().replace(/\/$/, ''))
    .filter(Boolean);
  const allowedOrigin = configuredOrigins.find(origin => origin === requestOrigin) || configuredOrigins[0] || 'http://localhost:5173';

  res.header('Access-Control-Allow-Origin', allowedOrigin);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});

// ✅ Public routes (no authentication required)
router.post('/login', adminController.adminLogin);

// ✅ Apply admin middleware ONLY to protected routes
router.use(authenticateAdmin);
router.use(isAdmin);

// Test route to verify authentication is working
router.get('/test-auth', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Admin authentication working!',
    user: req.user 
  });
});

// Dashboard and data routes
router.get('/dashboard', adminController.getDashboardStats);
router.get('/all-data', adminController.getAllData);

// ==================== PANDIT MANAGEMENT ====================
// ✅ FIXED: Now using adminController (not panditController)
router.post('/pandits', upload.single('panditImage'), validatePandit, adminController.createPandit);
router.put('/pandits/:id', upload.single('panditImage'), validatePandit, adminController.updatePandit);
router.delete('/pandits/:id', adminController.deletePandit);
router.patch('/pandits/:id/toggle-availability', adminController.togglePanditAvailability);
router.post('/pandits/bulk-update', adminController.bulkUpdatePandits);
router.post('/pandits/:id/resend-credentials', adminController.resendPanditCredentials); // Optional

// ==================== SERVICE MANAGEMENT ====================
router.post('/services', upload.single('serviceImage'), validateService, serviceController.createService);
router.put('/services/:id', upload.single('serviceImage'), validateService, serviceController.updateService);
router.delete('/services/:id', serviceController.deleteService);
router.patch('/services/:id/toggle-activity', adminController.toggleServiceActivity);
router.post('/services/bulk-update', adminController.bulkUpdateServices);

// ==================== BOOKINGS ====================
router.get('/bookings', authenticateAdmin, adminController.getAllBookings);
router.get('/bookings/:id', adminController.getBookingDetails);
router.patch('/bookings/:id/status', adminController.updateBookingStatus);
router.post('/bookings/:bookingId/admin-cancel', authenticateAdmin, async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { reason } = req.body;
    
    const booking = await Booking.findById(bookingId)
      .populate('serviceId', 'name')
      .populate('customerId', 'name email');
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Booking is already cancelled'
      });
    }
    
    if (booking.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel a completed booking'
      });
    }
    
    const bookingDate = new Date(booking.dateTime);
    const now = new Date();
    const hoursDifference = (bookingDate - now) / (1000 * 60 * 60);
    
    booking.status = 'cancelled';
    booking.cancelledBy = 'admin';
    booking.cancelledAt = new Date();
    booking.cancellationReason = reason || 'Cancelled by admin';
    booking.cancelledAtHours = hoursDifference;
    
    await booking.save();
    
    console.log(`✅ Admin cancelled booking ${bookingId}`);
    
    res.json({
      success: true,
      message: `Booking cancelled successfully`,
      booking
    });
    
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ==================== ANALYTICS & ACTIVITY ====================
router.get('/pandits/performance', adminController.getPanditPerformance);
router.get('/analytics/bookings', adminController.getBookingAnalytics);
router.get('/activity/recent', adminController.getRecentActivity);

// ==================== SUPPORT TICKETS ====================
router.get('/support-tickets', authenticateAdmin, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    
    let query = {};
    if (status) query.status = status;
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    const tickets = await SupportTicket.find(query)
      .populate('customerId', 'name email phone')
      .populate('bookingId', 'serviceId dateTime price status name contact')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);
    
    const total = await SupportTicket.countDocuments(query);
    
    const stats = {
      total: await SupportTicket.countDocuments(),
      open: await SupportTicket.countDocuments({ status: 'open' }),
      inProgress: await SupportTicket.countDocuments({ status: 'in_progress' }),
      resolved: await SupportTicket.countDocuments({ status: 'resolved' }),
      closed: await SupportTicket.countDocuments({ status: 'closed' })
    };
    
    res.json({
      success: true,
      tickets,
      stats,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
    
  } catch (error) {
    console.error('Error fetching support tickets:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.get('/support-tickets/:id', authenticateAdmin, async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id)
      .populate('customerId', 'name email phone')
      .populate('bookingId', 'serviceId dateTime price status name contact address');
    
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Support ticket not found'
      });
    }
    
    res.json({
      success: true,
      ticket
    });
    
  } catch (error) {
    console.error('Error fetching support ticket:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.patch('/support-tickets/:id/status', authenticateAdmin, async (req, res) => {
  try {
    const { status, adminResponse } = req.body;
    
    const updateData = {
      status,
      updatedAt: new Date()
    };
    
    if (adminResponse) {
      updateData.adminResponse = adminResponse;
    }
    
    if (status === 'resolved') {
      updateData.resolvedAt = new Date();
    }
    
    const ticket = await SupportTicket.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Support ticket not found'
      });
    }
    
    console.log(`✅ Ticket ${ticket._id} status updated to: ${status}`);
    
    res.json({
      success: true,
      message: 'Support ticket updated successfully',
      ticket
    });
    
  } catch (error) {
    console.error('Error updating support ticket:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.delete('/support-tickets/:id', authenticateAdmin, async (req, res) => {
  try {
    const ticket = await SupportTicket.findByIdAndDelete(req.params.id);
    
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Support ticket not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Support ticket deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting support ticket:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
