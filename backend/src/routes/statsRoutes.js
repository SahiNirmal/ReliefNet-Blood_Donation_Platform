const express = require("express");
const { getStats } = require("../controllers/donationController");

const router = express.Router();

router.get("/", getStats);

module.exports = router;
