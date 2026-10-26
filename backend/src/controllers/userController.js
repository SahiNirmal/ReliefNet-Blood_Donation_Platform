const User = require("../models/User");
const { distanceKm } = require("../utils/geo");
const generateToken = require("../utils/generateToken");
const crypto = require("crypto");
const RESET_TOKEN_TTL_MS = 15 * 60 * 1000;

// POST /api/users/register
async function registerUser(req, res, next) {
  try {
    const { name, email, password, phone, role, bloodGroup, area, organization } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }

    const userData = { name, email, password, phone, role };
    if (role === "donor") {
      userData.bloodGroup = bloodGroup;
      userData.area = area;
    } else {
      userData.organization = organization;
    }

    // The password is hashed automatically by the pre("save") hook on
    // the User model — this controller never sees or stores it in plain text.
    const user = await User.create(userData);

    res.status(201).json({ user: user.toSafeObject(), token: generateToken(user) });
  } catch (err) {
    next(err);
  }
}

// POST /api/users/login
async function loginUser(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    // Same error message whether the email doesn't exist or the password
    // is wrong — revealing which one it was would let an attacker enumerate
    // valid emails.
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    res.json({ user: user.toSafeObject(), token: generateToken(user) });
  } catch (err) {
    next(err);
  }
}

// GET /api/users/donors?bloodGroup=O+&available=true&lat=..&lng=..&radiusKm=25
async function listDonors(req, res, next) {
  try {
    const { bloodGroup, available, lat, lng, radiusKm } = req.query;
    const filter = { role: "donor" };
    if (bloodGroup) filter.bloodGroup = bloodGroup;
    if (available !== undefined) filter.isAvailable = available === "true";

    let donors = await User.find(filter).select("-password");

    if (lat && lng) {
      const originLat = Number(lat);
      const originLng = Number(lng);
      const radius = radiusKm ? Number(radiusKm) : null;

      donors = donors
        .map((d) => {
          const obj = d.toObject();
          obj.distanceKm = distanceKm(originLat, originLng, d.location?.lat, d.location?.lng);
          return obj;
        })
        .filter((d) => !radius || d.distanceKm === null || d.distanceKm <= radius)
        .sort((a, b) => {
          if (a.distanceKm === null) return 1;
          if (b.distanceKm === null) return -1;
          return a.distanceKm - b.distanceKm;
        });
    }

    res.json(donors);
  } catch (err) {
    next(err);
  }
}

// GET /api/users/:id
async function getUser(req, res, next) {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found." });
    res.json(user);
  } catch (err) {
    next(err);
  }
}

// PATCH /api/users/:id — protected: only the logged-in user themself can
// update their own record. Without this check, any authenticated user
// could pass someone else's id in the URL and edit that person's profile.
async function updateUser(req, res, next) {
  try {
    if (req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ message: "You can only update your own profile." });
    }

    const allowedFields = ["location", "isAvailable", "area", "phone"];
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }

    const user = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) return res.status(404).json({ message: "User not found." });
    res.json(user);
  } catch (err) {
    next(err);
  }
}

async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    const genericMessage = "If an account with that email exists, a password reset link has been generated.";

    if (!user) {
      return res.json({ message: genericMessage });
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + RESET_TOKEN_TTL_MS;
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password?token=${rawToken}`;

    res.json({
      message: genericMessage,
      devResetUrl: resetUrl,
      expiresInMinutes: RESET_TOKEN_TTL_MS / 60000,
    });
  } catch (err) {
    next(err);
  }
}

async function resetPassword(req, res, next) {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ message: "Token and new password are required." });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "This reset link is invalid or has expired. Please request a new one." });
    }

    user.password = newPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.json({ user: user.toSafeObject(), token: generateToken(user) });
  } catch (err) {
    next(err);
  }
}

module.exports = { registerUser, loginUser, listDonors, getUser, updateUser, forgotPassword, resetPassword };