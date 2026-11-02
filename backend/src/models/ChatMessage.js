const mongoose = require("mongoose");

const chatMessageSchema = new mongoose.Schema(
  {
    donation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Donation",
      required: true,
      index: true,
    },
    request: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BloodRequest",
      required: true,
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    senderName: {
      type: String,
      required: true,
      trim: true,
    },
    senderRole: {
      type: String,
      enum: ["donor", "requester", "admin"],
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
  },
  { timestamps: true }
);

// Optimize query for fetching conversation history for a given response/donation
chatMessageSchema.index({ donation: 1, createdAt: 1 });

module.exports = mongoose.model("ChatMessage", chatMessageSchema);
