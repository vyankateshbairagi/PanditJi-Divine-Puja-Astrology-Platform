// bookingController.js
const Booking = require('../models/Booking');
const Service = require('../models/Service');
const Pandit = require('../models/Pandit');
const NotificationService = require('../utils/notificationService');
const Notification = require('../models/Notification');
const mongoose = require('mongoose');


// Helper function to extract location from address
const extractLocationFromAddress = (address) => {
  if (!address) return 'Unknown';

  const cities = ['Pune', 'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Ahmedabad'];
  for (const city of cities) {
    if (address.toLowerCase().includes(city.toLowerCase())) {
      return city;
    }
  }
  return 'Unknown';
};



exports.createBooking = async (req, res, next) => {
  try {
    console.log('='.repeat(50));
    console.log('📝 NEW BOOKING REQUEST RECEIVED');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('='.repeat(50));

    const {
      name, contact, email, serviceId, panditId, dateTime, address, message, price, userLocation
    } = req.body;

    // ✅ Updated validation: At least one of serviceId or panditId must be present
    if (!name || !contact || !dateTime || !address) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, contact, dateTime, address are required'
      });
    }

    if (!serviceId && !panditId) {
      return res.status(400).json({
        success: false,
        message: 'Either service or pandit selection is required'
      });
    }

    // Check service exists (if provided)
    let service = null;
    if (serviceId) {
      service = await Service.findById(serviceId).lean();
      if (!service) {
        return res.status(404).json({
          success: false,
          message: 'Service not found'
        });
      }
    }

    // Extract location from address or use provided userLocation
    let finalUserLocation = userLocation;
    if (!finalUserLocation) {
      finalUserLocation = extractLocationFromAddress(address);
    }
    console.log('📍 Extracted location:', finalUserLocation);

    // Calculate actual numeric price
    let actualPrice = 0;
    let displayPrice = price;

    if (service && service.price) {
      const priceMatch = service.price.match(/\d+/);
      actualPrice = priceMatch ? parseInt(priceMatch[0]) : 0;
      displayPrice = service.price;
    } else if (price) {
      const priceMatch = price.match(/\d+/);
      actualPrice = priceMatch ? parseInt(priceMatch[0]) : 0;
    }

    const booking = new Booking({
      name, contact, email,
      serviceId: serviceId || null,
      panditId: panditId || null,
      dateTime: new Date(dateTime),
      address,
      userLocation: finalUserLocation,
      message,
      price: displayPrice || 'Price on request',
      actualPrice,
      customerId: req.user?.id,
      status: panditId ? 'pending' : 'pending'
    });

    await booking.save();
    console.log('✅ Booking saved:', booking._id);

    // If specific pandit is selected, send notification ONLY to that pandit
    if (panditId) {
      const pandit = await Pandit.findById(panditId);
      if (!pandit) {
        return res.status(404).json({
          success: false,
          message: 'Selected pandit not found'
        });
      }

      booking.panditId = panditId;
      booking.status = 'pending';
      await booking.save();

      // Send notification ONLY to this pandit
      await NotificationService.notifySinglePandit(booking, pandit);

      return res.status(201).json({
        success: true,
        booking,
        message: `Booking request sent to ${pandit.name}. They will confirm soon.`
      });
    }
    // After finding service, add this validation
    if (userLocation && userLocation !== 'Unknown') {
      const panditsInCity = await Pandit.countDocuments({
        location: { $regex: userLocation, $options: 'i' },
        isAvailable: true
      });

      if (panditsInCity === 0) {
        return res.status(400).json({
          success: false,
          message: `No pandits available in ${userLocation}. Please select a different city.`,
          availableCities: await Pandit.distinct('location')
        });
      }
    }

    // If only service is selected (no pandit), find suitable pandits
    if (serviceId && !panditId) {
      console.log('🔍 Starting pandit search process...');

      const suitablePandits = await NotificationService.findSuitablePandits(booking);

      if (suitablePandits.length > 0) {
        console.log(`📢 Found ${suitablePandits.length} suitable pandits, sending notifications...`);
        await NotificationService.notifyPandits(booking, suitablePandits);

        booking.status = 'notified';
        await booking.save();

        return res.status(201).json({
          success: true,
          booking,
          message: `Booking created! Notifications sent to ${suitablePandits.length} pandits.`,
          panditsNotified: suitablePandits.length
        });
      } else {
        console.log('⚠️ No suitable pandits found');
        return res.status(201).json({
          success: true,
          booking,
          message: 'Booking created! Our team will assign a pandit shortly.',
          panditsNotified: 0
        });
      }
    }

    return res.status(201).json({
      success: true,
      booking,
      message: 'Booking created successfully!'
    });

  } catch (err) {
    console.error('❌ Booking creation error:', err);
    next(err);
  }
};



// Get bookings (admin or filter)
exports.getBookings = async (req, res, next) => {
  try {
    const q = {};
    const { status, panditId, serviceId, dateFrom, dateTo, page = 1, limit = 20 } = req.query;

    if (status) q.status = status;
    if (panditId) q.panditId = panditId;
    if (serviceId) q.serviceId = serviceId;
    if (dateFrom || dateTo) {
      q.dateTime = {};
      if (dateFrom) q.dateTime.$gte = new Date(dateFrom);
      if (dateTo) q.dateTime.$lte = new Date(dateTo);
    }

    const pageNum = Math.max(1, parseInt(page));
    const lim = Math.max(1, parseInt(limit));
    const skip = (pageNum - 1) * lim;

    const bookings = await Booking.find(q)
      .populate('serviceId', 'name price')
      .populate('panditId', 'name contact email')
      .sort({ dateTime: -1 })
      .skip(skip)
      .limit(lim)
      .lean();

    const total = await Booking.countDocuments(q);
    res.json({ success: true, bookings, total, page: pageNum, totalPages: Math.ceil(total / lim) });
  } catch (err) {
    next(err);
  }
};

exports.getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('serviceId', 'name price')
      .populate('panditId', 'name contact email')
      .lean();
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json({ success: true, booking });
  } catch (err) {
    next(err);
  }
};

// Update booking status/details (admin/pandit)
exports.updateBooking = async (req, res, next) => {
  try {
    const { status, panditId, dateTime, address, message, price } = req.body;
    const update = {};
    if (status) update.status = status;
    if (panditId !== undefined) update.panditId = panditId;
    if (dateTime) update.dateTime = new Date(dateTime);
    if (address) update.address = address;
    if (message) update.message = message;
    if (price) update.price = price;

    const booking = await Booking.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    res.json({ success: true, booking });
  } catch (err) {
    next(err);
  }
};

// Cancel booking
exports.cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findByIdAndUpdate(req.params.id, { status: 'cancelled' }, { new: true });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json({ success: true, booking });
  } catch (err) {
    next(err);
  }
};

// Pandit accepts booking
// Pandit accepts booking
exports.acceptBooking = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const panditId = req.user.id;

    const Booking = require('../models/Booking');
    const Pandit = require('../models/Pandit');
    const Notification = require('../models/Notification');
    const NotificationService = require('../utils/notificationService');

    const booking = await Booking.findById(bookingId)
      .populate('serviceId', 'name price')
      .populate('panditId', 'name email contact');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if booking is still available
    if (booking.status !== 'notified' && booking.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Booking already accepted by another pandit'
      });
    }

    // Get all pandits who were notified (for sending removal events)
    const notifiedPandits = booking.notifiedPandits || [];

    // Delete all notifications for this booking
    const deletedNotifications = await Notification.deleteMany({ bookingId: booking._id });
    console.log(`🗑️ Deleted ${deletedNotifications.deletedCount} notifications for booking ${booking._id}`);

    // Get pandit details
    const pandit = await Pandit.findById(panditId);

    // Update booking
    booking.panditId = panditId;
    booking.status = 'accepted';
    await booking.save();

    // ✅ Emit socket event to remove notification from all notified pandits
    const io = req.app.get('io');
    if (io) {
      // Notify the accepting pandit that booking is accepted
      io.to(`pandit_${panditId}`).emit('booking_accepted', {
        bookingId: booking._id,
        message: `You accepted booking for ${booking.serviceId?.name}`
      });

      // Notify all other pandits to remove this notification
      notifiedPandits.forEach(notifiedPanditId => {
        if (notifiedPanditId.toString() !== panditId.toString()) {
          io.to(`pandit_${notifiedPanditId}`).emit('remove_notification', {
            bookingId: booking._id,
            message: `Booking for ${booking.serviceId?.name} has been accepted by another pandit`
          });
        }
      });

      console.log(`📡 Emitted remove_notification to ${notifiedPandits.length - 1} other pandits`);
    }

    // Send email confirmation
    try {
      await NotificationService.sendBookingConfirmation(booking, pandit);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
    }

    res.json({
      success: true,
      message: 'Booking accepted successfully!',
      booking
    });

  } catch (err) {
    console.error('❌ Error accepting booking:', err);
    next(err);
  }
};

// Get pandit's bookings
exports.getPanditBookings = async (req, res, next) => {
  try {
    const panditId = req.user.id;
    const { status, page = 1, limit = 10 } = req.query;

    const query = { panditId };
    if (status) query.status = status;

    const pageNum = Math.max(1, parseInt(page));
    const lim = Math.max(1, parseInt(limit));
    const skip = (pageNum - 1) * lim;

    const bookings = await Booking.find(query)
      .populate('serviceId', 'name price duration')
      .sort({ dateTime: -1 })
      .skip(skip)
      .limit(lim)
      .lean();

    const total = await Booking.countDocuments(query);

    res.json({
      success: true,
      bookings,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / lim)
    });
  } catch (err) {
    next(err);
  }
};

exports.cancelBookingByUser = async (req, res, next) => {
  try {
    let query = { _id: req.params.id };

    if (req.user?.id) {
      // ✅ Logged-in user → strict ownership
      query.customerId = req.user.id;
    } else {
      // ✅ Guest user → fallback
      query.$or = [
        { email: req.body.email },
        { contact: req.body.contact }
      ];
    }

    const booking = await Booking.findOne(query);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found or unauthorized"
      });
    }

    booking.status = 'cancelled';
    await booking.save();

    res.json({
      success: true,
      message: "Booking cancelled successfully",
      booking
    });

  } catch (err) {
    console.error('❌ Cancel error:', err);
    next(err);
  }
};

// Helper to notify admin
exports.notifyAdminBookingAccepted = async (booking, panditId) => {
  const pandit = await Pandit.findById(panditId);
  const service = await Service.findById(booking.serviceId);

  console.log(`📢 Booking Accepted: ${service.name} by ${pandit.name} for ${booking.name}`);
};