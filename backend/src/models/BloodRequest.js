const mongoose = require("mongoose");
const { BLOOD_GROUPS } = require("./User");

const bloodRequestSchema = new mongoose.Schema(
  {
    requester: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    patientName: { type: String, required: true, trim: true },
    bloodGroup: { type: String, enum: BLOOD_GROUPS, required: true },
    unitsNeeded: { type: Number, required: true, min: 1 },
    hospital: { type: String, required: true, trim: true },
    urgency: { type: String, enum: ["critical", "urgent", "stable"], required: true },
    contactNumber: { type: String, required: true, trim: true },
    status: { type: String, enum: ["open", "fulfilled", "cancelled"], default: "open" },
    fulfilledBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

    // Where the request was posted from — the hospital/patient's location,
    // not necessarily the requester account's saved address. Used to
    // compute real distance to nearby donors.
    location: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
    },
  },
  { timestamps: true }
);

// Supports the Browse Requests filters (blood group + urgency) and the
// admin panel's request listing without a full collection scan.
bloodRequestSchema.index({ bloodGroup: 1, urgency: 1, status: 1 });

module.exports = mongoose.model("BloodRequest", bloodRequestSchema);
