const jwt = require("jsonwebtoken");

// Encodes the user's id and role into the token, signed with a secret
// only the server knows. Anyone holding a valid token is trusted to be
// that user for the token's lifetime — nothing else needs to be sent
// with each request to prove identity.
function generateToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

module.exports = generateToken;