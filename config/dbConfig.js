const mongoose = require('mongoose');
const logger = require('../logger/logger');
require('dotenv').config();

const connectDB = () => {
  const url = process.env.mongodb_uri;
 
  try {
    mongoose.connect(url);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
  const dbConnection = mongoose.connection;
  dbConnection.once("open", (_) => {
    logger.info(`Database connected`);
  });
 
  dbConnection.on("error", (err) => {
    logger.error(`connection error: ${err.message}`);
  });
  return;
}

module.exports = connectDB