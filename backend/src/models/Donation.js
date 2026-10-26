const mongoose = require("mongoose");

const donationSchema = new mongoose.Schema(
  {
    donor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    request: { type: mongoose.Schema.Types.ObjectId, ref: "BloodRequest", required: true },
    hospital: { type: String, required: true, trim: true },
    units: { type: Number, required: true, min: 1, default: 1 },
    status: { type: String, enum: ["scheduled", "completed", "cancelled"], default: "scheduled" },
    donatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Donation", donationSchema);
