const logger = require('../utils/logger');

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  logger.error(err.message);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ error: messages.join(', ') });
  }

  // Duplicate key (e.g. email already registered)
  if (err.code === 11000) {
    return res.status(409).json({ error: 'Resource already exists' });
  }

  // Invalid ObjectId
  if (err.name === 'CastError') {
    return res.status(400).json({ error: 'Invalid ID format' });
  }

  return res.status(err.statusCode || 500).json({
    error: err.statusCode ? err.message : 'Internal server error',
  });
};

module.exports = errorHandler;
