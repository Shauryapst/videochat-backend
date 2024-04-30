const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const conversationSchema = new Schema({
  participants: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  groupName: String,
  messages: [
    {
      type: Schema.Types.ObjectId,
      ref: "Message",
    },
  ],
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Conversation", conversationSchema);