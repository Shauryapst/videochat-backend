const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const invitationSchema = new mongoose.Schema({
    senderId : {
        type : Schema.Types.ObjectId,
        ref: 'User'
    },
    recieverId : {
        type : Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt : {
        type: Date,
        default: Date.now 
    },
    updatedAt: {
        type: Date,
        default: Date.now 
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
    },
});

module.exports = mongoose.model("Invitation", invitationSchema)
