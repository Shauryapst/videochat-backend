const express = require("express");
const cors = require("cors");
const bodyparser = require("body-parser");
const logger = require("./logger/logger");
require("dotenv").config();

const app = express();


app.use(cors());
app.use(express.json());
app.use(bodyparser.urlencoded({ extended: false }));

logger.info("routes------------", `./routes`);
require('./routes')('/api', app);
module.exports = app;