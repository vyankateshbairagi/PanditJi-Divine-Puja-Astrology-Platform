// server.js

// ================= IMPORTS =================
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
const logger = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');
const http = require('http');
const socketIo = require('socket.io');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();
const compatibilityRoutes = require('./routes/compatibility');

const getConfiguredOrigins = () => {
  const localOrigins = ['http://localhost:5173', 'http://localhost:3000'];
  const envOrigins = [process.env.FRONTEND_URL, process.env.CORS_ORIGINS]
    .filter(Boolean)
    .flatMap(value => value.split(','))
    .map(value => value.trim().replace(/\/$/, ''))
    .filter(Boolean);

  const origins = process.env.NODE_ENV === 'production'
    ? envOrigins
    : [...localOrigins, ...envOrigins];

  return [...new Set(origins)];
};

const allowedOrigins = getConfiguredOrigins();


const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/panditji';
const mongoUriForLog = mongoUri
  .replace(/:\/\/([^:]+):[^@]+@/, '://$1:***@')
  .replace(/([?&](?:password|pass|pwd)=)[^&]+/gi, '$1***');
console.log('MONGO URI:', mongoUriForLog);
// ================= ENVIRONMENT CHECK =================
const requiredEnvVars = ['JWT_SECRET', 'MONGODB_URI'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.warn('⚠️ Missing environment variables:', missingEnvVars.join(', '));
  console.warn('Using fallback values for development');
}

// ================= APP INIT =================
const app = express();
app.use(helmet({
  crossOriginResourcePolicy: { policy: "same-site" }, // Changed from 'cross-origin'
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'", "https:", "data:"],
      connectSrc: ["'self'", ...allowedOrigins],
      frameSrc: ["'self'", "https://checkout.razorpay.com"],
      frameAncestors: ["'none'"],
      formAction: ["'self'"],
      upgradeInsecureRequests: []
    }
  }
}));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    message: 'Too many attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// ================= CREATE HTTP SERVER =================
const server = http.createServer(app);

// ================= SOCKET.IO =================
const io = socketIo(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST']
  },
  // ✅ Add these options
  transports: ['websocket', 'polling'],
  allowEIO3: true,  // Allow Engine.IO v3 clients
  pingTimeout: 60000,
  pingInterval: 25000
});
  
io.engine.on('connection_error', (err) => {
  console.log('❌ Socket connection error:', err);
});

// Make io accessible to routes
app.set('io', io);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('🟢 New client connected:', socket.id);

  socket.on('register', (data) => {
    const { userId, role } = data;
    const room = `${role}_${userId}`;
    socket.join(room);
    console.log(`📌 User ${userId} (${role}) joined room: ${room}`);
  });

  socket.on('disconnect', () => {
    console.log('🔴 Client disconnected:', socket.id);
  });
});

// ================= CORS =================
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl)
    if (!origin) return callback(null, true);
    
    // Check if origin is allowed
    const isAllowed = allowedOrigins.some(allowed => {
      if (allowed === '*') return true;
      return origin === allowed || origin.startsWith(allowed);
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.log(`❌ CORS blocked: ${origin}`);
      console.log(`   Allowed: ${allowedOrigins.join(', ')}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
}));

app.options('*', cors());

app.use((req, res, next) => {
  // Set headers for all static assets
  if (req.url.startsWith('/uploads/')) {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  next();
});

// ================= BODY PARSER =================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ================= REQUEST LOGGER =================
app.use((req, res, next) => {
  console.log(`🌐 INCOMING REQUEST: ${req.method} ${req.url}`);
  console.log('Origin:', req.headers.origin);
  console.log('Authorization:', req.headers.authorization ? 'Present' : 'None');
  next();
});

app.use(logger);



// ================= DATABASE =================


// Connect to MongoDB
mongoose.connect(mongoUri, {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  family: 4,
}).catch((error) => {
  console.error('❌ Initial MongoDB connection failed:', error.message);
  console.error('🔎 Atlas checklist: verify Network Access (IP allowlist), DB user password, and a valid MONGODB_URI database name.');
});

const db = mongoose.connection;

db.on('error', (error) => {
  console.error('❌ MongoDB connection error:', error);
});

db.once('open', () => {
  console.log('✅ Connected to MongoDB Atlas');
  console.log(`   Database: ${mongoose.connection.db.databaseName}`);
  console.log(`   Host: ${mongoose.connection.host}`);
});

db.on('disconnected', () => {
  console.log('⚠️ MongoDB disconnected');
});

// Handle graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB connection closed');
  process.exit(0);
});

// ================= HEALTH ROUTES =================
app.get('/api/health', (req, res) => {
  const health = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  };
  res.json(health);
});

app.get('/api/health/detailed', (req, res) => {

  const health = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    responseTime: Date.now()
  };

  mongoose.connection.db.command({ ping: 1 }, (err) => {
    health.dbPing = err ? 'failed' : 'success';
    health.responseTime = Date.now() - health.responseTime;

    if (health.responseTime > 1000) {
      console.log(`⚠️ Slow database ping: ${health.responseTime}ms`);
    }

    res.json(health);
  });

});

// ================= DEBUG ROUTES =================

app.get('/api/debug', (req, res) => {
  res.json({
    message: 'Debug route working!',
    headers: req.headers,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/debug/pandits', async (req, res) => {

  try {

    const Pandit = require('./models/Pandit');

    const pandits = await Pandit.find().select('name username email password');

    res.json({
      count: pandits.length,
      pandits: pandits.map(p => ({
        name: p.name,
        username: p.username,
        email: p.email,
        hasPassword: !!p.password,
        passwordLength: p.password ? p.password.length : 0
      }))
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }

});

app.get('/api/debug/users', async (req, res) => {

  try {

    const User = require('./models/User');

    const users = await User.find();

    console.log('📊 Database Users:', users);

    res.json({
      totalUsers: users.length,
      users: users.map(u => ({
        id: u._id,
        email: u.email,
        username: u.username,
        role: u.role,
        hasPassword: !!u.password,
        passwordLength: u.password?.length,
        createdAt: u.createdAt
      }))
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }

});

app.get('/api/debug/token', async (req, res) => {

  try {

    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) return res.json({ error: 'No token provided' });

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'fallback-secret-for-development'
    );

    const Pandit = require('./models/Pandit');

    const pandit = await Pandit.findById(decoded.id);

    res.json({
      tokenValid: true,
      decoded,
      pandit
    });

  } catch (error) {
    res.json({
      tokenValid: false,
      error: error.message
    });
  }

});

app.get('/api/debug/bookings', async (req, res) => {

  try {

    const Booking = require('./models/Booking');

    const bookings = await Booking.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('serviceId', 'name')
      .lean();

    res.json({
      success: true,
      count: bookings.length,
      bookings
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }

});

app.get('/api/debug/notifications', async (req, res) => {

  try {

    const Notification = require('./models/Notification');

    const notifications = await Notification.find()
      .populate('panditId', 'name email')
      .populate({
        path: 'bookingId',
        populate: {
          path: 'serviceId',
          select: 'name'
        }
      })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    res.json({
      success: true,
      count: notifications.length,
      notifications
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }

});

app.get('/api/test', (req, res) => {
  console.log('✅ Test endpoint hit!');
  res.json({ message: 'Test endpoint working' });
});

app.get('/api/test-bookings', async (req, res) => {

  try {

    const Booking = require('./models/Booking');

    const count = await Booking.countDocuments();

    console.log('📊 Test bookings - count:', count);

    res.json({
      success: true,
      message: 'Bookings test working',
      count
    });

  } catch (error) {
    res.json({
      success: false,
      error: error.message
    });
  }

});


app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Also add root health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// ================= API ROUTES =================
app.use('/api/pandit/auth', require('./routes/panditAuth'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/pandits', require('./routes/pandits'));
app.use('/api/services', require('./routes/services'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/pandit', require('./routes/pandit'));
app.use('/api/user', require('./routes/user'));
app.use('/api/payment', require('./routes/payment'));
app.use('/api/application', require('./routes/application'));
app.use('/api/astro-consultation', require('./routes/astroConsultation'));
app.use('/api/free-astro', require('./routes/freeAstro'));
app.use('/api/astro', compatibilityRoutes);

// ================= ERROR HANDLER =================
app.use(errorHandler);



// ================= 404 =================
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});



// ================= START SERVER =================
const PORT = process.env.PORT || 5000;

server.listen(PORT, '0.0.0.0', () => {

  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`🌐 Local: http://localhost:${PORT}`);
  console.log(`🌐 Network: http://127.0.0.1:${PORT}`);
  console.log(`🔧 Health: http://localhost:${PORT}/api/health`);
  console.log(`🌍 Allowed origins: ${allowedOrigins.join(', ') || 'none configured'}`);
  console.log(`🔌 Socket.IO ready`);

});
