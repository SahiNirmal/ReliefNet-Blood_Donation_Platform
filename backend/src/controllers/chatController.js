const Donation = require("../models/Donation");
const ChatMessage = require("../models/ChatMessage");
const { getIO, userRoom } = require("../socket");

/**
 * Checks whether the requesting user is either the donor or the requester
 * involved in this specific response.
 */
function isAuthorizedForChat(donation, userId, userRole) {
  if (userRole === "admin") return true;

  const donorId = donation.donor?._id ? donation.donor._id.toString() : donation.donor?.toString();
  const requesterId = donation.request?.requester?._id
    ? donation.request.requester._id.toString()
    : donation.request?.requester?.toString();

  const currentId = userId.toString();
  return currentId === donorId || currentId === requesterId;
}

/**
 * GET /api/chat/:donationId/messages
 * Fetches message history for a verified donor-requester response.
 */
async function getChatMessages(req, res, next) {
  try {
    const { donationId } = req.params;

    const donation = await Donation.findById(donationId)
      .populate("donor", "name phone email bloodGroup area")
      .populate({
        path: "request",
        select: "patientName hospital contactNumber bloodGroup unitsNeeded urgency requester status",
        populate: { path: "requester", select: "name phone email organization" },
      });

    if (!donation) {
      return res.status(404).json({ message: "Response record not found." });
    }

    if (!isAuthorizedForChat(donation, req.user._id, req.user.role)) {
      return res.status(403).json({
        message: "You are not authorized to view this chat. Chat is only allowed between the requester and responding donor.",
      });
    }

    const messages = await ChatMessage.find({ donation: donationId }).sort({ createdAt: 1 });

    res.json({
      donation,
      messages,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/chat/:donationId/messages
 * Sends a new message and broadcasts it in real-time over Socket.IO.
 */
async function sendChatMessage(req, res, next) {
  try {
    const { donationId } = req.params;
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: "Message content cannot be empty." });
    }

    const donation = await Donation.findById(donationId)
      .populate("donor", "name phone email bloodGroup area")
      .populate({
        path: "request",
        select: "patientName hospital contactNumber bloodGroup unitsNeeded urgency requester status",
        populate: { path: "requester", select: "name phone email organization" },
      });

    if (!donation) {
      return res.status(404).json({ message: "Response record not found." });
    }

    if (!isAuthorizedForChat(donation, req.user._id, req.user.role)) {
      return res.status(403).json({
        message: "You are not authorized to send messages in this chat.",
      });
    }

    const newMessage = await ChatMessage.create({
      donation: donation._id,
      request: donation.request._id,
      sender: req.user._id,
      senderName: req.user.name,
      senderRole: req.user.role,
      message: message.trim(),
    });

    // Identify recipient user ID
    const donorId = donation.donor?._id ? donation.donor._id.toString() : donation.donor?.toString();
    const requesterId = donation.request?.requester?._id
      ? donation.request.requester._id.toString()
      : donation.request?.requester?.toString();
    const recipientId = req.user._id.toString() === donorId ? requesterId : donorId;

    const io = getIO();
    if (io) {
      // 1. Broadcast to active chat room
      io.to(`chat:${donation._id}`).emit("chat:new-message", newMessage);

      // 2. Push direct notification to recipient's individual user room
      if (recipientId) {
        io.to(userRoom(recipientId)).emit("chat:notification", {
          donationId: donation._id,
          senderId: req.user._id,
          senderName: req.user.name,
          message: newMessage.message,
          patientName: donation.request?.patientName || "Patient",
        });
      }
    }

    res.status(201).json(newMessage);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getChatMessages,
  sendChatMessage,
  isAuthorizedForChat,
};
