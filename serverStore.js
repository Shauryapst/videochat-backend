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


const getActiveConnections = (userId) => {
    const activeConnections = [];
  
    connectedUsers.forEach(function (value, key) {
      if (value.userId === userId) {
        activeConnections.push(key);
      }
    });
  
    return activeConnections;
  };
  
  const getOnlineUsers = () => {
    const onlineUsers = [];
  
    connectedUsers.forEach((value, key) => {
      onlineUsers.push({ socketId: key, userId: value.userId });
    });
  
    return onlineUsers;
  };

module.exports = {addNewConnectedUser, removeConnectedUser, getConnectedUsers, getActiveConnections, getOnlineUsers};