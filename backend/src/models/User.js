const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    // Plaintext password is never stored — see the pre("save") hook below,
    // which hashes it with bcrypt before it ever reaches the database.
    password: { type: String, required: true, minlength: 6 },
    phone: { type: String, trim: true },
    role: { type: String, enum: ["donor", "requester", "admin"], required: true },

    // Donor-only fields
    bloodGroup: {
      type: String,
      enum: BLOOD_GROUPS,
      required: function () {
        return this.role === "donor";
      },
      // A defensive fallback: an empty string is a defined value as far
      // as Mongoose's enum check is concerned, so it would otherwise
      // fail validation for non-donors. Converting "" to undefined here
      // means the field is simply skipped for requesters/admins, no
      // matter what a caller (frontend, Postman, etc.) sends.
      set: (v) => (v === "" ? undefined : v),
    },
    area: { type: String, trim: true },
    isAvailable: { type: Boolean, default: true },
    lastDonationDate: { type: Date, default: null },

    // Real coordinates, captured via the browser's Geolocation API on the
    // frontend and saved here so donor-to-request distance can actually
    // be computed server-side, instead of just showing raw lat/lng.
    location: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
    },

      // Requester-only field
    organization: { type: String, trim: true },

    // Password-reset flow: only a SHA-256 hash of the reset token is ever
    // stored (never the plain token that goes out to the user), the same
    // principle as the password itself.
    resetPasswordToken: { type: String, default: null, select: false },
    resetPasswordExpires: { type: Date, default: null, select: false },
  },
  { timestamps: true }
);

userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

// Hashes the password automatically on create/save — applies everywhere
// a user document is written (the register endpoint, the seed script,
// any future admin tooling), so there's no controller-by-controller risk
// of forgetting to hash it. Only re-hashes when the password field was
// actually changed, so updating an unrelated field (e.g. location) on
// login doesn't re-hash an already-hashed password.
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
module.exports.BLOOD_GROUPS = BLOOD_GROUPS;