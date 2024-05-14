const logger = require("../logger/logger");
const Invitation = require("../models/invitation");
const Conversation = require('../models/conversation');
const User = require("../models/user");
const {
  updateFriendsPendingInvitations,
} = require("../middleware/socket.handler");

const createInvitation = async (req, res) => {
  try {
    const { senderId, recieverId } = req.body;
    if (senderId == recieverId) {
      return res
        .status(400)
        .json({
          status: false,
          message: "Cannot send an invitation yourself.",
        });
    }

    if (!(await User.exists({ _id: senderId }))) {
      return res
        .status(404)
        .json({
          status: false,
          message: `SenderId : ${senderId} does not exist.`,
        });
    }
    if (!(await User.exists({ _id: recieverId }))) {
      return res
        .status(404)
        .json({
          status: false,
          message: `RecieverId : ${recieverId} does not exist.`,
        });
    }
    const invitationExists = await Invitation.exists({
      senderId: senderId,
      recieverId: recieverId,
    });

    if (invitationExists) {
      return res
        .status(409)
        .json({ status: false, message: "Already sent an invitation" });
    }
    const targetUser = await User.findOne({
      _id: senderId,
    });

    const usersAlreadyFriends = targetUser.friends.find(
      (friendId) => friendId.toString() === recieverId.toString()
    );


    if (usersAlreadyFriends) {
      return res
        .status(409)
        .json({status:false, message: "Already Friends"});
    }

    const invitation = await Invitation.create({
      senderId: senderId,
      recieverId: recieverId,
    });
    logger.debug('invite created');
    logger.debug(invitation);

    updateFriendsPendingInvitations(invitation._id, recieverId);
    return res.status(201).json({
      status: true,
      message: "Invitation Sent",
    });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};
const updateInvitation = async (req, res) => {
  try {
    const { action, invitationId } = req.body;

    if (!["accept", "reject"].includes(action)) {
      return res.status(400).json({ error: "Invalid action" });
    }

    const invitation = await Invitation.findById(invitationId);
    if (!invitation) {
      return res.status(404).json({ error: "Invitation not found" });
    }
    let conversation = null;
    switch (action) {
      case "accept":
        invitation.status = "accepted";
        await User.findByIdAndUpdate(invitation.recieverId, {
          $push: { friends: invitation.senderId },
        });
        await User.findByIdAndUpdate(invitation.senderId, {
          $push: { friends: invitation.recieverId },
        });
        conversation = await Conversation.create({
          message: [],
          participants: [invitation.recieverId, invitation.senderId]
        });
        
        break;
       
      case "reject":
        invitation.status = "rejected";
        break;
    }

    await Invitation.deleteOne({_id: invitation._id});
    res
      .status(200)
      .json({ message: `Sucessfully Invitation ${invitation.status}` });
  } catch (error) {
    console.error("Error updating invitation:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const listInvitation = async (req, res) => {
  try {
    const id = req.user.id;

    let list = await Invitation.find({ recieverId: id, status: "pending" })
      .select("senderId status createdAt")
      .populate("senderId", "email username");
    list = list.map((invite) => {
      return {
        inviteId: invite._id,
        sentAt: invite.createdAt,
        email: invite.senderId.email,
        username: invite.senderId.username,
      };
    });
    return res
      .status(200)
      .json({ status: true, message: "Invitation List", data: list });
  } catch (error) {
    return res.status(500).json({ status: true, message: error.message });
  }
};

module.exports = { createInvitation, updateInvitation, listInvitation };
