const logger = require("../logger/logger");
const Conversation = require("../models/conversation");
const User = require('../models/user');
const getAllConversation = async (req, res) => {
  try {
    const userId = req.user.id;
    const conversations = await Conversation.find({ "participants": userId })
      .populate({
        path: "participants",
        model: "User",
        select: "username _id"
      })
      .sort({ updatedAt: -1 })
      .exec();
      

      const conversationList = conversations.map(conversation => {
        let groupName;
        if (conversation.participants.length === 2) {
          groupName = conversation.participants.find(participant => participant._id.toString() !== userId.toString()).username;
        } else {
          groupName = conversation.groupName || conversation.participants
            .filter(participant => participant._id.toString() !== userId.toString())
            .map(participant => participant.username)
            .join(", ");
        }
        return {
            updatedAt: conversation.updatedAt,
          conversationId: conversation._id,
          conversationName : groupName,
          participants: conversation.participants.map(participant => ({
            pId: participant._id,
            pName: participant.username
          })),
        };
      });
      return res.status(200).send({status:true, data: conversationList});
  } catch (error) {
    console.error("Error fetching conversation:", error);
    return res.status(500).json(error.message);
  }
};

const getConversationById = async(req, res) => {
  try{
    const {conversationId} = req.params;

    const conversation = await Conversation.findById(conversationId);
    logger.debug(conversation);

    return res.status(200).send();
  }
  catch(error){
    return res.status('500').send({message: error.message, status: false});
  }
}

module.exports = { getAllConversation, getConversationById };
