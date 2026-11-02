const express = require("express");
const { protect } = require("../middleware/auth");
const { getChatMessages, sendChatMessage } = require("../controllers/chatController");

const router = express.Router();

// Both endpoints are protected — only logged-in users who are parties to the response can access
router.get("/:donationId/messages", protect, getChatMessages);
router.post("/:donationId/messages", protect, sendChatMessage);

module.exports = router;
