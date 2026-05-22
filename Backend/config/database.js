// Already good - ensure MONGODB_URI is set in environment variables
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Remove localhost fallback in production
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI && process.env.NODE_ENV === 'production') {
      throw new Error('MONGODB_URI is required in production');
    }
    await mongoose.connect(mongoURI || 'mongodb://localhost:27017/panditji');
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;