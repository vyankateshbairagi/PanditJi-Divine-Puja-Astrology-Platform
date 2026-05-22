// backend/middleware/errorHandler.js - ENHANCE
module.exports = (err, req, res, next) => {
  console.error("❌ Error Stack:", err.stack);
  
  let errorResponse = {
    success: false,
    message: err.message || "Internal Server Error",
  };

  // Mongoose validation errors
  if (err.name === 'ValidationError') {
    errorResponse = {
      success: false,
      message: 'Validation Error',
      errors: Object.values(err.errors).map(e => e.message),
      userMessage: 'Please check your input fields'
    };
    return res.status(400).json(errorResponse);
  }

  // MongoDB duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    errorResponse = {
      success: false,
      message: 'Duplicate entry',
      userMessage: `${field} already exists`
    };
    return res.status(400).json(errorResponse);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    errorResponse = {
      success: false,
      message: 'Invalid token',
      userMessage: 'Please login again'
    };
    return res.status(401).json(errorResponse);
  }

  // Mongoose CastError (invalid ID)
  if (err.name === 'CastError') {
    errorResponse = {
      success: false,
      message: 'Invalid ID',
      userMessage: 'The requested resource was not found'
    };
    return res.status(400).json(errorResponse);
  }

  // Default error
  res.status(err.status || 500).json({
    ...errorResponse,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};