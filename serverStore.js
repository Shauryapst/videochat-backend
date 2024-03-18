const logger = require("./logger/logger");

const connectedUsers = new Map();


const addNewConnectedUser = ({socketId, userId}) => {
    connectedUsers.set(socketId, {userId});
    logger.debug(connectedUsers);
}

const removeConnectedUser = (socketId)=>{
    connectedUsers.delete(socketId);
    logger.debug(connectedUsers);
}

const getConnectedUsers = () => connectedUsers;

module.exports = {addNewConnectedUser, removeConnectedUser, getConnectedUsers};