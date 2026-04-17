const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async (uri) => {
  if (!uri) {
    throw new Error('MONGO_URI environment variable is not set');
  }

  const options = {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  };

  await mongoose.connect(uri, options);
  logger.info('MongoDB connected');

  mongoose.connection.on('error', (err) => {
    logger.error(`MongoDB connection error: ${err.message}`);
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected');
  });
};

module.exports = connectDB;
