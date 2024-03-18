const logger = require('./logger/logger');
const { socketTokenValidation } = require('./middleware/auth.handler');
const { newConnectionHandler, disconnectHandler } = require('./middleware/socket.handler');

const registerSocketServer = (server) => {
    const io = require("socket.io")(server, {
        cors :{
            origin : "*",
            methods: ["GET", "PSOT"]
        }
    });
    io.use((socket, next) => {
        socketTokenValidation(socket, next);
    })

    io.on("connection", socket => {
        logger.debug('user connected')
        logger.debug(socket.id);
        newConnectionHandler(socket, io);

        socket.on('disconnect', ()=>{
            disconnectHandler(socket);
            
        })
    })
}

module.exports = {
    registerSocketServer
}