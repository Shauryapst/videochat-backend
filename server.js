const http = require("http");
const logger = require("./logger/logger");
const connectDB = require("./config/dbConfig");
const app = require('./app');
const socket = require('./socket');
require("dotenv").config();

const port = process.env.PORT || 8080;

connectDB();
const server = http.createServer(app);
socket.registerSocketServer(server);
server.listen(port, () => {
  logger.info(`Server is running on PORT ${port}`);
});
