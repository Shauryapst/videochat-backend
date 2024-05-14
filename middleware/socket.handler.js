const logger = require("../logger/logger");
const serverStore = require("../serverStore");

const User = require("../models/user");
const Invitation = require('../models/invitation')

const newConnectionHandler = async (socket, io) => {
    const userDetails = socket.user;
    serverStore.addNewConnectedUser({
        socketId : socket.id,
        userId : userDetails.id
    })
}

const disconnectHandler = async (socket) => {
    serverStore.removeConnectedUser(socket.id);
}




const updateFriendsPendingInvitations = async (receiverId) => {
  try {
    const pendingInvitations = await FriendInvitation.find({
      receiverId: receiverId,
    }).populate("senderId", "_id username email");

    const receiverList = serverStore.getActiveConnections(receiverId);

    const io = serverStore.getSocketServerInstance();

    receiverList.forEach((receiverSocketId) => {
      io.to(receiverSocketId).emit("invite", {
        pendingInvitations: pendingInvitations ? pendingInvitations : [],
      });
    });
  } catch (err) {
    console.log(err);
  }
};

const updateFriends = async (userId) => {
  try {
    // find active connections of specific id (online users)
    const receiverList = serverStore.getActiveConnections(userId);

    if (receiverList.length > 0) {
      const user = await User.findById(userId, { _id: 1, friends: 1 }).populate(
        "friends",
        "_id username email"
      );

      if (user) {
        const friendsList = user.friends.map((f) => {
          return {
            id: f._id,
            mail: f.email,
            username: f.username,
          };
        });

        // get io server instance
        const io = serverStore.getSocketServerInstance();

        receiverList.forEach((receiverSocketId) => {
          io.to(receiverSocketId).emit("friends-list", {
            friends: friendsList ? friendsList : [],
          });
        });
      }
    }
  } catch (err) {
    console.log(err);
  }
};




module.exports = {newConnectionHandler, disconnectHandler, updateFriends, updateFriendsPendingInvitations};