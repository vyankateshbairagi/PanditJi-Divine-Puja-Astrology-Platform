// backend/utils/notificationService.js - FIXED VERSION

const Notification = require('../models/Notification');
const Pandit = require('../models/Pandit');
const Booking = require('../models/Booking');

class NotificationService {

  // Find suitable pandits for a booking
  static async findSuitablePandits(booking) {
    try {
      console.log('🔍 Finding suitable pandits for booking:', booking._id);

      const Service = require('../models/Service');
      const service = await Service.findById(booking.serviceId);

      if (!service) {
        console.log('❌ Service not found:', booking.serviceId);
        return [];
      }

      const query = {
        isAvailable: true,
        services: { $in: [service.name] }
      };

      if (booking.userLocation && booking.userLocation !== 'Unknown') {
        query.location = { $regex: booking.userLocation, $options: 'i' };
      }

      const suitablePandits = await Pandit.find(query).limit(10);
      console.log(`✅ Found ${suitablePandits.length} suitable pandits`);
      return suitablePandits;

    } catch (error) {
      console.error('❌ Error finding suitable pandits:', error);
      return [];
    }
  }

  // Send notifications to pandits
  // Send notifications to pandits
static async notifyPandits(booking, pandits, io) {
  try {
    console.log(`📨 Sending notifications to ${pandits.length} pandits`);
    
    const notifications = [];
    const expiryTime = new Date();
    expiryTime.setHours(expiryTime.getHours() + 24);
    
    for (const pandit of pandits) {
      const notification = new Notification({
        panditId: pandit._id,
        bookingId: booking._id,
        type: 'booking_request',
        message: `New booking request for ${booking.serviceId?.name || 'puja service'}`,
        expiresAt: expiryTime
      });
      
      await notification.save();
      notifications.push(notification);
      
      if (!booking.notifiedPandits) {
        booking.notifiedPandits = [];
      }
      booking.notifiedPandits.push(pandit._id);

      // ✅ REAL-TIME EMIT
      io.to(`pandit_${pandit._id}`).emit('new_booking', {
        bookingId: booking._id,
        message: notification.message
      });
    }
    
    await booking.save();
    
    console.log(`✅ Created ${notifications.length} notifications`);
    return notifications;
    
  } catch (error) {
    console.error('❌ Error sending notifications:', error);
    return [];
  }
}

  // ✅ FIXED: Get pandit's notifications with complete booking data
  static async getPanditNotifications(panditId) {
    try {
      console.log(`📨 Fetching notifications for pandit: ${panditId}`);

      const now = new Date();
      await Notification.deleteMany({ expiresAt: { $lt: now } });

      let notifications = await Notification.find({
        panditId: panditId,
        expiresAt: { $gt: now },
        isRead: false
      })
        .populate({
          path: 'bookingId',
          populate: [
            {
              path: 'serviceId',
              select: 'name price duration category'
            },
            {
              path: 'panditId',
              select: 'name contact'
            }
          ]
        })
        .sort({ createdAt: -1 })
        .lean();

      console.log(`📊 Found ${notifications.length} notifications in database`);
      // filter out notification when booking is already accepted.
      notifications = notifications.filter(notification => {
        const booking = notification.bookingId;
        if (!booking) return false;

        // Keep notification only if booking is still pending or notified
        const isValidStatus = ['pending', 'notified'].includes(booking.status);
        if (!isValidStatus) {
          console.log(`🗑️ Filtering out notification ${notification._id} - booking status: ${booking.status}`);
        }
        return isValidStatus;
      });
      console.log(`📊 Found ${notifications.length} valid notifications`);

      // ✅ FIXED: Format notifications with complete data
      const formattedNotifications = notifications.map(notification => {
        const booking = notification.bookingId;

        // Log raw data for debugging
        console.log(`   Processing notification ${notification._id}:`);
        console.log(`      Booking exists: ${!!booking}`);

        if (!booking) {
          console.log(`      ⚠️ Booking not found for notification`);
          return {
            _id: notification._id,
            notificationId: notification._id,
            bookingId: null,
            type: notification.type,
            serviceName: 'Unknown Service',
            bookingDateTime: null,
            location: 'Unknown',
            customerName: 'Unknown Customer',
            price: 'N/A',
            contact: 'N/A',
            address: 'N/A',
            createdAt: notification.createdAt,
            expiresAt: notification.expiresAt,
            isRead: notification.isRead
          };
        }

        // Extract all booking details
        const formattedNotification = {
          _id: notification._id,
          notificationId: notification._id,
          bookingId: booking._id,
          type: notification.type,
          serviceName: booking.serviceId?.name || 'Puja Service',
          servicePrice: booking.serviceId?.price || booking.price || 'N/A',
          bookingDateTime: booking.dateTime,
          location: booking.userLocation || booking.location || 'Unknown',
          customerName: booking.name || 'Customer',
          customerContact: booking.contact || 'N/A',
          customerEmail: booking.email || 'N/A',
          price: booking.price || booking.serviceId?.price || 'N/A',
          contact: booking.contact || 'N/A',
          address: booking.address || 'No address provided',
          message: booking.message || '',
          status: booking.status,
          createdAt: notification.createdAt,
          expiresAt: notification.expiresAt,
          isRead: notification.isRead
        };

        console.log(`✅ Formatted: ${formattedNotification.customerName} - ${formattedNotification.serviceName}`);
        return formattedNotification;
      });

      console.log(`✅ Returning ${formattedNotifications.length} formatted notifications`);
      return formattedNotifications;

    } catch (error) {
      console.error('❌ Error getting pandit notifications:', error);
      return [];
    }
  }

  // Mark notification as read
  static async markAsRead(notificationId) {
    try {
      const result = await Notification.findByIdAndUpdate(
        notificationId,
        { isRead: true },
        { new: true }
      );
      return !!result;
    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
      return false;
    }
  }

  // Send booking confirmation email
  static async sendBookingConfirmation(booking, pandit) {
    try {
      console.log(`📧 Sending confirmation email for booking ${booking._id}`);
      // Implement email sending logic here
      return true;
    } catch (error) {
      console.error('❌ Error sending confirmation email:', error);
      return false;
    }
  }
  // Send notification to a single pandit (for direct booking)
  // Send notification to a single pandit (for direct booking)
  static async notifySinglePandit(booking, pandit, io) {
    try {
      const Notification = require('../models/Notification');
      const expiryTime = new Date();
      expiryTime.setHours(expiryTime.getHours() + 24);

      // Get service name if exists
      let serviceName = 'puja service';
      if (booking.serviceId) {
        const Service = require('../models/Service');
        const service = await Service.findById(booking.serviceId);
        if (service) serviceName = service.name;
      }

      const notification = new Notification({
        panditId: pandit._id,
        bookingId: booking._id,
        type: 'booking_request',
        message: `New direct booking request for ${serviceName} from ${booking.name}`,
        expiresAt: expiryTime
      });

      await notification.save();

      if (io) {
      io.to(`pandit_${pandit._id}`).emit('new_booking', {
        bookingId: booking._id,
        message: notification.message
      });
    }
      console.log(`✅ Notification sent to pandit ${pandit.name}`);
      return notification;
    } catch (error) {
      console.error('Error sending single pandit notification:', error);
      return null;
    }
  }
}

module.exports = NotificationService;