const express = require("express");
const { protect, authorize } = require("../middleware/auth");
const { listDonations, createDonation, updateDonation } = require("../controllers/donationController");

const router = express.Router();

// Protected: this list includes donor phone/email, so it shouldn't be
// readable by anyone who isn't logged in.
router.get("/", protect, listDonations);
router.post("/", protect, authorize("donor"), createDonation);
router.patch("/:id", protect, updateDonation);

module.exports = router;