// backend/middleware/logger.js - CREATE NEW
const logger = (req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl} - IP: ${req.ip}`);
  next();
};

module.exports = logger;

// Use in server.js:
// app.use(logger);