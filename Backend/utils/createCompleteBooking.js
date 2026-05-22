// backend/utils/createCompleteBooking.js
require('dotenv').config();
const mongoose = require('mongoose');

const createCompleteBooking = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/panditji');
    console.log('✅ Connected to MongoDB');
    
    const Booking = require('../models/Booking');
    const Service = require('../models/Service');
    const Pandit = require('../models/Pandit');
    const Notification = require('../models/Notification');
    
    // Get a service
    const service = await Service.findOne();
    if (!service) {
      console.log('❌ No service found. Please run seedData.js first');
      process.exit(1);
    }
    
    // Get a pandit
    const pandit = await Pandit.findOne();
    if (!pandit) {
      console.log('❌ No pandit found. Please run seedData.js first');
      process.exit(1);
    }
    
    console.log('📋 Using Service:', service.name);
    console.log('📋 Using Pandit:', pandit.name);
    
    // Delete old incomplete bookings
    await Booking.deleteMany({ name: { $in: [null, '', 'Customer'] } });
    console.log('🧹 Cleaned up incomplete bookings');
    
    // Delete old notifications
    await Notification.deleteMany({});
    console.log('🧹 Cleaned up old notifications');
    
    // Create a COMPLETE booking with all data
    const completeBooking = new Booking({
      name: 'Rajesh Sharma',
      contact: '9876543210',
      email: 'rajesh.sharma@example.com',
      serviceId: service._id,
      panditId: null,
      dateTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      address: 'A-101, Sunshine Apartments, FC Road, Shivaji Nagar, Pune - 411004',
      userLocation: 'Pune',
      message: 'Please bring Ganesh idol and all puja samagri. We have 10 family members attending.',
      price: service.price,
      actualPrice: parseInt(service.price.match(/\d+/)[0]),
      status: 'notified'
    });
    
    await completeBooking.save();
    console.log('\n✅ COMPLETE BOOKING CREATED:');
    console.log('   Booking ID:', completeBooking._id);
    console.log('   Customer Name:', completeBooking.name);
    console.log('   Contact:', completeBooking.contact);
    console.log('   Email:', completeBooking.email);
    console.log('   Address:', completeBooking.address);
    console.log('   Message:', completeBooking.message);
    console.log('   Service:', service.name);
    console.log('   Price:', service.price);
    
    // Create notification for pandit
    const notification = new Notification({
      panditId: pandit._id,
      bookingId: completeBooking._id,
      type: 'booking_request',
      message: `New booking request for ${service.name} from ${completeBooking.name}`,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    });
    
    await notification.save();
    console.log('\n✅ NOTIFICATION CREATED:');
    console.log('   Notification ID:', notification._id);
    console.log('   Pandit:', pandit.name);
    console.log('   Message:', notification.message);
    
    console.log('\n🎉 SUCCESS! Now login as pandit to see the complete notification.');
    console.log('\n📝 Pandit Login:');
    console.log(`   Username: ${pandit.username}`);
    console.log('   Password: pandit123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

createCompleteBooking();