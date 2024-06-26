const logger = require("../logger/logger");
const Invitation = require("../models/invitation");
const User = require("../models/user");
const {updateFriendsPendingInvitations } = require('../middleware/socket.handler')

const createInvitation = async (req, res) => {
  try {
    const { senderId, recieverId } = req.body;
    if(senderId == recieverId){
      return res.status(400).json({status: false, message: 'Cannot send an invitation yourself.'});
    }

    if(! (await user.exists({_id: senderId}))){
      return res.status(404).json({status: false, message: `SenderId : ${senderId} does not exist.`})
    }
    if(! (await user.exists({_id: recieverId}))){
      return res.status(404).json({status: false, message: `RecieverId : ${recieverId} does not exist.`})
    }
    const invitationExists = await Invitation.exists({
      senderId: senderId,
      recieverId: recieverId,
    });
   

    if (invitationExists) {
      return res.status(409).json({status:false, message: "Already sent an invitation"});
    }
    const targetUser = await User.findOne({
      _id: senderId,
    });
  
    const usersAlreadyFriends = targetUser.friends.find(
      (friendId) => friendId.toString() === senderId.toString()
    );
  
    if (usersAlreadyFriends) {
      return res
        .status(409)
        .send("Friend already added. Please check friends list");
    }
    
    const invitation = Invitation.create({
      senderId: senderId,
      recieverId: recieverId,
    });
    logger.debug(JSON.stringify(invitation));

    updateFriendsPendingInvitations(recieverId);

    return res.status(200).json({
      status: true,
      message: "Invitation Sent",
    });
  } catch (err) {
    return res.status(500).json({status:false, message: err.message});
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

    switch (action) {
      case "accept":
        invitation.status = "accepted";
        break;
      case "reject":
        invitation.status = "rejected";
        break;
    }

    await invitation.save();

    res
      .status(200)
      .json({ message: `Sucessfully Invitation ${invitation.status}` });
  } catch (error) {
    console.error("Error updating invitation:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const listInvitation = async (req, res) => {
  try{
    const id = req.user.id;
    
    let list = await Invitation.find({ recieverId: id, status: 'pending'}).select('senderId status createdAt').populate('senderId', 'email username');
    list = list.map(invite => {
      return {
        inviteId: invite._id,
        sentAt : invite.createdAt,
        email : invite.senderId.email,
        username : invite.senderId.username,
      }
    });
    

    
    return res.status(200).json({status: true, message: 'Invitation List',data : list});

    
  }
  catch(error){
    return res.status(500).json({status: true, message: error.message});
  }
}

module.exports = { createInvitation, updateInvitation, listInvitation };
