const serverStore = require("../serverStore");

const User = require("../models/user");
const Invitation = require("../models/invitation");
const logger = require("../logger/logger");
const Message = require('../models/message');
const Conversation = require('../models/conversation');

const newConnectionHandler = async (socket, io) => {
  const userDetails = socket.user;
  serverStore.addNewConnectedUser({
    socketId: socket.id,
    userId: userDetails.id,
  });
};

const disconnectHandler = async (socket) => {
  serverStore.removeConnectedUser(socket.id);
};

const updateFriendsPendingInvitations = async (inviteId, recieverId) => {
  try {

    let pendingInvitations = await Invitation.find({
      _id: inviteId,
    })
      .select("recieverId senderId status createdAt")
      .populate("senderId", "email username");

    pendingInvitations = pendingInvitations.map((invite) => {
      return {
        inviteId: invite._id,
        sentAt: invite.createdAt,
        email: invite.senderId.email,
        username: invite.senderId.username,
      };
    });

    const receiverList = serverStore.getActiveConnections(recieverId);

    const io = serverStore.getSocketServerInstance();

    receiverList.forEach((receiverSocketId) => {
      io.to(receiverSocketId).emit("new-invite", {
        pendingInvitations: pendingInvitations ? pendingInvitations : [],
      });
    });
  } catch (err) {
    console.log(err);
  }
};

const updateFriends = async (userId) => {
  try {
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

const messageHandler = async (socket, data) => {
  try {
    const senderId = socket.user.id;
    const senderName = socket.user.username;
   
    
    const { conversationId, content } = data;
    const timestamp = new Date();
    
    const message = await Message.create({
      content: content,
      author: senderId,
      date: timestamp
    });

    const conversation = await Conversation.findById(conversationId);
    if (conversation) {
      conversation.messages.push(message._id);
      conversation.updatedAt = timestamp;
      await conversation.save();


      conversation.participants.forEach((userId) => {

        const activeConnections = serverStore.getActiveConnections(
          userId.toString()
        );
        const io = serverStore.getSocketServerInstance();
        activeConnections.forEach((socketId) => {
          io.to(socketId).emit("new-message", {
            messageId : message._id,
            content : content,
            conversationId : conversationId,
            author : {_id : senderId, username: senderName},
            date : timestamp
          });
        });
      });
    } else {
      logger.error(`No conversation with id ${conversationId}`)
    }
  } catch (error) {
    console.error('Error handling message:', error);
    // Handle the error as needed, such as sending an error response to the client
  }
};

const getChatHistory = async (socket, data) => {
  try {
    const socketId = socket.id;
    const { conversationId, from, to } = data;
    const fromIndex = Math.abs(from);
    const toIndex = Math.abs(to);

    
    const conversation = await Conversation.findById(conversationId)
    .where("messages")
      .populate({
        path: "messages",
        select: "content date",
        options: {
          sort: { 'date' : -1 },
          populate: { path: 'author', select: 'username email _id' },
          skip: fromIndex,
          limit: toIndex - fromIndex
        },
      })
      
      const io = serverStore.getSocketServerInstance();
      io.to(socketId).emit("chat-history", {
        conversationId : conversation._id,
        messages : conversation.messages.reverse()
      });
  } catch (err) {
    console.error(err.message);
  }
};





module.exports = {
  newConnectionHandler,
  disconnectHandler,
  updateFriends,
  updateFriendsPendingInvitations,
  messageHandler,
  getChatHistory
};
