const logger = require('./logger/logger');
const { socketTokenValidation } = require('./middleware/auth.handler');
const { newConnectionHandler, disconnectHandler, messageHandler, getChatHistory } = require('./middleware/socket.handler');
const { setSocketServerInstance } = require('./serverStore');


const registerSocketServer = (server) => {
    const io = require("socket.io")(server, {
        cors :{
            origin : "*",
            methods: ["GET", "POST"]
        }
    });
    setSocketServerInstance(io);
    io.use((socket, next) => {
        socketTokenValidation(socket, next);
    })

    io.on("connection", socket => {
        logger.debug('user connected')
        logger.debug(socket.id);
        newConnectionHandler(socket, io);

        socket.on('disconnect', ()=>{
            disconnectHandler(socket);
            
        });

        socket.on('send-message', (data)=>{
            messageHandler(socket,data);
        })

        socket.on('get-chat-history', data => {
            getChatHistory(socket, data);
            
        })
    })

}
module.exports = {
    registerSocketServer
}