const logger = require('./logger/logger');
const registerSocketServer = (server) => {
    const io = require("socket.io")(server, {
        cors :{
            origin : "*",
            methods: ["GET", "PSOT"]
        }
    });

    io.on("connection", socket => {
        logger.info('user connected')
        logger.info(socket.id);
    })
}

module.exports = {
    registerSocketServer
}