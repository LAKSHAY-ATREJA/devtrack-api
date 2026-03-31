const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async (uri) => {
  await mongoose.connect(uri);
  logger.info('MongoDB connected');
};

module.exports = connectDB;
