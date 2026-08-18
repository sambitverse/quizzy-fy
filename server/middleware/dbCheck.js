const mongoose = require('mongoose');

const dbCheck = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: 'Database connection is not established. Please ensure MongoDB is running locally or configure MONGO_URI in your server/.env file.'
    });
  }
  next();
};

module.exports = dbCheck;
