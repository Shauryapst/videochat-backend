const logger = require("../logger/logger");
const serviceStore = require("../serverStore");

const newConnectionHandler = async (socket, io) => {
    const userDetails = socket.user;
    serviceStore.addNewConnectedUser({
        socketId : socket.id,
        userId : userDetails.id
    })
}

const disconnectHandler = async (socket) => {
    serviceStore.removeConnectedUser(socket.id);
}



module.exports = {newConnectionHandler, disconnectHandler};