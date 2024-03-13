const fs = require("fs");
const path = require("path");
const logger = require("../logger/logger");

const basename = path.basename(module.filename);

module.exports = (basePath, router) => {
  logger.info("Registering all routes");

  fs.readdirSync(__dirname)
    .filter((file) => {
      return (
        file.indexOf(".") !== 0 && file !== basename && file.slice(-3) == ".js"
      );
    })
    .forEach((file) => {
        logger.info(file)
      return require(path.join(__dirname, file))(basePath, router);
    });
};
